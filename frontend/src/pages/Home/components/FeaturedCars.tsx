import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarCard } from '@/components/cars/CarCard';
import { CarCardSkeleton } from '@/components/common/Skeleton';
import type { Car } from '@/types';

interface FeaturedCarsProps {
    cars: Car[];
    isLoading: boolean;
}

export const FeaturedCars = ({ cars, isLoading }: FeaturedCarsProps) => {
    return (
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
                        : cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
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
    );
};
