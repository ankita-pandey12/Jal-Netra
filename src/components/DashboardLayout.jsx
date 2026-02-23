import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    BarChart3,
    Truck,
    Map as MapIcon,
    LogOut,
    Droplets,
    Bell,
    User,
    Settings,
    MessageSquare
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const menuItems = [
        { name: "Intelligence", icon: <MapIcon size={20} />, path: "/dashboard" },
        { name: "Operations", icon: <Truck size={20} />, path: "/logistics" },
        { name: "Analytics", icon: <BarChart3 size={20} />, path: "/analytics" },
    ];

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden font-display">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">JalNetra</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nagpur HQ</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium text-sm">Welcome back,</span>
                        <span className="text-slate-900 font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg">
                            {user?.email}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                            <Bell size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                            <Settings size={20} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-blue-50 shadow-sm border border-blue-200">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Outlet */}
                <main className="flex-1 overflow-hidden relative">
                    <Outlet />
                </main>
            </div>

            {/* AI Assistant FAB */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
            >
                <MessageSquare size={24} />
            </button>

            {/* Chat UI Modal */}
            {isChatOpen && (
                <div className="fixed bottom-24 right-8 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-fade-in-up overflow-hidden">
                    <div className="p-4 bg-blue-600 text-white font-bold flex justify-between items-center">
                        <span>JalNetra AI Assist</span>
                        <button onClick={() => setIsChatOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="bg-blue-50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-700">
                            Hello Commissioner! I'm monitoring the water levels across Nagpur. Hingna is currently showing high risk. Would you like to check the latest NDVI values?
                        </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 flex gap-2">
                        <input type="text" placeholder="Type a message..." className="flex-1 text-xs bg-slate-50 rounded-lg px-3 py-2 border-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>
            )}
        </div>
    );
}
