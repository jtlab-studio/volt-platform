use crate::core::models::race::{GpxData, GpxPoint, ElevationProfile, GradientDistribution, GradientBin};

pub fn calculate_elevation_metrics(gpx_data: &GpxData) -> (f64, f64, f64) {
    let mut distance = 0.0;
    let mut elevation_gain = 0.0;
    let mut elevation_loss = 0.0;
    
    for i in 1..gpx_data.points.len() {
        let prev = &gpx_data.points[i - 1];
        let curr = &gpx_data.points[i];
        
        // Calculate distance
        distance += haversine_distance(prev.lat, prev.lon, curr.lat, curr.lon);
        
        // Calculate elevation change
        let ele_diff = curr.ele - prev.ele;
        if ele_diff > 0.0 {
            elevation_gain += ele_diff;
        } else {
            elevation_loss += ele_diff.abs();
        }
    }
    
    (distance, elevation_gain, elevation_loss)
}

pub fn calculate_elevation_profile(gpx_data: &GpxData, window_size: u32) -> ElevationProfile {
    let mut distances = vec![0.0];
    let mut elevations = vec![gpx_data.points[0].ele];
    let mut cumulative_distance = 0.0;
    
    for i in 1..gpx_data.points.len() {
        let prev = &gpx_data.points[i - 1];
        let curr = &gpx_data.points[i];
        
        cumulative_distance += haversine_distance(prev.lat, prev.lon, curr.lat, curr.lon);
        distances.push(cumulative_distance);
        elevations.push(curr.ele);
    }
    
    // Apply smoothing if window_size > 0
    let smoothed_elevations = if window_size > 0 {
        smooth_elevations(&elevations, window_size as usize)
    } else {
        elevations.clone()
    };
    
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
    // Placeholder implementation
    let gradient_ranges = vec!["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30+"];
    
    let ascent_bins: Vec<GradientBin> = gradient_ranges
        .iter()
        .map(|range| GradientBin {
            range: range.to_string(),
            percentage: 100.0 / gradient_ranges.len() as f64,
            distance: 5.0,
        })
        .collect();
    
    let descent_bins = ascent_bins.clone();
    
    GradientDistribution {
        ascent: ascent_bins,
        descent: descent_bins,
    }
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
