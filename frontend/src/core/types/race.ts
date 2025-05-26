export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
  time?: string;
}

export interface Race {
  id: string;
  userId: string;
  name: string;
  gpxData: {
    points: GpxPoint[];
  };
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  itraEffortDistance: number;
  createdAt: string;
}

export interface GradientBin {
  range: string;
  percentage: number;
  distance: number;
}

export interface GradientDistribution {
  ascent: GradientBin[];
  descent: GradientBin[];
}

export interface ElevationProfile {
  distance: number[];
  elevation: number[];
  smoothed: boolean;
  windowSize: number;
}
