use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    pub username: String,
    pub password_hash: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl User {
    pub fn new(id: String, email: String, username: String, password_hash: String) -> Self {
        Self {
            id,
            email,
            username,
            password_hash,
            created_at: None,
            updated_at: None,
        }
    }
}
