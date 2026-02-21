import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Mail, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { formatPrice } from '@/lib/currency';
import type { Car, Booking } from '@/types';

interface BookingState {
  car: Car;
  booking: Booking;
  stkResult?: any;
  type: 'book_now' | 'reserve';
}

export default function BookingConfirmation() {
  const location = useLocation();
  const state = location.state as BookingState | null;

  if (!state) {
    return <Navigate to="/cars" replace />;
  }

  const { car, booking, stkResult, type } = state;

  // Handle missing booking data gracefully
  if (!booking) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <Card className="p-8 text-center max-w-md">
            <h1 className="font-display text-2xl font-bold mb-4">Something Went Wrong</h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t retrieve your booking details. Please check your email or contact support.
            </p>
            <Button asChild>
              <Link to="/cars">Browse Cars</Link>
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const bookingRef = booking.bookingId || 'Processing...';

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full gradient-accent flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold mb-2">
              {type === 'book_now' ? 'Booking Initiated!' : 'Reservation Submitted!'}
            </h1>
            <p className="text-muted-foreground">
              {type === 'book_now'
                ? 'Please check your phone for the M-Pesa payment prompt.'
                : 'Your reservation has been received. Admin will contact you soon.'}
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="overflow-hidden mb-6">
            <div className="flex items-center gap-4 p-4 bg-secondary/50 border-b border-border">
              <LazyImage
                src={car.imageUrl}
                alt={car.name}
                className="w-24 h-16 object-cover rounded-lg"
                wrapperClassName="flex-shrink-0"
              />
              <div>
                <h2 className="font-display font-semibold">{car.name}</h2>
                <p className="text-sm text-muted-foreground">{car.brand} • {car.year}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="font-display text-2xl font-bold text-accent">{bookingRef}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Pickup
                  </div>
                  <p className="font-medium">{new Date(booking.pickupDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{booking.pickupLocation}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Return
                  </div>
                  <p className="font-medium">{new Date(booking.returnDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{booking.returnLocation}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Customer</p>
                <p className="text-muted-foreground">{booking.firstName} {booking.lastName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {booking.customerEmail || 'N/A'}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({booking.totalDays} days)
                  </span>
                  <span>{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Amount Due</span>
                  <span className="text-accent">{formatPrice(booking.totalPrice)}</span>
                </div>
              </div>
            </div>
          </Card>

          {type === 'book_now' && stkResult && (
            <Card className="p-4 bg-accent/10 border-accent/20 mb-6">
              <p className="text-sm text-center font-medium text-accent">
                {stkResult.CustomerMessage || 'STK Push sent to your phone.'}
              </p>
            </Card>
          )}

          <Card className="p-4 bg-success/10 border-success/20 mb-6">
            <p className="text-sm text-center">
              {type === 'book_now'
                ? 'We will send a receipt once the payment is confirmed.'
                : `We've received your request. An admin will review your documents and contact you at ${booking.customerPhone}.`}
            </p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 gradient-accent text-accent-foreground border-0 gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
