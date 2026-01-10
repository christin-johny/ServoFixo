import { z } from "zod";

// --- TYPES ---

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface ZoneBoundary {
  lat: number;
  lng: number;
}

export interface ZoneOption {
  id: string;
  name: string;
  description: string; // Acts as 'City'
  isActive: boolean;
  boundaries: ZoneBoundary[];
}

// Runtime type with calculated center
export interface RuntimeZoneOption extends ZoneOption {
  center: GeoCoordinate; 
}

// Extended type with Normalized City
export interface ProcessedZone extends RuntimeZoneOption {
  normalizedCity: string;
}

// --- ZOD SCHEMA ---
export const step3Schema = z.object({
  zoneIds: z.array(z.string())
    .min(1, "Please select a service zone.")
    .max(1, "You can only be active in one primary zone.")
});

// --- HELPERS ---

export const calculatePolygonCenter = (boundaries: ZoneBoundary[]): GeoCoordinate => {
  if (!boundaries || boundaries.length === 0) return { lat: 0, lng: 0 };
  let sumLat = 0, sumLng = 0;
  boundaries.forEach(b => { sumLat += b.lat; sumLng += b.lng; });
  return { lat: sumLat / boundaries.length, lng: sumLng / boundaries.length };
};

export const calculateDistance = (
  userLat: number, userLng: number, targetLat: number, targetLng: number
): number => {
  const R = 6371; 
  const dLat = deg2rad(targetLat - userLat);
  const dLon = deg2rad(targetLng - userLng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(targetLat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

// ✅ NEW: Centralized Data Processor
export const processRawZones = (rawData: ZoneOption[]): ProcessedZone[] => {
  return rawData.map((z) => ({
    ...z,
    center: calculatePolygonCenter(z.boundaries),
    // Fix empty descriptions by falling back to name
    normalizedCity: z.description && z.description.trim() !== "" ? z.description : z.name
  }));
};

// ✅ NEW: Logic to find the nearest city from a list
export const findNearestCity = (zones: ProcessedZone[], lat: number, lng: number): string | null => {
  if (zones.length === 0) return null;

  let nearestCity = "";
  let minDistance = Infinity;

  zones.forEach(z => {
      const dist = calculateDistance(lat, lng, z.center.lat, z.center.lng);
      if (dist < minDistance) {
          minDistance = dist;
          nearestCity = z.normalizedCity; 
      }
  });

  return nearestCity || null;
};

// Sort Dropdown Options
export const sortCitiesByLocation = (
  cities: string[],
  zones: ProcessedZone[],
  userLoc: GeoCoordinate
): string[] => {
  return cities.sort((cityA, cityB) => {
    const getMinDist = (city: string) => Math.min(
      ...zones
        .filter((z) => z.normalizedCity === city)
        .map((z) => calculateDistance(userLoc.lat, userLoc.lng, z.center.lat, z.center.lng))
    );
    return getMinDist(cityA) - getMinDist(cityB);
  });
};