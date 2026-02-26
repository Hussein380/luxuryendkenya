import { motion } from 'framer-motion';
import {
    Car,
    CalendarDays,
    DollarSign,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/currency';

interface Stat {
    label: string;
    value: string | number;
    icon: any;
    change: string;
    isPositive: boolean;
    color: string;
}

interface DashboardStatsProps {
    stats: {
        carTotal: number;
        activeBookings: number;
        totalRevenue: number;
        customerCount: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const items: Stat[] = [
        {
            label: 'Total Fleet',
            value: stats.carTotal,
            icon: Car,
            change: '+2 this month',
            isPositive: true,
            color: 'from-blue-500 to-indigo-600',
        },
        {
            label: 'Active Trips',
            value: stats.activeBookings,
            icon: CalendarDays,
            change: '12% increase',
            isPositive: true,
            color: 'from-accent to-amber-600',
        },
        {
            label: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: DollarSign,
            change: '8% growth',
            isPositive: true,
            color: 'from-emerald-500 to-teal-600',
        },
        {
            label: 'Total Customers',
            value: stats.customerCount,
            icon: Users,
            change: '+5 new',
            isPositive: true,
            color: 'from-purple-500 to-pink-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="p-6 relative overflow-hidden group hover:shadow-accent/20 transition-all duration-500 border-border/50">
                        {/* Background Decorative Gradient */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />

                        <div className="flex items-start justify-between relative mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>

                        <div>
                            <p className="text-3xl font-display font-bold tracking-tight mb-1">{stat.value}</p>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>

                        {/* Bottom Progress Bar Decoration */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
