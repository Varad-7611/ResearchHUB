import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, ArrowRight, Search, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const History = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/chats');
                setChats(data);
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this research conversation?')) return;

        try {
            await api.delete(`/chats/${id}`);
            setChats(prev => prev.filter(chat => chat.id !== id));
            toast.success('Conversation deleted permanently');
        } catch (error) {
            toast.error('Failed to delete history item');
            console.error(error);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.chat_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Research History</h1>
                    <p className="text-secondary text-lg">Revisit and manage your previous research conversations.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="glass-input w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card p-6 h-40 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : filteredChats.length === 0 ? (
                <div className="text-center py-40 glass-card">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={40} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No history found</h3>
                    <p className="text-secondary max-w-sm mx-auto">
                        You haven't started any research conversations yet or your search didn't match anything.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredChats.map((chat, i) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 flex flex-col justify-between group cursor-pointer border-primary/0 hover:border-primary/20 transition-all"
                            onClick={() => navigate('/chat')}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <MessageSquare size={20} />
                                    </div>
                                    <span className="text-[10px] text-secondary flex items-center gap-1">
                                        <Clock size={12} /> {new Date(chat.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 line-clamp-2">{chat.chat_title}</h3>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <button className="text-primary text-sm font-medium flex items-center gap-1 group-hover:underline">
                                    Open Chat <ExternalLink size={14} />
                                </button>
                                <button
                                    className="p-2 opacity-0 group-hover:opacity-100 text-secondary hover:text-red-500 transition-all"
                                    onClick={(e) => handleDelete(e, chat.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
