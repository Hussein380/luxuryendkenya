import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/common/Layout';
import { CarCard } from '@/components/cars/CarCard';
import { CarFilters } from '@/components/cars/CarFilters';
import { CarCardSkeleton } from '@/components/common/Skeleton';
import { getCars, type CarFilters as CarFiltersType } from '@/services/carService';
import type { Car } from '@/types';

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CarFiltersType>(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category');
    return category ? { category } : {};
  });

  useEffect(() => {
    const loadCars = async () => {
      setIsLoading(true);
      try {
        const result = await getCars(filters);
        setCars(result.cars);
      } finally {
        setIsLoading(false);
      }
    };
    loadCars();
  }, [filters]);

  const handleFilterChange = (newFilters: CarFiltersType) => {
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.search) params.set('search', newFilters.search);
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold">Browse Our Fleet</h1>
          <p className="text-muted-foreground mt-2">
            Find the perfect car for your next adventure
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <CarFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            totalResults={cars.length}
          />
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
            : cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
        </div>

        {/* Empty State */}
        {!isLoading && cars.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="font-display text-xl font-semibold mb-2">No cars found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find available vehicles
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
