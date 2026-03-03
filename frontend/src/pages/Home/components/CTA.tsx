import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTA = () => {
    return (
        <section className="py-24 bg-[#0a0a0a] border-t border-accent/10">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                        Ready to experience <span className="text-accent underline decoration-accent/30 underline-offset-8">Ultimate Luxury?</span>
                    </h2>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        Book your dream car or elite airport transfer today. Experience Kenya behind the wheel of excellence.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="gradient-accent text-accent-foreground border-0 shadow-accent h-16 px-10 text-xl font-bold transition-all hover:scale-105"
                    >
                        <Link to="/cars">
                            Browse Full Fleet
                            <ArrowRight className="w-6 h-6 ml-3" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};
