import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/login', formData);
            login(data.user, data.access_token);
            toast.success('Welcome back!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl">R</div>
                        <span className="text-2xl font-bold">ResearchHUB</span>
                    </Link>
                    <h2 className="text-3xl font-bold">Welcome back</h2>
                    <p className="text-secondary mt-2">Continue your research journey</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-secondary">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@email.com"
                                    className="glass-input w-full pl-10"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-secondary">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="glass-input w-full pl-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Log In <LogIn size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-secondary text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
