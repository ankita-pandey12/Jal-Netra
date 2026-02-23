import { Truck, CheckCircle, Clock, ShieldCheck } from "lucide-react";

const mockDeliveries = [
    { id: "T-102", village: "Katol", eta: "15 mins", status: "In Transit", otp: "" },
    { id: "T-105", village: "Hingna", eta: "Real-time", status: "Unloading", otp: "Verified" },
    { id: "T-108", village: "Saoner", eta: "1 hr 20m", status: "Scheduled", otp: "" },
];

export default function DeliveryStatusTable() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Tanker Fleet Status
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Anti-Theft Active
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Tanker ID</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Target Village</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">ETA / Window</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Verify OTP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockDeliveries.map((delivery) => (
                            <tr key={delivery.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-4 font-mono text-blue-600 font-bold">{delivery.id}</td>
                                <td className="px-4 py-4 text-slate-700 font-semibold">{delivery.village}</td>
                                <td className="px-4 py-4">
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {delivery.eta}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <StatusBadge status={delivery.status} />
                                </td>
                                <td className="px-4 py-4">
                                    {delivery.otp === "Verified" ? (
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            SECURE
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="••••"
                                                className="w-14 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-center font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-all text-[10px]"
                                            />
                                            <button className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">Confirm</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Geofence Pseudo-code Logic hint */}
            <div className="p-3 bg-slate-900/50 border-t border-white/5">
                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                    <span className="text-blue-500 font-bold not-italic">GEOFENCE PROTOCOL:</span>
                    If tanker_coords === target_village_coords for &gt;15 mins, status auto-updates to
                    <span className="text-emerald-500"> "Unloading"</span>. Manual OTP override available for multi-point drops.
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        "In Transit": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "Unloading": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        "Scheduled": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${styles[status]}`}>
            {status}
        </span>
    );
}
