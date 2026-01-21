import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ArrowRight, Sparkles, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/common/Layout';
import { CarCard } from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/common/Skeleton';
import { LazyImage } from '@/components/common/LazyImage';
import { getFeaturedCars, getCategories } from '@/services/carService';
import { getRecommendations } from '@/services/recommendationService';
import type { Car } from '@/types';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [recommendations, setRecommendations] = useState<{ car: Car; reason: string; tags: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cars, cats, recs] = await Promise.all([
          getFeaturedCars(4),
          getCategories(),
          getRecommendations(),
        ]);
        setFeaturedCars(cars);
        setCategories(cats);
        setRecommendations(recs);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] gradient-hero text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Image - Mobile First (above content) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative lg:hidden order-1 mb-6"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-accent/20 rounded-2xl blur-2xl" />
                <LazyImage
                  src="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&auto=format&fit=crop"
                  alt="Luxury car"
                  className="relative rounded-xl shadow-xl w-full object-cover"
                  wrapperClassName="aspect-[16/10]"
                />
              </div>

              {/* Stats Card - Mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 -right-4 bg-card text-card-foreground rounded-lg p-3 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                    <Star className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl">4.9</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6 order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Premium Car Rental Experience
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Drive Your Dreams,{' '}
                <span className="text-gradient">Any Day</span>
              </h1>

              <p className="text-base sm:text-lg text-primary-foreground/80 max-w-lg">
                Explore our premium fleet of vehicles. From eco-friendly electrics to luxury sports cars, find your perfect ride.
              </p>

              {/* Search Form */}
              <div className="bg-card text-card-foreground rounded-2xl p-4 shadow-xl space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Location" className="pl-10 h-12" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-12" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-12" />
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-12"
                >
                  <Link to="/cars">
                    <Search className="w-5 h-5 mr-2" />
                    Search Available Cars
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Hero Image - Desktop (side by side) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block order-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-3xl" />
                <LazyImage
                  src="https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&auto=format&fit=crop"
                  alt="Luxury car"
                  className="relative rounded-2xl shadow-2xl w-full object-cover"
                  wrapperClassName="aspect-[4/3]"
                />
              </div>

              {/* Stats Card - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-card text-card-foreground rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl">4.9</p>
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Fully Insured', desc: 'Comprehensive coverage included' },
              { icon: Clock, title: '24/7 Support', desc: 'Always here when you need us' },
              { icon: MapPin, title: 'Flexible Pickup', desc: 'Multiple convenient locations' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card"
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

      {/* Categories */}
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

      {/* Featured Cars */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Vehicles</h2>
              <p className="text-muted-foreground mt-1">Our most popular picks</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/cars">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)
              : featuredCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/cars">
                View All Cars
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
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
      )}

      {/* CTA */}
      <section className="py-20 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ready to Hit the Road?
            </h2>
            <p className="text-primary-foreground/80">
              Book your dream car today and experience the freedom of the open road.
            </p>
            <Button
              asChild
              size="lg"
              className="gradient-accent text-accent-foreground border-0 shadow-accent"
            >
              <Link to="/cars">
                Browse All Cars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
