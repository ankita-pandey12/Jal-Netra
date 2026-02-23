import { createContext, useContext, useState, useEffect } from "react";
import { nagpurData } from "../data/nagpurData";
import { calculateWSI } from "../utils/droughtEngine";

const WaterContext = createContext();

export function WaterProvider({ children }) {
    const [locations, setLocations] = useState([]);
    const [activeLayer, setActiveLayer] = useState("RISK"); // RISK, NDVI, WEATHER, GROUNDWATER

    // 🌊 Groundwater state (NEW)
    const [groundwaterData, setGroundwaterData] = useState({});

    const [fleet, setFleet] = useState([
        { id: "T-101", status: "AVAILABLE", assignment: null, lat: 21.1458, lng: 79.0882 },
        { id: "T-102", status: "EN-ROUTE", assignment: "Katol", lat: 21.2, lng: 78.8, otpScale: "4321", geofence: "SECURE" },
        { id: "T-103", status: "AVAILABLE", assignment: null, lat: 21.1458, lng: 79.0882 },
        { id: "T-104", status: "UNLOADING", assignment: "Hingna", lat: 21.1147, lng: 79.0304, otpScale: "8899", geofence: "SECURE" },
        { id: "T-105", status: "AVAILABLE", assignment: null, lat: 21.1458, lng: 79.0882 },
    ]);

    // 🔹 Initialize locations with WSI & priority
    useEffect(() => {
        const data = nagpurData.map((loc) => {
            const wsi = calculateWSI(loc);
            const demand = (loc.population * 40) + (loc.livestock * 30);
            const priorityScore = (wsi.score * demand) / 1000;
            return { ...loc, wsi, demand, priorityScore: Math.round(priorityScore) };
        });
        setLocations(data);
    }, []);

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

    // 🚚 Tanker allocation (UNCHANGED)
    const allocateTanker = (locationName) => {
        setFleet(prev => {
            const availableIndex = prev.findIndex(t => t.status === "AVAILABLE");
            if (availableIndex === -1) return prev;

            const newFleet = [...prev];
            newFleet[availableIndex] = {
                ...newFleet[availableIndex],
                status: "EN-ROUTE",
                assignment: locationName,
                geofence: "SECURE",
                otpScale: Math.floor(1000 + Math.random() * 9000).toString()
            };
            return newFleet;
        });
    };

    return (
        <WaterContext.Provider value={{
            locations,
            activeLayer,
            setActiveLayer,
            fleet,
            allocateTanker,
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