use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub database_url: String,
    pub database_max_connections: u32,
    pub jwt_secret: String,
    pub port: u16,
    pub host: String,
    pub log_level: String,
    pub cors_origin: String,
}

impl Settings {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://volt.db".to_string()),
            database_max_connections: env::var("DATABASE_MAX_CONNECTIONS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()?,
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()?,
            host: env::var("HOST")
                .unwrap_or_else(|_| "127.0.0.1".to_string()),
            log_level: env::var("LOG_LEVEL")
                .unwrap_or_else(|_| "info".to_string()),
            cors_origin: env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "*".to_string()),
        })
    }
    
    pub fn validate(&self) -> Result<(), String> {
        if self.jwt_secret.len() < 32 {
            return Err("JWT_SECRET must be at least 32 characters long".to_string());
        }
        
        if self.database_max_connections < 1 {
            return Err("DATABASE_MAX_CONNECTIONS must be at least 1".to_string());
        }
        
        Ok(())
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            database_url: "sqlite://volt.db".to_string(),
            database_max_connections: 5,
            jwt_secret: "your-secret-key-change-in-production".to_string(),
            port: 3000,
            host: "127.0.0.1".to_string(),
            log_level: "info".to_string(),
            cors_origin: "*".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_settings_validation() {
        let mut settings = Settings::default();
        settings.jwt_secret = "short".to_string();
        assert!(settings.validate().is_err());
        
        settings.jwt_secret = "a".repeat(32);
        assert!(settings.validate().is_ok());
    }
}
