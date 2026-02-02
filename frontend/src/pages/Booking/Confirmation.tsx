import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Mail, Download, Home, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { formatPrice } from '@/lib/currency';
import { createBooking } from '@/services/bookingService';
import type { Car, Booking } from '@/types';

interface BookingState {
  car: Car;
  booking: {
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    extras: string[];
    days: number;
    pricing: {
      subtotal: number;
      extrasTotal: number;
      total: number;
    };
  };
}

export default function BookingConfirmation() {
  const location = useLocation();
  const state = location.state as BookingState | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Only submit once when the component mounts
    if (state && !isSubmitted && !isSubmitting) {
      submitBooking();
    }
  }, []);

  const submitBooking = async () => {
    if (!state) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createBooking({
        carId: state.car.id,
        customerName: state.booking.customerName,
        customerEmail: state.booking.customerEmail,
        customerPhone: state.booking.customerPhone || '',
        pickupDate: state.booking.pickupDate,
        returnDate: state.booking.returnDate,
        pickupLocation: state.booking.pickupLocation,
        returnLocation: state.booking.returnLocation,
        extras: state.booking.extras,
      });
      
      if (result) {
        setCreatedBooking(result);
        setIsSubmitted(true);
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state) {
    return <Navigate to="/cars" replace />;
  }

  const { car, booking } = state;
  const bookingRef = createdBooking?.id || 'Processing...';

  // Show loading state while submitting
  if (isSubmitting) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-accent mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Processing Your Booking...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your reservation.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Booking Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={submitBooking} className="gradient-accent text-accent-foreground border-0">
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/cars/${car.id}`}>Back to Car</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
            <h1 className="font-display text-3xl font-bold mb-2">Booking Submitted!</h1>
            <p className="text-muted-foreground">
              Your reservation has been successfully submitted and is pending confirmation.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="overflow-hidden mb-6">
            {/* Car Info Header */}
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

            {/* Booking Info */}
            <div className="p-6 space-y-6">
              {/* Reference */}
              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="font-display text-2xl font-bold text-accent">{bookingRef}</p>
              </div>

              {/* Details Grid */}
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

              {/* Customer Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Customer</p>
                <p className="text-muted-foreground">{booking.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {booking.customerEmail}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatPrice(car.pricePerDay)} × {booking.days} days
                  </span>
                  <span>{formatPrice(booking.pricing.subtotal)}</span>
                </div>
                {booking.pricing.extrasTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Extras</span>
                    <span>{formatPrice(booking.pricing.extrasTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(booking.pricing.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Confirmation Message */}
          <Card className="p-4 bg-success/10 border-success/20 mb-6">
            <p className="text-sm text-center">
              We&apos;ve sent a &quot;Booking Received&quot; email to <strong>{booking.customerEmail}</strong>.
              You&apos;ll get a confirmation email once we approve your booking.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
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
