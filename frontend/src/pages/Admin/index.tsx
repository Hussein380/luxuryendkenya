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
  Clock,
  CheckCircle2,
  AlertCircle,
  UserX,
  Download,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
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
import { getBookings, updateBookingStatus, cancelBooking, startTrip, markAsOverdue, markNoShow } from '@/services/bookingService';
import { getRevenue, exportRevenueCSV, exportRevenuePDF, getQuickDateRange, type RevenueResponse } from '@/services/revenueService';
import { AdminCarModal } from '@/components/admin/AdminCarModal';
import { CheckInModal } from '@/components/admin/CheckInModal';
import { AdminBookingDetailsModal } from '@/components/admin/AdminBookingDetailsModal';
import type { Car as CarType, Booking } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: 'Pending Payment', color: 'bg-warning/10 text-warning', icon: Clock },
  reserved: { label: 'Reserved', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-accent/10 text-accent', icon: Check },
  paid: { label: 'Paid', color: 'bg-success/10 text-success', icon: Check },
  active: { label: 'Active', color: 'bg-indigo-500/10 text-indigo-500', icon: TrendingUp },
  overdue: { label: 'Overdue', color: 'bg-destructive/10 text-destructive', icon: Clock },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: X },
};

export default function Admin() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carPage, setCarPage] = useState(1);
  const [carTotal, setCarTotal] = useState(0);

  // Revenue State
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueStartDate, setRevenueStartDate] = useState('');
  const [revenueEndDate, setRevenueEndDate] = useState('');
  const [revenueGroupBy, setRevenueGroupBy] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [carsData, bookingsData] = await Promise.all([
        getCars({ limit: 24, page: 1 } as any),
        getBookings(),
      ]);
      setCars(carsData.cars);
      setCarTotal(carsData.total);
      setCarPage(1);
      setBookings(bookingsData.bookings);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCars = async () => {
    const nextPage = carPage + 1;
    setIsLoadingCars(true);
    try {
      const carsData = await getCars({ limit: 24, page: nextPage } as any);
      setCars(prev => [...prev, ...carsData.cars]);
      setCarPage(nextPage);
    } finally {
      setIsLoadingCars(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Revenue Functions
  const loadRevenue = async () => {
    setIsLoadingRevenue(true);
    try {
      const data = await getRevenue({
        startDate: revenueStartDate || undefined,
        endDate: revenueEndDate || undefined,
        groupBy: revenueGroupBy
      });
      setRevenueData(data);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const handleQuickDateFilter = (range: 'today' | 'week' | 'month' | 'year') => {
    const { startDate, endDate } = getQuickDateRange(range);
    setRevenueStartDate(startDate);
    setRevenueEndDate(endDate);
  };

  const handleExportCSV = async () => {
    try {
      await exportRevenueCSV({
        startDate: revenueStartDate || undefined,
        endDate: revenueEndDate || undefined
      });
    } catch (error) {
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDFSummary = async () => {
    try {
      await exportRevenuePDF({
        startDate: revenueStartDate || undefined,
        endDate: revenueEndDate || undefined
      }, false); // Summary only
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportPDFFull = async () => {
    try {
      await exportRevenuePDF({
        startDate: revenueStartDate || undefined,
        endDate: revenueEndDate || undefined
      }, true); // Full report with details
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    }
  };

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

  const handleConfirmBooking = async (id: string) => {
    const updated = await updateBookingStatus(id, 'confirmed');
    if (updated) {
      loadData();
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const success = await cancelBooking(id);
      if (success) {
        loadData();
      }
    }
  };

  const handleStartTrip = async (id: string) => {
    const updated = await startTrip(id);
    if (updated) {
      loadData();
    }
  };

  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckInModalOpen(true);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleMarkOverdue = async (id: string) => {
    if (window.confirm('Mark this booking as overdue and send alert email?')) {
      const updated = await markAsOverdue(id);
      if (updated) {
        loadData();
      }
    }
  };

  const handleNoShow = async (id: string) => {
    if (window.confirm('Customer did not show up. Release car and make it available for others?')) {
      const updated = await markNoShow(id);
      if (updated) {
        loadData();
      }
    }
  };

  const stats = [
    {
      label: 'Total Cars',
      value: carTotal,
      icon: Car,
      change: '+2 this month',
    },
    {
      label: 'Active Bookings',
      value: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length,
      icon: CalendarDays,
      change: '+12% from last week',
    },
    {
      label: 'Revenue',
      value: formatPrice(bookings.filter(b => b.status === 'paid' || b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0)),
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
    `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="revenue" onClick={loadRevenue}>Revenue</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Booking</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground hidden lg:table-cell">Dates</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Status</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Total</th>
                      <th className="text-right p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Actions</th>
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
                            <td className="p-2 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <LazyImage
                                  src={booking.carImage}
                                  alt={booking.carName}
                                  className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded"
                                  wrapperClassName="flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{booking.id}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.carName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 sm:p-4 hidden md:table-cell">
                              <p className="text-sm">{booking.firstName} {booking.lastName}</p>
                              <p className="text-xs text-muted-foreground">{booking.customerEmail || booking.customerPhone}</p>
                            </td>
                            <td className="p-2 sm:p-4 hidden lg:table-cell">
                              <p className="text-sm">
                                {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                                {new Date(booking.returnDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{booking.totalDays} days</p>
                            </td>
                            <td className="p-2 sm:p-4">
                              <Badge className={`${statusInfo.color} text-xs sm:text-sm whitespace-nowrap`} variant="secondary">
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base">{formatPrice(booking.totalPrice)}</td>
                            <td className="p-2 sm:p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {(booking.status === 'pending' || booking.status === 'reserved') && (
                                    <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Confirm Status
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status === 'paid' && (
                                    <DropdownMenuItem onClick={() => handleStartTrip(booking.id)}>
                                      <TrendingUp className="w-4 h-4 mr-2" />
                                      Checkout (Start Trip)
                                    </DropdownMenuItem>
                                  )}
                                  {(booking.status === 'active' || booking.status === 'overdue') && (
                                    <DropdownMenuItem onClick={() => handleCheckIn(booking)}>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Check-In (End Trip)
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status === 'active' && (
                                    <DropdownMenuItem onClick={() => handleMarkOverdue(booking.id)} className="text-destructive">
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      Mark as Overdue
                                    </DropdownMenuItem>
                                  )}
                                  {['pending', 'confirmed', 'paid', 'reserved'].includes(booking.status) && (
                                    <DropdownMenuItem onClick={() => handleNoShow(booking.id)} className="text-warning">
                                      <UserX className="w-4 h-4 mr-2" />
                                      Make Available (No-Show)
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleCancelBooking(booking.id)}>
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
                          <p className="font-bold text-accent">{formatPrice(car.pricePerDay)}/day</p>
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

            {!isLoading && cars.length < carTotal && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMoreCars}
                  disabled={isLoadingCars}
                >
                  {isLoadingCars ? 'Loading...' : 'Load More Cars'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card className="p-6">
              {/* Revenue Summary Cards */}
              {revenueData?.summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Expected Revenue</p>
                    <p className="text-xs text-blue-400 mb-2">(Projected)</p>
                    <p className="font-display text-xl font-bold text-blue-700">
                      {formatPrice(revenueData.summary.expectedRevenue)}
                    </p>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <p className="text-sm text-green-600 mb-1">Collected Revenue</p>
                    <p className="text-xs text-green-400 mb-2">(Actual - Money in hand)</p>
                    <p className="font-display text-xl font-bold text-green-700">
                      {formatPrice(revenueData.summary.collectedRevenue)}
                    </p>
                  </Card>
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-600 mb-1">Pending Collection</p>
                    <p className="text-xs text-yellow-400 mb-2">(Outstanding)</p>
                    <p className="font-display text-xl font-bold text-yellow-700">
                      {formatPrice(revenueData.summary.pendingCollection)}
                    </p>
                  </Card>
                  <Card className="p-4 bg-red-50 border-red-200">
                    <p className="text-sm text-red-600 mb-1">Lost Revenue</p>
                    <p className="text-xs text-red-400 mb-2">(Cancelled bookings)</p>
                    <p className="font-display text-xl font-bold text-red-700">
                      {formatPrice(revenueData.summary.lostRevenue)}
                    </p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Collection Rate</p>
                    <p className="text-xs text-purple-400 mb-2">(% collected)</p>
                    <p className="font-display text-xl font-bold text-purple-700">
                      {revenueData.summary.collectionRate}%
                    </p>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Date Inputs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">From Date</label>
                    <Input
                      type="date"
                      value={revenueStartDate}
                      onChange={(e) => setRevenueStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">To Date</label>
                    <Input
                      type="date"
                      value={revenueEndDate}
                      onChange={(e) => setRevenueEndDate(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Group By */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Group By</label>
                  <div className="flex flex-wrap gap-1">
                    {(['day', 'week', 'month', 'year'] as const).map((period) => (
                      <Button
                        key={period}
                        variant={revenueGroupBy === period ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRevenueGroupBy(period)}
                        className="capitalize flex-1 sm:flex-none"
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadRevenue} disabled={isLoadingRevenue} className="flex-1 sm:flex-none">
                    <Filter className="w-4 h-4 mr-2" />
                    {isLoadingRevenue ? 'Loading...' : 'Apply'}
                  </Button>
                  <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={handleExportPDFSummary} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Summary
                  </Button>
                  <Button variant="outline" onClick={handleExportPDFFull} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Full
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6">
                <Button variant="outline" size="sm" onClick={() => handleQuickDateFilter('today')} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-1" />
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickDateFilter('week')} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-1" />
                  This Week
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickDateFilter('month')} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-1" />
                  This Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickDateFilter('year')} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-1" />
                  This Year
                </Button>
              </div>

              {/* Revenue Table */}
              {isLoadingRevenue ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : revenueData?.data && revenueData.data.length > 0 ? (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Period</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Expected</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Collected</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Pending</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Lost</th>
                        <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-sm sm:text-base">Bookings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.data.map((row, index) => (
                        <tr key={index} className="border-b border-border hover:bg-secondary/50">
                          <td className="p-2 sm:p-4 font-medium text-sm sm:text-base">{row.period}</td>
                          <td className="p-2 sm:p-4 text-blue-600 text-sm sm:text-base">{formatPrice(row.expectedRevenue)}</td>
                          <td className="p-2 sm:p-4 text-green-600 text-sm sm:text-base">{formatPrice(row.collectedRevenue)}</td>
                          <td className="p-2 sm:p-4 text-yellow-600 text-sm sm:text-base">{formatPrice(row.pendingCollection)}</td>
                          <td className="p-2 sm:p-4 text-red-600 text-sm sm:text-base">{formatPrice(row.lostRevenue)}</td>
                          <td className="p-2 sm:p-4">
                            <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                              {row.bookingCount} ({row.cancelledCount} cancelled)
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No revenue data found for the selected period</p>
                  <p className="text-sm mt-2">Select a date range and click Apply to view revenue</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <AdminCarModal
          car={selectedCar}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
        />

        <CheckInModal
          booking={selectedBooking}
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          onSuccess={loadData}
        />

        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onConfirm={handleConfirmBooking}
          onStartTrip={handleStartTrip}
          onCancel={handleCancelBooking}
          onMarkPaid={handleConfirmBooking}
        />
      </div>
    </Layout>
  );
}
