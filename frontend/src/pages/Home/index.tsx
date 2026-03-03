import { useState, useEffect } from 'react';
import { Layout } from '@/components/common/Layout';
import { getFeaturedCars, getCategories } from '@/services/carService';
import { getRecommendations } from '@/services/recommendationService';
import type { Car } from '@/types';

// Modular Components
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Categories } from './components/Categories';
import { FeaturedCars } from './components/FeaturedCars';
import { AIRecommendations } from './components/AIRecommendations';
import { CTA } from './components/CTA';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [recommendations, setRecommendations] = useState<{ car: Car; reason: string; tags: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeService, setActiveService] = useState<'hire' | 'transfer'>('hire');
  const [hireDetails, setHireDetails] = useState({
    location: '',
    pickupDate: new Date().toISOString(),
    returnDate: new Date(Date.now() + 86400000).toISOString()
  });
  const [transferDetails, setTransferDetails] = useState({
    pickup: '',
    dropoff: '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cars, cats, recs] = await Promise.all([
          getFeaturedCars(4),
          getCategories(),
          getRecommendations(),
        ]);
        setFeaturedCars(cars);
        setCategories(cats);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (recommendations.length === 0) {
          setRecommendations([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi Luxuryend, I'd like to book an airport transfer:
Pickup: ${transferDetails.pickup || 'Not specified'}
Drop-off: ${transferDetails.dropoff || 'Not specified'}
Date: ${transferDetails.date || 'Not specified'}`;
    window.open(`https://wa.me/254725675022?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      <Hero
        activeService={activeService}
        setActiveService={setActiveService}
        hireDetails={hireDetails}
        setHireDetails={setHireDetails}
        transferDetails={transferDetails}
        setTransferDetails={setTransferDetails}
        isMobileFormOpen={isMobileFormOpen}
        setIsMobileFormOpen={setIsMobileFormOpen}
        handleTransferSubmit={handleTransferSubmit}
      />
      <Features />
      <Categories categories={categories} />
      <FeaturedCars cars={featuredCars} isLoading={isLoading} />
      <AIRecommendations recommendations={recommendations} />
      <CTA />
    </Layout>
  );
}
