import { useState } from "react";
import { useWater } from "../context/WaterContext";
import MapContainer from "./MapContainer";
import { fetchLocationGroundwater } from "../services/groundwaterApi";

import {
    AlertTriangle,
    Satellite,
    CloudSun,
    Waves,
    Activity,
    ChevronRight,
    TrendingDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchLocationWeather } from "../services/weatherService";
import DispatchToast from "./DispatchToast";

export default function IntelligencePage() {
    const { locations, activeLayer, setActiveLayer, updateWeatherData } = useWater();
    const [isSimulating, setIsSimulating] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const fetchAllWeather = async () => {
        setIsSimulating(true);
        const weatherResults = {};

        try {
            await Promise.all(locations.map(async (loc) => {
                const weather = await fetchLocationWeather(loc.coords.lat, loc.coords.lng);
                if (weather) {
                    weatherResults[loc.id] = weather;
                }
            }));

            updateWeatherData(weatherResults);
            setToast({ type: "success", message: "Weather data for Nagpur District updated successfully." });
            setTimeout(() => setToast(null), 4000);
        } catch (error) {
            setToast({ type: "error", message: "Failed to update weather data." });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleLayerChange = (layer) => {
        if (layer === "WEATHER") {
            fetchAllWeather();
        } else {
            setIsSimulating(true);
            setTimeout(() => {
                setActiveLayer(layer);
                setIsSimulating(false);
            }, 800);
        }
        setActiveLayer(layer);
    };

    const topRisk = [...locations]
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 5);

    const layerButtons = [
        { id: "RISK", name: "Risk Map", icon: <AlertTriangle size={16} /> },
        { id: "NDVI", name: "NDVI Sat", icon: <Satellite size={16} /> },
        { id: "WEATHER", name: "Weather", icon: <CloudSun size={16} /> },
        { id: "GROUNDWATER", name: "Groundwater", icon: <Waves size={16} /> },
    ];

    return (
        <div className="h-full flex gap-4 p-4 overflow-hidden">
            {/* Risk Sidebar */}
            <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
                <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col shadow-sm overflow-hidden flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            High Risk Areas
                        </h2>
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Top 5</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {topRisk.map((loc, idx) => (
                            <div
                                key={loc.id}
                                onClick={() => navigate(`/logistics?village=${loc.name}`)}
                                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-500/30 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">{loc.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">WSI: {loc.wsi.score}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Pop: {(loc.population / 1000).toFixed(0)}k</span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                                        style={{ backgroundColor: loc.wsi.color }}
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] text-slate-500 font-bold">
                                        Demand: <span className="text-slate-800 font-bold">{(loc.demand / 1000).toFixed(0)}kL</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global Stats */}
                <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">District Wide</p>
                        <h4 className="text-2xl font-bold mb-4">65% <span className="text-xs font-normal opacity-70">Stress Avg</span></h4>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full w-[65%]" />
                        </div>
                        <p className="text-[10px] mt-4 font-medium opacity-80">Monitoring 2.4M people across 14 tehsils.</p>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
                </div>
            </aside>

            {/* Map Engine */}
            <section className="flex-1 min-w-0 relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <MapContainer
                    locations={locations}
                    onDispatch={(name) => navigate(`/logistics?village=${name}`)}
                />

                {/* Dynamic Layer Switcher */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-2xl z-20">
                    {layerButtons.map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => handleLayerChange(btn.id)}
                            disabled={isSimulating}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeLayer === btn.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                } ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {btn.icon}
                            {btn.name}
                        </button>
                    ))}
                </div>

                {/* Simulation Loader Overlay */}
                {isSimulating && (
                    <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-[2px] flex items-center justify-center animate-fade-in">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Fetching Satellite Data...</span>
                        </div>
                    </div>
                )}

                {/* Layer Info Overlay */}
                <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs">
                        <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Active View: {activeLayer}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {activeLayer === "RISK" && "Showing composite Water Stress Index (WSI) for Nagpur Talukas."}
                            {activeLayer === "NDVI" && "Displaying simulated Normalized Difference Vegetation Index (NDVI) mapping."}
                            {activeLayer === "WEATHER" && "Real-time weather telemetry across monitoring stations."}
                            {activeLayer === "GROUNDWATER" && "Inverse modeling of depth-to-water-level sensors."}
                        </p>
                    </div>
                </div>
            </section>
            {toast && <DispatchToast toast={toast} />}
        </div>
    );
}
