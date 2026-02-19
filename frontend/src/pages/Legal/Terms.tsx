import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, MapPin, DollarSign, PenTool as Tool, Fuel, Clock } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { Card } from '@/components/ui/card';

export default function Terms() {
    const sections = [
        {
            icon: Clock,
            title: "Age Requirement",
            content: "The renter must be at least 18 years of age to qualify for the rental. A valid driving license is mandatory."
        },
        {
            icon: MapPin,
            title: "Pickup & Return",
            content: "The vehicle is to be picked up and returned to the same location, which is situated next to Decale Hotel (Eastleigh 12th St)."
        },
        {
            icon: DollarSign,
            title: "Booking Deposit",
            content: "A deposit is required prior to the rental to confirm the booking. For 'Book Now' transactions, full payment is required immediately."
        },
        {
            icon: MapPin,
            title: "Geographical Limit",
            content: "The vehicle must remain within a 50km radius of Nairobi. This ensures we can provide timely assistance if needed."
        },
        {
            icon: DollarSign,
            title: "Extended Travel",
            content: "Any travel beyond the 50km radius of Nairobi will incur an additional charge of Ksh 30 per kilometer."
        },
        {
            icon: Tool,
            title: "Damage Responsibility",
            content: "The renter is fully responsible for any damages to the vehicle and must cover the full cost of repairs and any associated downtime."
        },
        {
            icon: Fuel,
            title: "Vehicle Condition & Fuel",
            content: "The vehicle must be returned in the same condition as it was received. This includes the fuel level, which must match the level at pickup."
        }
    ];

    return (
        <Layout>
            <div className="py-12 bg-secondary/30 min-h-[calc(100vh-80px)]">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms & Conditions</h1>
                        <p className="text-muted-foreground text-lg">Please read these rules carefully before renting from Sol Travel Group.</p>
                    </motion.div>

                    <div className="grid gap-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-6 border-l-4 border-l-accent hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                            <section.icon className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 p-8 bg-primary rounded-2xl text-white text-center shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-4 italic">"Your safety and convenience are our priority."</h2>
                        <p className="opacity-80">By proceeding with a booking or reservation, you signify your full agreement and consent to these terms.</p>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
