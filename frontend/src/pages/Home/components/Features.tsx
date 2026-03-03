import { motion } from 'framer-motion';
import { Shield, Clock, MapPin } from 'lucide-react';

export const Features = () => {
    const features = [
        { icon: Shield, title: 'Fully Insured', desc: 'Comprehensive coverage included' },
        { icon: Clock, title: '24/7 Support', desc: 'Always here when you need us' },
        { icon: MapPin, title: 'Flexible Pickup', desc: 'Multiple convenient locations' },
    ];

    return (
        <section className="py-16 bg-secondary/50 border-y border-border/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                                <feature.icon className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
