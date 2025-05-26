use axum::{
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use sqlx::sqlite::SqlitePoolOptions;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

mod api;
mod core;
mod db;
mod spatial;
mod config;
mod errors;

use crate::api::server::create_app;
use crate::config::settings::Settings;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv().ok();
    
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let settings = Settings::new()?;
    
    // Create database pool
    let db_pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&settings.database_url)
        .await?;
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&db_pool)
        .await?;
    
    // Create app
    let app = create_app(db_pool, settings.clone());
    
    // Start server
    let addr = SocketAddr::from(([127, 0, 0, 1], settings.port));
    tracing::info!("Listening on {}", addr);
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    
    Ok(())
}
