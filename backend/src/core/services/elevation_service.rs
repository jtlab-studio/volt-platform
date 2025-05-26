use crate::core::models::race::{GpxData, ElevationProfile, GradientDistribution, GradientBin};
use crate::core::algorithms::gradient_analysis::{analyze_gradients, categorize_gradients};

pub fn calculate_elevation_metrics(gpx_data: &GpxData) -> (f64, f64, f64) {
    println!("=== CALCULATING ELEVATION METRICS ===");
    println!("Number of points: {}", gpx_data.points.len());
    
    let mut distance = 0.0;
    let mut elevation_gain = 0.0;
    let mut elevation_loss = 0.0;
    
    for i in 1..gpx_data.points.len() {
        let prev = &gpx_data.points[i - 1];
        let curr = &gpx_data.points[i];
        
        // Calculate distance
        let segment_distance = haversine_distance(prev.lat, prev.lon, curr.lat, curr.lon);
        distance += segment_distance;
        
        // Calculate elevation change
        let ele_diff = curr.ele - prev.ele;
        if ele_diff > 0.0 {
            elevation_gain += ele_diff;
        } else {
            elevation_loss += ele_diff.abs();
        }
        
        if i <= 5 || i >= gpx_data.points.len() - 5 {
            println!("Point {}: dist_segment={:.3}km, ele_diff={:.1}m", i, segment_distance, ele_diff);
        }
    }
    
    println!("TOTAL DISTANCE: {:.2} km", distance);
    println!("TOTAL ELEVATION GAIN: {:.0} m", elevation_gain);
    println!("TOTAL ELEVATION LOSS: {:.0} m", elevation_loss);
    println!("=== ELEVATION METRICS COMPLETE ===");
    
    (distance, elevation_gain, elevation_loss)
}

pub fn calculate_elevation_profile(gpx_data: &GpxData, window_size: u32) -> ElevationProfile {
    println!("=== CALCULATING ELEVATION PROFILE ===");
    println!("Window size: {}", window_size);
    
    let mut distances = vec![0.0];
    let mut elevations = vec![gpx_data.points[0].ele];
    let mut cumulative_distance = 0.0;
    
    for i in 1..gpx_data.points.len() {
        let prev = &gpx_data.points[i - 1];
        let curr = &gpx_data.points[i];
        
        let segment_distance = haversine_distance(prev.lat, prev.lon, curr.lat, curr.lon);
        cumulative_distance += segment_distance;
        distances.push(cumulative_distance);
        elevations.push(curr.ele);
    }
    
    println!("Profile has {} points", distances.len());
    println!("Distance range: 0.0 to {:.2} km", cumulative_distance);
    println!("Elevation range: {:.0} to {:.0} m", 
        elevations.iter().cloned().fold(f64::INFINITY, f64::min),
        elevations.iter().cloned().fold(f64::NEG_INFINITY, f64::max)
    );
    
    // Apply smoothing if window_size > 0
    let smoothed_elevations = if window_size > 0 {
        smooth_elevations(&elevations, window_size as usize)
    } else {
        elevations.clone()
    };
    
    println!("=== ELEVATION PROFILE COMPLETE ===");
    
    ElevationProfile {
        distance: distances,
        elevation: smoothed_elevations,
        smoothed: window_size > 0,
        window_size,
    }
}

pub fn calculate_gradient_distribution(
    gpx_data: &GpxData,
    window_size: u32,
) -> GradientDistribution {
    println!("=== CALCULATING GRADIENT DISTRIBUTION ===");
    
    // Use the gradient analysis algorithm
    let segments = analyze_gradients(gpx_data, window_size as f64);
    println!("Analyzed {} gradient segments", segments.len());
    
    let (ascent_bins, descent_bins) = categorize_gradients(&segments);
    
    let total_distance = calculate_elevation_metrics(gpx_data).0;
    
    let ascent: Vec<GradientBin> = ascent_bins.into_iter()
        .map(|(range, percentage)| {
            let distance = (percentage / 100.0) * total_distance;
            println!("Ascent bin {}: {:.1}% ({:.2}km)", range, percentage, distance);
            
            GradientBin {
                range,
                percentage,
                distance,
            }
        })
        .collect();
    
    let descent: Vec<GradientBin> = descent_bins.into_iter()
        .map(|(range, percentage)| {
            let distance = (percentage / 100.0) * total_distance;
            println!("Descent bin {}: {:.1}% ({:.2}km)", range, percentage, distance);
            
            GradientBin {
                range,
                percentage,
                distance,
            }
        })
        .collect();
    
    println!("=== GRADIENT DISTRIBUTION COMPLETE ===");
    
    GradientDistribution { ascent, descent }
}

fn smooth_elevations(elevations: &[f64], window_size: usize) -> Vec<f64> {
    let half_window = window_size / 2;
    let mut smoothed = Vec::with_capacity(elevations.len());
    
    for i in 0..elevations.len() {
        let start = i.saturating_sub(half_window);
        let end = (i + half_window + 1).min(elevations.len());
        
        let sum: f64 = elevations[start..end].iter().sum();
        let avg = sum / (end - start) as f64;
        smoothed.push(avg);
    }
    
    smoothed
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
