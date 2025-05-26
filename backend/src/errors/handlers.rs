use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;

#[derive(Debug)]
pub enum ApiError {
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    InternalError(String),
    DatabaseError(sqlx::Error),
    ValidationError(String),
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ApiError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            ApiError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            ApiError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            ApiError::NotFound(msg) => write!(f, "Not found: {}", msg),
            ApiError::InternalError(msg) => write!(f, "Internal error: {}", msg),
            ApiError::DatabaseError(err) => write!(f, "Database error: {}", err),
            ApiError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
        }
    }
}

impl std::error::Error for ApiError {}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::DatabaseError(err)
    }
}

impl From<serde_json::Error> for ApiError {
    fn from(err: serde_json::Error) -> Self {
        ApiError::BadRequest(format!("JSON error: {}", err))
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message, error_code) = match self {
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg, "BAD_REQUEST"),
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg, "UNAUTHORIZED"),
            ApiError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg, "FORBIDDEN"),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg, "NOT_FOUND"),
            ApiError::InternalError(msg) => {
                tracing::error!("Internal error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An internal error occurred".to_string(),
                    "INTERNAL_ERROR",
                )
            }
            ApiError::DatabaseError(err) => {
                tracing::error!("Database error: {}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "A database error occurred".to_string(),
                    "DATABASE_ERROR",
                )
            }
            ApiError::ValidationError(msg) => {
                (StatusCode::BAD_REQUEST, msg, "VALIDATION_ERROR")
            }
        };
        
        let body = Json(json!({
            "error": error_message,
            "code": error_code,
            "statusCode": status.as_u16(),
        }));
        
        (status, body).into_response()
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

// Helper functions for common error responses
pub fn bad_request(msg: &str) -> ApiError {
    ApiError::BadRequest(msg.to_string())
}

pub fn unauthorized(msg: &str) -> ApiError {
    ApiError::Unauthorized(msg.to_string())
}

pub fn not_found(msg: &str) -> ApiError {
    ApiError::NotFound(msg.to_string())
}

pub fn internal_error(msg: &str) -> ApiError {
    ApiError::InternalError(msg.to_string())
}

pub fn validation_error(msg: &str) -> ApiError {
    ApiError::ValidationError(msg.to_string())
}
