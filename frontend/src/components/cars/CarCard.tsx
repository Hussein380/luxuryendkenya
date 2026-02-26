import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Fuel, Settings2 } from 'lucide-react';
import { type Car } from '@/types';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const fuelLabels: Record<string, string> = {
    electric: 'Electric',
    hybrid: 'Hybrid',
    petrol: 'Petrol',
    diesel: 'Diesel',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/cars/${car.id}`}>
        <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <LazyImage
              src={car.imageUrl}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              wrapperClassName="h-full"
            />

            {/* Status Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {car.available ? (
                <Badge className="bg-success text-success-foreground border-0 shadow-sm">Available</Badge>
              ) : (
                <Badge variant="destructive" className="shadow-sm border-0">Unavailable</Badge>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-card/80 backdrop-blur-sm capitalize">
                {car.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title & Rating */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors">
                  {car.name}
                </h3>
                <p className="text-sm text-muted-foreground">{car.year}</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-medium">{car.rating}</span>
                <span className="text-muted-foreground">({car.reviewCount})</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{car.seats}</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings2 className="w-4 h-4" />
                <span className="capitalize">{car.transmission}</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span>{fuelLabels[car.fuelType]}</span>
              </div>
            </div>

            {/* Availability Detail */}
            {!car.available && (
              <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10">
                <div className="flex items-center gap-2 text-destructive">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Currently Out on Trip</span>
                </div>
                {car.nextAvailableAt && (
                  <div className="mt-2 flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Expected back</span>
                    <span className="text-sm font-semibold text-foreground">
                      {new Date(car.nextAvailableAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex flex-col">
                <div>
                  <span className="text-2xl font-display font-bold">{formatPrice(car.pricePerDay)}</span>
                  <span className="text-sm text-muted-foreground">/day</span>
                </div>
                {!car.available && car.nextAvailableAt && (
                  <span className="text-[10px] font-bold text-destructive/80 mt-0.5">
                    Expected back: {new Date(car.nextAvailableAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                className={cn(
                  'shadow-sm',
                  car.available
                    ? 'gradient-accent text-accent-foreground border-0'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                disabled={!car.available}
              >
                {car.available ? 'Book Now' : 'Unavailable'}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
