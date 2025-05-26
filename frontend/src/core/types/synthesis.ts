export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SynthesisRequest {
  referenceRaceId: string;
  boundingBox: BoundingBox;
  rollingWindow: number;
  maxResults: number;
}

export interface SynthesisResult {
  id: string;
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  itraEffortDistance: number;
  similarityScore: number;
  route: {
    points: Array<{
      lat: number;
      lon: number;
      ele: number;
    }>;
  };
}

export interface SynthesisResponse {
  id: string;
  userId: string;
  referenceRaceId: string;
  results: SynthesisResult[];
  createdAt: string;
}
