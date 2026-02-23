import { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    CloudRain,
    ArrowDown,
    Gauge,
    MapPin,
    Truck,
    Waves,
    CloudSun,
    AlertTriangle
} from 'lucide-react';
import { useWater } from '../context/WaterContext';

// --- Helper: Dynamic Marker Icons ---
const createCustomIcon = (loc, activeLayer) => {
    let color = loc.wsi.color;

    if (activeLayer === "NDVI") {
        const greenVal = 100 + (loc.metrics?.soil_moisture || 0) * 2;
        color = `rgb(34, ${Math.min(255, greenVal)}, 94)`;
    } else if (activeLayer === "WEATHER") {
        color = "#3b82f6";
    } else if (activeLayer === "GROUNDWATER") {
        const gw = loc.metrics?.groundwater_level || 0;
        if (gw > 40) color = "#dc2626";
        else if (gw > 25) color = "#f59e0b";
        else color = "#22c55e";
    }

    const html = `
        <div class="relative group flex flex-col items-center">
            <div class="w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-125" 
                 style="background-color: ${color};">
                ${activeLayer === "WEATHER" ? `
                    <span class="text-[8px] font-bold text-white uppercase">${loc.metrics?.current_rain ?? 0}mm</span>
                ` : activeLayer === "GROUNDWATER" ? `
                    <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 6 7 6s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"></path></svg>
                ` : ''}
            </div>
            <div class="mt-2 bg-white px-3 py-1 rounded-xl text-[10px] font-extrabold text-slate-800 shadow-md">
                ${loc.name}
            </div>
        </div>
    `;

    return L.divIcon({
        className: 'custom-marker',
        html: html,
        iconSize: [40, 60],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

// --- Map View Controller ---
function MapController({ viewState }) {
    const map = useMap();
    useEffect(() => {
        map.setView([viewState.latitude, viewState.longitude], viewState.zoom);
    }, [viewState, map]);
    return null;
}

export default function MapContainer({ locations, onDispatch }) {
    const { activeLayer } = useWater();
    const [viewState] = useState({
        latitude: 21.1458,
        longitude: 79.0882,
        zoom: 10
    });

    return (
        <div className="w-full h-full bg-slate-100">
            <LeafletMap
                center={[viewState.latitude, viewState.longitude]}
                zoom={viewState.zoom}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                {/* Premium Dark Theme */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <ZoomControl position="bottomright" />
                <MapController viewState={viewState} />

                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.coords.lat, loc.coords.lng]}
                        icon={createCustomIcon(loc, activeLayer)}
                    >
                        <Popup className="custom-leaflet-popup">
                            <div className="p-1 min-w-[240px]">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-base text-slate-800">{loc.name}</h3>
                                    <span
                                        className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider"
                                        style={{
                                            backgroundColor: `${loc.wsi.color}15`,
                                            color: loc.wsi.color
                                        }}
                                    >
                                        WSI: {loc.wsi.score}
                                    </span>
                                </div>

                                {/* Live Info Hub */}
                                <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-xl border bg-slate-50 border-slate-100">
                                    {activeLayer === "GROUNDWATER" ? (
                                        <>
                                            <Waves className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">GROUNDWATER TELEMETRY</span>
                                        </>
                                    ) : activeLayer === "NDVI" ? (
                                        <>
                                            <Gauge className="w-3.5 h-3.5 text-red-600" />
                                            <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">REAL-TIME WATER STRESS INDEX (WSI)</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">LIVE SATELLITE DATA</span>
                                        </>
                                    )}
                                </div>

                                {/* Stats Matrix */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {activeLayer === "GROUNDWATER" ? (
                                        <>
                                            <MiniStats
                                                icon={<ArrowDown className="w-3 h-3 text-red-500" />}
                                                label="GW LVL"
                                                value={`${loc.metrics?.groundwater_level ?? "—"}m`}
                                            />
                                            <MiniStats
                                                icon={<Gauge className="w-3 h-3 text-amber-500" />}
                                                label="RECHARGE"
                                                value={`${loc.metrics?.recharge_pct ?? "—"}%`}
                                            />
                                            <MiniStats
                                                icon={<MapPin className="w-3 h-3 text-indigo-500" />}
                                                label="DEMAND"
                                                value={`${(loc.demand / 1000).toFixed(0)}kL`}
                                            />
                                        </>
                                    ) : activeLayer === "NDVI" ? (
                                        <>
                                            <div className="col-span-2 space-y-2">
                                                <MiniStats
                                                    icon={<Gauge className="w-3 h-3 text-emerald-500" />}
                                                    label="Soil Moisture"
                                                    value={`${loc.metrics?.soil_moisture_realtime ?? "0.00"} %`}
                                                />
                                                <MiniStats
                                                    icon={<AlertTriangle className="w-3 h-3 text-red-500" />}
                                                    label="Water Stress Index (WSI)"
                                                    value={loc.metrics?.wsi_realtime ?? "0.00"}
                                                />
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                                    <p className="text-[8px] font-black uppercase text-slate-400">Stress Level</p>
                                                    <p className={`text-[10px] font-black uppercase ${parseFloat(loc.metrics?.wsi_realtime) > 0.7 ? "text-red-600" :
                                                        parseFloat(loc.metrics?.wsi_realtime) > 0.5 ? "text-orange-600" :
                                                            parseFloat(loc.metrics?.wsi_realtime) > 0.2 ? "text-amber-600" : "text-emerald-600"
                                                        }`}>
                                                        {parseFloat(loc.metrics?.wsi_realtime) <= 0.2 && "No Stress"}
                                                        {parseFloat(loc.metrics?.wsi_realtime) > 0.2 && parseFloat(loc.metrics?.wsi_realtime) <= 0.5 && "Mild Stress"}
                                                        {parseFloat(loc.metrics?.wsi_realtime) > 0.5 && parseFloat(loc.metrics?.wsi_realtime) <= 0.7 && "Moderate Stress"}
                                                        {parseFloat(loc.metrics?.wsi_realtime) > 0.7 && "Severe Stress"}
                                                    </p>
                                                </div>
                                            </div>
                                            <MiniStats
                                                icon={<MapPin className="w-3 h-3 text-indigo-500" />}
                                                label="DEMAND"
                                                value={`${(loc.demand / 1000).toFixed(0)}kL`}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <MiniStats
                                                icon={<CloudRain className="w-3 h-3 text-blue-500" />}
                                                label="PRECIP"
                                                value={`${loc.metrics?.current_rain ?? 0}mm`}
                                            />
                                            <MiniStats
                                                icon={<Gauge className="w-3 h-3 text-emerald-500" />}
                                                label="MOISTURE"
                                                value={`${loc.metrics?.soil_moisture ?? 0}%`}
                                            />
                                            <MiniStats
                                                icon={<MapPin className="w-3 h-3 text-indigo-500" />}
                                                label="DEMAND"
                                                value={`${(loc.demand / 1000).toFixed(0)}kL`}
                                            />
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => onDispatch(loc.name)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.1em] py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    <Truck className="w-3.5 h-3.5" />
                                    Dispatch Resource
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </LeafletMap>
        </div>
    );
}

function MiniStats({ icon, label, value }) {
    return (
        <div className="flex flex-col gap-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
            <div className="flex items-center gap-1.5">
                {icon}
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{label}</p>
            </div>
            <p className="text-xs font-black text-slate-800 pl-4.5">{value}</p>
        </div>
    );
}
