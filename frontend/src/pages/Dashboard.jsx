import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Zap, Clock, ArrowUpRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        user_name: '',
        total_documents: 0,
        total_chats: 0,
        total_messages: 0
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
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-primary" /> Recent Activity
                        </h3>
                        <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Placeholder activity items */}
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Uploaded "Quantum_Computing_Analysis.pdf"</p>
                                <p className="text-xs text-secondary mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-medium">New chat started: "Climate Change Impact"</p>
                                <p className="text-xs text-secondary mt-1">Yesterday</p>
                            </div>
                        </div>
                        <div className="flex gap-4 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Workspace created</p>
                                <p className="text-xs text-secondary mt-1">3 days ago</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/20"
                >
                    <h3 className="text-xl font-bold mb-4">Pro Tip: AI Research</h3>
                    <p className="text-secondary leading-relaxed mb-6">
                        Try asking specific questions like "What are the core methodologies used in the PDF uploaded today?" for better extraction results.
                    </p>
                    <button className="btn-primary w-fit">
                        Launch Chat Mode
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
