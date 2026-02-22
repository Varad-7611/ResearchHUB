import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md border-b border-white/5 bg-background/50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">R</div>
                    <span className="text-xl font-bold">ResearchHUB</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-secondary hover:text-white transition-colors">Login</Link>
                    <Link
                        to="/signup"
                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
