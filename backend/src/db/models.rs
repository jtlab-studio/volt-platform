use sqlx::FromRow;
use serde::{Deserialize, Serialize};

// Re-export core models that map to database tables
pub use crate::core::models::user::User;
pub use crate::core::models::race::Race;
pub use crate::core::models::synthesis::SynthesisResult;

// Additional database-specific models can be defined here
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbSession {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub expires_at: String,
    pub created_at: String,
}
