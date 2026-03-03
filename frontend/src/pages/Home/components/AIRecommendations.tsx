import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { LazyImage } from '@/components/common/LazyImage';
import type { Car } from '@/types';

interface AIRecommendationsProps {
    recommendations: { car: Car; reason: string; tags: string[] }[];
}

export const AIRecommendations = ({ recommendations }: AIRecommendationsProps) => {
    if (recommendations.length === 0) return null;

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                        <h2 className="font-display text-2xl font-bold">Recommended for You</h2>
                        <p className="text-muted-foreground text-sm">AI-powered suggestions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={rec.car.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                to={`/cars/${rec.car.id}`}
                                className="block bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-colors group"
                            >
                                <div className="relative h-40">
                                    <LazyImage
                                        src={rec.car.imageUrl}
                                        alt={rec.car.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        wrapperClassName="h-full"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <p className="text-sm text-primary-foreground/80">{rec.reason}</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-display font-semibold group-hover:text-accent transition-colors">
                                        {rec.car.name}
                                    </h3>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {rec.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
