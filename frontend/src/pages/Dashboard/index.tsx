import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Car,
  Heart,
  Search,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/common/Layout';
import { LazyImage } from '@/components/common/LazyImage';
import { Skeleton } from '@/components/common/Skeleton';
import { getMyBookings } from '@/services/bookingService';
import { getMyProfile, removeFavorite, deleteSavedSearch } from '@/services/userService';
import type { Booking } from '@/types';
import type { UserProfile } from '@/services/userService';
import { Link } from 'react-router-dom';

const statusIcons = {
  pending: Clock,
  reserved: Clock,
  confirmed: CheckCircle,
  paid: CheckCircle,
  active: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookingsData, profileData] = await Promise.all([
          getMyBookings(),
          getMyProfile(),
        ]);
        setBookings(bookingsData.bookings);
        setProfile(profileData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRemoveFavorite = async (carId: string) => {
    const updated = await removeFavorite(carId);
    if (updated) {
      setProfile(updated);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    const updated = await deleteSavedSearch(searchId);
    if (updated) {
      setProfile(updated);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => ['pending', 'reserved', 'confirmed', 'paid', 'active'].includes(b.status)
  );
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile?.name || 'User'}!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Car },
            { label: 'Upcoming', value: upcomingBookings.length, icon: Calendar },
            { label: 'Favorites', value: profile?.favorites.length || 0, icon: Heart },
            { label: 'Saved Searches', value: profile?.savedSearches.length || 0, icon: Search },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-xl font-semibold mb-4">Upcoming Bookings</h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    <Button asChild className="mt-4">
                      <Link to="/cars">Browse Cars</Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => {
                      const StatusIcon = statusIcons[booking.status];
                      return (
                        <Card key={booking.id} className="p-4">
                          <div className="flex gap-4">
                            <LazyImage
                              src={booking.carImage}
                              alt={booking.carName}
                              className="w-24 h-24 object-cover rounded-lg"
                              wrapperClassName="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{booking.carName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Booking ID: {booking.id}
                                  </p>
                                </div>
                                <Badge className="capitalize flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                                  {new Date(booking.returnDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {booking.pickupLocation}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <p className="font-semibold text-accent">{formatPrice(booking.totalPrice)}</p>
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/bookings/${booking.id}`}>View Details</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold mb-4">Past Bookings</h3>
                {pastBookings.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    No past bookings
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => {
                      const StatusIcon = statusIcons[booking.status];
                      return (
                        <Card key={booking.id} className="p-4 opacity-75">
                          <div className="flex gap-4">
                            <LazyImage
                              src={booking.carImage}
                              alt={booking.carName}
                              className="w-20 h-20 object-cover rounded-lg"
                              wrapperClassName="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-sm">{booking.carName}</h4>
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                                {new Date(booking.returnDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : !profile || profile.favorites.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No favorite cars yet</p>
                <Button asChild className="mt-4">
                  <Link to="/cars">Browse Cars</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.favorites.map((car) => (
                  <Card key={car.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <LazyImage
                        src={car.imageUrl}
                        alt={car.name}
                        className="w-full h-full object-cover"
                        wrapperClassName="h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{car.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize mb-3">{car.category}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-accent">{formatPrice(car.pricePerDay)}/day</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/cars/${car.id}`}>View</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveFavorite(car.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Preferred Locations</h3>
                {profile?.preferredPickupLocations && profile.preferredPickupLocations.length > 0 ? (
                  <div className="space-y-2">
                    {profile.preferredPickupLocations.map((loc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {loc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No preferred locations set</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Preferred Categories</h3>
                {profile?.preferredCategorySlugs && profile.preferredCategorySlugs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredCategorySlugs.map((cat, i) => (
                      <Badge key={i} variant="secondary" className="capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No preferred categories set</p>
                )}
              </Card>

              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Saved Searches</h3>
                </div>
                {profile?.savedSearches && profile.savedSearches.length > 0 ? (
                  <div className="space-y-3">
                    {profile.savedSearches.map((search) => (
                      <div
                        key={search._id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{search.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Saved {new Date(search.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteSearch(search._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved searches yet</p>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
