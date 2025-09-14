import { getDistance } from 'geolib';

export function calculateDistance(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): number {
  return getDistance(start, end);
}

export function isWithinRadius(
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number },
  radius: number
): boolean {
  const distance = calculateDistance(pointA, pointB);
  return distance <= radius * 1000; // Convert radius from km to meters
}