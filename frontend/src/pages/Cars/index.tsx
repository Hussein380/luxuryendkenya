import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/common/Layout';
import { Button } from '@/components/ui/button';
import { CarCard } from '@/components/cars/CarCard';
import { CarFilters } from '@/components/cars/CarFilters';
import { CarCardSkeleton } from '@/components/common/Skeleton';
import { getCars, type CarFilters as CarFiltersType } from '@/services/carService';
import type { Car } from '@/types';

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CarFiltersType>(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');
    const location = searchParams.get('location');

    const initialFilters: CarFiltersType = {};
    if (category) initialFilters.category = category;
    if (search) initialFilters.search = search;
    if (pickupDate) initialFilters.pickupDate = pickupDate;
    if (returnDate) initialFilters.returnDate = returnDate;
    if (location) initialFilters.location = location;
    return initialFilters;
  });

  const [error, setError] = useState<string | null>(null);

  const loadCars = async (currentPage: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    setError(null);
    try {
      // Pass the page to the service
      const result = await getCars({ ...filters, page: currentPage } as any);
      setCars(append ? [...cars, ...result.cars] : result.cars);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cars');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadCars(1, false);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCars(nextPage, true);
  };

  const handleFilterChange = (newFilters: CarFiltersType) => {
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.pickupDate) params.set('pickupDate', newFilters.pickupDate);
    if (newFilters.returnDate) params.set('returnDate', newFilters.returnDate);
    if (newFilters.location) params.set('location', newFilters.location);
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
            totalResults={total}
          />
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
            : cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
        </div>

        {/* Load More Button */}
        {!isLoading && cars.length < total && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Cars'}
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Could not load cars</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && cars.length === 0 && (
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
