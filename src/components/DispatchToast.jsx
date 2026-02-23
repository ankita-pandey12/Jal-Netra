import { CheckCircle, AlertCircle } from "lucide-react";

export default function DispatchToast({ toast }) {
    const isSuccess = toast.type === "success";

    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] animate-fade-in-up flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl
        ${isSuccess
                    ? "bg-emerald-950/90 border-emerald-700/50 shadow-emerald-900/40"
                    : "bg-red-950/90 border-red-700/50 shadow-red-900/40"
                }
      `}
        >
            {isSuccess ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 animate-dispatch-pulse" />
            ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p className="text-sm font-medium text-slate-100">{toast.message}</p>
        </div>
    );
}
