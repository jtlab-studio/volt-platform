use axum::{
    extract::{Extension, Path, Query, State},
    middleware,
    routing::{get, post, delete},
    Json,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::api::middleware::auth::auth_middleware;
use crate::config::settings::Settings;
use crate::core::models::race::Race;
use crate::core::services::gpx_parser::parse_gpx;
use crate::core::services::elevation_service::calculate_elevation_metrics;
use crate::core::services::itra_calculator::calculate_itra_effort;
use crate::errors::handlers::ApiError;

#[derive(Debug, Deserialize)]
pub struct WindowSizeQuery {
    window_size: Option<u32>,
}

pub fn routes(db_pool: SqlitePool, settings: Settings) -> Router {
    Router::new()
        .route("/", get(get_races).post(upload_gpx))
        .route("/:id", get(get_race).delete(delete_race))
        .route("/:id/elevation", get(get_elevation_profile))
        .route("/:id/gradient", get(get_gradient_distribution))
        .layer(middleware::from_fn_with_state(
            settings.clone(),
            auth_middleware,
        ))
        .with_state((db_pool, settings))
}

async fn get_races(
    Extension(user_id): Extension<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<Vec<Race>>, ApiError> {
    let races = sqlx::query_as!(
        Race,
        r#"SELECT * FROM races WHERE user_id = ? ORDER BY created_at DESC"#,
        user_id
    )
    .fetch_all(&db_pool)
    .await?;
    
    Ok(Json(races))
}

async fn get_race(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<Race>, ApiError> {
    let race = sqlx::query_as!(
        Race,
        r#"SELECT * FROM races WHERE id = ? AND user_id = ?"#,
        id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Race not found".to_string()))?;
    
    Ok(Json(race))
}

async fn upload_gpx(
    Extension(user_id): Extension<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
    body: String, // In real implementation, use multipart form
) -> Result<Json<Race>, ApiError> {
    // Parse GPX file
    let gpx_data = parse_gpx(&body)?;
    
    // Calculate metrics
    let (distance_km, elevation_gain_m, elevation_loss_m) = calculate_elevation_metrics(&gpx_data);
    let itra_effort_distance = calculate_itra_effort(distance_km, elevation_gain_m);
    
    // Create race
    let race_id = Uuid::new_v4().to_string();
    let race_name = format!("Race {}", chrono::Utc::now().format("%Y-%m-%d"));
    let gpx_json = serde_json::to_string(&gpx_data)?;
    
    sqlx::query!(
        r#"
        INSERT INTO races (
            id, user_id, name, gpx_data,
            distance_km, elevation_gain_m, elevation_loss_m, itra_effort_distance
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        race_id,
        user_id,
        race_name,
        gpx_json,
        distance_km,
        elevation_gain_m,
        elevation_loss_m,
        itra_effort_distance
    )
    .execute(&db_pool)
    .await?;
    
    // Fetch and return the created race
    let race = sqlx::query_as!(
        Race,
        r#"SELECT * FROM races WHERE id = ?"#,
        race_id
    )
    .fetch_one(&db_pool)
    .await?;
    
    Ok(Json(race))
}

async fn delete_race(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<StatusCode, ApiError> {
    let result = sqlx::query!(
        r#"DELETE FROM races WHERE id = ? AND user_id = ?"#,
        id,
        user_id
    )
    .execute(&db_pool)
    .await?;
    
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Race not found".to_string()));
    }
    
    Ok(StatusCode::NO_CONTENT)
}

async fn get_elevation_profile(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Query(params): Query<WindowSizeQuery>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Implementation would calculate elevation profile with smoothing
    // For now, return placeholder
    Ok(Json(serde_json::json!({
        "distance": [0.0, 1.0, 2.0],
        "elevation": [100.0, 150.0, 120.0],
        "smoothed": true,
        "windowSize": params.window_size.unwrap_or(100)
    })))
}

async fn get_gradient_distribution(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Query(params): Query<WindowSizeQuery>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Implementation would calculate gradient distribution
    // For now, return placeholder
    Ok(Json(serde_json::json!({
        "ascent": [
            {"range": "0-5", "percentage": 30.0, "distance": 10.0},
            {"range": "5-10", "percentage": 40.0, "distance": 13.3},
            {"range": "10-15", "percentage": 20.0, "distance": 6.7},
            {"range": "15+", "percentage": 10.0, "distance": 3.3}
        ],
        "descent": [
            {"range": "0-5", "percentage": 35.0, "distance": 11.7},
            {"range": "5-10", "percentage": 45.0, "distance": 15.0},
            {"range": "10-15", "percentage": 15.0, "distance": 5.0},
            {"range": "15+", "percentage": 5.0, "distance": 1.7}
        ]
    })))
}

use axum::http::StatusCode;
