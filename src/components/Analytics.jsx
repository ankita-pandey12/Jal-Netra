import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Sparkles,
    Terminal,
    Database,
    ChevronDown,
    ChevronUp,
    Send,
    History,
    Zap,
    ShieldCheck,
    BarChart3,
    Activity
} from 'lucide-react';

const Analytics = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeResult, setActiveResult] = useState(null);
    const [showSql, setShowSql] = useState(false);
    const scrollRef = useRef(null);

    const quickChips = [
        "Show available tankers",
        "Tankers in Hingna",
        "Non-secure missions",
        "Total fleet capacity"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleQuery = async (userPrompt) => {
        const promptToUse = userPrompt || query;
        if (!promptToUse.trim()) return;

        setIsLoading(true);
        const newUserMessage = { role: 'user', content: promptToUse };
        setMessages(prev => [...prev, newUserMessage]);
        setQuery('');

        try {
            const response = await fetch('http://localhost:5000/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptToUse })
            });

            if (!response.ok) throw new Error('Failed to fetch from AI Command Center');

            const data = await response.json();
            const aiMessage = {
                role: 'ai',
                insight: data.insight,
                query: data.query,
                data: data.data
            };

            setMessages(prev => [...prev, aiMessage]);
            setActiveResult(aiMessage);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'ai',
                insight: "Error: I'm unable to reach the Nagpur Command Center database right now. Please verify system connectivity."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-white font-sans overflow-hidden">
            {/* --- Left Sidebar (The Thread) --- */}
            <div className="w-[35%] border-r border-slate-200 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-200 bg-white">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Mission Thread
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">L3 Artificial Intelligence Auditor</p>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    ref={scrollRef}
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">Secure AI Interface</h3>
                            <p className="text-sm text-slate-500 mt-2">Query the Nagpur Tanker Fleet using natural language.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                onClick={() => msg.role === 'ai' && setActiveResult(msg)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white ml-8'
                                    : 'bg-white border border-slate-200 text-slate-800 mr-8 hover:border-blue-300 shadow-sm'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">
                                    {msg.role === 'user' ? msg.content : (msg.insight?.substring(0, 100) + (msg.insight?.length > 100 ? '...' : ''))}
                                </p>
                                {msg.role === 'ai' && (
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                        <Activity className="w-3 h-3" />
                                        Review Details
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-2 p-4 bg-white border border-slate-200 rounded-xl mr-8 animate-pulse">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                        {quickChips.map(chip => (
                            <button
                                key={chip}
                                onClick={() => handleQuery(chip)}
                                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-[11px] font-semibold text-slate-600 border border-slate-200 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center">
                            <Sparkles className="w-5 h-5 text-blue-500 group-focus-within:animate-pulse" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                            placeholder="Query the Nagpur Tanker Fleet..."
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <button
                            onClick={() => handleQuery()}
                            disabled={isLoading}
                            className="absolute inset-y-2 right-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Main View (The Insight Lab) --- */}
            <div className="w-[65%] flex flex-col bg-white overflow-y-auto">
                {!activeResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse" />
                            <h1 className="text-8xl font-black text-slate-100 select-none tracking-tighter">JALNETRA AI</h1>
                        </div>
                        <div className="grid grid-cols-2 gap-6 max-w-2xl">
                            <div className="p-6 border border-slate-200 rounded-3xl text-left bg-slate-50">
                                <Zap className="w-8 h-8 text-blue-600 mb-4" />
                                <h4 className="font-bold text-slate-800">Real-time Analysis</h4>
                                <p className="text-sm text-slate-500 mt-1">Instant querying of mission-critical tanker deployments.</p>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-3xl text-left bg-slate-50">
                                <ShieldCheck className="w-8 h-8 text-blue-600 mb-4" />
                                <h4 className="font-bold text-slate-800">Security Audits</h4>
                                <p className="text-sm text-slate-500 mt-1">Monitor secure vs non-secure routes and cargo status.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 space-y-8 animate-fade-in">
                        {/* L3 Human Insight Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-bold uppercase">L3 Insight Layer</div>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-light leading-relaxed italic text-blue-50">
                                    "{activeResult.insight}"
                                </h2>
                                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">HQ</div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Nagpur Command Center</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Verified Artificial Auditor</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* L2 Data Table Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                    <Database className="w-4 h-4 text-blue-600" />
                                    Live Fleet Inventory (L2 Output)
                                </h3>
                                <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-md font-mono text-slate-500 border border-slate-200">
                                    {activeResult.data?.length || 0} RECORDS RETRIEVED
                                </span>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Tanker ID</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Location</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Capacity (L)</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Security</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeResult.data?.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group odd:bg-white even:bg-slate-50/40">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.id}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.current_village || 'BASE'}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-slate-600">{row.capacity?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    {row.is_secure ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                            <ShieldCheck className="w-3 h-3" /> SECURE
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                            <Activity className="w-3 h-3" /> STANDARD
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                            row.status === 'EN-ROUTE' ? 'bg-blue-100 text-blue-700' :
                                                                row.status === 'UNLOADING' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!activeResult.data || activeResult.data.length === 0) && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                                    No specific records found for this query context.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* L1 Technical Transparency Accordion */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowSql(!showSql)}
                                className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <Terminal className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Technical Transparency (L1 Output)</p>
                                        <p className="text-[10px] text-slate-500">Generated SQL Instruction Set</p>
                                    </div>
                                </div>
                                {showSql ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {showSql && (
                                <div className="p-6 bg-slate-900">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">MySQL v8.0 Dialect</div>
                                    </div>
                                    <code className="block font-mono text-sm text-blue-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700 leading-relaxed overflow-x-auto">
                                        {activeResult.query}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Analytics;
