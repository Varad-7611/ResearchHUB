import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Verify = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) return toast.error('Please enter 6-digit OTP');

        setLoading(true);
        try {
            await api.post('/verify-otp', { email, otp_code: otpCode });
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="mb-4">No email provided for verification.</p>
                    <Link to="/signup" className="text-primary hover:underline">Go to Signup</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold">Verify your email</h2>
                    <p className="text-secondary mt-2">We've sent a 6-digit code to <span className="text-white font-medium">{email}</span></p>
                </div>

                <div className="glass-card p-8 text-center">
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-between gap-2 mb-8">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onFocus={(e) => e.target.select()}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Verify Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-secondary">
                        Didn't receive the code?{' '}
                        <button className="text-primary hover:underline">Resend OTP</button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Verify;
