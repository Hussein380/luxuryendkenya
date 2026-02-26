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
  Filter,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { LazyImage } from '@/components/common/LazyImage';
import { Skeleton } from '@/components/common/Skeleton';
import { getCars, deleteCar } from '@/services/carService';
import {
  getBookings,
  updateBookingStatus,
  cancelBooking,
  startTrip,
  checkIn,
  markAsOverdue,
  markNoShow,
  confirmPayment,
  getBookingById
} from '@/services/bookingService';
import { getRevenue, exportRevenueCSV, exportRevenuePDF, getQuickDateRange, type RevenueResponse } from '@/services/revenueService';
import { AdminCarModal } from '@/components/admin/AdminCarModal';
import { CheckInModal } from '@/components/admin/CheckInModal';
import { AdminBookingDetailsModal } from '@/components/admin/AdminBookingDetailsModal';
import type { Car as CarType, Booking } from '@/types';

import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Payment', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  reserved: { label: 'Reserved', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-accent/10 text-accent border-accent/20', icon: Check },
  paid: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Check },
  active: { label: 'Active', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: TrendingUp },
  overdue: { label: 'Overdue', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Clock },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground border-muted-foreground/20', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: X },
};

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
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
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      // Only refresh if not already loading and not in the middle of a search/modal
      if (!isLoading && !isModalOpen && !isCheckInModalOpen && !isDetailsModalOpen) {
        loadData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync revenue loading with tab selection
  useEffect(() => {
    if (activeTab === 'revenue') {
      loadRevenue();
    }
  }, [activeTab]);

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

    // Auto-select best grouping based on date range
    const groupByMap = {
      'today': 'day',
      'week': 'day',
      'month': 'week',
      'year': 'month'
    } as const;
    setRevenueGroupBy(groupByMap[range]);
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
      toast({ title: 'Booking Confirmed', description: `Booking ${updated.bookingId} has been confirmed.` });
      if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
      loadData();
    } else {
      toast({ title: 'Update Failed', description: 'Could not confirm booking. Please try again.', variant: 'destructive' });
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const success = await cancelBooking(id);
      if (success) {
        toast({ title: 'Booking Cancelled', description: 'The booking has been successfully cancelled.' });
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
        }
        loadData();
      } else {
        toast({ title: 'Cancellation Failed', description: 'Could not cancel booking.', variant: 'destructive' });
      }
    }
  };

  const handleStartTrip = async (id: string) => {
    const updated = await startTrip(id);
    if (updated) {
      toast({ title: 'Trip Started', description: `Trip for ${updated.bookingId} has officially started.` });
      if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
      loadData();
    } else {
      toast({
        title: 'Checkout Failed',
        description: 'Ensure the booking is confirmed/paid and not already active.',
        variant: 'destructive'
      });
    }
  };

  const handleMarkPaid = async (id: string) => {
    const receipt = window.prompt('Enter M-Pesa Receipt Number (Manual Confirmation):', 'MANUAL-CONFIRM');
    if (receipt === null) return;

    const amountStr = window.prompt('Enter Paid Amount (Leave empty for total price):');
    const amount = amountStr ? parseFloat(amountStr) : undefined;

    const updated = await confirmPayment(id, receipt, amount);
    if (updated) {
      toast({ title: 'Payment Confirmed', description: `Booking ${updated.bookingId} marked as paid.` });
      if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
      loadData();
    } else {
      toast({ title: 'Payment Failed', description: 'Could not update payment status.', variant: 'destructive' });
    }
  };

  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(false);
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
        toast({ title: 'Overdue Alert Sent', description: `Booking ${updated.bookingId} marked as overdue.` });
        if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
        loadData();
      } else {
        toast({ title: 'Action Failed', description: 'Could not mark as overdue.', variant: 'destructive' });
      }
    }
  };

  const handleNoShow = async (id: string) => {
    if (window.confirm('Customer did not show up. Release car and make it available for others?')) {
      const updated = await markNoShow(id);
      if (updated) {
        toast({ title: 'Car Released', description: 'Booking marked as No-Show and car set to available.' });
        if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
        loadData();
      } else {
        toast({ title: 'Action Failed', description: 'Could not mark as no-show.', variant: 'destructive' });
      }
    }
  };

  const handleResetStatus = async (id: string) => {
    const updated = await updateBookingStatus(id, 'pending');
    if (updated) {
      toast({ title: 'Status Reset', description: 'Booking has been reset to Pending.' });
      if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
      loadData();
    } else {
      toast({ title: 'Reset Failed', description: 'Could not reset booking status.', variant: 'destructive' });
    }
  };

  const dashboardStats = {
    carTotal,
    activeBookings: bookings.filter(b => ['confirmed', 'paid', 'active', 'overdue'].includes(b.status)).length,
    totalRevenue: bookings.filter(b => ['paid', 'active', 'overdue', 'completed'].includes(b.status)).reduce((sum, b) => {
      const penalty = b.penaltyFee?.status === 'paid' ? b.penaltyFee.amount : 0;
      return sum + b.totalPrice + penalty;
    }, 0),
    customerCount: new Set(bookings.map(b => b.customerEmail)).size,
  };

  const sortedBookings = [...bookings].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const carToActiveBooking = bookings.reduce((acc, b) => {
    if (['active', 'overdue'].includes(b.status)) {
      acc[b.carId] = b;
    }
    return acc;
  }, {} as Record<string, Booking>);

  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = sortedBookings.filter(booking =>
    `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Luxury Fleet Control</h1>
            <p className="text-muted-foreground mt-1 text-lg">Oversee your premium vehicle operations</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="gradient-accent text-accent-foreground border-0 shadow-accent hover:scale-105 transition-transform"
              onClick={handleAddCar}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Car
            </Button>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search bookings, fleet, or customers..."
            className="pl-12 h-14 bg-card/50 border-border/50 text-lg rounded-2xl shadow-sm focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsContent value="dashboard" className="space-y-8 m-0 outline-none">
            <DashboardStats stats={dashboardStats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 border-border/50 glass">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">Recent Bookings</h3>
                  <Button variant="link" onClick={() => setActiveTab('bookings')} className="text-accent underline-offset-4">View All</Button>
                </div>
                {/* Simplified list for dashboard */}
                <div className="space-y-4">
                  {sortedBookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/10 cursor-pointer" onClick={() => handleViewDetails(booking)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={booking.carImage} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{booking.firstName} {booking.lastName}</p>
                          <p className="text-[10px] uppercase text-accent tracking-widest font-bold">{booking.bookingId}</p>
                          <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{booking.carName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPrice(booking.totalPrice)}</p>
                        <Badge variant="secondary" className={`${statusConfig[booking.status]?.color} text-[10px] px-1 py-0`}>
                          {statusConfig[booking.status]?.label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-border/50 glass">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">Active Fleet Status</h3>
                  <Button variant="link" onClick={() => setActiveTab('cars')} className="text-accent underline-offset-4">Management</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-success/5 border border-success/10 text-center">
                    <p className="text-2xl font-bold text-success">{cars.filter(c => c.available).length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Available</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-center">
                    <p className="text-2xl font-bold text-destructive">{cars.filter(c => !c.available).length}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">In Service</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-sm font-medium mb-4 text-muted-foreground">Fleet Utilization</p>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(cars.filter(c => !c.available).length / cars.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    <span>0%</span>
                    <span>{Math.round((cars.filter(c => !c.available).length / (cars.length || 1)) * 100)}% Utilized</span>
                    <span>100%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="m-0 outline-none">
            <Card className="overflow-hidden glass border-border/50 shadow-xl">
              <div className="p-6 border-b border-border/50">
                <h3 className="font-display text-xl font-bold">Booking Ledger</h3>
                <p className="text-sm text-muted-foreground">Detailed history of all vehicle rentals</p>
              </div>
              <div className="overflow-x-auto sm:overflow-visible">
                <table className="w-full table-fixed sm:table-auto">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-xs sm:text-base w-[40%] sm:w-auto">Booking</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground hidden lg:table-cell">Dates</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-xs sm:text-base w-[22%] sm:w-auto">Status</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted-foreground text-xs sm:text-base w-[23%] sm:w-auto">Total</th>
                      <th className="text-right p-2 sm:p-4 font-medium text-muted-foreground text-xs sm:text-base w-[15%] sm:w-auto"></th>
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
                            className="border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer group"
                            onClick={() => handleViewDetails(booking)}
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
                                  <p className="font-medium text-sm truncate">{booking.bookingId}</p>
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
                              <Badge className={cn(statusInfo.color, "text-[10px] sm:text-xs px-2 py-0.5 border whitespace-nowrap shadow-sm")} variant="outline">
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-2 sm:p-4">
                              <span className="font-semibold text-xs sm:text-base whitespace-nowrap">{formatPrice(booking.totalPrice)}</span>
                            </td>
                            <td className="p-2 sm:p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                  {(booking.status === 'paid' || booking.status === 'confirmed') && (
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
              <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Showing {filteredBookings.length} entries</p>
              </div>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="m-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <Card className="overflow-hidden glass border-border/50 hover:shadow-accent/10 transition-all duration-500 group">
                      <div className="relative h-48 overflow-hidden">
                        <LazyImage
                          src={car.imageUrl}
                          alt={car.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          wrapperClassName="h-full"
                        />
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                          <Badge
                            className={
                              car.available
                                ? 'bg-success text-success-foreground border-0 shadow-sm'
                                : 'bg-muted text-muted-foreground shadow-sm'
                            }
                          >
                            {car.available ? 'Available' : 'Currently Out on Trip'}
                          </Badge>
                          {!car.available && carToActiveBooking[car.id] && (
                            <Badge variant="secondary" className="bg-white/95 backdrop-blur-md text-black border-0 text-[10px] font-bold shadow-sm">
                              Expected: {new Date(carToActiveBooking[car.id].returnDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                          )}
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
          <TabsContent value="revenue" className="m-0 outline-none">
            <Card className="p-8 glass border-border/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 gradient-accent"></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl font-bold">Financial Analytics</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive revenue and collection overview</p>
                </div>
                <BarChart3 className="w-8 h-8 text-accent opacity-20" />
              </div>
              {/* Revenue Summary Cards */}
              {revenueData?.summary && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Expected Revenue', value: revenueData.summary.expectedRevenue, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
                    { label: 'Collected Revenue', value: revenueData.summary.collectedRevenue, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                    { label: 'Pending Collection', value: revenueData.summary.pendingCollection, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                    { label: 'Lost Revenue', value: revenueData.summary.lostRevenue, color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/10' },
                    { label: 'Collection Rate', value: `${revenueData.summary.collectionRate}%`, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/10' },
                  ].map((stat) => (
                    <Card key={stat.label} className={cn("p-4 glass", stat.bg, stat.border)}>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</p>
                      <p className={cn("font-display text-xl font-bold", stat.color)}>
                        {typeof stat.value === 'number' ? formatPrice(stat.value) : stat.value}
                      </p>
                    </Card>
                  ))}
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

              {/* Quick Date Filters - Auto sets date range and grouping */}
              <div className="mb-2">
                <label className="text-sm text-muted-foreground mb-2 block">Select Time Period</label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <Button
                    variant={revenueStartDate === getQuickDateRange('today').startDate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickDateFilter('today')}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Today
                  </Button>
                  <Button
                    variant={revenueStartDate === getQuickDateRange('week').startDate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickDateFilter('week')}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    This Week
                  </Button>
                  <Button
                    variant={revenueStartDate === getQuickDateRange('month').startDate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickDateFilter('month')}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    This Month
                  </Button>
                  <Button
                    variant={revenueStartDate === getQuickDateRange('year').startDate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickDateFilter('year')}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    This Year
                  </Button>
                </div>
              </div>

              {/* Revenue Table */}
              {isLoadingRevenue ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : revenueData?.data && revenueData.data.length > 0 ? (
                <div className="overflow-x-auto sm:overflow-visible -mx-2 sm:mx-0">
                  <div className="rounded-2xl border border-border/50 overflow-hidden bg-background/30 backdrop-blur-sm">
                    <table className="w-full sm:min-w-[600px] table-fixed sm:table-auto">
                      <thead>
                        <tr className="bg-secondary/20 border-b border-border/50">
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[22%] sm:w-auto">Period</th>
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[18%] sm:w-auto">Expected</th>
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[18%] sm:w-auto">Collected</th>
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[18%] sm:w-auto hidden sm:table-cell">Pending</th>
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[12%] sm:w-auto">Lost</th>
                          <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest w-[12%] sm:w-auto">#</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.data.map((row, index) => (
                          <tr key={index} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                            <td className="p-4 font-medium text-sm sm:text-base">{row.period}</td>
                            <td className="p-4 text-blue-500 font-semibold text-sm sm:text-base">{formatPrice(row.expectedRevenue)}</td>
                            <td className="p-4 text-emerald-500 font-semibold text-sm sm:text-base">{formatPrice(row.collectedRevenue)}</td>
                            <td className="p-4 text-amber-500 font-semibold text-sm sm:text-base hidden sm:table-cell">{formatPrice(row.pendingCollection)}</td>
                            <td className="p-4 text-destructive font-semibold text-sm sm:text-base">{formatPrice(row.lostRevenue)}</td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold">{row.bookingCount}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="m-0 outline-none">
            <Card className="p-12 glass border-border/50 text-center space-y-6">
              <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto shadow-accent/20">
                <Filter className="w-10 h-10 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-3xl font-bold italic tracking-tight text-gradient">Admin Settings</h3>
                <p className="text-muted-foreground max-w-md mx-auto">Configure your luxury rental platform's global parameters, payment gateways, and administrative access controls.</p>
              </div>
              <div className="pt-4">
                <Badge variant="outline" className="px-4 py-1 text-accent border-accent/30 bg-accent/5">Coming Soon to Elite Tier</Badge>
              </div>
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
          onSuccess={async () => {
            toast({ title: 'Return Completed', description: 'The vehicle is now available for new bookings.' });
            if (selectedBooking) {
              const updated = await getBookingById(selectedBooking.id);
              if (updated) setSelectedBooking(updated);
            }
            loadData();
          }}
        />

        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onConfirm={handleConfirmBooking}
          onStartTrip={handleStartTrip}
          onCancel={handleCancelBooking}
          onMarkPaid={handleMarkPaid}
          onResetStatus={handleResetStatus}
          onCheckIn={handleCheckIn}
        />
      </div>
    </AdminLayout>
  );
}
