import { Truck, Droplets, Users, Layers, MapPin, ChevronRight } from "lucide-react";

export default function Sidebar({
    villages,
    onDispatch,
    depotWater,
    tankerCapacity,
    selectedVillageId,
    onSelectVillage,
}) {
    return (
        <aside className="w-[370px] flex-shrink-0 border-r border-[var(--color-gov-600)]/20 flex flex-col bg-[var(--color-gov-900)]/50">
            {/* ---- Header ---- */}
            <div className="px-4 py-3 border-b border-[var(--color-gov-600)]/20">
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--color-water-blue)]" />
                    Dispatch Priority Queue
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                    Sorted by urgency score · Click to locate on map
                </p>
            </div>

            {/* ---- Village Cards ---- */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {villages.map((village, idx) => (
                    <VillageCard
                        key={village.id}
                        village={village}
                        rank={idx + 1}
                        onDispatch={onDispatch}
                        depotWater={depotWater}
                        tankerCapacity={tankerCapacity}
                        isSelected={selectedVillageId === village.id}
                        onSelect={() => onSelectVillage(village.id)}
                    />
                ))}
            </div>
        </aside>
    );
}

/* ============================================================
   Village Card
   ============================================================ */
function VillageCard({
    village,
    rank,
    onDispatch,
    depotWater,
    tankerCapacity,
    isSelected,
    onSelect,
}) {
    const { wsi, priorityScore, distanceKm } = village;

    const statusConfig = {
        CRITICAL: {
            bg: "bg-red-950/50",
            border: "border-red-800/50",
            badge: "bg-red-600/90 text-red-100",
            dot: "bg-red-500",
            glow: "shadow-red-900/30",
        },
        STRESSED: {
            bg: "bg-amber-950/30",
            border: "border-amber-800/30",
            badge: "bg-amber-600/80 text-amber-100",
            dot: "bg-amber-500",
            glow: "shadow-amber-900/20",
        },
        STABLE: {
            bg: "bg-emerald-950/25",
            border: "border-emerald-800/25",
            badge: "bg-emerald-600/70 text-emerald-100",
            dot: "bg-emerald-500",
            glow: "shadow-emerald-900/15",
        },
    };

    const cfg = statusConfig[wsi.category] || statusConfig.STABLE;
    const storagePercent = Math.round(
        (village.status.current_available_liters /
            village.status.storage_capacity_liters) *
        100
    );

    const canDispatch = depotWater >= tankerCapacity;

    return (
        <div
            className={`village-card animate-slide-in opacity-0 rounded-xl border transition-all duration-300 cursor-pointer group
        ${cfg.bg} ${cfg.border} ${cfg.glow}
        ${isSelected ? "ring-1 ring-[var(--color-water-blue)]/50 shadow-lg" : "hover:shadow-md"}
      `}
            onClick={onSelect}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between px-3 pt-3 pb-1">
                <div className="flex items-center gap-2">
                    {/* Rank badge */}
                    <span className="text-[10px] font-bold text-slate-500 bg-[var(--color-gov-700)] w-5 h-5 rounded-md flex items-center justify-center">
                        {rank}
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                            {village.name}
                            <ChevronRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-[10px] text-slate-500">{village.id}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${cfg.badge}`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${wsi.category === "CRITICAL" ? "animate-pulse" : ""}`} />
                    {wsi.category}
                </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-1 px-3 py-2">
                <MiniMetric label="WSI" value={wsi.score} unit="/100" />
                <MiniMetric label="Priority" value={priorityScore.toFixed(1)} />
                <MiniMetric label="Distance" value={distanceKm} unit="km" />
            </div>

            {/* Storage Bar */}
            <div className="px-3 pb-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        Storage
                    </span>
                    <span>
                        {(village.status.current_available_liters / 1000).toFixed(1)}kL /{" "}
                        {(village.status.storage_capacity_liters / 1000).toFixed(0)}kL
                    </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--color-gov-700)] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
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
            </div>

            {/* Population + Dispatch */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {village.demographics.population.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {village.demographics.livestock.toLocaleString()} livestock
                    </span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDispatch(village.id);
                    }}
                    disabled={!canDispatch}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200
            ${canDispatch
                            ? "bg-gradient-to-r from-[var(--color-water-blue)] to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.03] active:scale-95"
                            : "bg-[var(--color-gov-700)] text-slate-500 cursor-not-allowed"
                        }
          `}
                >
                    <Truck className="w-3.5 h-3.5" />
                    Dispatch
                </button>
            </div>
        </div>
    );
}

/* ---- Mini Metric ---- */
function MiniMetric({ label, value, unit = "" }) {
    return (
        <div className="text-center">
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="text-xs font-bold text-slate-200">
                {value}
                <span className="text-[9px] font-normal text-slate-500">{unit}</span>
            </p>
        </div>
    );
}
