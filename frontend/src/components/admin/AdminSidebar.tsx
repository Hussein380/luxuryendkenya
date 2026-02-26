import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Car,
    CalendarDays,
    DollarSign,
    Settings,
    LogOut,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', id: 'dashboard' },
    { icon: CalendarDays, label: 'Bookings', path: '/admin#bookings', id: 'bookings' },
    { icon: Car, label: 'Fleet', path: '/admin#cars', id: 'cars' },
    { icon: DollarSign, label: 'Revenue', path: '/admin#revenue', id: 'revenue' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', id: 'settings' },
];

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}

export function AdminSidebar({ activeTab, onTabChange, className }: AdminSidebarProps) {
    const location = useLocation();

    return (
        <aside className={cn(
            "w-64 h-screen sticky top-0 bg-card border-r border-border flex flex-col glass",
            className
        )}>
            {/* Logo Section */}
            <div className="p-6 border-b border-border/50">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-accent">
                        <Car className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-xl tracking-tight">LuxuryEnd</h1>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-accent" : "text-muted-foreground"
                                )} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="relative z-10"
                                >
                                    <ChevronRight className="w-4 h-4 text-accent" />
                                </motion.div>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 bg-primary/10 opacity-50 transition-opacity"
                                    initial={false}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border/50 space-y-2">
                <div className="px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate uppercase tracking-tighter">Verified Admin</p>
                        <p className="text-[10px] text-muted-foreground truncate">Secure Session</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    asChild
                >
                    <Link to="/">
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="text-sm font-medium">Exit Admin</span>
                    </Link>
                </Button>
            </div>
        </aside>
    );
}
