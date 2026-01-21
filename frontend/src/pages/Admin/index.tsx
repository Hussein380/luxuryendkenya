import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { Skeleton } from '@/components/common/Skeleton';
import { getCars, deleteCar } from '@/services/carService';
import { getBookings } from '@/services/bookingService';
import { AdminCarModal } from '@/components/admin/AdminCarModal';
import type { Car as CarType, Booking } from '@/types';

const statusConfig: Record<Booking['status'], { label: string; color: string; icon: typeof Check }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-accent/10 text-accent', icon: Check },
  active: { label: 'Active', color: 'bg-success/10 text-success', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: X },
};

export default function Admin() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [carsData, bookingsData] = await Promise.all([
        getCars(),
        getBookings(),
      ]);
      setCars(carsData.cars);
      setBookings(bookingsData.bookings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCar = () => {
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleEditCar = (car: CarType) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      const success = await deleteCar(id);
      if (success) {
        loadData();
      }
    }
  };

  const stats = [
    {
      label: 'Total Cars',
      value: cars.length,
      icon: Car,
      change: '+2 this month',
    },
    {
      label: 'Active Bookings',
      value: bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length,
      icon: CalendarDays,
      change: '+12% from last week',
    },
    {
      label: 'Revenue',
      value: `$${bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+8% from last month',
    },
    {
      label: 'Customers',
      value: new Set(bookings.map(b => b.customerEmail)).size,
      icon: Users,
      change: '+5 new customers',
    },
  ];

  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your fleet and bookings</p>
          </div>
          <Button
            className="gradient-accent text-accent-foreground border-0"
            onClick={handleAddCar}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Car
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-success mt-1">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search cars, bookings, customers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Booking</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Dates</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="p-4" colSpan={6}>
                            <Skeleton className="h-12 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => {
                        const statusInfo = statusConfig[booking.status];
                        return (
                          <motion.tr
                            key={booking.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border hover:bg-secondary/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <LazyImage
                                  src={booking.carImage}
                                  alt={booking.carName}
                                  className="w-12 h-8 object-cover rounded"
                                  wrapperClassName="flex-shrink-0"
                                />
                                <div>
                                  <p className="font-medium">{booking.id}</p>
                                  <p className="text-sm text-muted-foreground">{booking.carName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <p className="text-sm">{booking.customerName}</p>
                              <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <p className="text-sm">
                                {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                                {new Date(booking.returnDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{booking.totalDays} days</p>
                            </td>
                            <td className="p-4">
                              <Badge className={statusInfo.color} variant="secondary">
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-4 font-semibold">${booking.totalPrice}</td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))
                : filteredCars.map((car, i) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="relative h-40">
                        <LazyImage
                          src={car.imageUrl}
                          alt={car.name}
                          className="w-full h-full object-cover"
                          wrapperClassName="h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            className={
                              car.available
                                ? 'bg-success text-success-foreground border-0'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {car.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display font-semibold">{car.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{car.category}</p>
                          </div>
                          <p className="font-bold text-accent">${car.pricePerDay}/day</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditCar(car)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <AdminCarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          car={selectedCar}
          onSuccess={loadData}
        />
      </div>
    </Layout>
  );
}
