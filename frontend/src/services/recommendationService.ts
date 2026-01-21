/**
 * Recommendation Service
 * 
 * Handles AI-powered recommendations and chat functionality.
 */

import { type Recommendation, type AIMessage, type Car } from '@/types';
import { apiRequest } from './apiClient';

/**
 * Map backend car object to frontend car object (handling _id)
 */
const mapCar = (car: any): Car => ({
  ...car,
  id: car.id || car._id,
});

/**
 * Get personalized car recommendations from the AI
 */
export async function getRecommendations(): Promise<(Recommendation & { car: Car })[]> {
  const response = await apiRequest<any[]>('/ai/recommendations');

  if (response.success && response.data) {
    // Map the backend Car array to the structure the Home page expects
    return response.data.map((car, index) => ({
      id: `rec-${index}`,
      carId: car._id,
      reason: "Based on our AI's analysis of your preferences and current fleet availability.",
      tags: [car.category, car.fuelType, car.transmission],
      score: car.rating ? car.rating / 5 : 0.9, // Use real rating if available
      car: mapCar(car)
    }));
  }

  return [];
}

/**
 * Get AI chat response from Gemini Backend
 */
export async function getAIChatResponse(message: string): Promise<string> {
  const response = await apiRequest<{ response: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  if (response.success && response.data?.response) {
    return response.data.response;
  }

  return response.error || "I'm sorry, I'm having trouble connecting to my brain right now. Please try again.";
}

/**
 * Generate initial AI greeting
 */
export function getInitialMessage(): AIMessage {
  return {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your DriveEase assistant. How can I help you find the perfect car today?",
    timestamp: new Date().toISOString(),
  };
}
