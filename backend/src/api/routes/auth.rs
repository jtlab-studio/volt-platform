use axum::{
    extract::State,
    routing::{post, get},
    middleware,
    Json,
    Router,
    Extension,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use uuid::Uuid;
use chrono::{Duration, Utc};

use crate::api::middleware::auth::{Claims, auth_middleware};
use crate::config::settings::Settings;
use crate::core::models::user::User;
use crate::errors::handlers::ApiError;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    email: String,
    username: String,
    password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    user: UserResponse,
    token: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    id: String,
    email: String,
    username: String,
}

pub fn routes(db_pool: SqlitePool, settings: Settings) -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/signup", post(signup))
        .route(
            "/verify",
            get(verify_token).layer(middleware::from_fn_with_state(
                settings.clone(),
                auth_middleware,
            )),
        )
        .with_state((db_pool, settings))
}

async fn login(
    State((db_pool, settings)): State<(SqlitePool, Settings)>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    println!("Login attempt for email: {}", payload.email);
    
    // Find user by email using query! macro
    let row = sqlx::query!(
        r#"SELECT id, email, username, password_hash FROM users WHERE email = ?"#,
        payload.email
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::BadRequest("Invalid email or password".to_string()))?;
    
    // Verify password
    if !verify(&payload.password, &row.password_hash)
        .map_err(|_| ApiError::InternalError("Password verification failed".to_string()))?
    {
        return Err(ApiError::BadRequest("Invalid email or password".to_string()));
    }
    
    // Generate JWT token
    let claims = Claims {
        sub: row.id.clone(),
        exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
    };
    
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(settings.jwt_secret.as_bytes()),
    )
    .map_err(|_| ApiError::InternalError("Token generation failed".to_string()))?;
    
    println!("Login successful for user: {}", row.id);
    
    Ok(Json(AuthResponse {
        user: UserResponse {
            id: row.id,
            email: row.email,
            username: row.username,
        },
        token,
    }))
}

async fn signup(
    State((db_pool, settings)): State<(SqlitePool, Settings)>,
    Json(payload): Json<SignupRequest>,
) -> Result<Json<AuthResponse>, ApiError> {
    println!("Signup attempt for email: {}", payload.email);
    
    // Check if email already exists
    let existing = sqlx::query!(
        r#"SELECT id FROM users WHERE email = ? OR username = ?"#,
        payload.email,
        payload.username
    )
    .fetch_optional(&db_pool)
    .await?;
    
    if existing.is_some() {
        return Err(ApiError::BadRequest("Email or username already exists".to_string()));
    }
    
    // Hash password
    let password_hash = hash(&payload.password, DEFAULT_COST)
        .map_err(|_| ApiError::InternalError("Password hashing failed".to_string()))?;
    
    // Create user
    let user_id = Uuid::new_v4().to_string();
    
    sqlx::query!(
        r#"
        INSERT INTO users (id, email, username, password_hash)
        VALUES (?, ?, ?, ?)
        "#,
        user_id,
        payload.email,
        payload.username,
        password_hash
    )
    .execute(&db_pool)
    .await?;
    
    // Generate JWT token
    let claims = Claims {
        sub: user_id.clone(),
        exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
    };
    
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(settings.jwt_secret.as_bytes()),
    )
    .map_err(|_| ApiError::InternalError("Token generation failed".to_string()))?;
    
    println!("Signup successful for user: {}", user_id);
    
    Ok(Json(AuthResponse {
        user: UserResponse {
            id: user_id,
            email: payload.email,
            username: payload.username,
        },
        token,
    }))
}

async fn verify_token(
    Extension(user_id): Extension<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // This endpoint is protected by auth middleware
    // If we reach here, the token is valid
    
    let row = sqlx::query!(
        r#"SELECT id, email, username FROM users WHERE id = ?"#,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;
    
    Ok(Json(serde_json::json!({
        "valid": true,
        "user": {
            "id": row.id,
            "email": row.email,
            "username": row.username
        }
    })))
}
