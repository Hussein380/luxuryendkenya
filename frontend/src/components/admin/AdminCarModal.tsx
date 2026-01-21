import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Car } from '@/types';
import { createCar, updateCar } from '@/services/carService';

interface AdminCarModalProps {
    isOpen: boolean;
    onClose: () => void;
    car?: Car | null;
    onSuccess: () => void;
}

export function AdminCarModal({ isOpen, onClose, car, onSuccess }: AdminCarModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        category: 'economy',
        pricePerDay: '',
        description: '',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        location: '',
        features: '',
        available: true,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (car) {
            setFormData({
                name: car.name,
                brand: car.brand,
                model: car.model,
                year: car.year,
                category: car.category,
                pricePerDay: car.pricePerDay.toString(),
                description: car.description,
                transmission: car.transmission,
                fuelType: car.fuelType,
                seats: car.seats,
                location: car.location,
                features: car.features.join(', '),
                available: car.available,
            });
            setPreviewUrl(car.imageUrl);
        } else {
            setFormData({
                name: '',
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                category: 'economy',
                pricePerDay: '',
                description: '',
                transmission: 'automatic',
                fuelType: 'petrol',
                seats: 5,
                location: '',
                features: '',
                available: true,
            });
            setPreviewUrl('');
            setSelectedFile(null);
        }
        setError(null);
    }, [car, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (!car) {
                throw new Error('Please select an image');
            }

            let result;
            if (car) {
                result = await updateCar(car.id, data);
            } else {
                result = await createCar(data);
            }

            if (result) {
                onSuccess();
                onClose();
            } else {
                setError('Failed to save car. Please check your inputs.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="font-display text-2xl font-bold">
                                {car ? 'Edit Car' : 'Add New Car'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Car Image</label>
                                    <div className="relative group aspect-video rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors overflow-hidden">
                                        {previewUrl ? (
                                            <>
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform">
                                                        Change Image
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                        />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors">
                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                                <span className="text-sm font-medium">Click to upload image</span>
                                                <span className="text-xs text-muted-foreground">JPG, PNG or WEBP (max 5MB)</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    required={!car}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Brand</label>
                                    <Input
                                        placeholder="e.g. Tesla"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Model</label>
                                    <Input
                                        placeholder="e.g. Model 3"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Year</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 2024"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="economy">Economy</option>
                                        <option value="compact">Compact</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="luxury">Luxury</option>
                                        <option value="sports">Sports</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price Per Day ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={formData.pricePerDay}
                                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Transmission</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.transmission}
                                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                                    >
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fuel Type</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.fuelType}
                                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                                    >
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        placeholder="e.g. London Airport"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Seats</label>
                                    <Input
                                        type="number"
                                        value={formData.seats}
                                        onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Features (comma-separated)</label>
                                    <Input
                                        placeholder="e.g. GPS, Leather Seats, Sunroof"
                                        value={formData.features}
                                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Detailed car description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="available"
                                        checked={formData.available}
                                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="available" className="text-sm font-medium cursor-pointer">
                                        Available for Rent
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="gradient-accent text-accent-foreground border-0 min-w-[120px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            {car ? 'Update Car' : 'Create Car'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
