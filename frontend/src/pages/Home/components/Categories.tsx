import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoriesProps {
    categories: Category[];
}

export const Categories = ({ categories }: CategoriesProps) => {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="font-display text-3xl font-bold">Browse by Category</h2>
                        <p className="text-muted-foreground mt-1">Find the perfect car for every occasion</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                to={`/cars?category=${cat.id}`}
                                className="block p-6 rounded-xl bg-card border border-border hover:border-accent hover:shadow-lg transition-all text-center group"
                            >
                                <span className="text-3xl mb-2 block">{cat.icon}</span>
                                <span className="font-medium group-hover:text-accent transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
