use dotenv::dotenv;
use std::net::SocketAddr;
use tracing_subscriber;

mod api;
mod core;
mod db;
mod spatial;
mod config;
mod errors;

use crate::api::server::create_app;
use crate::config::settings::Settings;
use crate::db::pool::{create_pool, migrate};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenv().ok();
    
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let settings = Settings::new()?;
    settings.validate()?;
    
    // Create database pool
    let db_pool = create_pool(&settings).await?;
    
    // Run migrations
    migrate(&db_pool).await?;
    
    // Create app
    let app = create_app(db_pool, settings.clone());
    
    // Start server
    let addr = SocketAddr::from(([127, 0, 0, 1], settings.port));
    tracing::info!("Listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}
