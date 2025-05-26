use axum::{
    Router,
    Extension,
};
use sqlx::SqlitePool;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use crate::config::settings::Settings;
use crate::api::routes;

pub fn create_app(db_pool: SqlitePool, settings: Settings) -> Router {
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    // Create router
    Router::new()
        .nest("/api/v1", api_routes(db_pool.clone(), settings.clone()))
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
