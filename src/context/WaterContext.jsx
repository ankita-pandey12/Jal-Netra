import { createContext, useContext, useState, useEffect } from "react";
import { nagpurData } from "../data/nagpurData";
import { calculateWSI } from "../utils/droughtEngine";

const WaterContext = createContext();

export function WaterProvider({ children }) {
    const [locations, setLocations] = useState([]);
    const [activeLayer, setActiveLayer] = useState("RISK"); // RISK, NDVI, WEATHER, GROUNDWATER

    // 🌊 Groundwater state (NEW)
    const [groundwaterData, setGroundwaterData] = useState({});

    const [fleet, setFleet] = useState([]);

    // 🔹 Initialize locations & Fetch Fleet
    useEffect(() => {
        // Initialize locations
        const data = nagpurData.map((loc) => {
            const wsi = calculateWSI(loc);
            const demand = (loc.population * 40) + (loc.livestock * 30);
            const priorityScore = (wsi.score * demand) / 1000;
            return { ...loc, wsi, demand, priorityScore: Math.round(priorityScore) };
        });
        setLocations(data);

        // Fetch Fleet from Backend
        fetchFleet();
    }, []);

    const fetchFleet = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/tankers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setFleet(data);
            } else {
                console.error("Backend error or invalid format:", data);
            }
        } catch (err) {
            console.error("Failed to fetch fleet:", err);
        }
    };

    // 🌦 WEATHER UPDATE (UNCHANGED)
    const updateWeatherData = (weatherResults) => {
        setLocations(prev =>
            prev.map(loc => {
                const weather = weatherResults[loc.id];
                if (!weather) return loc;

                const updatedMetrics = {
                    ...loc.metrics,
                    current_rain: weather.precip_mm,
                    soil_moisture: weather.humidity // proxy
                };

                const updatedLoc = {
                    ...loc,
                    metrics: updatedMetrics,
                    weather_live: weather
                };

                const wsi = calculateWSI(updatedLoc);
                const demand = (loc.population * 40) + (loc.livestock * 30);
                const priorityScore = (wsi.score * demand) / 1000;

                return { ...updatedLoc, wsi, priorityScore: Math.round(priorityScore) };
            })
        );
    };

    // 🌊 GROUNDWATER UPDATE (NEW)
    const updateGroundwaterData = (groundwaterResults) => {
        setGroundwaterData(groundwaterResults);

        setLocations(prev =>
            prev.map(loc => {
                const groundwater = groundwaterResults[loc.id];
                if (!groundwater) return loc;

                const updatedMetrics = {
                    ...loc.metrics,
                    groundwater_level: groundwater.gw_level_m,
                    recharge_pct: groundwater.recharge_pct,
                    soil_moisture: groundwater.soil_moisture_pct
                };

                const updatedLoc = {
                    ...loc,
                    metrics: updatedMetrics,
                    groundwater_live: groundwater
                };

                const wsi = calculateWSI(updatedLoc);
                const demand = (loc.population * 40) + (loc.livestock * 30);
                const priorityScore = (wsi.score * demand) / 1000;

                return { ...updatedLoc, wsi, priorityScore: Math.round(priorityScore) };
            })
        );
    };

    // 🛰 NDVI PROXY UPDATE (NEW)
    const updateNDVIProxy = (proxyResults) => {
        setLocations(prev =>
            prev.map(loc => {
                const results = proxyResults[loc.id];
                if (!results) return loc;

                const updatedMetrics = {
                    ...loc.metrics,
                    soil_moisture_realtime: results.soilMoisture,
                    wsi_realtime: results.wsi
                };

                return { ...loc, metrics: updatedMetrics };
            })
        );
    };

    // 🚚 Tanker allocation (SYNCED WITH BACKEND)
    const allocateTanker = async (locationName) => {
        try {
            const res = await fetch('http://localhost:5000/api/allocate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ villageName: locationName })
            });

            if (res.ok) {
                fetchFleet(); // Refresh fleet data
                return true;
            }
            return false;
        } catch (err) {
            console.error("Allocation failed:", err);
            return false;
        }
    };

    // 🛡️ Verify OTP
    const verifyTanker = async (tankerId, otp) => {
        try {
            const res = await fetch('http://localhost:5000/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tankerId, otp })
            });

            if (res.ok) {
                fetchFleet();
                return { success: true };
            } else {
                const data = await res.json();
                return { success: false, error: data.error };
            }
        } catch (err) {
            console.error("Verification error:", err);
            return { success: false, error: 'Network Error' };
        }
    };

    return (
        <WaterContext.Provider value={{
            locations,
            activeLayer,
            setActiveLayer,
            fleet,
            allocateTanker,
            verifyTanker,
            refreshFleet: fetchFleet,
            updateWeatherData,
            groundwaterData,
            updateGroundwaterData,
            updateNDVIProxy
        }}>
            {children}
        </WaterContext.Provider>
    );
}

export const useWater = () => useContext(WaterContext);