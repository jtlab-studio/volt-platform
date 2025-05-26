use crate::core::models::race::{GpxData, GpxPoint};
use crate::errors::handlers::ApiError;

pub fn parse_gpx(gpx_content: &str) -> Result<GpxData, ApiError> {
    println!("=== PARSING GPX - START ===");
    println!("GPX content length: {} bytes", gpx_content.len());
    println!("First 200 chars: {}", &gpx_content[..gpx_content.len().min(200)]);
    
    // Clean up the GPX content to handle extended namespaces
    let cleaned_content = clean_gpx_content(gpx_content);
    
    // Try to parse as GPX using the gpx crate
    match gpx::read(cleaned_content.as_bytes()) {
        Ok(gpx) => {
            println!("GPX parsed successfully!");
            let mut points = Vec::new();
            
            // Extract points from all tracks and segments
            for (track_idx, track) in gpx.tracks.iter().enumerate() {
                println!("Processing track {}: {} segments", track_idx, track.segments.len());
                for (seg_idx, segment) in track.segments.iter().enumerate() {
                    println!("  Segment {}: {} points", seg_idx, segment.points.len());
                    for point in &segment.points {
                        points.push(GpxPoint {
                            lat: point.point().y(),
                            lon: point.point().x(),
                            ele: point.elevation.unwrap_or(0.0),
                            time: point.time.and_then(|t| t.format().ok()),
                        });
                    }
                }
            }
            
            // If no tracks, try waypoints
            if points.is_empty() {
                println!("No track points found, checking waypoints...");
                for waypoint in &gpx.waypoints {
                    points.push(GpxPoint {
                        lat: waypoint.point().y(),
                        lon: waypoint.point().x(),
                        ele: waypoint.elevation.unwrap_or(0.0),
                        time: waypoint.time.and_then(|t| t.format().ok()),
                    });
                }
            }
            
            println!("Total points extracted: {}", points.len());
            if points.len() > 0 {
                println!("First point: lat={}, lon={}, ele={}", points[0].lat, points[0].lon, points[0].ele);
                println!("Last point: lat={}, lon={}, ele={}", points.last().unwrap().lat, points.last().unwrap().lon, points.last().unwrap().ele);
            }
            
            if points.is_empty() {
                return Err(ApiError::BadRequest("No track points found in GPX file".to_string()));
            }
            
            println!("=== PARSING GPX - SUCCESS ===");
            Ok(GpxData { points })
        },
        Err(e) => {
            println!("GPX parsing failed: {:?}", e);
            
            // Fallback: try to parse manually for common GPX formats
            println!("Attempting manual GPX parsing...");
            
            let mut points = Vec::new();
            
            // Simple regex-based parsing for track points
            let trkpt_regex = regex::Regex::new(r#"(?s)<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>.*?(?:<ele>([^<]+)</ele>)?.*?</trkpt>"#).unwrap();
            
            for cap in trkpt_regex.captures_iter(&cleaned_content) {
                if let (Some(lat), Some(lon)) = (cap.get(1), cap.get(2)) {
                    let lat_val: f64 = lat.as_str().parse().unwrap_or(0.0);
                    let lon_val: f64 = lon.as_str().parse().unwrap_or(0.0);
                    let ele_val: f64 = cap.get(3).map(|e| e.as_str().parse().unwrap_or(0.0)).unwrap_or(0.0);
                    
                    points.push(GpxPoint {
                        lat: lat_val,
                        lon: lon_val,
                        ele: ele_val,
                        time: None,
                    });
                }
            }
            
            if points.is_empty() {
                // Try waypoints
                let wpt_regex = regex::Regex::new(r#"(?s)<wpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>.*?(?:<ele>([^<]+)</ele>)?.*?</wpt>"#).unwrap();
                
                for cap in wpt_regex.captures_iter(&cleaned_content) {
                    if let (Some(lat), Some(lon)) = (cap.get(1), cap.get(2)) {
                        let lat_val: f64 = lat.as_str().parse().unwrap_or(0.0);
                        let lon_val: f64 = lon.as_str().parse().unwrap_or(0.0);
                        let ele_val: f64 = cap.get(3).map(|e| e.as_str().parse().unwrap_or(0.0)).unwrap_or(0.0);
                        
                        points.push(GpxPoint {
                            lat: lat_val,
                            lon: lon_val,
                            ele: ele_val,
                            time: None,
                        });
                    }
                }
            }
            
            println!("Manual parsing found {} points", points.len());
            
            if points.is_empty() {
                Err(ApiError::BadRequest(format!("Failed to parse GPX file: {}", e)))
            } else {
                println!("=== MANUAL PARSING GPX - SUCCESS ===");
                Ok(GpxData { points })
            }
        }
    }
}

/// Clean GPX content to handle extended namespaces
fn clean_gpx_content(content: &str) -> String {
    // Remove all custom namespace declarations to simplify parsing
    let mut cleaned = content.to_string();
    
    // Remove namespace prefixes from tags
    let prefixes = vec!["gpxx:", "gpxtrx:", "gpxtpx:", "wptx1:", "trp:", "adv:", "prs:", "tmd:", "vptm:", "ctx:", "gpxacc:", "gpxpx:", "vidx1:"];
    for prefix in prefixes {
        cleaned = cleaned.replace(&format!("<{}", prefix), "<");
        cleaned = cleaned.replace(&format!("</{}", prefix), "</");
    }
    
    cleaned
}

pub fn gpx_to_string(gpx_data: &GpxData) -> String {
    let mut gpx = String::from(r#"<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Volt Platform" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Generated Route</name>
    <trkseg>
"#);
    
    for point in &gpx_data.points {
        gpx.push_str(&format!(
            r#"      <trkpt lat="{}" lon="{}">
        <ele>{}</ele>
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