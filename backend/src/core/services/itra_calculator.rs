/// Calculate ITRA effort distance based on distance and elevation gain
/// Formula: effort_distance = distance + (elevation_gain / 100)
pub fn calculate_itra_effort(distance_km: f64, elevation_gain_m: f64) -> f64 {
    distance_km + (elevation_gain_m / 100.0)
}

/// Calculate similarity score between two routes based on ITRA effort distance
pub fn calculate_similarity(
    ref_distance: f64,
    ref_elevation_gain: f64,
    cand_distance: f64,
    cand_elevation_gain: f64,
) -> f64 {
    let ref_itra = calculate_itra_effort(ref_distance, ref_elevation_gain);
    let cand_itra = calculate_itra_effort(cand_distance, cand_elevation_gain);
    
    // Calculate percentage difference
    let diff = (ref_itra - cand_itra).abs() / ref_itra;
    
    // Convert to similarity score (1.0 = perfect match, 0.0 = no similarity)
    // Using exponential decay for smoother scoring
    (-diff * 5.0).exp()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_itra_calculation() {
        let distance = 42.195; // Marathon distance
        let elevation_gain = 1000.0; // 1000m elevation gain
        
        let itra = calculate_itra_effort(distance, elevation_gain);
        assert_eq!(itra, 52.195); // 42.195 + (1000/100)
    }
    
    #[test]
    fn test_similarity_calculation() {
        let ref_dist = 50.0;
        let ref_ele = 2000.0;
        
        // Perfect match
        let sim1 = calculate_similarity(ref_dist, ref_ele, ref_dist, ref_ele);
        assert!((sim1 - 1.0).abs() < 0.001);
        
        // Similar route
        let sim2 = calculate_similarity(ref_dist, ref_ele, 48.0, 2100.0);
        assert!(sim2 > 0.8);
        
        // Very different route
        let sim3 = calculate_similarity(ref_dist, ref_ele, 10.0, 100.0);
        assert!(sim3 < 0.1);
    }
}
