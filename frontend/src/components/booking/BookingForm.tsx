import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Plus, Check, AlertTriangle, Calendar } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: car.location,
    returnLocation: car.location,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
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

  // Check availability whenever dates change
  useEffect(() => {
    if (formData.pickupDate && formData.returnDate) {
      const { available, conflictingBooking } = checkDateAvailability(
        formData.pickupDate,
        formData.returnDate,
        unavailableDates
      );

      if (!available && conflictingBooking) {
        const start = new Date(conflictingBooking.start).toLocaleDateString();
        const end = new Date(conflictingBooking.end).toLocaleDateString();
        setDateConflict(`This car is already booked from ${start} to ${end}`);
      } else {
        setDateConflict(null);
      }
    } else {
      setDateConflict(null);
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
    const diff = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();
  const selectedExtraItems = extras.filter((e) => selectedExtras.includes(e.id));
  const pricing = calculateBookingPrice(car.pricePerDay, days, selectedExtraItems);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to confirmation with booking details
    navigate('/booking/confirmation', {
      state: {
        car,
        booking: {
          ...formData,
          extras: selectedExtras,
          days,
          pricing,
        },
      },
    });
  };

  const isFormValid =
    formData.pickupDate &&
    formData.returnDate &&
    formData.customerName &&
    formData.customerEmail &&
    days > 0 &&
    !dateConflict; // Also check for date conflicts

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dates */}
      <Card className="p-4 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-accent" />
          Rental Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupDate">Pickup Date</Label>
            <Input
              type="date"
              id="pickupDate"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className={dateConflict ? 'border-destructive' : ''}
            />
          </div>
          <div>
            <Label htmlFor="returnDate">Return Date</Label>
            <Input
              type="date"
              id="returnDate"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.pickupDate || new Date().toISOString().split('T')[0]}
              required
              className={dateConflict ? 'border-destructive' : ''}
            />
          </div>
        </div>

        {/* Date Conflict Warning */}
        {dateConflict && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
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
                  {new Date(range.start).toLocaleDateString()} - {new Date(range.end).toLocaleDateString()}
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
          Pickup & Return
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <LocationAutocomplete
              value={formData.pickupLocation}
              onChange={(val) => setFormData(prev => ({ ...prev, pickupLocation: val }))}
              placeholder="Select pickup point"
            />
          </div>
          <div>
            <Label htmlFor="returnLocation">Return Location</Label>
            <LocationAutocomplete
              value={formData.returnLocation}
              onChange={(val) => setFormData(prev => ({ ...prev, returnLocation: val }))}
              placeholder="Select return point"
            />
          </div>
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
        <div className="space-y-3">
          <div>
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="0725 996 394"
            />
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

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-semibold"
        disabled={!isFormValid}
      >
        <Check className="w-5 h-5 mr-2" />
        Confirm Booking
      </Button>
    </form>
  );
}
