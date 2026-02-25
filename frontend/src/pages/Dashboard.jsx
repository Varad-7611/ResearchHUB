import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Zap, Clock, ArrowUpRight, TrendingUp } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        user_name: '',
        total_documents: 0,
        total_chats: 0,
        total_messages: 0,
        query_history: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard-stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Documents Uploaded', value: stats.total_documents, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Conversations', value: stats.total_chats, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'AI Queries Made', value: stats.total_messages, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-10">
            <header>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold mb-2"
                >
                    Welcome, {stats.user_name || user?.name || 'Explorer'} 👋
                </motion.h1>
                <p className="text-secondary text-lg">Here's an overview of your research activities.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 flex items-center justify-between group cursor-default"
                    >
                        <div>
                            <p className="text-secondary text-sm font-medium mb-1">{card.label}</p>
                            <h3 className="text-3xl font-bold">{loading ? '...' : card.value}</h3>
                        </div>
                        <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110`}>
                            <card.icon size={28} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Graph Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8 min-h-[400px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" /> Query Activity
                        </h3>
                        <div className="text-xs text-secondary bg-white/5 px-2 py-1 rounded">Last 7 Days</div>
                    </div>

                    <div className="flex-1 w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.query_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#151518',
                                        border: '1px solid #ffffff10',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="queries"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorQueries)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-primary" /> Recent History
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-sm">System Ready for Research</p>
                                <p className="text-[10px] text-secondary mt-1">AI models loaded and verified.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all opacity-80">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Web Search Integrated</p>
                                <p className="text-[10px] text-secondary mt-1">Automatic fallback to web search enabled.</p>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Pro Insight</p>
                            <p className="text-sm text-secondary leading-relaxed">
                                Your research activity has increased. Upload more documents to build a stronger knowledge base for the AI.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
