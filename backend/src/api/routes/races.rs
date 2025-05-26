use axum::{
    extract::{Extension, Path, Query, State, Multipart},
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
use crate::core::models::race::{Race, ElevationProfile, GradientDistribution};
use crate::core::services::gpx_parser::parse_gpx;
use crate::core::services::elevation_service::{
    calculate_elevation_metrics, 
    calculate_elevation_profile, 
    calculate_gradient_distribution
};
use crate::core::services::itra_calculator::calculate_itra_effort;
use crate::errors::handlers::ApiError;

#[derive(Debug, Deserialize)]
pub struct WindowSizeQuery {
    window_size: Option<u32>,
    smoothed: Option<bool>,
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
    println!("Getting races for user: {}", user_id);
    
    let rows = sqlx::query!(
        r#"
        SELECT 
            id, user_id, name, gpx_data,
            distance_km, elevation_gain_m, elevation_loss_m,
            itra_effort_distance, created_at
        FROM races 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        "#,
        user_id
    )
    .fetch_all(&db_pool)
    .await?;
    
    let races: Vec<Race> = rows.into_iter().map(|row| Race {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        gpx_data: row.gpx_data,
        distance_km: row.distance_km,
        elevation_gain_m: row.elevation_gain_m,
        elevation_loss_m: row.elevation_loss_m,
        itra_effort_distance: row.itra_effort_distance,
        created_at: row.created_at,
    }).collect();
    
    println!("Found {} races", races.len());
    Ok(Json(races))
}

async fn get_race(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<Race>, ApiError> {
    let row = sqlx::query!(
        r#"
        SELECT 
            id, user_id, name, gpx_data,
            distance_km, elevation_gain_m, elevation_loss_m,
            itra_effort_distance, created_at
        FROM races 
        WHERE id = ? AND user_id = ?
        "#,
        id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Race not found".to_string()))?;
    
    let race = Race {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        gpx_data: row.gpx_data,
        distance_km: row.distance_km,
        elevation_gain_m: row.elevation_gain_m,
        elevation_loss_m: row.elevation_loss_m,
        itra_effort_distance: row.itra_effort_distance,
        created_at: row.created_at,
    };
    
    Ok(Json(race))
}

async fn upload_gpx(
    Extension(user_id): Extension<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
    mut multipart: Multipart,
) -> Result<Json<Race>, ApiError> {
    println!("Uploading GPX for user: {}", user_id);
    
    let mut gpx_content = String::new();
    let mut filename = String::new();
    
    // Process multipart form
    while let Some(field) = multipart.next_field().await
        .map_err(|e| {
            println!("Multipart error: {:?}", e);
            ApiError::BadRequest("Invalid multipart data".to_string())
        })?
    {
        let name = field.name().unwrap_or("").to_string();
        println!("Processing field: {}", name);
        
        if name == "file" {
            filename = field.file_name().unwrap_or("unnamed.gpx").to_string();
            let data = field.bytes().await
                .map_err(|e| {
                    println!("Failed to read file: {:?}", e);
                    ApiError::BadRequest("Failed to read file".to_string())
                })?;
            
            gpx_content = String::from_utf8(data.to_vec())
                .map_err(|e| {
                    println!("Invalid UTF-8: {:?}", e);
                    ApiError::BadRequest("Invalid UTF-8 in GPX file".to_string())
                })?;
            
            println!("GPX content length: {}", gpx_content.len());
        }
    }
    
    if gpx_content.is_empty() {
        return Err(ApiError::BadRequest("No GPX file provided".to_string()));
    }
    
    // Parse GPX file
    let gpx_data = parse_gpx(&gpx_content)?;
    
    // Calculate metrics
    let (distance_km, elevation_gain_m, elevation_loss_m) = calculate_elevation_metrics(&gpx_data);
    let itra_effort_distance = calculate_itra_effort(distance_km, elevation_gain_m);
    
    // Create race
    let race_id = Uuid::new_v4().to_string();
    let race_name = if !filename.is_empty() && filename != "unnamed.gpx" {
        filename.replace(".gpx", "")
    } else {
        format!("Race {}", chrono::Utc::now().format("%Y-%m-%d %H:%M"))
    };
    let gpx_json = serde_json::to_string(&gpx_data)?;
    
    println!("Creating race: {} with distance: {}km", race_name, distance_km);
    
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
    let row = sqlx::query!(
        r#"
        SELECT 
            id, user_id, name, gpx_data,
            distance_km, elevation_gain_m, elevation_loss_m,
            itra_effort_distance, created_at
        FROM races 
        WHERE id = ?
        "#,
        race_id
    )
    .fetch_one(&db_pool)
    .await?;
    
    let race = Race {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        gpx_data: row.gpx_data,
        distance_km: row.distance_km,
        elevation_gain_m: row.elevation_gain_m,
        elevation_loss_m: row.elevation_loss_m,
        itra_effort_distance: row.itra_effort_distance,
        created_at: row.created_at,
    };
    
    println!("Race created successfully: {}", race.id);
    Ok(Json(race))
}

async fn delete_race(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<StatusCode, ApiError> {
    println!("Deleting race {} for user {}", id, user_id);
    
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
    
    println!("Race deleted successfully");
    Ok(StatusCode::NO_CONTENT)
}

async fn get_elevation_profile(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Query(params): Query<WindowSizeQuery>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<ElevationProfile>, ApiError> {
    // Get the race data
    let row = sqlx::query!(
        r#"SELECT gpx_data FROM races WHERE id = ? AND user_id = ?"#,
        id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Race not found".to_string()))?;
    
    // Parse GPX data
    let gpx_data: crate::core::models::race::GpxData = serde_json::from_str(&row.gpx_data)?;
    
    // Calculate elevation profile
    // Use elevation processor for smoothing
    use crate::core::services::elevation_processor::ElevationData;
    
    let smoothed = params.smoothed.unwrap_or(true);
    let elevation_data = ElevationData::from_gpx_data(&gpx_data, smoothed);
    
    // Convert to elevation profile format
    let profile = crate::core::models::race::ElevationProfile {
        distance: elevation_data.cumulative_distance.iter()
            .map(|d| d / 1000.0) // Convert to km
            .collect(),
        elevation: elevation_data.enhanced_altitude.clone(),
        smoothed,
        window_size: params.window_size.unwrap_or(100),
    };
    
    Ok(Json(profile))
}

async fn get_gradient_distribution(
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Query(params): Query<WindowSizeQuery>,
    State((db_pool, _)): State<(SqlitePool, Settings)>,
) -> Result<Json<GradientDistribution>, ApiError> {
    // Get the race data
    let row = sqlx::query!(
        r#"SELECT gpx_data FROM races WHERE id = ? AND user_id = ?"#,
        id,
        user_id
    )
    .fetch_optional(&db_pool)
    .await?
    .ok_or_else(|| ApiError::NotFound("Race not found".to_string()))?;
    
    // Parse GPX data
    let gpx_data: crate::core::models::race::GpxData = serde_json::from_str(&row.gpx_data)?;
    
    // Calculate gradient distribution
    let distribution = calculate_gradient_distribution(&gpx_data, params.window_size.unwrap_or(100));
    
    Ok(Json(distribution))
}

use axum::http::StatusCode;

