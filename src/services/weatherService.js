const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

export async function fetchLocationWeather(lat, lng) {
    try {
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lng}&aqi=no`
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            temp_c: data.current.temp_c,
            precip_mm: data.current.precip_mm,
            humidity: data.current.humidity,
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            last_updated: data.current.last_updated
        };
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
}
