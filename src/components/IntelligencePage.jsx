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
        <div className="h-full relative overflow-hidden bg-slate-900">
            {/* Background Map Layer */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    locations={locations}
                    onDispatch={(name) => navigate(`/logistics?village=${name}`)}
                />
            </div>

            {/* Content Overlays */}
            <div className="relative z-10 h-full w-full pointer-events-none flex p-6 gap-6">
                {/* Risk Sidebar Overlay */}
                <aside className="w-80 shrink-0 flex flex-col gap-6 overflow-hidden pointer-events-auto">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 flex flex-col shadow-2xl overflow-hidden flex-1 ring-1 ring-black/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                <TrendingDown className="w-5 h-5 text-red-500" />
                                High Risk Areas
                            </h2>
                            <span className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Top 5</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                            {topRisk.map((loc, idx) => (
                                <div
                                    key={loc.id}
                                    onClick={() => navigate(`/logistics?village=${loc.name}`)}
                                    className="p-4 bg-white/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-blue-500/30 hover:shadow-lg transition-all group cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{loc.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">WSI: {loc.wsi.score}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Pop: {(loc.population / 1000).toFixed(0)}k</span>
                                            </div>
                                        </div>
                                        <div
                                            className="w-3 h-3 rounded-full shadow-inner ring-4 ring-white"
                                            style={{ backgroundColor: loc.wsi.color }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                        <div className="text-[10px] text-slate-500 font-bold">
                                            Demand: <span className="text-slate-800 font-bold">{(loc.demand / 1000).toFixed(0)}kL</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Global Stats Card */}
                    <div className="bg-blue-600/90 backdrop-blur-lg rounded-[2rem] p-6 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden border border-blue-400/30 ring-1 ring-black/5">
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Nagpur District Wide</p>
                            <h4 className="text-3xl font-extrabold mb-5 flex items-baseline gap-2">
                                65% <span className="text-xs font-bold opacity-70 tracking-normal uppercase">Stress Avg</span>
                            </h4>
                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-5">
                                <div className="h-full bg-white rounded-full shadow-[0_0_10px_white] w-[65%]" />
                            </div>
                            <p className="text-[10px] font-medium opacity-80 leading-relaxed uppercase tracking-wide">Monitoring 2.4M people across 14 tehsils.</p>
                        </div>
                        <Activity className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
                    </div>
                </aside>

                {/* Center Space for Map Interaction */}
                <div className="flex-1 min-w-0 relative h-full flex flex-col justify-between items-center pointer-events-none">

                    {/* Floating Tier Switcher */}
                    <div className="mt-4 flex items-center gap-1 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-2xl z-20 pointer-events-auto ring-1 ring-black/5">
                        {layerButtons.map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleLayerChange(btn.id)}
                                disabled={isSimulating}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extra-bold transition-all ${activeLayer === btn.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                    } ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {btn.icon}
                                {btn.name}
                            </button>
                        ))}
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="mb-6 w-full flex justify-between items-end">
                        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-2xl max-w-sm pointer-events-auto ring-1 ring-black/5">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 leading-none">Active Intelligence: {activeLayer}</h4>
                            <p className="text-xs text-slate-700 leading-relaxed font-bold">
                                {activeLayer === "RISK" && "Showing composite Water Stress Index (WSI) for Nagpur Talukas."}
                                {activeLayer === "NDVI" && "Displaying simulated Normalized Difference Vegetation Index (NDVI) mapping."}
                                {activeLayer === "WEATHER" && "Real-time weather telemetry across monitoring stations."}
                                {activeLayer === "GROUNDWATER" && "Inverse modeling of depth-to-water-level sensors."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simulation Loader Overlay */}
                {isSimulating && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center">
                        <div className="bg-white px-8 py-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-5">
                            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.25em]">Syncing Satellite Data...</span>
                        </div>
                    </div>
                )}
            </div>

            {toast && <DispatchToast toast={toast} />}
        </div>
    );
}
