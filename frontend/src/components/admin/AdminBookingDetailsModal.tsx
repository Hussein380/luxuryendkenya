import { motion } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    CreditCard,
    FileText,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    TrendingUp,
    Car as CarIcon,
    RefreshCcw,
    Undo2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/currency';
import type { Booking } from '@/types';

interface AdminBookingDetailsModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onStartTrip: (id: string) => void;
    onCancel: (id: string) => void;
    onMarkPaid: (id: string) => void;
    onResetStatus?: (id: string) => void;
    onCheckIn?: (booking: Booking) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending Payment', color: 'bg-warning/10 text-warning border-warning/20' },
    reserved: { label: 'Reserved', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    confirmed: { label: 'Confirmed', color: 'bg-accent/10 text-accent border-accent/20' },
    paid: { label: 'Paid', color: 'bg-success/10 text-success border-success/20' },
    active: { label: 'Active Trip', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    overdue: { label: 'Overdue', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    completed: { label: 'Completed', color: 'bg-muted text-muted-foreground border-muted' },
    cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function AdminBookingDetailsModal({
    booking,
    isOpen,
    onClose,
    onConfirm,
    onStartTrip,
    onCancel,
    onMarkPaid,
    onResetStatus,
    onCheckIn
}: AdminBookingDetailsModalProps) {
    if (!booking) return null;

    const status = statusConfig[booking.status] || statusConfig.pending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mt-2">
                        <DialogTitle className="text-2xl font-display font-bold">Booking Details</DialogTitle>
                        <Badge className={status.color} variant="outline">
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">ID: {booking.bookingId}</p>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Left Column - Customer & Car */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Customer Information
                            </h3>
                            <Card className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-accent">
                                        {booking.firstName[0]}{booking.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{booking.firstName} {booking.lastName}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-3 h-3" /> {booking.customerEmail || 'No email provided'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{booking.customerPhone}</span>
                                </div>
                            </Card>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <CarIcon className="w-4 h-4" />
                                Vehicle & Trip
                            </h3>
                            <Card className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <img src={booking.carImage} alt={booking.carName} className="w-24 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-semibold">{booking.carName}</p>
                                        <p className="text-sm text-muted-foreground">{booking.totalDays} Days Rental</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pickup</p>
                                        <p className="text-sm font-medium">{new Date(booking.pickupDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Return</p>
                                        <p className="text-sm font-medium">{new Date(booking.returnDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                        <span>{booking.pickupLocation}</span>
                                    </div>
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Right Column - Documents & Payment */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Identity Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <a href={booking.idImageUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-video rounded-lg overflow-hidden border bg-muted hover:border-accent transition-colors">
                                    <img src={booking.idImageUrl} alt="ID" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-background/80 backdrop-blur p-2 rounded-full shadow-lg">
                                            <ExternalLink className="w-4 h-4 text-accent" />
                                        </div>
                                    </div>
                                    <p className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow-md">National ID</p>
                                </a>
                                <a href={booking.licenseImageUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-video rounded-lg overflow-hidden border bg-muted hover:border-accent transition-colors">
                                    <img src={booking.licenseImageUrl} alt="License" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-background/80 backdrop-blur p-2 rounded-full shadow-lg">
                                            <ExternalLink className="w-4 h-4 text-accent" />
                                        </div>
                                    </div>
                                    <p className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow-md">Driving License</p>
                                </a>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Summary
                            </h3>
                            <Card className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Price</span>
                                    <span className="text-lg font-bold text-accent">{formatPrice(booking.totalPrice)}</span>
                                </div>
                                {booking.paymentDetails?.mpesaReceiptNumber && (
                                    <div className="pt-2 border-t space-y-1">
                                        <p className="text-xs text-muted-foreground">M-Pesa Receipt</p>
                                        <p className="text-sm font-mono font-bold text-success capitalize">{booking.paymentDetails.mpesaReceiptNumber}</p>
                                        <p className="text-[10px] text-muted-foreground italic">Paid on {new Date(booking.paymentDetails.paidAt).toLocaleString()}</p>
                                    </div>
                                )}
                                {booking.penaltyFee?.amount > 0 && (
                                    <div className="pt-2 border-t flex justify-between items-center text-destructive">
                                        <div className="flex items-center gap-1 text-xs">
                                            <AlertCircle className="w-3 h-3" /> Penalty Fee
                                        </div>
                                        <span className="font-bold">{formatPrice(booking.penaltyFee.amount)}</span>
                                    </div>
                                )}
                            </Card>
                        </section>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t justify-end">
                    <Button variant="outline" onClick={onClose} className="mr-auto">Close</Button>

                    {/* ALWAYS SHOW RESET if not pending/reserved - allows undoing mistake */}
                    {onResetStatus && booking.status !== 'pending' && booking.status !== 'reserved' && (
                        <Button
                            variant="outline"
                            className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                            onClick={() => {
                                if (window.confirm('Reset this booking to Pending status? This will unlock the car availability if it was blocked.')) {
                                    onResetStatus(booking.id);
                                }
                            }}
                        >
                            <Undo2 className="w-4 h-4 mr-2" />
                            Reset to Pending
                        </Button>
                    )}

                    {/* Primary Actions based on next logical steps, but slightly more open */}
                    {(booking.status === 'pending' || booking.status === 'reserved' || booking.status === 'cancelled') && (
                        <Button className="gradient-accent border-0" onClick={() => onConfirm(booking.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {booking.status === 'cancelled' ? 'Restore & Confirm' : 'Confirm Booking'}
                        </Button>
                    )}

                    {/* Mark as Paid - useful for any upcoming/active trip */}
                    {(booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'active') && (
                        <Button variant="outline" className="text-success border-success/30 hover:bg-success/10" onClick={() => onMarkPaid(booking.id)}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Mark as Paid
                        </Button>
                    )}

                    {/* Checkout - allow if confirmed or paid */}
                    {(booking.status === 'paid' || booking.status === 'confirmed') && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onStartTrip(booking.id)}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Checkout (Start Trip)
                        </Button>
                    )}

                    {/* Check-in - show if active or overdue */}
                    {(booking.status === 'active' || booking.status === 'overdue') && onCheckIn && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onCheckIn(booking)}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Check-in (Returns)
                        </Button>
                    )}

                    {/* Cancel - available for almost any state except end states */}
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onCancel(booking.id)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Booking
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
