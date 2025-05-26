use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Race {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub gpx_data: String, // JSON string
    pub distance_km: f64,
    pub elevation_gain_m: f64,
    pub elevation_loss_m: f64,
    pub itra_effort_distance: Option<f64>,
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpxPoint {
    pub lat: f64,
    pub lon: f64,
    pub ele: f64,
    pub time: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpxData {
    pub points: Vec<GpxPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElevationProfile {
    pub distance: Vec<f64>,
    pub elevation: Vec<f64>,
    pub smoothed: bool,
    pub window_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradientBin {
    pub range: String,
    pub percentage: f64,
    pub distance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradientDistribution {
    pub ascent: Vec<GradientBin>,
    pub descent: Vec<GradientBin>,
}
