import { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CloudRain, ArrowDown, Gauge, MapPin, Truck } from 'lucide-react';
import { useWater } from '../context/WaterContext'; // Added import for useWater

// NOTE: Ideally this should be in an .env file.
// For the prototype, the user can replace this with their own token.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export default function MapContainer({ locations, onDispatch }) {
    const { activeLayer } = useWater(); // Added activeLayer from WaterContext
    const [selectedCity, setSelectedCity] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: 21.1458,
        longitude: 79.0882,
        zoom: 9
    });

    // Layer Specific Calculations
    const getMarkerStyle = (loc) => {
        if (activeLayer === "NDVI") {
            // Greenish mapping for NDVI
            const greenVal = 100 + (loc.metrics.soil_moisture * 2);
            return { backgroundColor: `rgb(34, ${Math.min(255, greenVal)}, 94)` };
        }
        if (activeLayer === "WEATHER") {
            return { backgroundColor: "#3b82f6" }; // Cooling blue for weather stations
        }
        if (activeLayer === "GROUNDWATER") {
            const intensity = (loc.metrics.groundwater_level / 100) * 255;
            return { backgroundColor: `rgb(${intensity}, 50, 255)` };
        }
        return { backgroundColor: loc.wsi.color }; // Default RISK color
    };

    return (
        <div className="h-full relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />

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
                        <div
                            className="group cursor-pointer flex flex-col items-center"
                            style={{ transform: 'translateY(-5px)' }}
                        >
                            <div
                                className="w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-125 hover:z-50"
                                style={getMarkerStyle(loc)}
                            >
                                {activeLayer === "RISK" && <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />}
                                {activeLayer === "WEATHER" && <span className="text-[8px] font-bold text-white uppercase">{loc.metrics.current_rain}mm</span>}
                            </div>
                            <div className="mt-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-extrabold text-slate-800 border border-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {loc.name}
                            </div>
                        </div>
                    </Marker>
                ))}

                {selectedCity && (
                    <Popup
                        latitude={selectedCity.coords.lat}
                        longitude={selectedCity.coords.lng}
                        anchor="top"
                        onClose={() => setSelectedCity(null)}
                        closeButton={false}
                        className="custom-popup"
                        maxWidth="320px"
                    >
                        <div className="p-3 bg-white/95 backdrop-blur-xl rounded-xl text-slate-800 border border-slate-200 shadow-2xl">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-lg">{selectedCity.name}</h3>
                                <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                                    style={{ backgroundColor: `${selectedCity.wsi.color}15`, color: selectedCity.wsi.color, border: `1px solid ${selectedCity.wsi.color}30` }}
                                >
                                    WSI: {selectedCity.wsi.score}
                                </span>
                            </div>

                            {selectedCity.weather_live && (
                                <div className="flex items-center gap-2 mb-3 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Live Weather</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-800">
                                        <img src={selectedCity.weather_live.icon} className="w-4 h-4" alt="weather" />
                                        <span>{selectedCity.weather_live.temp_c}°C</span>
                                        <span className="opacity-60">•</span>
                                        <span>{selectedCity.weather_live.condition}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <MiniStats
                                    icon={<CloudRain className="w-3.5 h-3.5 text-blue-500" />}
                                    label="Rainfall Dev"
                                    value={Math.round(((selectedCity.metrics.avg_rain - selectedCity.metrics.current_rain) / selectedCity.metrics.avg_rain) * 100) + '%'}
                                />
                                <MiniStats
                                    icon={<ArrowDown className="w-3.5 h-3.5 text-blue-400" />}
                                    label="GW Level"
                                    value={selectedCity.metrics.groundwater_level + 'm'}
                                />
                                <MiniStats
                                    icon={<Gauge className="w-3.5 h-3.5 text-amber-500" />}
                                    label="Moisture"
                                    value={selectedCity.metrics.soil_moisture + '%'}
                                />
                                <MiniStats
                                    icon={<MapPin className="w-3.5 h-3.5 text-indigo-500" />}
                                    label="Demand"
                                    value={(selectedCity.demand / 1000).toFixed(0) + 'kL'}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    onDispatch(selectedCity.name);
                                    setSelectedCity(null);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
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
            <div className="mt-1">{icon}</div>
            <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{label}</p>
                <p className="text-xs font-bold text-slate-200">{value}</p>
            </div>
        </div>
    );
}
