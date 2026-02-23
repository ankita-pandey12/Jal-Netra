import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
    Droplets,
    Users,
    CloudRain,
    Layers,
    Truck,
    ArrowDown,
    Gauge,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// ============================================================
// Custom SVG Marker Icons
// ============================================================
function createMarkerIcon(category) {
    const colors = {
        CRITICAL: { fill: "#ef4444", stroke: "#7f1d1d", glow: "#ef444480" },
        STRESSED: { fill: "#f59e0b", stroke: "#78350f", glow: "#f59e0b60" },
        STABLE: { fill: "#10b981", stroke: "#064e3b", glow: "#10b98150" },
    };
    const c = colors[category] || colors.STABLE;

    const svg = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${category}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feFlood flood-color="${c.glow}" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="shadow"/>
          <feMerge>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M18 47 C18 47 2 28 2 16 C2 7.16 9.16 0 18 0 C26.84 0 34 7.16 34 16 C34 28 18 47 18 47Z"
            fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"
            filter="url(#glow-${category})"/>
      <circle cx="18" cy="16" r="7" fill="white" opacity="0.9"/>
      <circle cx="18" cy="16" r="4" fill="${c.fill}"/>
    </svg>
  `;

    return L.divIcon({
        html: svg,
        className: `marker-${category.toLowerCase()}`,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48],
    });
}

function createDepotIcon() {
    const svg = `
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="20" fill="#1e3a5f" stroke="#06b6d4" stroke-width="2"/>
      <circle cx="22" cy="22" r="14" fill="#0f2440" stroke="#06b6d4" stroke-width="1" opacity="0.7"/>
      <text x="22" y="27" text-anchor="middle" font-size="16" fill="#06b6d4" font-weight="bold">🏭</text>
    </svg>
  `;
    return L.divIcon({
        html: svg,
        className: "depot-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
    });
}

// ============================================================
// Fly-to helper when a village is selected
// ============================================================
function FlyToVillage({ selectedVillageId, villages }) {
    const map = useMap();
    useEffect(() => {
        if (selectedVillageId) {
            const v = villages.find((v) => v.id === selectedVillageId);
            if (v) {
                map.flyTo([v.coords.lat, v.coords.lng], 11, { duration: 0.8 });
            }
        }
    }, [selectedVillageId, villages, map]);
    return null;
}

// ============================================================
// Main MapView Component
// ============================================================
export default function MapView({
    villages,
    depot,
    depotWater,
    onDispatch,
    tankerCapacity,
    selectedVillageId,
    onSelectVillage,
}) {
    // Center of the Solapur region
    const center = [17.85, 75.65];

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-[var(--color-gov-600)]/20 shadow-2xl shadow-black/30">
            <MapContainer
                center={center}
                zoom={9}
                className="h-full w-full"
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />

                <FlyToVillage
                    selectedVillageId={selectedVillageId}
                    villages={villages}
                />

                {/* ---- Depot Marker ---- */}
                <Marker
                    position={[depot.coords.lat, depot.coords.lng]}
                    icon={createDepotIcon()}
                >
                    <Popup>
                        <DepotPopup depot={depot} currentWater={depotWater} />
                    </Popup>
                </Marker>

                {/* ---- Village Markers ---- */}
                {villages.map((village) => (
                    <Marker
                        key={village.id}
                        position={[village.coords.lat, village.coords.lng]}
                        icon={createMarkerIcon(village.wsi.category)}
                        eventHandlers={{
                            click: () => onSelectVillage(village.id),
                        }}
                    >
                        <Popup maxWidth={320}>
                            <VillagePopup
                                village={village}
                                onDispatch={onDispatch}
                                tankerCapacity={tankerCapacity}
                                depotWater={depotWater}
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

// ============================================================
// Village Popup
// ============================================================
function VillagePopup({ village, onDispatch, tankerCapacity, depotWater }) {
    const { wsi, distanceKm } = village;
    const storagePercent = Math.round(
        (village.status.current_available_liters /
            village.status.storage_capacity_liters) *
        100
    );

    const statusColor = {
        CRITICAL: { text: "text-red-400", bg: "bg-red-600/20", border: "border-red-700/50" },
        STRESSED: { text: "text-amber-400", bg: "bg-amber-600/20", border: "border-amber-700/50" },
        STABLE: { text: "text-emerald-400", bg: "bg-emerald-600/20", border: "border-emerald-700/50" },
    };
    const sc = statusColor[wsi.category] || statusColor.STABLE;

    return (
        <div className="min-w-[280px] p-1">
            {/* Name + Badge */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">{village.name}</h3>
                <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg ${sc.bg} ${sc.text} ${sc.border} border`}
                >
                    WSI {wsi.score} · {wsi.category}
                </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <PopupMetric
                    icon={<CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                    label="Rainfall"
                    value={`${village.metrics.rainfall_current} / ${village.metrics.rainfall_avg_10yr} mm`}
                />
                <PopupMetric
                    icon={<ArrowDown className="w-3.5 h-3.5 text-cyan-400" />}
                    label="Groundwater"
                    value={`${village.metrics.groundwater_depth}m depth`}
                />
                <PopupMetric
                    icon={<Gauge className="w-3.5 h-3.5 text-amber-400" />}
                    label="Soil Moisture"
                    value={`${village.metrics.soil_moisture}%`}
                />
                <PopupMetric
                    icon={<Users className="w-3.5 h-3.5 text-violet-400" />}
                    label="Population"
                    value={village.demographics.population.toLocaleString()}
                />
            </div>

            {/* Storage */}
            <div className="mb-3">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        Water Storage
                    </span>
                    <span className="font-semibold text-slate-300">{storagePercent}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-gov-700)] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${storagePercent}%`,
                            background:
                                storagePercent > 60
                                    ? "linear-gradient(90deg, #10b981, #06b6d4)"
                                    : storagePercent > 30
                                        ? "linear-gradient(90deg, #f59e0b, #eab308)"
                                        : "linear-gradient(90deg, #ef4444, #dc2626)",
                        }}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                    {(village.status.current_available_liters / 1000).toFixed(1)}kL of{" "}
                    {(village.status.storage_capacity_liters / 1000).toFixed(0)}kL
                    {" · "}Distance: {distanceKm} km from depot
                </p>
            </div>

            {/* Dispatch Button */}
            <button
                onClick={() => onDispatch(village.id)}
                disabled={depotWater < tankerCapacity}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200
          ${depotWater >= tankerCapacity
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
                        : "bg-[var(--color-gov-700)] text-slate-500 cursor-not-allowed"
                    }
        `}
            >
                <Truck className="w-4 h-4" />
                Dispatch {(tankerCapacity / 1000).toFixed(0)}kL Tanker
            </button>
        </div>
    );
}

/* ---- Popup Metric ---- */
function PopupMetric({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2 bg-[var(--color-gov-700)]/50 rounded-lg p-2">
            {icon}
            <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-[11px] font-semibold text-slate-200">{value}</p>
            </div>
        </div>
    );
}

// ============================================================
// Depot Popup
// ============================================================
function DepotPopup({ depot, currentWater }) {
    const percent = Math.round((currentWater / depot.total_capacity_liters) * 100);
    return (
        <div className="min-w-[220px] p-1">
            <h3 className="text-base font-bold text-[var(--color-water-blue)] mb-1">
                🏭 {depot.name}
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">Central tanker dispatch hub</p>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Reserve</span>
                <span className="font-semibold text-slate-200">{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--color-gov-700)] rounded-full overflow-hidden mb-1">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                    }}
                />
            </div>
            <p className="text-[10px] text-slate-500">
                {(currentWater / 1000).toFixed(0)}kL / {(depot.total_capacity_liters / 1000).toFixed(0)}kL available
            </p>
        </div>
    );
}
