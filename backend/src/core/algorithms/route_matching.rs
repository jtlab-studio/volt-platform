use crate::core::models::synthesis::{BoundingBox, RouteCandidate};
use crate::core::models::race::GpxData;
use crate::core::services::itra_calculator::calculate_similarity;

pub struct RouteMatchingConfig {
    pub max_results: usize,
    pub min_similarity_score: f64,
    pub distance_tolerance: f64, // percentage
}

impl Default for RouteMatchingConfig {
    fn default() -> Self {
        Self {
            max_results: 50,
            min_similarity_score: 0.5,
            distance_tolerance: 0.2, // 20% tolerance
        }
    }
}

pub fn find_similar_routes(
    _reference: &GpxData,  // Prefix with underscore to indicate it's intentionally unused
    reference_metrics: (f64, f64, f64), // distance, gain, loss
    candidates: Vec<RouteCandidate>,
    config: RouteMatchingConfig,
) -> Vec<RouteCandidate> {
    let (ref_distance, ref_gain, _) = reference_metrics;
    
    let mut scored_candidates: Vec<(f64, RouteCandidate)> = candidates
        .into_iter()
        .map(|candidate| {
            let similarity = calculate_similarity(
                ref_distance,
                ref_gain,
                candidate.distance_km,
                candidate.elevation_gain_m,
            );
            (similarity, candidate)
        })
        .filter(|(score, _)| *score >= config.min_similarity_score)
        .collect();
    
    // Sort by similarity score (descending)
    scored_candidates.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
    
    // Take top N results
    scored_candidates
        .into_iter()
        .take(config.max_results)
        .map(|(score, mut candidate)| {
            candidate.similarity_score = score;
            candidate
        })
        .collect()
}

pub fn filter_routes_by_bbox(
    routes: Vec<RouteCandidate>,
    bbox: &BoundingBox,
) -> Vec<RouteCandidate> {
    routes
        .into_iter()
        .filter(|route| {
            // Check if all points are within bbox
            route.route.points.iter().all(|p| bbox.contains(p.lat, p.lon))
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::models::synthesis::RouteData;
    
    #[test]
    fn test_route_filtering() {
        let bbox = BoundingBox {
            north: 47.0,
            south: 46.0,
            east: 7.0,
            west: 6.0,
        };
        
        let route1 = RouteCandidate {
            id: "1".to_string(),
            distance_km: 50.0,
            elevation_gain_m: 2000.0,
            elevation_loss_m: 2000.0,
            itra_effort_distance: 70.0,
            similarity_score: 0.0,
            route: RouteData {
                points: vec![
                    crate::core::models::synthesis::RoutePoint { lat: 46.5, lon: 6.5, ele: 1000.0 },
                ],
            },
        };
        
        let route2 = RouteCandidate {
            id: "2".to_string(),
            distance_km: 50.0,
            elevation_gain_m: 2000.0,
            elevation_loss_m: 2000.0,
            itra_effort_distance: 70.0,
            similarity_score: 0.0,
            route: RouteData {
                points: vec![
                    crate::core::models::synthesis::RoutePoint { lat: 48.0, lon: 6.5, ele: 1000.0 },
                ],
            },
        };
        
        let filtered = filter_routes_by_bbox(vec![route1, route2], &bbox);
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].id, "1");
    }
}
