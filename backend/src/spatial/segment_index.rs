use crate::core::models::race::GpxData;
use crate::spatial::rtree::{SpatialSegment, SpatialIndex};
use geo::Point;
use uuid::Uuid;

pub fn build_segment_index(routes: Vec<(String, GpxData)>) -> SpatialIndex {
    let mut segments = Vec::new();
    
    for (route_id, gpx_data) in routes {
        for i in 1..gpx_data.points.len() {
            let start = &gpx_data.points[i - 1];
            let end = &gpx_data.points[i];
            
            let distance = haversine_distance(start.lat, start.lon, end.lat, end.lon);
            let elevation_gain = if end.ele > start.ele { end.ele - start.ele } else { 0.0 };
            let elevation_loss = if start.ele > end.ele { start.ele - end.ele } else { 0.0 };
            
            let segment = SpatialSegment {
                id: format!("{}-{}", route_id, i),
                start: Point::new(start.lon, start.lat),
                end: Point::new(end.lon, end.lat),
                distance_km: distance,
                elevation_gain_m: elevation_gain,
                elevation_loss_m: elevation_loss,
            };
            
            segments.push(segment);
        }
    }
    
    SpatialIndex::from_segments(segments)
}

pub fn find_connected_segments(
    index: &SpatialIndex,
    start_point: (f64, f64),
    max_distance_km: f64,
    max_segments: usize,
) -> Vec<Vec<&SpatialSegment>> {
    let mut routes = Vec::new();
    let mut visited = std::collections::HashSet::new();
    
    // Find segments near the start point
    let initial_segments = index.nearest_neighbor(start_point.1, start_point.0, 10);
    
    for segment in initial_segments {
        if visited.contains(&segment.id) {
            continue;
        }
        
        let mut route = vec![segment];
        let mut current_distance = segment.distance_km;
        visited.insert(&segment.id);
        
        // Build route by finding connected segments
        while current_distance < max_distance_km && route.len() < max_segments {
            let last_segment = route.last().unwrap();
            let end_point = &last_segment.end;
            
            // Find nearby segments
            let nearby = index.nearest_neighbor(end_point.x(), end_point.y(), 5);
            
            let mut found_next = false;
            for next_segment in nearby {
                if visited.contains(&next_segment.id) {
                    continue;
                }
                
                // Check if segments are connected (end of one near start of other)
                let dist = distance_between_points(&last_segment.end, &next_segment.start);
                if dist < 0.001 {  // ~100m tolerance
                    route.push(next_segment);
                    current_distance += next_segment.distance_km;
                    visited.insert(&next_segment.id);
                    found_next = true;
                    break;
                }
            }
            
            if !found_next {
                break;
            }
        }
        
        if route.len() > 1 {
            routes.push(route);
        }
    }
    
    routes
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

fn distance_between_points(p1: &Point<f64>, p2: &Point<f64>) -> f64 {
    haversine_distance(p1.y(), p1.x(), p2.y(), p2.x())
}
