import { distanceBetween, geohashForLocation, geohashQueryBounds } from "geofire-common";

export type LatLng = [number, number];

export const RADII_KM = [3, 5, 10, 20] as const;
export const DEFAULT_RADIUS_KM = 3;

export const geohash = (p: LatLng, precision = 10) => geohashForLocation(p, precision);

/** Rangos de geohash para consultar Firestore dentro de un radio. */
export const queryBounds = (center: LatLng, radiusKm: number) => geohashQueryBounds(center, radiusKm * 1000);

export const distanceKm = (a: LatLng, b: LatLng) => distanceBetween(a, b);

/** Distancia que se muestra: redondeada a 0,5 km, mínimo 0,5 (privacidad). */
export function displayDistanceKm(km: number): number {
  return Math.max(0.5, Math.round(km * 2) / 2);
}
