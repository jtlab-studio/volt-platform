use sqlx::{Executor, SqlitePool};
use crate::errors::handlers::ApiError;

pub async fn init_database(pool: &SqlitePool) -> Result<(), ApiError> {
    // Create tables if they don't exist
    // This is handled by migrations, but we can add runtime checks here
    Ok(())
}

pub async fn check_database_health(pool: &SqlitePool) -> Result<bool, ApiError> {
    let result = sqlx::query!("SELECT 1 as alive")
        .fetch_one(pool)
        .await?;
    
    Ok(result.alive == Some(1))
}

// User queries
pub mod users {
    use super::*;
    use crate::db::models::User;
    
    pub async fn find_by_email(pool: &SqlitePool, email: &str) -> Result<Option<User>, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"SELECT * FROM users WHERE email = ?"#,
            email
        )
        .fetch_optional(pool)
        .await?;
        
        Ok(user)
    }
    
    pub async fn find_by_id(pool: &SqlitePool, id: &str) -> Result<Option<User>, ApiError> {
        let user = sqlx::query_as!(
            User,
            r#"SELECT * FROM users WHERE id = ?"#,
            id
        )
        .fetch_optional(pool)
        .await?;
        
        Ok(user)
    }
}

// Race queries
pub mod races {
    use super::*;
    use crate::db::models::Race;
    
    pub async fn find_by_user(pool: &SqlitePool, user_id: &str) -> Result<Vec<Race>, ApiError> {
        let races = sqlx::query_as!(
            Race,
            r#"SELECT * FROM races WHERE user_id = ? ORDER BY created_at DESC"#,
            user_id
        )
        .fetch_all(pool)
        .await?;
        
        Ok(races)
    }
    
    pub async fn count_by_user(pool: &SqlitePool, user_id: &str) -> Result<i64, ApiError> {
        let result = sqlx::query!(
            r#"SELECT COUNT(*) as count FROM races WHERE user_id = ?"#,
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
        let results = sqlx::query_as!(
            SynthesisResult,
            r#"
            SELECT * FROM synthesis_results 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
            "#,
            user_id,
            limit
        )
        .fetch_all(pool)
        .await?;
        
        Ok(results)
    }
}
