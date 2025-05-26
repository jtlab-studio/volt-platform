use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{ConnectOptions, SqlitePool};
use std::str::FromStr;
use std::time::Duration;
use tracing::log::LevelFilter;

use crate::config::settings::Settings;
use crate::errors::handlers::ApiError;

pub async fn create_pool(settings: &Settings) -> Result<SqlitePool, ApiError> {
    let connect_options = SqliteConnectOptions::from_str(&settings.database_url)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .busy_timeout(Duration::from_secs(5))
        .log_statements(LevelFilter::Debug)
        .log_slow_statements(LevelFilter::Warn, Duration::from_secs(1));
    
    let pool = SqlitePoolOptions::new()
        .max_connections(settings.database_max_connections)
        .min_connections(1)
        .connect_timeout(Duration::from_secs(5))
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(60))
        .connect_with(connect_options)
        .await?;
    
    Ok(pool)
}

pub async fn migrate(pool: &SqlitePool) -> Result<(), ApiError> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|e| ApiError::InternalError(format!("Migration failed: {}", e)))?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_create_pool() {
        let settings = Settings {
            database_url: ":memory:".to_string(),
            database_max_connections: 5,
            ..Default::default()
        };
        
        let pool = create_pool(&settings).await;
        assert!(pool.is_ok());
    }
}
