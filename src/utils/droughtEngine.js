/**
 * Drought Intelligence Engine
 * 
 * Weights:
 * - Rainfall Deviation (40%)
 * - Groundwater Depth (30%)
 * - Soil Moisture (30%)
 */
export function calculateWSI(location) {
    const { metrics } = location;

    // 1. Rainfall Deviation (40% weight)
    // Formula: ((Avg - Current) / Avg) * 100
    const rainDev = ((metrics.avg_rain - metrics.current_rain) / metrics.avg_rain) * 100;
    const rainScore = Math.max(0, Math.min(100, rainDev));

    // 2. Groundwater Depth (30% weight)
    // Scale: 0m = 0, 60m+ = 100
    const gwScore = Math.max(0, Math.min(100, (metrics.groundwater_level / 60) * 100));

    // 3. Soil Moisture (30% weight)
    // Formula: 100 - Moisture Percentage
    const moistureScore = 100 - metrics.soil_moisture;

    // Composite Score
    const score = Math.round(
        (rainScore * 0.4) + (gwScore * 0.3) + (moistureScore * 0.3)
    );

    let category;
    let color;
    if (score > 75) {
        category = "CRITICAL";
        color = "#ef4444"; // Red
    } else if (score >= 40) {
        category = "STRESSED";
        color = "#f59e0b"; // Yellow
    } else {
        category = "STABLE";
        color = "#10b981"; // Green
    }

    return { score, category, color };
}

/**
 * Logistics: Predictive Demand & Priority
 * 
 * Demand: (Pop * 40L) + (Livestock * 30L)
 * Priority Score: (WSI * Demand) / 1000
 */
export function getPriority(location) {
    const wsi = calculateWSI(location);

    // Daily Demand in Liters
    const demand = (location.population * 40) + (location.livestock * 30);

    // Priority Score
    const priorityScore = (wsi.score * demand) / 1000;

    return {
        ...location,
        wsi,
        demand,
        priorityScore: Math.round(priorityScore)
    };
}
