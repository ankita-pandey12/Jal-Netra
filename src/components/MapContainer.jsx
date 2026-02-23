import { useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    CloudRain,
    ArrowDown,
    Gauge,
    MapPin,
    Truck,
    Waves,
    CloudSun
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapContainer({ locations, onDispatch }) {
    const { activeLayer } = useWater();
    const [selectedCity, setSelectedCity] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: 21.1458,
        longitude: 79.0882,
        zoom: 9
    });

    // 🎨 Marker color logic
    const getMarkerStyle = (loc) => {
        if (activeLayer === "NDVI") {
            const greenVal = 100 + (loc.metrics?.soil_moisture || 0) * 2;
            return { backgroundColor: `rgb(34, ${Math.min(255, greenVal)}, 94)` };
        }

        if (activeLayer === "WEATHER") {
            return { backgroundColor: "#3b82f6" };
        }

        if (activeLayer === "GROUNDWATER") {
            const gw = loc.metrics?.groundwater_level || 0;
            if (gw > 40) return { backgroundColor: "#dc2626" }; // red
            if (gw > 25) return { backgroundColor: "#f59e0b" }; // orange
            return { backgroundColor: "#22c55e" };              // green
        }

        return { backgroundColor: loc.wsi.color };
    };

    return (
        <div className="h-full relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <Map
                {...viewState}
                onMove={e => setViewState(e.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />

                {/* MARKERS */}
                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        latitude={loc.coords.lat}
                        longitude={loc.coords.lng}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedCity(loc);
                        }}
                    >
                        <div className="group cursor-pointer flex flex-col items-center">
                            <div
                                className="w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-125"
                                style={getMarkerStyle(loc)}
                            >
                                {activeLayer === "WEATHER" && (
                                    <span className="text-[8px] font-bold text-white uppercase">
                                        {loc.metrics?.current_rain ?? 0}mm
                                    </span>
                                )}
                                {activeLayer === "GROUNDWATER" && (
                                    <Waves className="w-4 h-4 text-white" />
                                )}
                            </div>

                            <div className="mt-2 bg-white px-3 py-1 rounded-xl text-[10px] font-extrabold text-slate-800 shadow opacity-0 group-hover:opacity-100">
                                {loc.name}
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* POPUP */}
                {selectedCity && (
                    <Popup
                        latitude={selectedCity.coords.lat}
                        longitude={selectedCity.coords.lng}
                        anchor="top"
                        onClose={() => setSelectedCity(null)}
                        closeButton={false}
                        maxWidth="320px"
                    >
                        <div className="p-3 bg-white rounded-xl shadow-2xl border">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">{selectedCity.name}</h3>
                                <span
                                    className="px-2 py-0.5 text-[10px] font-bold rounded"
                                    style={{
                                        backgroundColor: `${selectedCity.wsi.color}15`,
                                        color: selectedCity.wsi.color
                                    }}
                                >
                                    WSI: {selectedCity.wsi.score}
                                </span>
                            </div>

                            {/* LIVE HEADER */}
                            <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded-lg border bg-slate-50">
                                {activeLayer === "GROUNDWATER" ? (
                                    <>
                                        <Waves className="w-4 h-4 text-indigo-600" />
                                        <span className="text-xs font-bold text-indigo-700">
                                            LIVE GROUNDWATER
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CloudSun className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-blue-700">
                                            LIVE WEATHER
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {activeLayer === "GROUNDWATER" ? (
                                    <>
                                        <MiniStats
                                            icon={<ArrowDown className="w-3.5 h-3.5 text-red-500" />}
                                            label="GW Level"
                                            value={`${selectedCity.metrics?.groundwater_level ?? "—"} m`}
                                        />
                                        <MiniStats
                                            icon={<Gauge className="w-3.5 h-3.5 text-amber-500" />}
                                            label="Recharge"
                                            value={`${selectedCity.metrics?.recharge_pct ?? "—"} %`}
                                        />
                                        <MiniStats
                                            icon={<Gauge className="w-3.5 h-3.5 text-green-500" />}
                                            label="Moisture"
                                            value={`${selectedCity.metrics?.soil_moisture ?? "—"} %`}
                                        />
                                        <MiniStats
                                            icon={<MapPin className="w-3.5 h-3.5 text-indigo-500" />}
                                            label="Demand"
                                            value={`${(selectedCity.demand / 1000).toFixed(0)} kL`}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MiniStats
                                            icon={<CloudRain className="w-3.5 h-3.5 text-blue-500" />}
                                            label="Rainfall"
                                            value={`${selectedCity.metrics?.current_rain ?? 0} mm`}
                                        />
                                        <MiniStats
                                            icon={<Gauge className="w-3.5 h-3.5 text-amber-500" />}
                                            label="Moisture"
                                            value={`${selectedCity.metrics?.soil_moisture ?? 0} %`}
                                        />
                                        <MiniStats
                                            icon={<MapPin className="w-3.5 h-3.5 text-indigo-500" />}
                                            label="Demand"
                                            value={`${(selectedCity.demand / 1000).toFixed(0)} kL`}
                                        />
                                    </>
                                )}
                            </div>

                            {/* ACTION */}
                            <button
                                onClick={() => {
                                    onDispatch(selectedCity.name);
                                    setSelectedCity(null);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                Dispatch Tanker
                            </button>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

function MiniStats({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            {icon}
            <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold">{label}</p>
                <p className="text-xs font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
