use crate::core::models::race::{GpxData, GpxPoint};
use crate::errors::handlers::ApiError;

/// Maximum number of points to process (to prevent memory issues)
const MAX_POINTS: usize = 50000;

/// Minimum distance between points in meters (to reduce density)
const MIN_DISTANCE_METERS: f64 = 5.0;

pub fn parse_gpx(gpx_content: &str) -> Result<GpxData, ApiError> {
    println!("=== PARSING GPX - START ===");
    println!("GPX content length: {} bytes", gpx_content.len());
    
    // Clean up the GPX content to handle extended namespaces
    let cleaned_content = clean_gpx_content(gpx_content);
    
    // Extract raw points from GPX
    let raw_points = extract_raw_points(&cleaned_content)?;
    
    if raw_points.is_empty() {
        return Err(ApiError::BadRequest("No valid track points found in GPX file".to_string()));
    }
    
    println!("Raw points extracted: {}", raw_points.len());
    
    // Strip and optimize points
    let stripped_points = strip_and_optimize_points(raw_points)?;
    
    println!("Points after stripping: {}", stripped_points.len());
    println!("=== PARSING GPX - SUCCESS ===");
    
    Ok(GpxData { points: stripped_points })
}

/// Extract raw points from GPX content
fn extract_raw_points(content: &str) -> Result<Vec<GpxPoint>, ApiError> {
    let mut points = Vec::new();
    
    // Try to parse using the gpx crate first
    match gpx::read(content.as_bytes()) {
        Ok(gpx) => {
            // Extract from tracks
            for track in &gpx.tracks {
                for segment in &track.segments {
                    for point in &segment.points {
                        points.push(GpxPoint {
                            lat: point.point().y(),
                            lon: point.point().x(),
                            ele: point.elevation.unwrap_or(0.0),
                            time: None, // Strip time data
                        });
                    }
                }
            }
            
            // If no tracks, try waypoints
            if points.is_empty() {
                for waypoint in &gpx.waypoints {
                    points.push(GpxPoint {
                        lat: waypoint.point().y(),
                        lon: waypoint.point().x(),
                        ele: waypoint.elevation.unwrap_or(0.0),
                        time: None,
                    });
                }
            }
        }
        Err(_) => {
            // Fallback to regex parsing
            println!("Using fallback regex parsing...");
            
            // Parse track points
            let trkpt_regex = regex::Regex::new(
                r#"<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>.*?(?:<ele>([^<]+)</ele>)?.*?</trkpt>"#
            ).unwrap();
            
            for cap in trkpt_regex.captures_iter(content) {
                if let (Some(lat), Some(lon)) = (cap.get(1), cap.get(2)) {
                    let lat_val: f64 = lat.as_str().parse().unwrap_or(0.0);
                    let lon_val: f64 = lon.as_str().parse().unwrap_or(0.0);
                    let ele_val: f64 = cap.get(3)
                        .map(|e| e.as_str().parse().unwrap_or(0.0))
                        .unwrap_or(0.0);
                    
                    // Validate coordinates
                    if lat_val.abs() <= 90.0 && lon_val.abs() <= 180.0 {
                        points.push(GpxPoint {
                            lat: lat_val,
                            lon: lon_val,
                            ele: ele_val,
                            time: None,
                        });
                    }
                }
            }
            
            // Try waypoints if no track points found
            if points.is_empty() {
                let wpt_regex = regex::Regex::new(
                    r#"<wpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>.*?(?:<ele>([^<]+)</ele>)?.*?</wpt>"#
                ).unwrap();
                
                for cap in wpt_regex.captures_iter(content) {
                    if let (Some(lat), Some(lon)) = (cap.get(1), cap.get(2)) {
                        let lat_val: f64 = lat.as_str().parse().unwrap_or(0.0);
                        let lon_val: f64 = lon.as_str().parse().unwrap_or(0.0);
                        let ele_val: f64 = cap.get(3)
                            .map(|e| e.as_str().parse().unwrap_or(0.0))
                            .unwrap_or(0.0);
                        
                        if lat_val.abs() <= 90.0 && lon_val.abs() <= 180.0 {
                            points.push(GpxPoint {
                                lat: lat_val,
                                lon: lon_val,
                                ele: ele_val,
                                time: None,
                            });
                        }
                    }
                }
            }
        }
    }
    
    Ok(points)
}

/// Strip non-essential data and optimize point density
fn strip_and_optimize_points(mut points: Vec<GpxPoint>) -> Result<Vec<GpxPoint>, ApiError> {
    if points.is_empty() {
        return Ok(points);
    }
    
    // Step 1: Remove duplicate consecutive points
    points.dedup_by(|a, b| {
        (a.lat - b.lat).abs() < 0.000001 && 
        (a.lon - b.lon).abs() < 0.000001
    });
    
    // Step 2: Limit total number of points
    if points.len() > MAX_POINTS {
        println!("Reducing points from {} to {}", points.len(), MAX_POINTS);
        points = downsample_points(points, MAX_POINTS);
    }
    
    // Step 3: Remove points that are too close together
    let mut optimized = vec![points[0].clone()];
    let mut last_kept = &points[0];
    
    for point in points.iter().skip(1) {
        let distance = haversine_distance(last_kept.lat, last_kept.lon, point.lat, point.lon) * 1000.0;
        
        if distance >= MIN_DISTANCE_METERS {
            optimized.push(point.clone());
            last_kept = point;
        }
    }
    
    // Always keep the last point
    if optimized.len() > 1 {
        let last_point = points.last().unwrap();
        let last_optimized = optimized.last().unwrap();
        
        if last_point.lat != last_optimized.lat || last_point.lon != last_optimized.lon {
            optimized.push(last_point.clone());
        }
    }
    
    // Step 4: Clean elevation data
    clean_elevation_data(&mut optimized);
    
    // Ensure we have at least 2 points
    if optimized.len() < 2 {
        return Err(ApiError::BadRequest("Insufficient valid points after optimization".to_string()));
    }
    
    Ok(optimized)
}

/// Downsample points to a target count while preserving route shape
fn downsample_points(points: Vec<GpxPoint>, target_count: usize) -> Vec<GpxPoint> {
    if points.len() <= target_count {
        return points;
    }
    
    let step = points.len() as f64 / target_count as f64;
    let mut result = Vec::with_capacity(target_count);
    
    // Always include first point
    result.push(points[0].clone());
    
    // Sample points at regular intervals
    let mut index = step;
    while index < points.len() as f64 - 1.0 {
        result.push(points[index.floor() as usize].clone());
        index += step;
    }
    
    // Always include last point
    result.push(points.last().unwrap().clone());
    
    result
}

/// Clean elevation data by removing obvious errors
fn clean_elevation_data(points: &mut Vec<GpxPoint>) {
    if points.is_empty() {
        return;
    }
    
    // Step 1: Replace invalid elevations (0 or unrealistic values)
    let valid_elevations: Vec<f64> = points.iter()
        .map(|p| p.ele)
        .filter(|&e| e > -500.0 && e < 9000.0) // Reasonable Earth elevation range
        .collect();
    
    if valid_elevations.is_empty() {
        // If no valid elevations, set all to 0
        for point in points.iter_mut() {
            point.ele = 0.0;
        }
        return;
    }
    
    let avg_elevation = valid_elevations.iter().sum::<f64>() / valid_elevations.len() as f64;
    
    // Replace invalid elevations with average
    for point in points.iter_mut() {
        if point.ele <= -500.0 || point.ele >= 9000.0 {
            point.ele = avg_elevation;
        }
    }
    
    // Step 2: Smooth out extreme elevation spikes
    let mut i = 1;
    while i < points.len() - 1 {
        let prev_ele = points[i - 1].ele;
        let curr_ele = points[i].ele;
        let next_ele = points[i + 1].ele;
        
        // Check for spikes (point significantly different from neighbors)
        let diff_prev = (curr_ele - prev_ele).abs();
        let diff_next = (curr_ele - next_ele).abs();
        let diff_neighbors = (next_ele - prev_ele).abs();
        
        // If current point creates a spike > 100m from both neighbors
        // but neighbors are close to each other, smooth it
        if diff_prev > 100.0 && diff_next > 100.0 && diff_neighbors < 50.0 {
            points[i].ele = (prev_ele + next_ele) / 2.0;
        }
        
        i += 1;
    }
}

/// Clean GPX content to handle extended namespaces and formatting issues
fn clean_gpx_content(content: &str) -> String {
    let mut cleaned = content.to_string();
    
    // Remove BOM if present
    if cleaned.starts_with('\u{feff}') {
        cleaned = cleaned.trim_start_matches('\u{feff}').to_string();
    }
    
    // Remove all namespace prefixes from tags
    let prefixes = vec![
        "gpxx:", "gpxtrx:", "gpxtpx:", "wptx1:", "trp:", 
        "adv:", "prs:", "tmd:", "vptm:", "ctx:", "gpxacc:", 
        "gpxpx:", "vidx1:", "ns2:", "ns3:", "gpxdata:"
    ];
    
    for prefix in prefixes {
        cleaned = cleaned.replace(&format!("<{}", prefix), "<");
        cleaned = cleaned.replace(&format!("</{}", prefix), "</");
    }
    
    // Remove extension blocks that might contain problematic data
    let extension_regex = regex::Regex::new(r"<extensions>.*?</extensions>").unwrap();
    cleaned = extension_regex.replace_all(&cleaned, "").to_string();
    
    cleaned
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

pub fn gpx_to_string(gpx_data: &GpxData) -> String {
    let mut gpx = String::from(r#"<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Volt Platform" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Processed Route</name>
    <desc>Stripped and optimized GPX data</desc>
    <time>"#);
    
    gpx.push_str(&chrono::Utc::now().to_rfc3339());
    gpx.push_str(r#"</time>
  </metadata>
  <trk>
    <name>Processed Route</name>
    <trkseg>
"#);
    
    for point in &gpx_data.points {
        gpx.push_str(&format!(
            r#"      <trkpt lat="{:.6}" lon="{:.6}">
        <ele>{:.1}</ele>
      </trkpt>
"#,
            point.lat, point.lon, point.ele
        ));
    }
    
    gpx.push_str(r#"    </trkseg>
  </trk>
</gpx>"#);
    
    gpx
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_point_stripping() {
        let points = vec![
            GpxPoint { lat: 46.0, lon: 7.0, ele: 1000.0, time: None },
            GpxPoint { lat: 46.0, lon: 7.0, ele: 1000.0, time: None }, // Duplicate
            GpxPoint { lat: 46.00001, lon: 7.00001, ele: 1001.0, time: None }, // Too close
            GpxPoint { lat: 46.001, lon: 7.001, ele: 1010.0, time: None }, // Good
        ];
        
        let result = strip_and_optimize_points(points).unwrap();
        assert_eq!(result.len(), 2); // Should keep first and last good point
    }
    
    #[test]
    fn test_elevation_cleaning() {
        let mut points = vec![
            GpxPoint { lat: 46.0, lon: 7.0, ele: 1000.0, time: None },
            GpxPoint { lat: 46.1, lon: 7.1, ele: -600.0, time: None }, // Invalid
            GpxPoint { lat: 46.2, lon: 7.2, ele: 10000.0, time: None }, // Invalid
            GpxPoint { lat: 46.3, lon: 7.3, ele: 1100.0, time: None },
        ];
        
        clean_elevation_data(&mut points);
        
        // Invalid elevations should be replaced
        assert!(points[1].ele > -500.0);
        assert!(points[2].ele < 9000.0);
    }
}
