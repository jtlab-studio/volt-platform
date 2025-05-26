use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use crate::config::settings::Settings;
use crate::errors::handlers::ApiError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub exp: usize,
}

pub async fn auth_middleware(
    State(settings): State<Settings>,
    mut request: Request,
    next: Next,
) -> Result<Response, ApiError> {
    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|header| header.to_str().ok());
    
    let token = match auth_header {
        Some(header) if header.starts_with("Bearer ") => &header[7..],
        _ => {
            return Err(ApiError::Unauthorized("Missing or invalid authorization header".to_string()));
        }
    };
    
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(settings.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| ApiError::Unauthorized("Invalid token".to_string()))?;
    
    // Add user_id to request extensions
    request.extensions_mut().insert(token_data.claims.sub);
    
    Ok(next.run(request).await)
}
