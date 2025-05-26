use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SynthesisResult {
    pub id: String,
    pub user_id: String,
    pub reference_race_id: String,
    pub bbox_geometry: String, // JSON string
    pub results: String, // JSON string
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteCandidate {
    pub id: String,
    pub distance_km: f64,
    pub elevation_gain_m: f64,
    pub elevation_loss_m: f64,
    pub itra_effort_distance: f64,
    pub similarity_score: f64,
    pub route: RouteData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteData {
    pub points: Vec<RoutePoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutePoint {
    pub lat: f64,
    pub lon: f64,
    pub ele: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub north: f64,
    pub south: f64,
    pub east: f64,
    pub west: f64,
}

impl BoundingBox {
    pub fn contains(&self, lat: f64, lon: f64) -> bool {
        lat >= self.south && lat <= self.north && lon >= self.west && lon <= self.east
    }
    
    pub fn area_km2(&self) -> f64 {
        let lat_dist = haversine_distance(self.south, self.west, self.north, self.west);
        let lon_dist = haversine_distance(self.south, self.west, self.south, self.east);
        lat_dist * lon_dist
    }
}

fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // Earth radius in km
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let lat1 = lat1.to_radians();
    let lat2 = lat2.to_radians();
    
    let a = (dlat / 2.0).sin().powi(2) + lat1.cos() * lat2.cos() * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    
    r * c
}
