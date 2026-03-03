import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Sparkles, Car as CarIcon, Plane, X } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LazyImage } from '@/components/common/LazyImage';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

interface HeroProps {
    activeService: 'hire' | 'transfer';
    setActiveService: (service: 'hire' | 'transfer') => void;
    hireDetails: { location: string; pickupDate: string; returnDate: string };
    setHireDetails: (details: any) => void;
    transferDetails: { pickup: string; dropoff: string; date: string };
    setTransferDetails: (details: any) => void;
    isMobileFormOpen: boolean;
    setIsMobileFormOpen: (open: boolean) => void;
    handleTransferSubmit: (e: React.FormEvent) => void;
}

export const Hero = ({
    activeService,
    setActiveService,
    hireDetails,
    setHireDetails,
    transferDetails,
    setTransferDetails,
    isMobileFormOpen,
    setIsMobileFormOpen,
    handleTransferSubmit,
}: HeroProps) => {
    return (
        <section className="relative min-h-[650px] lg:min-h-[850px] flex items-center justify-center text-primary-foreground overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <LazyImage
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
                    alt="Luxury Hero Background"
                    className="w-full h-full object-cover object-center scale-105"
                    wrapperClassName="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95" />
                <div className="absolute inset-0 bg-black/20 md:hidden" />
            </div>

            <div className="container mx-auto px-4 relative z-10 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent font-medium backdrop-blur-sm mx-auto">
                        <Sparkles className="w-4 h-4" />
                        Elite Travel Solutions in Kenya
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">
                        Arrive in <span className="text-gradient">Style</span>, every time.
                    </h1>

                    <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto drop-shadow-md">
                        Whether you need to hire a premium vehicle or require a seamless airport transfer, we've got you covered.
                    </p>

                    {/* Desktop Search Card */}
                    <div className="hidden md:block bg-card/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-w-3xl mx-auto mt-12 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent opacity-60" />

                        {/* Service Switcher Tabs */}
                        <div className="flex p-1 bg-black/20 rounded-xl max-w-sm mx-auto mb-4 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setActiveService('hire')}
                                className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'hire'
                                    ? 'bg-accent text-accent-foreground shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Hire a Car
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveService('transfer')}
                                className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'transfer'
                                    ? 'bg-accent text-accent-foreground shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Airport Transfers
                            </button>
                        </div>

                        {activeService === 'hire' ? (
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                            <Input
                                                required
                                                placeholder="Enter location"
                                                value={hireDetails.location}
                                                onChange={(e) => setHireDetails({ ...hireDetails, location: e.target.value })}
                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Date</label>
                                        <DateTimePicker
                                            date={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : undefined}
                                            setDate={(date) => setHireDetails({ ...hireDetails, pickupDate: date ? date.toISOString() : '' })}
                                            minDate={new Date()}
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Return Date</label>
                                        <DateTimePicker
                                            date={hireDetails.returnDate ? new Date(hireDetails.returnDate) : undefined}
                                            setDate={(date) => setHireDetails({ ...hireDetails, returnDate: date ? date.toISOString() : '' })}
                                            minDate={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : new Date()}
                                        />
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    <Link to={`/cars?pickupDate=${hireDetails.pickupDate}&returnDate=${hireDetails.returnDate}&location=${encodeURIComponent(hireDetails.location)}`}>
                                        <Search className="w-5 h-5 mr-3" />
                                        Search Available Cars
                                    </Link>
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleTransferSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Point</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                            <Input
                                                required
                                                placeholder="Airport or Hotel"
                                                value={transferDetails.pickup}
                                                onChange={(e) => setTransferDetails({ ...transferDetails, pickup: e.target.value })}
                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Destination</label>
                                        <div className="relative">
                                            <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                            <Input
                                                required
                                                placeholder="Hotel or Airport"
                                                value={transferDetails.dropoff}
                                                onChange={(e) => setTransferDetails({ ...transferDetails, dropoff: e.target.value })}
                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-accent transition-all rounded-xl shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Date & Time</label>
                                        <DateTimePicker
                                            date={transferDetails.date ? new Date(transferDetails.date) : undefined}
                                            setDate={(date) => setTransferDetails({ ...transferDetails, date: date ? date.toISOString() : '' })}
                                            minDate={new Date()}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full gradient-accent text-accent-foreground border-0 shadow-accent h-14 text-lg font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    <Search className="w-5 h-5 mr-3" />
                                    Book Transfer via WhatsApp
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Mobile Booking Tiles */}
                    <div className="md:hidden flex flex-col gap-4 mt-12 w-full max-w-sm mx-auto">
                        <Sheet open={isMobileFormOpen} onOpenChange={setIsMobileFormOpen}>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setActiveService('hire'); setIsMobileFormOpen(true); }}
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <CarIcon className="w-6 h-6 text-accent-foreground" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-white">Hire Car</span>
                                </button>

                                <button
                                    onClick={() => { setActiveService('transfer'); setIsMobileFormOpen(true); }}
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Plane className="w-6 h-6 text-accent-foreground" />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-white">Transfers</span>
                                </button>
                            </div>

                            <SheetContent side="bottom" className="h-auto max-h-[95vh] bg-transparent border-0 p-4 pb-10 shadow-none overflow-visible">
                                <div className="bg-card/10 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden max-w-lg mx-auto">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent opacity-60" />

                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-2" />
                                        <div className="flex items-center justify-between w-full">
                                            <div className="w-8" />
                                            <SheetTitle className="font-display text-2xl font-bold text-white text-center leading-tight">
                                                {activeService === 'hire' ? 'Hire a Premium Car' : 'Elite Airport Transfer'}
                                            </SheetTitle>
                                            <SheetDescription className="sr-only">
                                                Select your destination and preferred dates for your premium travel experience in Kenya.
                                            </SheetDescription>
                                            <SheetClose className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                                                <X className="w-5 h-5" />
                                            </SheetClose>
                                        </div>
                                    </div>

                                    <div className="flex p-1 bg-black/20 rounded-xl max-w-sm mx-auto mb-4 border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setActiveService('hire')}
                                            className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'hire'
                                                ? 'bg-accent text-accent-foreground shadow-lg'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Hire a Car
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveService('transfer')}
                                            className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeService === 'transfer'
                                                ? 'bg-accent text-accent-foreground shadow-lg'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Transfers
                                        </button>
                                    </div>

                                    <div className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar pb-4">
                                        {activeService === 'hire' ? (
                                            <form className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Location</label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                                            <Input
                                                                required
                                                                value={hireDetails.location}
                                                                onChange={(e) => setHireDetails({ ...hireDetails, location: e.target.value })}
                                                                placeholder="Enter location"
                                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <DateTimePicker
                                                            label="Pickup Date"
                                                            date={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : undefined}
                                                            setDate={(date) => setHireDetails({ ...hireDetails, pickupDate: date ? date.toISOString() : '' })}
                                                            minDate={new Date()}
                                                        />
                                                        <DateTimePicker
                                                            label="Return Date"
                                                            date={hireDetails.returnDate ? new Date(hireDetails.returnDate) : undefined}
                                                            setDate={(date) => setHireDetails({ ...hireDetails, returnDate: date ? date.toISOString() : '' })}
                                                            minDate={hireDetails.pickupDate ? new Date(hireDetails.pickupDate) : new Date()}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="w-full gradient-accent h-14 text-base sm:text-lg font-bold shadow-accent rounded-xl"
                                                >
                                                    <Link to={`/cars?pickupDate=${hireDetails.pickupDate}&returnDate=${hireDetails.returnDate}&location=${encodeURIComponent(hireDetails.location)}`}>
                                                        <Search className="w-5 h-5 mr-3" />
                                                        Search Available Cars
                                                    </Link>
                                                </Button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleTransferSubmit} className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Pickup Point</label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                                            <Input
                                                                required
                                                                placeholder="Airport or Hotel"
                                                                value={transferDetails.pickup}
                                                                onChange={(e) => setTransferDetails({ ...transferDetails, pickup: e.target.value })}
                                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-accent/90 ml-1">Destination</label>
                                                        <div className="relative">
                                                            <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                                            <Input
                                                                required
                                                                placeholder="Hotel or Airport"
                                                                value={transferDetails.dropoff}
                                                                onChange={(e) => setTransferDetails({ ...transferDetails, dropoff: e.target.value })}
                                                                className="pl-10 h-14 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DateTimePicker
                                                        label="Date & Time"
                                                        date={transferDetails.date ? new Date(transferDetails.date) : undefined}
                                                        setDate={(date) => setTransferDetails({ ...transferDetails, date: date ? date.toISOString() : '' })}
                                                        minDate={new Date()}
                                                    />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="w-full gradient-accent h-14 text-base sm:text-lg font-bold shadow-accent rounded-xl whitespace-normal"
                                                >
                                                    <Search className="w-5 h-5 mr-2" />
                                                    Book Transfer via WhatsApp
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
