use axum::{
    Router,
    Extension,
    extract::DefaultBodyLimit,
};
use sqlx::SqlitePool;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;

use crate::config::settings::Settings;
use crate::api::routes;

pub fn create_app(db_pool: SqlitePool, settings: Settings) -> Router {
    // CORS configuration - allow all origins in development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .expose_headers(Any);
    
    // Create router with increased body limit for file uploads
    Router::new()
        .nest("/api/v1", api_routes(db_pool.clone(), settings.clone()))
        .layer(DefaultBodyLimit::max(52_428_800)) // 50MB limit
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(Extension(db_pool))
        .layer(Extension(settings))
}

fn api_routes(db_pool: SqlitePool, settings: Settings) -> Router {
    Router::new()
        .nest("/auth", routes::auth::routes(db_pool.clone(), settings.clone()))
        .nest("/races", routes::races::routes(db_pool.clone(), settings.clone()))
        .nest("/synthesis", routes::synthesis::routes(db_pool.clone(), settings.clone()))
}
