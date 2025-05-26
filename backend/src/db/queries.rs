use sqlx::SqlitePool;
use crate::errors::handlers::ApiError;

pub async fn init_database(_pool: &SqlitePool) -> Result<(), ApiError> {
    // Create tables if they don't exist
    // This is handled by migrations, but we can add runtime checks here
    Ok(())
}

pub async fn check_database_health(pool: &SqlitePool) -> Result<bool, ApiError> {
    let result = sqlx::query!("SELECT 1 as alive")
        .fetch_one(pool)
        .await?;
    
    Ok(result.alive == 1)
}

// User queries
pub mod users {
    use super::*;
    use crate::db::models::User;
    
    pub async fn find_by_email(pool: &SqlitePool, email: &str) -> Result<Option<User>, ApiError> {
        let row = sqlx::query!(
            r#"
            SELECT 
                id, email, username, password_hash,
                created_at, updated_at
            FROM users 
            WHERE email = ?
            "#,
            email
        )
        .fetch_optional(pool)
        .await?;
        
        Ok(row.map(|r| User {
            id: r.id,
            email: r.email,
            username: r.username,
            password_hash: r.password_hash,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }))
    }
    
    pub async fn find_by_id(pool: &SqlitePool, id: &str) -> Result<Option<User>, ApiError> {
        let row = sqlx::query!(
            r#"
            SELECT 
                id, email, username, password_hash,
                created_at, updated_at
            FROM users 
            WHERE id = ?
            "#,
            id
        )
        .fetch_optional(pool)
        .await?;
        
        Ok(row.map(|r| User {
            id: r.id,
            email: r.email,
            username: r.username,
            password_hash: r.password_hash,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }))
    }
}

// Race queries
pub mod races {
    use super::*;
    use crate::db::models::Race;
    
    pub async fn find_by_user(pool: &SqlitePool, user_id: &str) -> Result<Vec<Race>, ApiError> {
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
        .fetch_all(pool)
        .await?;
        
        Ok(rows.into_iter().map(|r| Race {
            id: r.id,
            user_id: r.user_id,
            name: r.name,
            gpx_data: r.gpx_data,
            distance_km: r.distance_km,
            elevation_gain_m: r.elevation_gain_m,
            elevation_loss_m: r.elevation_loss_m,
            itra_effort_distance: r.itra_effort_distance,
            created_at: r.created_at,
        }).collect())
    }
    
    pub async fn count_by_user(pool: &SqlitePool, user_id: &str) -> Result<i64, ApiError> {
        let result = sqlx::query!(
            r#"SELECT COUNT(*) as "count: i64" FROM races WHERE user_id = ?"#,
            user_id
        )
        .fetch_one(pool)
        .await?;
        
        Ok(result.count)
    }
}

// Synthesis queries
pub mod synthesis {
    use super::*;
    use crate::db::models::SynthesisResult;
    
    pub async fn find_recent_by_user(
        pool: &SqlitePool,
        user_id: &str,
        limit: i64,
    ) -> Result<Vec<SynthesisResult>, ApiError> {
        let rows = sqlx::query!(
            r#"
            SELECT 
                id, user_id, reference_race_id,
                bbox_geometry, results, created_at
            FROM synthesis_results 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
            "#,
            user_id,
            limit
        )
        .fetch_all(pool)
        .await?;
        
        Ok(rows.into_iter().map(|r| SynthesisResult {
            id: r.id,
            user_id: r.user_id,
            reference_race_id: r.reference_race_id,
            bbox_geometry: r.bbox_geometry,
            results: r.results,
            created_at: r.created_at,
        }).collect())
    }
}
