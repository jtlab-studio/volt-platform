use crate::core::models::race::GpxData;

#[derive(Debug, Clone)]
pub struct GradientSegment {
    pub start_idx: usize,
    pub end_idx: usize,
    pub distance_m: f64,
    pub elevation_change_m: f64,
    pub gradient_percent: f64,
}

pub fn analyze_gradients(gpx_data: &GpxData, window_size_m: f64) -> Vec<GradientSegment> {
    let mut segments = Vec::new();
    let mut current_distance = 0.0;
    let mut window_start_idx = 0;
    
    for i in 1..gpx_data.points.len() {
        let prev = &gpx_data.points[i - 1];
        let curr = &gpx_data.points[i];
        
        let segment_distance = haversine_distance(prev.lat, prev.lon, curr.lat, curr.lon) * 1000.0; // to meters
        current_distance += segment_distance;
        
        // Check if we've reached the window size
        if current_distance >= window_size_m {
            let start_ele = gpx_data.points[window_start_idx].ele;
            let end_ele = curr.ele;
            let elevation_change = end_ele - start_ele;
            let gradient = (elevation_change / current_distance) * 100.0;
            
            segments.push(GradientSegment {
                start_idx: window_start_idx,
                end_idx: i,
                distance_m: current_distance,
                elevation_change_m: elevation_change,
                gradient_percent: gradient,
            });
            
            // Move window
            window_start_idx = i;
            current_distance = 0.0;
        }
    }
    
    segments
}

pub fn categorize_gradients(segments: &[GradientSegment]) -> (Vec<(String, f64)>, Vec<(String, f64)>) {
    let gradient_bins = vec![
        ("0-5", 0.0, 5.0),
        ("5-10", 5.0, 10.0),
        ("10-15", 10.0, 15.0),
        ("15-20", 15.0, 20.0),
        ("20-25", 20.0, 25.0),
        ("25-30", 25.0, 30.0),
        ("30+", 30.0, f64::INFINITY),
    ];
    
    let mut ascent_distances = vec![0.0; gradient_bins.len()];
    let mut descent_distances = vec![0.0; gradient_bins.len()];
    let mut total_ascent_distance = 0.0;
    let mut total_descent_distance = 0.0;
    
    for segment in segments {
        let abs_gradient = segment.gradient_percent.abs();
        
        for (i, (_, min, max)) in gradient_bins.iter().enumerate() {
            if abs_gradient >= *min && abs_gradient < *max {
                if segment.gradient_percent > 0.0 {
                    ascent_distances[i] += segment.distance_m;
                    total_ascent_distance += segment.distance_m;
                } else {
                    descent_distances[i] += segment.distance_m;
                    total_descent_distance += segment.distance_m;
                }
                break;
            }
        }
    }
    
    // Convert to percentages
    let ascent_percentages: Vec<(String, f64)> = gradient_bins
        .iter()
        .zip(ascent_distances.iter())
        .map(|((name, _, _), dist)| {
            let percentage = if total_ascent_distance > 0.0 {
                (dist / total_ascent_distance) * 100.0
            } else {
                0.0
            };
            (name.to_string(), percentage)
        })
        .collect();
    
    let descent_percentages: Vec<(String, f64)> = gradient_bins
        .iter()
        .zip(descent_distances.iter())
        .map(|((name, _, _), dist)| {
            let percentage = if total_descent_distance > 0.0 {
                (dist / total_descent_distance) * 100.0
            } else {
                0.0
            };
            (name.to_string(), percentage)
        })
        .collect();
    
    (ascent_percentages, descent_percentages)
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
