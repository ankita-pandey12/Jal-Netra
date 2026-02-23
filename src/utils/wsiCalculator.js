// ============================================================
// Water Stress Index (WSI) Calculator – Prevention Logic
// ============================================================

/**
 * Calculates the Water Stress Index (WSI) for a village.
 *
 * Weights:
 *   - Rainfall Deviation : 40%
 *   - Groundwater Stress : 40%
 *   - Soil Moisture Stress: 20%
 *
 * @param {Object} village – A village object from mockData.
 * @returns {{ score: number, category: string }}
 */
export function calculateWSI(village) {
    const { metrics } = village;

    // --- Rainfall Deviation (0-100, higher = worse) -------------------
    const rainfallDeviation =
        ((metrics.rainfall_avg_10yr - metrics.rainfall_current) /
            metrics.rainfall_avg_10yr) *
        100;
    const rainfallScore = Math.max(0, Math.min(100, rainfallDeviation));

    // --- Groundwater Stress (0-100) -----------------------------------
    // Linear scale: 0m → 0, 40m → 50, 80m+ → 100
    let groundwaterScore;
    if (metrics.groundwater_depth <= 20) {
        groundwaterScore = (metrics.groundwater_depth / 20) * 25;
    } else if (metrics.groundwater_depth <= 40) {
        groundwaterScore = 25 + ((metrics.groundwater_depth - 20) / 20) * 25;
    } else if (metrics.groundwater_depth <= 60) {
        groundwaterScore = 50 + ((metrics.groundwater_depth - 40) / 20) * 30;
    } else {
        groundwaterScore = 80 + ((metrics.groundwater_depth - 60) / 40) * 20;
    }
    groundwaterScore = Math.min(100, groundwaterScore);

    // --- Soil Moisture Stress (0-100, inverse) ------------------------
    // 0% moisture → 100 stress, 50%+ moisture → 0 stress
    const soilMoistureScore = Math.max(0, Math.min(100, (1 - metrics.soil_moisture / 50) * 100));

    // --- Weighted Composite -------------------------------------------
    const score = Math.round(
        rainfallScore * 0.4 + groundwaterScore * 0.4 + soilMoistureScore * 0.2
    );

    // --- Category Assignment ------------------------------------------
    let category;
    if (score > 75) category = "CRITICAL";
    else if (score >= 40) category = "STRESSED";
    else category = "STABLE";

    return { score, category };
}
