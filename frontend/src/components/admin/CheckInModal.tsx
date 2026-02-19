import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, DollarSign, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { checkIn, updatePenalty, payPenalty } from '@/services/bookingService';
import type { Booking } from '@/types';

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onSuccess: () => void;
}

export function CheckInModal({ isOpen, onClose, booking, onSuccess }: CheckInModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPenaltyLoading, setIsPenaltyLoading] = useState(false);
    const [editablePenalty, setEditablePenalty] = useState<{
        amount: number;
        reason: string;
        waived: boolean;
    }>({ amount: 0, reason: '', waived: false });

    useEffect(() => {
        if (booking && booking.penaltyFee) {
            setEditablePenalty({
                amount: booking.penaltyFee.amount,
                reason: booking.penaltyFee.reason || '',
                waived: booking.penaltyFee.status === 'waived',
            });
        }
    }, [booking]);

    const handleCheckInInitial = async () => {
        if (!booking) return;
        setIsSubmitting(true);
        try {
            const updated = await checkIn(booking.id);
            if (updated) {
                onSuccess();
                // Don't close yet, show penalty review if needed
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePenalty = async () => {
        if (!booking) return;
        setIsPenaltyLoading(true);
        try {
            await updatePenalty(booking.id, {
                amount: editablePenalty.waived ? 0 : editablePenalty.amount,
                reason: editablePenalty.reason,
                status: editablePenalty.waived ? 'waived' : 'pending',
            });
            onSuccess();
        } finally {
            setIsPenaltyLoading(false);
        }
    };

    const handleChargePenalty = async () => {
        if (!booking) return;
        setIsPenaltyLoading(true);
        try {
            await payPenalty(booking.id);
            // M-Pesa initiated, closing modal
            onClose();
        } finally {
            setIsPenaltyLoading(false);
        }
    };

    if (!booking) return null;

    const isOverdue = booking.status === 'overdue' || (new Date() > new Date(booking.returnDate));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Vehicle Check-In</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Booking Info Summary */}
                    <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Booking ID</span>
                            <span className="font-medium">{booking.bookingId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expected Return</span>
                            <span className="font-medium">
                                {new Date(booking.returnDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
                            </span>
                        </div>
                        {booking.actualReturnDate && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Actual Return</span>
                                <span className="font-medium text-success">
                                    {new Date(booking.actualReturnDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
                                </span>
                            </div>
                        )}
                    </div>

                    {!booking.actualReturnDate ? (
                        <div className="space-y-4">
                            {isOverdue && (
                                <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-semibold">Late Return Detected</p>
                                        <p>The system will automatically calculate the penalty based on your business rules (1hr = 50%, 6hrs = 100%).</p>
                                    </div>
                                </div>
                            )}
                            <Button
                                onClick={handleCheckInInitial}
                                className="w-full h-12 gradient-accent text-accent-foreground"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                Confirm Vehicle Return
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Penalty Management</h4>
                                <Badge variant={editablePenalty.waived ? 'outline' : 'destructive'} className="uppercase">
                                    {editablePenalty.waived ? 'Waived' : 'Action Required'}
                                </Badge>
                            </div>

                            <div className="space-y-3 p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Late Fee Amount (KES)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-9"
                                            value={editablePenalty.amount}
                                            disabled={editablePenalty.waived}
                                            onChange={(e) => setEditablePenalty({ ...editablePenalty, amount: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Reason / Note</label>
                                    <Textarea
                                        placeholder="e.g. Returned 3 hours late..."
                                        value={editablePenalty.reason}
                                        onChange={(e) => setEditablePenalty({ ...editablePenalty, reason: e.target.value })}
                                        className="resize-none"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="waived"
                                        checked={editablePenalty.waived}
                                        onChange={(e) => setEditablePenalty({ ...editablePenalty, waived: e.target.checked })}
                                        className="rounded border-input text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="waived" className="text-sm cursor-pointer select-none">
                                        Waive this penalty (Negotiated)
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleUpdatePenalty}
                                    disabled={isPenaltyLoading}
                                >
                                    Save Changes
                                </Button>
                                {!editablePenalty.waived && editablePenalty.amount > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleChargePenalty}
                                        disabled={isPenaltyLoading}
                                    >
                                        Charge via M-Pesa
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
