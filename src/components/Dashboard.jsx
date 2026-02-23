import { useState, useMemo } from 'react';
import { nagpurData } from '../data/nagpurData';
import { getPriority } from '../utils/droughtEngine';
import MapContainer from './MapContainer';
import DeliveryStatusTable from './DeliveryStatusTable';
import { Truck, Droplets, AlertTriangle, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [toast, setToast] = useState(null);

    // Process data for Nagpur
    const processedData = useMemo(() => {
        return nagpurData.map(loc => getPriority(loc)).sort((a, b) => b.priorityScore - a.priorityScore);
    }, []);

    const topRisk = processedData.slice(0, 5);

    const handleDispatch = (name) => {
        setToast(`Tanker T-102 dispatched to ${name}. Route Optimized.`);
        setTimeout(() => setToast(null), 4000);
    };

    return (
        <div className="h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-display">
            {/* --- Top Header --- */}
            <nav className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold gradient-text tracking-tight">JalNetra</h1>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Official Monitoring Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-600">{user?.email}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors group"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* --- Main Dashboard Content --- */}
            <main className="flex-1 flex overflow-hidden p-4 gap-4">

                {/* Left Sidebar: Risk Assessment */}
                <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
                    {/* Top 5 High Risk */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-5 flex flex-col overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                High Risk Areas
                            </h2>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Nagpur Top 5</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {topRisk.map((loc, idx) => (
                                <div key={loc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-500/30 transition-all group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">{loc.name}</h3>
                                            <p className="text-[10px] text-slate-500">Priority Score: <span className="text-blue-600 font-bold">{loc.priorityScore}</span></p>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ backgroundColor: loc.wsi.color }} />
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-[10px] text-slate-500">
                                            Demand: <span className="text-slate-700 font-bold">{(loc.demand / 1000).toFixed(0)}kL</span>
                                        </div>
                                        <button
                                            onClick={() => handleDispatch(loc.name)}
                                            className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                                        >
                                            Dispatch
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Active Fleet</p>
                                <p className="text-lg font-bold text-slate-800">12 Tankers</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Delivered Today</p>
                            <p className="text-lg font-bold text-emerald-600">85,000 L</p>
                        </div>
                    </div>
                </aside>

                {/* Center/Right Content: Map + Table */}
                <section className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Map Section */}
                    <div className="flex-[2] min-h-0 relative">
                        <MapContainer locations={processedData} onDispatch={handleDispatch} />

                        {/* Legend Overlay */}
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl pointer-events-none">
                            <div className="flex flex-col gap-2">
                                <LegendItem color="#ef4444" label="Critical (>75)" />
                                <LegendItem color="#f59e0b" label="Stressed (40-75)" />
                                <LegendItem color="#10b981" label="Stable (<40)" />
                            </div>
                        </div>
                    </div>

                    {/* Logistics Tracking Section */}
                    <div className="flex-1 min-h-[220px]">
                        <DeliveryStatusTable />
                    </div>
                </section>
            </main>

            {/* Floating Notification */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-blue-400/30">
                    <Truck className="w-5 h-5 animate-bounce" />
                    <p className="text-sm font-bold tracking-tight">{toast}</p>
                </div>
            )}
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{label}</span>
        </div>
    );
}
