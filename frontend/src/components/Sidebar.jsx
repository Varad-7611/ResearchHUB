import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Upload,
    MessageSquare,
    History,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Upload', icon: Upload, path: '/upload' },
        { name: 'Chat', icon: MessageSquare, path: '/chat' },
        { name: 'History', icon: History, path: '/history' },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className="h-screen bg-panel border-r border-white/5 flex flex-col relative transition-all"
        >
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                        >
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">R</div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">ResearchHUB</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-white/5 rounded-lg text-secondary"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                    >
                        <item.icon size={22} className="min-w-[22px]" />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="whitespace-nowrap"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 space-y-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2 py-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-secondary truncate">{user?.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-500/10 text-secondary hover:text-red-500"
                >
                    <LogOut size={22} className="min-w-[22px]" />
                    {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
