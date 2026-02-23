// ============================================================
// Priority Engine – Dispatch Logistics
// ============================================================

import { calculateWSI } from "./wsiCalculator";
import { CENTRAL_DEPOT } from "../data/mockData";

/**
 * Haversine formula to compute great-circle distance (km)
 * between two { lat, lng } coordinate objects.
 */
export function haversineDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // 2 decimal places
}

/**
 * Calculates a dispatch-priority score for a village.
 *
 * Formula:
 *   Priority = (WSI × (Population + Livestock)) / Current Storage
 *
 * A higher score means higher urgency.
 *
 * @param {Object} village
 * @returns {{ priorityScore: number, wsi: { score: number, category: string }, distanceKm: number }}
 */
export function getDispatchPriority(village) {
    const wsi = calculateWSI(village);
    const { population, livestock } = village.demographics;
    const currentStorage = Math.max(village.status.current_available_liters, 1); // avoid div-by-zero

    const priorityScore =
        Math.round(((wsi.score * (population + livestock)) / currentStorage) * 100) / 100;

    const distanceKm = haversineDistance(CENTRAL_DEPOT.coords, village.coords);

    return { priorityScore, wsi, distanceKm };
}
