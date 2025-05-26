use crate::core::models::synthesis::BoundingBox;

pub fn expand_bbox(bbox: &BoundingBox, factor: f64) -> BoundingBox {
    let center_lat = (bbox.north + bbox.south) / 2.0;
    let center_lon = (bbox.east + bbox.west) / 2.0;
    
    let lat_span = bbox.north - bbox.south;
    let lon_span = bbox.east - bbox.west;
    
    let new_lat_span = lat_span * factor;
    let new_lon_span = lon_span * factor;
    
    BoundingBox {
        north: center_lat + new_lat_span / 2.0,
        south: center_lat - new_lat_span / 2.0,
        east: center_lon + new_lon_span / 2.0,
        west: center_lon - new_lon_span / 2.0,
    }
}

pub fn validate_bbox(bbox: &BoundingBox) -> Result<(), String> {
    if bbox.north <= bbox.south {
        return Err("North must be greater than south".to_string());
    }
    
    if bbox.east <= bbox.west {
        return Err("East must be greater than west".to_string());
    }
    
    if bbox.north > 90.0 || bbox.south < -90.0 {
        return Err("Latitude must be between -90 and 90".to_string());
    }
    
    if bbox.east > 180.0 || bbox.west < -180.0 {
        return Err("Longitude must be between -180 and 180".to_string());
    }
    
    // Check if area is reasonable (not too large)
    let area = bbox.area_km2();
    if area > 10000.0 {
        return Err("Bounding box area is too large (max 10,000 km²)".to_string());
    }
    
    if area < 1.0 {
        return Err("Bounding box area is too small (min 1 km²)".to_string());
    }
    
    Ok(())
}

pub fn bbox_from_points(points: &[(f64, f64)]) -> Option<BoundingBox> {
    if points.is_empty() {
        return None;
    }
    
    let mut min_lat = points[0].0;
    let mut max_lat = points[0].0;
    let mut min_lon = points[0].1;
    let mut max_lon = points[0].1;
    
    for &(lat, lon) in points {
        min_lat = min_lat.min(lat);
        max_lat = max_lat.max(lat);
        min_lon = min_lon.min(lon);
        max_lon = max_lon.max(lon);
    }
    
    Some(BoundingBox {
        north: max_lat,
        south: min_lat,
        east: max_lon,
        west: min_lon,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_expand_bbox() {
        let bbox = BoundingBox {
            north: 47.0,
            south: 46.0,
            east: 7.0,
            west: 6.0,
        };
        
        let expanded = expand_bbox(&bbox, 2.0);
        assert_eq!(expanded.north, 47.5);
        assert_eq!(expanded.south, 45.5);
        assert_eq!(expanded.east, 7.5);
        assert_eq!(expanded.west, 5.5);
    }
    
    #[test]
    fn test_validate_bbox() {
        let valid_bbox = BoundingBox {
            north: 47.0,
            south: 46.0,
            east: 7.0,
            west: 6.0,
        };
        assert!(validate_bbox(&valid_bbox).is_ok());
        
        let invalid_bbox = BoundingBox {
            north: 46.0,
            south: 47.0,
            east: 7.0,
            west: 6.0,
        };
        assert!(validate_bbox(&invalid_bbox).is_err());
    }
}
