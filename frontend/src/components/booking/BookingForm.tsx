import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Plus, Check, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getBookingExtras, calculateBookingPrice } from '@/services/bookingService';
import { getLocations, getUnavailableDates, checkDateAvailability, type UnavailableDateRange } from '@/services/carService';
import { formatPrice } from '@/lib/currency';
import { type Car } from '@/types';
import { LocationAutocomplete } from '@/components/common/LocationAutocomplete';

interface BookingFormProps {
  car: Car;
}

export function BookingForm({ car }: BookingFormProps) {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [extras, setExtras] = useState<{ id: string; name: string; pricePerDay: number }[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDateRange[]>([]);
  const [dateConflict, setDateConflict] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: 'Eastleigh 12nd St, Sec 2',
    returnLocation: 'Eastleigh 12nd St, Sec 2',
    firstName: '',
    lastName: '',
    customerEmail: '',
    customerPhone: '',
    bookingType: 'book_now' as 'book_now' | 'reserve',
    agreedToTerms: false,
  });

  useEffect(() => {
    const loadData = async () => {
      const [locs, exts, bookedDates] = await Promise.all([
        getLocations(),
        getBookingExtras(),
        getUnavailableDates(car.id)
      ]);
      setLocations(locs);
      setExtras(exts);
      setUnavailableDates(bookedDates);
    };
    loadData();
  }, [car.id]);

  // Check availability and validate dates whenever they change
  useEffect(() => {
    // Reset errors
    setDateError(null);
    setDateConflict(null);

    if (!formData.pickupDate || !formData.returnDate) return;

    const pickup = new Date(formData.pickupDate);
    const returnD = new Date(formData.returnDate);
    const now = new Date();

    // Validate: Pickup cannot be in the past
    if (pickup < now) {
      setDateError('Pickup date cannot be in the past');
      return;
    }

    // Validate: Return must be after pickup
    if (returnD <= pickup) {
      setDateError('Return date must be after pickup date');
      return;
    }

    // Validate: Minimum rental period (1 hour)
    const diffHours = (returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) {
      setDateError('Minimum rental period is 1 hour');
      return;
    }

    // Check for conflicts with existing bookings
    const { available, conflictingBooking } = checkDateAvailability(
      formData.pickupDate,
      formData.returnDate,
      unavailableDates
    );

    if (!available && conflictingBooking) {
      const start = new Date(conflictingBooking.start).toLocaleDateString();
      const end = new Date(conflictingBooking.end).toLocaleDateString();
      setDateConflict(`This car is already booked from ${start} to ${end}`);
    }
  }, [formData.pickupDate, formData.returnDate, unavailableDates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const returnD = new Date(formData.returnDate);
    const diffMs = returnD.getTime() - pickup.getTime();

    if (diffMs <= 0) return 0;

    // Calculate total hours and convert to days (rounding up)
    // e.g. 25 hours = 2 days
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.ceil(diffHours / 24);
  };

  const days = calculateDays();
  const selectedExtraItems = extras.filter((e) => selectedExtras.includes(e.id));
  const pricing = calculateBookingPrice(car.pricePerDay, days, selectedExtraItems);

  const handleSubmit = async (e: React.FormEvent, type: 'book_now' | 'reserve') => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!idImage || !licenseImage) {
        throw new Error('Please upload both ID and Driving License images');
      }

      const submissionData = new FormData();
      submissionData.append('carId', car.id);
      submissionData.append('firstName', formData.firstName);
      submissionData.append('lastName', formData.lastName);
      submissionData.append('customerEmail', formData.customerEmail || '');
      submissionData.append('customerPhone', formData.customerPhone);
      submissionData.append('pickupDate', formData.pickupDate);
      submissionData.append('returnDate', formData.returnDate);
      submissionData.append('pickupLocation', formData.pickupLocation);
      submissionData.append('returnLocation', formData.returnLocation);
      submissionData.append('bookingType', type);
      submissionData.append('extras', JSON.stringify(selectedExtras));
      submissionData.append('idImage', idImage);
      submissionData.append('licenseImage', licenseImage);

      const { createBooking } = await import('@/services/bookingService');
      const result = await createBooking(submissionData);

      // Navigate to confirmation with full result
      navigate('/booking/confirmation', {
        state: {
          car,
          booking: result.booking,
          stkResult: result.stkResult,
          type
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.pickupDate &&
    formData.returnDate &&
    formData.firstName &&
    formData.lastName &&
    formData.customerPhone &&
    formData.agreedToTerms &&
    idImage &&
    licenseImage &&
    days > 0 &&
    !dateError &&
    !dateConflict;

  return (
    <form className="space-y-6">
      {/* Dates */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-accent" />
          Rental Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupDate">Pickup Date & Time</Label>
            <Input
              type="datetime-local"
              id="pickupDate"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              required
              className={dateConflict ? 'border-destructive' : ''}
            />
          </div>
          <div>
            <Label htmlFor="returnDate">Return Date & Time</Label>
            <Input
              type="datetime-local"
              id="returnDate"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.pickupDate || new Date().toISOString().slice(0, 16)}
              required
              className={dateConflict ? 'border-destructive' : ''}
            />
          </div>
        </div>

        {/* Date Validation Error */}
        {dateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{dateError}</span>
          </motion.div>
        )}

        {/* Date Conflict Warning */}
        {dateConflict && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{dateConflict}</span>
          </motion.div>
        )}

        {/* Show Booked Dates */}
        {unavailableDates.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Already booked dates:
            </p>
            <div className="flex flex-wrap gap-2">
              {unavailableDates.map((range, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-1 rounded-full ${range.status === 'confirmed'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                >
                  {new Date(range.start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })} - {new Date(range.end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                  {range.status === 'pending' && ' (pending)'}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Locations */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          Pickup & Return Location
        </h3>
        <div className="p-3 rounded-lg bg-secondary/50 border border-accent/20">
          <p className="text-sm font-medium mb-1">Eastleigh 12nd St, Sec 2</p>
          <a
            href="https://share.google/BAz0wMApv14BzE2mR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Open in Google Maps
          </a>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            All vehicles are picked up and returned to this central location.
          </p>
        </div>
      </Card>

      {/* Extras */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          Optional Extras
        </h3>
        <div className="space-y-3">
          {extras.map((extra) => (
            <label
              key={extra.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedExtras.includes(extra.id)}
                  onCheckedChange={() => toggleExtra(extra.id)}
                />
                <span className="text-sm font-medium">{extra.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">+{formatPrice(extra.pricePerDay)}/day</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Customer Info */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold">Your Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number (M-Pesa)</Label>
            <Input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="2547XXXXXXXX"
              required
            />
            <p className="text-[10px] text-muted-foreground mt-1">Format: 2547xxxxxxxx</p>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold">Required Documents</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idImage">National ID Image</Label>
            <Input
              type="file"
              id="idImage"
              accept="image/*"
              onChange={(e) => setIdImage(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {idImage && <p className="text-xs text-success">ID Selected: {idImage.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseImage">Driving License Image</Label>
            <Input
              type="file"
              id="licenseImage"
              accept="image/*"
              onChange={(e) => setLicenseImage(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {licenseImage && <p className="text-xs text-success">License Selected: {licenseImage.name}</p>}
          </div>
        </div>
      </Card>

      {/* Price Summary */}
      {days > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 space-y-3 bg-secondary/50">
            <h3 className="font-display font-semibold">Price Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  {formatPrice(car.pricePerDay)} × {days} days
                </span>
                <span>{formatPrice(pricing.subtotal)}</span>
              </div>
              {selectedExtraItems.map((extra) => (
                <div key={extra.id} className="flex justify-between text-muted-foreground">
                  <span>{extra.name}</span>
                  <span>+{formatPrice(extra.pricePerDay * days)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">{formatPrice(pricing.total)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Submit Buttons */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Terms & Conditions Acceptance */}
      <Card className="p-4 bg-accent/5 border-dashed border-accent/20">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, agreedToTerms: !!checked }))
            }
            className="mt-1"
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I agree to the <Link to="/terms" className="text-accent underline hover:text-accent/80" target="_blank">Terms & Conditions</Link>
            </Label>
            <p className="text-xs text-muted-foreground">
              By checking this, you acknowledge our age requirements, geographical limits (50km from Nairobi), and damage responsibility policies.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, 'book_now')}
          size="lg"
          className="gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-semibold"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Pay & Book Now
        </Button>

        <Button
          type="button"
          onClick={(e) => handleSubmit(e, 'reserve')}
          variant="outline"
          size="lg"
          className="h-14 text-lg font-semibold border-2"
          disabled={!isFormValid || isSubmitting}
        >
          Reserve
        </Button>
      </div>
      <p className="text-[10px] text-center text-muted-foreground">
        Reserve flow requires admin confirmation before payment.
      </p>
    </form>
  );
}
