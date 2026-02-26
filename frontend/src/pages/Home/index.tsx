import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ArrowRight, Sparkles, Shield, Clock, Star, Car as CarIcon, Plane, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/common/Layout';
import { CarCard } from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/common/Skeleton';
import { LazyImage } from '@/components/common/LazyImage';
import { getFeaturedCars, getCategories } from '@/services/carService';
import { getRecommendations } from '@/services/recommendationService';
import type { Car } from '@/types';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { cn } from '@/lib/utils';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [recommendations, setRecommendations] = useState<{ car: Car; reason: string; tags: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeService, setActiveService] = useState<'hire' | 'transfer'>('hire');
  const [hireDetails, setHireDetails] = useState({
    location: '',
    pickupDate: new Date().toISOString(),
    returnDate: new Date(Date.now() + 86400000).toISOString()
  });
  const [transferDetails, setTransferDetails] = useState({
    pickup: '',
    dropoff: '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

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
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty states if API fails (e.g. 429 error)
        if (recommendations.length === 0) {
          setRecommendations([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi Luxuryend, I'd like to book an airport transfer:
Pickup: ${transferDetails.pickup || 'Not specified'}
Drop-off: ${transferDetails.dropoff || 'Not specified'}
Date: ${transferDetails.date || 'Not specified'}`;
    window.open(`https://wa.me/254725675022?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[650px] lg:min-h-[850px] flex items-center justify-center text-primary-foreground overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <LazyImage
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
            alt="Luxury Hero Background"
            className="w-full h-full object-cover object-center scale-105"
            wrapperClassName="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95" />
          <div className="absolute inset-0 bg-black/20 md:hidden" /> {/* Extra darkening for mobile legibility */}
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent font-medium backdrop-blur-sm mx-auto">
              <Sparkles className="w-4 h-4" />
              Elite Travel Solutions in Kenya
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">
              Arrive in <span className="text-gradient">Style</span>, every time.
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto drop-shadow-md">
              Whether you need to hire a premium vehicle or require a seamless airport transfer, we've got you covered.
            </p>

            {/* Desktop Search Card - Hidden on Mobile */}
            <div className="hidden md:block bg-card/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-w-3xl mx-auto mt-12 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent opacity-60" />

              {/* Service Switcher Tabs */}
              <div className="flex p-1 bg-black/20 rounded-xl max-w-sm mx-auto mb-4 border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveService('hire')}
                  className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'hire'
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Hire a Car
                </button>
                <button
                  type="button"
                  onClick={() => setActiveService('transfer')}
                  className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'transfer'
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  Airport Transfers
                </button>
              </div>

              {activeService === 'hire' ? (
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                        <Input
                          required
                          placeholder="Enter location"
                          value={hireDetails.location}
                          onChange={(e) => setHireDetails({ ...hireDetails, location: e.target.value })}
                          className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Date</label>
                      <DateTimePicker
                        date={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : undefined}
                        setDate={(date) => setHireDetails({ ...hireDetails, pickupDate: date ? date.toISOString() : '' })}
                        minDate={new Date()}
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Return Date</label>
                      <DateTimePicker
                        date={hireDetails.returnDate ? new Date(hireDetails.returnDate) : undefined}
                        setDate={(date) => setHireDetails({ ...hireDetails, returnDate: date ? date.toISOString() : '' })}
                        minDate={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : new Date()}
                      />
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Link to={`/cars?pickupDate=${hireDetails.pickupDate}&returnDate=${hireDetails.returnDate}&location=${encodeURIComponent(hireDetails.location)}`}>
                      <Search className="w-5 h-5 mr-3" />
                      Search Available Cars
                    </Link>
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Point</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                        <Input
                          required
                          placeholder="Airport or Hotel"
                          value={transferDetails.pickup}
                          onChange={(e) => setTransferDetails({ ...transferDetails, pickup: e.target.value })}
                          className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Destination</label>
                      <div className="relative">
                        <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                        <Input
                          required
                          placeholder="Hotel or Airport"
                          value={transferDetails.dropoff}
                          onChange={(e) => setTransferDetails({ ...transferDetails, dropoff: e.target.value })}
                          className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Date & Time</label>
                      <DateTimePicker
                        date={transferDetails.date ? new Date(transferDetails.date) : undefined}
                        setDate={(date) => setTransferDetails({ ...transferDetails, date: date ? date.toISOString() : '' })}
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Search className="w-5 h-5 mr-3" />
                    Book Transfer via WhatsApp
                  </Button>
                </form>
              )}
            </div>

            {/* Mobile Booking Tiles - Visible on Mobile Only */}
            <div className="md:hidden flex flex-col gap-4 mt-12 w-full max-w-sm mx-auto">
              <Sheet open={isMobileFormOpen} onOpenChange={setIsMobileFormOpen}>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setActiveService('hire'); setIsMobileFormOpen(true); }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CarIcon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Hire Car</span>
                  </button>

                  <button
                    onClick={() => { setActiveService('transfer'); setIsMobileFormOpen(true); }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plane className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Transfers</span>
                  </button>
                </div>

                <SheetContent side="bottom" className="h-auto max-h-[95vh] bg-transparent border-0 p-4 pb-10 shadow-none overflow-visible">
                  {/* The Original Search Card Design */}
                  <div className="bg-card/10 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden max-w-lg mx-auto">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent opacity-60" />

                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="w-12 h-1.5 bg-white/20 rounded-full mb-2" />
                      <div className="flex items-center justify-between w-full">
                        <div className="w-8" /> {/* Spacer to center title */}
                        <SheetTitle className="font-display text-2xl font-bold text-white text-center leading-tight">
                          {activeService === 'hire' ? 'Hire a Premium Car' : 'Elite Airport Transfer'}
                        </SheetTitle>
                        <SheetDescription className="sr-only">
                          Select your destination and preferred dates for your premium travel experience in Kenya.
                        </SheetDescription>
                        <SheetClose className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                          <X className="w-5 h-5" />
                        </SheetClose>
                      </div>
                    </div>

                    {/* Service Switcher Tabs - Exactly like desktop */}
                    <div className="flex p-1 bg-black/20 rounded-xl max-w-sm mx-auto mb-4 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setActiveService('hire')}
                        className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'hire'
                          ? 'bg-accent text-accent-foreground shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        Hire a Car
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveService('transfer')}
                        className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'transfer'
                          ? 'bg-accent text-accent-foreground shadow-lg'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        Transfers
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar pb-4">
                      {activeService === 'hire' ? (
                        <form className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Location</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                <Input
                                  required
                                  value={hireDetails.location}
                                  onChange={(e) => setHireDetails({ ...hireDetails, location: e.target.value })}
                                  placeholder="Enter location"
                                  className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <DateTimePicker
                                label="Pickup Date"
                                date={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : undefined}
                                setDate={(date) => setHireDetails({ ...hireDetails, pickupDate: date ? date.toISOString() : '' })}
                                minDate={new Date()}
                              />
                              <DateTimePicker
                                label="Return Date"
                                date={hireDetails.returnDate ? new Date(hireDetails.returnDate) : undefined}
                                setDate={(date) => setHireDetails({ ...hireDetails, returnDate: date ? date.toISOString() : '' })}
                                minDate={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : new Date()}
                              />
                            </div>
                          </div>
                          <Button
                            asChild
                            size="lg"
                            className="w-full gradient-accent h-14 text-base sm:text-lg font-bold shadow-accent rounded-xl"
                          >
                            <Link to={`/cars?pickupDate=${hireDetails.pickupDate}&returnDate=${hireDetails.returnDate}&location=${encodeURIComponent(hireDetails.location)}`}>
                              <Search className="w-5 h-5 mr-3" />
                              Search Available Cars
                            </Link>
                          </Button>
                        </form>
                      ) : (
                        <form onSubmit={handleTransferSubmit} className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Point</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                <Input
                                  required
                                  placeholder="Airport or Hotel"
                                  value={transferDetails.pickup}
                                  onChange={(e) => setTransferDetails({ ...transferDetails, pickup: e.target.value })}
                                  className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Destination</label>
                              <div className="relative">
                                <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                <Input
                                  required
                                  placeholder="Hotel or Airport"
                                  value={transferDetails.dropoff}
                                  onChange={(e) => setTransferDetails({ ...transferDetails, dropoff: e.target.value })}
                                  className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                />
                              </div>
                            </div>
                            <DateTimePicker
                              label="Date & Time"
                              date={transferDetails.date ? new Date(transferDetails.date) : undefined}
                              setDate={(date) => setTransferDetails({ ...transferDetails, date: date ? date.toISOString() : '' })}
                              minDate={new Date()}
                            />
                          </div>
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full gradient-accent h-14 text-base sm:text-lg font-bold shadow-accent rounded-xl whitespace-normal"
                          >
                            <Search className="w-5 h-5 mr-2" />
                            Book Transfer via WhatsApp
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/50 border-y border-border/50">
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
      <section className="py-16 bg-secondary/50 border-y border-border/50">
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
      {
        recommendations.length > 0 && (
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
        )
      }

      {/* CTA */}
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
    </Layout>
  );
}
