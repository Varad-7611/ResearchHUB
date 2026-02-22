import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Shield, Zap, FileText, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="animate-float"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium inline-block mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            The Future of Research is AI-Powered
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            Analyze Research Papers <br />
                            <span className="gradient-text">With Superhuman Speed</span>
                        </h1>
                        <p className="text-lg text-secondary max-w-2xl mx-auto mb-10">
                            Upload your documents and let ResearchHUB AI extract insights, summarize findings, and answer your most complex research questions in seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup" className="btn-primary px-8 py-4 text-lg group">
                                Start Researching Now
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 text-lg font-semibold hover:bg-white/5 rounded-lg transition-all border border-white/10 glass-card">
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-panel/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: 'Instant Analysis',
                                desc: 'Get deep insights from long papers in seconds using advanced RAG technology.'
                            },
                            {
                                icon: Search,
                                title: 'Vector Search',
                                desc: 'Find exact information across your entire library of uploaded research materials.'
                            },
                            {
                                icon: Shield,
                                title: 'Secure & Private',
                                desc: 'Your documents are encrypted and only accessible by you. We prioritize security.'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 hover:border-primary/30 transition-all cursor-default group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-secondary leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center font-bold text-sm">R</div>
                        <span className="font-bold">ResearchHUB AI</span>
                    </div>
                    <div className="text-secondary text-sm">
                        © 2026 ResearchHUB AI. Built for the modern researcher.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
