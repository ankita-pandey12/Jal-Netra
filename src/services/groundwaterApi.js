const BASE_URL = import.meta.env.VITE_GROUNDWATER_BASE_URL;

/**
 * Fetch derived groundwater data using satellite soil moisture
 * @param {number} lat
 * @param {number} lng
 */
export async function fetchLocationGroundwater(lat, lng) {
    try {
        const params = new URLSearchParams({
            parameters: "SOILM",
            community: "AG",
            latitude: lat,
            longitude: lng,
            start: "20240101",
            end: "20240131",
            format: "JSON"
        });

        const response = await fetch(`${BASE_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Groundwater API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Latest soil moisture value
        const soilMoistureValues = Object.values(
            data.properties.parameter.SOILM
        );

        const soilMoisture =
            soilMoistureValues[soilMoistureValues.length - 1];

        const gwLevel = Math.max(8, 60 - soilMoisture * 100);

        return {
            gw_level_m: Number(gwLevel.toFixed(1)),
            recharge_pct: Math.round(soilMoisture * 100),
            soil_moisture_pct: Math.round(soilMoisture * 100),
            trend: gwLevel > 40 ? "Declining" : "Stable",
            status: gwLevel > 40 ? "Severe" : "Moderate",
            last_updated: new Date().toLocaleString()
        };

    } catch (error) {
        console.error("Error fetching groundwater:", error);
        return null;
    }
}