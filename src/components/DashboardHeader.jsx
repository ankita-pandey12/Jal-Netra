import {
    ShieldAlert,
    Users,
    Droplets,
    MapPin,
    AlertTriangle,
    Activity,
} from "lucide-react";

export default function DashboardHeader({ stats }) {
    const depotPercent = Math.round(
        (stats.depotWater / 500000) * 100
    );

    return (
        <header className="glass-card border-b border-[var(--color-gov-600)]/30 px-5 py-3">
            {/* Top row: branding + stats */}
            <div className="flex items-center justify-between">
                {/* ---- Branding ---- */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-gov-500)] to-[var(--color-water-blue)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight gradient-text leading-tight">
                            JalNetra
                        </h1>
                        <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                            Drought Warning & Tanker Management
                        </p>
                    </div>
                </div>

                {/* ---- Stat Cards ---- */}
                <div className="flex items-center gap-3">
                    {/* Critical Villages */}
                    <StatPill
                        icon={<ShieldAlert className="w-4 h-4" />}
                        label="Critical"
                        value={stats.criticalCount}
                        color="critical"
                    />

                    {/* Stressed Villages */}
                    <StatPill
                        icon={<AlertTriangle className="w-4 h-4" />}
                        label="Stressed"
                        value={stats.stressedCount}
                        color="stressed"
                    />

                    {/* At-Risk Population */}
                    <StatPill
                        icon={<Users className="w-4 h-4" />}
                        label="At-Risk Pop."
                        value={stats.atRiskPopulation.toLocaleString()}
                        color="info"
                    />

                    {/* Total Monitored */}
                    <StatPill
                        icon={<MapPin className="w-4 h-4" />}
                        label="Villages"
                        value={stats.totalVillages}
                        color="info"
                    />

                    {/* Depot Status */}
                    <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2">
                        <Activity className="w-4 h-4 text-[var(--color-water-blue)]" />
                        <div className="text-xs">
                            <span className="text-slate-400">Depot</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-24 h-1.5 bg-[var(--color-gov-700)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${depotPercent}%`,
                                            background:
                                                depotPercent > 50
                                                    ? "linear-gradient(90deg, #10b981, #06b6d4)"
                                                    : depotPercent > 20
                                                        ? "linear-gradient(90deg, #f59e0b, #eab308)"
                                                        : "linear-gradient(90deg, #ef4444, #dc2626)",
                                        }}
                                    />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-200">
                                    {(stats.depotWater / 1000).toFixed(0)}kL
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

/* ---- Reusable stat pill ---- */
function StatPill({ icon, label, value, color }) {
    const colorMap = {
        critical: {
            bg: "bg-red-950/60",
            border: "border-red-800/40",
            text: "text-red-400",
            icon: "text-red-400",
        },
        stressed: {
            bg: "bg-amber-950/60",
            border: "border-amber-800/40",
            text: "text-amber-400",
            icon: "text-amber-400",
        },
        info: {
            bg: "bg-blue-950/40",
            border: "border-blue-800/30",
            text: "text-blue-300",
            icon: "text-blue-400",
        },
    };

    const c = colorMap[color] || colorMap.info;

    return (
        <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${c.bg} ${c.border}`}
        >
            <span className={c.icon}>{icon}</span>
            <div className="text-xs leading-tight">
                <span className="text-slate-400">{label}</span>
                <p className={`font-bold text-sm ${c.text}`}>{value}</p>
            </div>
        </div>
    );
}
