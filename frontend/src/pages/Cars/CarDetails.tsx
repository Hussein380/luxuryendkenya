import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Users, Fuel, Settings2, MapPin, Check, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/common/Layout';
import { Skeleton } from '@/components/common/Skeleton';
import { BookingForm } from '@/components/booking/BookingForm';
import { ImageGallery } from '@/components/cars/ImageGallery';
import { getCarById } from '@/services/carService';
import { formatPrice } from '@/lib/currency';
import type { Car } from '@/types';

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCarData = async () => {
      if (!id) return;
      try {
        const [carData, dates] = await Promise.all([
          getCarById(id),
          import('@/services/carService').then(m => m.getUnavailableDates(id))
        ]);
        setCar(carData);
        setUnavailableDates(dates);
      } finally {
        setIsLoading(false);
      }
    };
    loadCarData();
  }, [id]);

  const getCurrentReturnDate = () => {
    if (!unavailableDates.length) return null;
    const now = new Date();
    const activeBooking = unavailableDates.find(d =>
      new Date(d.start) <= now && new Date(d.end) >= now
    );
    return activeBooking ? new Date(activeBooking.end) : null;
  };

  const returnDate = getCurrentReturnDate();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Car Not Found</h2>
          <p className="text-muted-foreground mb-6">The car you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/cars">Browse All Cars</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const fuelLabels: Record<string, string> = {
    electric: 'Electric',
    hybrid: 'Hybrid',
    petrol: 'Petrol',
    diesel: 'Diesel',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/cars">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cars
          </Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Car Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Car Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <ImageGallery
                images={car.images && car.images.length > 0 ? car.images : [car.imageUrl]}
                alt={car.name}
              />

              {/* Status Badges - Overlay on top of gallery if needed, but gallery has its own padding/dots */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {car.available ? (
                  <Badge className="bg-success text-success-foreground border-0 shadow-sm">Available</Badge>
                ) : (
                  <Badge variant="secondary" className="shadow-sm">Unavailable</Badge>
                )}
                <Badge variant="outline" className="bg-card/80 backdrop-blur-sm capitalize shadow-sm">
                  {car.category}
                </Badge>
              </div>
            </motion.div>

            {/* Title & Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold">{car.name}</h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    {car.brand} {car.model} • {car.year}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-semibold">{car.rating}</span>
                  <span className="text-muted-foreground">({car.reviewCount} reviews)</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Specs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Users className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-semibold">{car.seats} People</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Settings2 className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-semibold capitalize">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Fuel className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel</p>
                      <p className="font-semibold">{fuelLabels[car.fuelType]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <MapPin className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{car.location}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold">About This Car</h2>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {car.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
                  >
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-success" />
                <span>Fully insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-success" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                <span>{car.mileage}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Price Card */}
              <Card className="p-6 text-center gradient-hero text-primary-foreground">
                <p className="text-sm text-primary-foreground/70">Starting from</p>
                <p className="font-display text-4xl font-bold">
                  {formatPrice(car.pricePerDay)}
                  <span className="text-lg font-normal">/day</span>
                </p>
              </Card>

              {/* Booking Form - Always show to allow future bookings */}
              <div className="space-y-4">
                {!car.available && (
                  <Card className="p-4 border-destructive/20 bg-destructive/5">
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-destructive shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-destructive">Currently Out on Trip</p>
                        <p className="text-muted-foreground">
                          {returnDate
                            ? `Expected back: ${returnDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`
                            : 'This car is currently unavailable for immediate pickup.'}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                <BookingForm car={car} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
