use rstar::{RTree, RTreeObject, AABB, PointDistance};
use geo::Point;

#[derive(Clone, Debug)]
pub struct SpatialSegment {
    pub id: String,
    pub start: Point<f64>,
    pub end: Point<f64>,
    pub distance_km: f64,
    pub elevation_gain_m: f64,
    pub elevation_loss_m: f64,
}

impl RTreeObject for SpatialSegment {
    type Envelope = AABB<[f64; 2]>;
    
    fn envelope(&self) -> Self::Envelope {
        let start_coord = self.start.0;
        let end_coord = self.end.0;
        
        let min_x = start_coord.x.min(end_coord.x);
        let max_x = start_coord.x.max(end_coord.x);
        let min_y = start_coord.y.min(end_coord.y);
        let max_y = start_coord.y.max(end_coord.y);
        
        AABB::from_corners([min_x, min_y], [max_x, max_y])
    }
}

impl PointDistance for SpatialSegment {
    fn distance_2(&self, point: &[f64; 2]) -> f64 {
        let p = Point::new(point[0], point[1]);
        let start_dist = distance_squared(&p, &self.start);
        let end_dist = distance_squared(&p, &self.end);
        start_dist.min(end_dist)
    }
}

pub struct SpatialIndex {
    tree: RTree<SpatialSegment>,
}

impl SpatialIndex {
    pub fn new() -> Self {
        Self {
            tree: RTree::new(),
        }
    }
    
    pub fn from_segments(segments: Vec<SpatialSegment>) -> Self {
        Self {
            tree: RTree::bulk_load(segments),
        }
    }
    
    pub fn insert(&mut self, segment: SpatialSegment) {
        self.tree.insert(segment);
    }
    
    pub fn query_bbox(&self, min_lon: f64, min_lat: f64, max_lon: f64, max_lat: f64) -> Vec<&SpatialSegment> {
        let envelope = AABB::from_corners([min_lon, min_lat], [max_lon, max_lat]);
        self.tree.locate_in_envelope(&envelope).collect()
    }
    
    pub fn nearest_neighbor(&self, lon: f64, lat: f64, k: usize) -> Vec<&SpatialSegment> {
        self.tree.nearest_neighbor_iter(&[lon, lat])
            .take(k)
            .collect()
    }
}

fn distance_squared(p1: &Point<f64>, p2: &Point<f64>) -> f64 {
    let dx = p1.x() - p2.x();
    let dy = p1.y() - p2.y();
    dx * dx + dy * dy
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_spatial_index() {
        let segment = SpatialSegment {
            id: "test".to_string(),
            start: Point::new(6.0, 46.0),
            end: Point::new(7.0, 47.0),
            distance_km: 100.0,
            elevation_gain_m: 1000.0,
            elevation_loss_m: 800.0,
        };
        
        let mut index = SpatialIndex::new();
        index.insert(segment);
        
        let results = index.query_bbox(5.5, 45.5, 7.5, 47.5);
        assert_eq!(results.len(), 1);
    }
}
