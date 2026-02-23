import { useSearchParams } from "react-router-dom";
import { useWater } from "../context/WaterContext";
import {
    Truck,
    MapPin,
    ShieldCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    PackageCheck,
    Navigation
} from "lucide-react";
import { useState, useMemo } from "react";

export default function LogisticsPage() {
    const [searchParams] = useSearchParams();
    const highlightedVillage = searchParams.get("village");
    const { locations, fleet, allocateTanker } = useWater();
    const [otpInput, setOtpInput] = useState("");

    const sortedLocations = useMemo(() => {
        return [...locations].sort((a, b) => b.priorityScore - a.priorityScore);
    }, [locations]);

    const handleAllocate = (name) => {
        allocateTanker(name);
    };

    return (
        <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
            {/* Header Stats */}
            <div className="grid grid-cols-4 gap-4 shrink-0">
                <StatCard label="Total Fleet" value={fleet.length} icon={<Truck className="text-blue-600" />} />
                <StatCard label="Active Missions" value={fleet.filter(t => t.status !== "AVAILABLE").length} icon={<Navigation className="text-amber-600" />} />
                <StatCard label="Secured Deliveries" value="124" icon={<ShieldCheck className="text-emerald-600" />} />
                <StatCard label="Water Dispatched" value="620k L" icon={<PackageCheck className="text-indigo-600" />} />
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Allocation List */}
                <aside className="w-96 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-800">Priority Allocation</h2>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Nagpur Collector</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {sortedLocations.map((loc) => (
                            <div
                                key={loc.id}
                                className={`p-4 rounded-2xl border transition-all ${highlightedVillage === loc.name
                                        ? "bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/10"
                                        : "bg-white border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{loc.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Priority: {loc.priorityScore}</p>
                                    </div>
                                    <div
                                        className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                        style={{ backgroundColor: `${loc.wsi.color}20`, color: loc.wsi.color }}
                                    >
                                        {loc.wsi.category}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-600">
                                        Daily Demand: <span className="font-bold">{(loc.demand / 1000).toFixed(0)}kL</span>
                                    </div>
                                    <button
                                        onClick={() => handleAllocate(loc.name)}
                                        disabled={fleet.every(t => t.status !== "AVAILABLE")}
                                        className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Allocate Tanker
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Fleet Tracking Table */}
                <section className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-800">Real-time Fleet Tracking</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase text-slate-400">GPRS Active</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50">
                                    <th className="px-6 py-4">Tanker ID</th>
                                    <th className="px-6 py-4">Mission Target</th>
                                    <th className="px-6 py-4">Geofence</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Security (OTP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {fleet.map((tanker) => (
                                    <tr key={tanker.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
                                                    <Truck size={14} />
                                                </div>
                                                <span className="font-bold text-slate-900">{tanker.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {tanker.assignment ? (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={12} className="text-blue-500" />
                                                    <span className="font-bold text-slate-700">{tanker.assignment}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Standby - Solapur Depot</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {tanker.geofence ? (
                                                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                                    <CheckCircle2 size={12} />
                                                    {tanker.geofence}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Clock size={12} />
                                                    N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={tanker.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center flex-col items-center gap-2">
                                                {tanker.status === "UNLOADING" ? (
                                                    <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                                        <ShieldCheck size={14} />
                                                        VERIFIED
                                                    </div>
                                                ) : tanker.status === "AVAILABLE" ? (
                                                    <span className="text-slate-300">---</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="VERIFY"
                                                            className="w-16 h-7 text-[10px] bg-slate-100 border border-slate-200 rounded-lg text-center font-mono focus:ring-1 focus:ring-blue-500 transition-all"
                                                        />
                                                        <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Confirm</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {icon}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        "AVAILABLE": "bg-slate-100 text-slate-500",
        "EN-ROUTE": "bg-blue-100 text-blue-600",
        "UNLOADING": "bg-emerald-100 text-emerald-600",
        "MAINTENANCE": "bg-red-100 text-red-600",
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
            {status}
        </span>
    );
}
