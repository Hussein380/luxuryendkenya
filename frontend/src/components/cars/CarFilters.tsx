import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { getCategories, getLocations } from '@/services/carService';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import type { CarFilters as CarFiltersType } from '@/services/carService';

interface CarFiltersProps {
  filters: CarFiltersType;
  onFilterChange: (filters: CarFiltersType) => void;
  totalResults: number;
}

export function CarFilters({ filters, onFilterChange, totalResults }: CarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState([0, 50000]);

  useEffect(() => {
    const loadFiltersData = async () => {
      const [cats, locs] = await Promise.all([getCategories(), getLocations()]);
      setCategories(cats);
      setLocations(locs);
    };
    loadFiltersData();
  }, []);

  // Sync local search with filters prop (for clear all or external changes)
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        onFilterChange({ ...filters, search: localSearch || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onFilterChange, filters]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({
      ...filters,
      priceMin: values[0] > 0 ? values[0] : undefined,
      priceMax: values[1] < 50000 ? values[1] : undefined,
    });
  };

  const handleTransmissionChange = (transmission: string) => {
    onFilterChange({
      ...filters,
      transmission: filters.transmission === transmission ? undefined : transmission,
    });
  };

  const handleFuelChange = (fuel: string) => {
    onFilterChange({
      ...filters,
      fuelType: filters.fuelType === fuel ? undefined : fuel,
    });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({
      ...filters,
      location: filters.location === location ? undefined : location,
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 50000]);
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cars, brands..."
            className="pl-10 h-12"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-1 bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {totalResults} {totalResults === 1 ? 'car' : 'cars'} available
      </p>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border p-4 space-y-6">
              {/* Rental Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> Pickup Date
                  </Label>
                  <DateTimePicker
                    date={filters.pickupDate ? new Date(filters.pickupDate) : undefined}
                    setDate={(date) => onFilterChange({ ...filters, pickupDate: date ? date.toISOString() : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> Return Date
                  </Label>
                  <DateTimePicker
                    date={filters.returnDate ? new Date(filters.returnDate) : undefined}
                    setDate={(date) => onFilterChange({ ...filters, returnDate: date ? date.toISOString() : undefined })}
                    minDate={filters.pickupDate ? new Date(filters.pickupDate) : undefined}
                  />
                </div>
              </div>
              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={filters.category === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(cat.id)}
                      className="gap-1"
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm font-medium">Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}+/day
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={50000}
                  step={500}
                  className="w-full"
                />
              </div>

              {/* Transmission */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Transmission</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.transmission === 'automatic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTransmissionChange('automatic')}
                  >
                    Automatic
                  </Button>
                  <Button
                    variant={filters.transmission === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTransmissionChange('manual')}
                  >
                    Manual
                  </Button>
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Fuel Type</Label>
                <div className="flex flex-wrap gap-2">
                  {['electric', 'hybrid', 'petrol', 'diesel'].map((fuel) => (
                    <Button
                      key={fuel}
                      variant={filters.fuelType === fuel ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFuelChange(fuel)}
                      className="capitalize"
                    >
                      {fuel}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Pickup Location</Label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <Button
                      key={loc}
                      variant={filters.location === loc ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLocationChange(loc)}
                    >
                      {loc}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
