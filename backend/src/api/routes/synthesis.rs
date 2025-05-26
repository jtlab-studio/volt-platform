use axum::{
    extract::{Extension, Path, State},
    middleware,
    routing::post,
    Json,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::api::middleware::auth::auth_middleware;
use crate::config::settings::Settings;
use crate::errors::handlers::ApiError;

#[derive(Debug, Deserialize)]
pub struct SynthesisRequest {
    reference_race_id: String,
    bounding_box: BoundingBox,
    rolling_window: u32,
    max_results: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BoundingBox {
    north: f64,
    south: f64,
    east: f64,
    west: f64,
}

pub fn routes(db_pool: SqlitePool, settings: Settings) -> Router {
    Router::new()
        .route("/generate", post(generate_routes))
        .route("/results/:id", post(get_synthesis_results))
        .route("/results/:synthesis_id/download/:result_id", post(download_gpx))
        .route("/results/:synthesis_id/save/:result_id", post(save_to_library))
        .layer(middleware::from_fn_with_state(
            settings.clone(),
            auth_middleware,
        ))
        .with_state((db_pool, settings))
}

async fn generate_routes(
    Extension(user_id): Extension<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
    Json(payload): Json<SynthesisRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Verify user owns the reference race
    let _race = sqlx::query!(
        r#"SELECT id FROM races WHERE id = ? AND user_id = ?"#,
        payload.reference_race_id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Reference race not found".to_string()))?;
    
    // Create synthesis job
    let synthesis_id = Uuid::new_v4().to_string();
    let bbox_json = serde_json::to_string(&payload.bounding_box)?;
    let results_json = serde_json::to_string(&Vec::<serde_json::Value>::new())?;
    
    sqlx::query!(
        r#"
        INSERT INTO synthesis_results (
            id, user_id, reference_race_id, bbox_geometry, results
        )
        VALUES (?, ?, ?, ?, ?)
        "#,
        synthesis_id,
        user_id,
        payload.reference_race_id,
        bbox_json,
        results_json
    )
    .execute(&db_pool)
    .await?;
    
    // In real implementation, this would start an async job
    // For now, return immediate response
    Ok(Json(serde_json::json!({
        "id": synthesis_id,
        "user_id": user_id,
        "reference_race_id": payload.reference_race_id,
        "results": [],
        "created_at": chrono::Utc::now().to_rfc3339()
    })))
}

async fn get_synthesis_results(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let result = sqlx::query!(
        r#"SELECT * FROM synthesis_results WHERE id = ? AND user_id = ?"#,
        id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Synthesis results not found".to_string()))?;
    
    Ok(Json(serde_json::json!({
        "id": result.id,
        "user_id": result.user_id,
        "reference_race_id": result.reference_race_id,
        "results": serde_json::from_str::<Vec<serde_json::Value>>(&result.results)?,
        "created_at": result.created_at
    })))
}

async fn download_gpx(
    Extension(_user_id): Extension<String>,
    Path((_synthesis_id, _result_id)): Path<(String, String)>,
    State((_db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<String, ApiError> {
    // Verify access and generate GPX
    // For now, return placeholder
    Ok("<?xml version=\"1.0\"?><gpx></gpx>".to_string())
}

async fn save_to_library(
    Extension(_user_id): Extension<String>,
    Path((_synthesis_id, _result_id)): Path<(String, String)>,
    State((_db_pool, _)): State<(SqlitePool, Settings)>,
    Json(_payload): Json<serde_json::Value>,
) -> Result<(), ApiError> {
    // Save synthesized route as a new race
    // Implementation would extract route from synthesis results
    Ok(())
}
