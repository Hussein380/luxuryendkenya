import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Car,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { getBookingById, cancelBooking } from '@/services/bookingService';
import type { Booking } from '@/types';

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pending Payment' },
  reserved: { icon: Clock, color: 'bg-blue-500', label: 'Reservation Under Review' },
  confirmed: { icon: CheckCircle, color: 'bg-indigo-500', label: 'Admin Confirmed - Action Required' },
  paid: { icon: CheckCircle, color: 'bg-green-500', label: 'Paid & Confirmed' },
  active: { icon: Car, color: 'bg-blue-500', label: 'Active Trip' },
  completed: { icon: CheckCircle, color: 'bg-gray-500', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled' },
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getBookingById(id);
        if (data) {
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return;

    setIsCancelling(true);
    try {
      const success = await cancelBooking(booking.id);
      if (success) {
        setBooking({ ...booking, status: 'cancelled' });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || 'The booking you are looking for does not exist.'}</p>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Car Image */}
                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                    <LazyImage
                      src={booking.carImage}
                      alt={booking.carName}
                      className="w-full h-full object-cover rounded-lg"
                      wrapperClassName="h-full"
                    />
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="font-display text-2xl font-bold">{booking.carName}</h1>
                        <p className="text-muted-foreground">Booking ID: {booking.id}</p>
                      </div>
                      <Badge className={`${status.color} text-white flex items-center gap-1`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup</p>
                          <p className="font-medium">
                            {new Date(booking.pickupDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Return</p>
                          <p className="font-medium">
                            {new Date(booking.returnDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Pickup & Return</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Location</p>
                      <p className="font-medium">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Return Location</p>
                      <p className="font-medium">{booking.returnLocation}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Customer Information</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{booking.customerEmail || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{booking.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 sticky top-24">
                <h2 className="font-display text-lg font-semibold mb-4">Price Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Rental Charge ({booking.totalDays} days)
                    </span>
                    <span>{formatPrice(booking.totalPrice)}</span>
                  </div>

                  {booking.extras && booking.extras.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extras</span>
                      <span>Included</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Price</span>
                      <span className="text-accent">{formatPrice(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className={`p-4 rounded-lg ${booking.status === 'confirmed' || booking.status === 'paid' ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' :
                    booking.status === 'pending' || booking.status === 'reserved' ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' :
                      booking.status === 'cancelled' ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' :
                        'bg-muted'
                  }`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    <span className="font-medium">{status.label}</span>
                  </div>
                  <p className="text-sm mt-1 opacity-80">
                    {booking.status === 'pending' && 'Please complete the M-Pesa payment initiated on your phone.'}
                    {booking.status === 'reserved' && 'Admin is reviewing your documents. You will be notified once confirmed.'}
                    {booking.status === 'confirmed' && 'Your reservation is approved! Please proceed with payment.'}
                    {booking.status === 'paid' && 'Payment received! Your booking is fully confirmed.'}
                    {booking.status === 'cancelled' && 'This booking has been cancelled.'}
                  </p>
                </div>

                {/* Cancel Button */}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </Button>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
