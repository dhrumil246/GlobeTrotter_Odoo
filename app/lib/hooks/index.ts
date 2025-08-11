'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { City, Activity, SearchFilters } from '../types';

// Mock data for development
const mockCities: City[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    timezone: 'Europe/Paris',
    currency: 'EUR',
    description: 'The City of Light, known for its art, fashion, gastronomy, and culture.',
    imageUrl: '/images/cities/paris.jpg',
    averageCost: { budget: 80, midRange: 150, luxury: 300 },
    popularActivities: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral']
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    description: 'A vibrant metropolis blending traditional and modern culture.',
    imageUrl: '/images/cities/tokyo.jpg',
    averageCost: { budget: 100, midRange: 180, luxury: 350 },
    popularActivities: ['Shibuya Crossing', 'Senso-ji Temple', 'Tsukiji Fish Market']
  },
  {
    id: '3',
    name: 'New York',
    country: 'United States',
    region: 'North America',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    currency: 'USD',
    description: 'The Big Apple, a global hub of finance, arts, and culture.',
    imageUrl: '/images/cities/newyork.jpg',
    averageCost: { budget: 120, midRange: 200, luxury: 400 },
    popularActivities: ['Central Park', 'Statue of Liberty', 'Times Square']
  },
  {
    id: '4',
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: 'Europe/London',
    currency: 'GBP',
    description: 'A historic city with royal palaces, world-class museums, and vibrant culture.',
    imageUrl: '/images/cities/london.jpg',
    averageCost: { budget: 90, midRange: 170, luxury: 320 },
    popularActivities: ['Big Ben', 'London Eye', 'British Museum']
  },
  {
    id: '5',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    coordinates: { lat: -8.3405, lng: 115.0920 },
    timezone: 'Asia/Makassar',
    currency: 'IDR',
    description: 'A tropical paradise known for its beaches, temples, and rice terraces.',
    imageUrl: '/images/cities/bali.jpg',
    averageCost: { budget: 40, midRange: 80, luxury: 200 },
    popularActivities: ['Tanah Lot Temple', 'Ubud Rice Terraces', 'Mount Batur']
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Eiffel Tower Visit',
    type: 'sightseeing',
    description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.',
    duration: 180,
    cost: { min: 25, max: 50, currency: 'EUR' },
    location: {
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    images: ['/images/activities/eiffel-tower.jpg'],
    rating: 4.5,
    tags: ['landmark', 'views', 'photography'],
    bookingUrl: 'https://example.com/eiffel-tower'
  },
  {
    id: '2',
    name: 'Seine River Cruise',
    type: 'sightseeing',
    description: 'Enjoy a relaxing cruise along the Seine River with views of Paris landmarks.',
    duration: 90,
    cost: { min: 15, max: 35, currency: 'EUR' },
    location: {
      address: 'Port de la Bourdonnais, 75007 Paris, France',
      coordinates: { lat: 48.8606, lng: 2.2984 }
    },
    images: ['/images/activities/seine-cruise.jpg'],
    rating: 4.3,
    tags: ['cruise', 'relaxing', 'sightseeing'],
    bookingUrl: 'https://example.com/seine-cruise'
  },
  {
    id: '3',
    name: 'Cooking Class',
    type: 'cultural',
    description: 'Learn to cook traditional French cuisine with a professional chef.',
    duration: 240,
    cost: { min: 80, max: 120, currency: 'EUR' },
    images: ['/images/activities/cooking-class.jpg'],
    rating: 4.7,
    tags: ['cooking', 'cultural', 'hands-on'],
    bookingUrl: 'https://example.com/cooking-class'
  }
];

// Hook for searching cities
export const useCitySearch = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchCities = useCallback((query: string, filters: SearchFilters = {}) => {
    const doSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let filteredCities = mockCities;

        // Apply search query
        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          filteredCities = filteredCities.filter(city =>
            city.name.toLowerCase().includes(searchTerm) ||
            city.country.toLowerCase().includes(searchTerm) ||
            city.region.toLowerCase().includes(searchTerm)
          );
        }

        // Apply filters
        if (filters.country) {
          filteredCities = filteredCities.filter(city =>
            city.country.toLowerCase() === filters.country?.toLowerCase()
          );
        }

        if (filters.region) {
          filteredCities = filteredCities.filter(city =>
            city.region.toLowerCase() === filters.region?.toLowerCase()
          );
        }

        setCities(filteredCities);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search cities';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(doSearch, 300);
  }, []);

  return { cities, isLoading, error, searchCities };
};

// Hook for searching activities
export const useActivitySearch = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchActivities = useCallback((query: string, filters: SearchFilters = {}) => {
    const doSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let filteredActivities = mockActivities;

        // Apply search query
        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          filteredActivities = filteredActivities.filter(activity =>
            activity.name.toLowerCase().includes(searchTerm) ||
            activity.description.toLowerCase().includes(searchTerm) ||
            activity.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }

        // Apply activity type filters
        if (filters.activityTypes && filters.activityTypes.length > 0) {
          filteredActivities = filteredActivities.filter(activity =>
            filters.activityTypes!.includes(activity.type)
          );
        }

        // Apply cost range filter
        if (filters.costRange) {
          filteredActivities = filteredActivities.filter(activity => {
            const avgCost = (activity.cost.min + activity.cost.max) / 2;
            return avgCost >= filters.costRange!.min && avgCost <= filters.costRange!.max;
          });
        }

        // Apply duration filter
        if (filters.duration) {
          filteredActivities = filteredActivities.filter(activity =>
            activity.duration >= filters.duration!.min && activity.duration <= filters.duration!.max
          );
        }

        setActivities(filteredActivities);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search activities';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(doSearch, 300);
  }, []);

  return { activities, isLoading, error, searchActivities };
};

// Hook for form handling with validation
export const useForm = <T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema?: Record<keyof T, { required?: boolean; email?: boolean; minLength?: number }>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateField = useCallback((name: keyof T, value: unknown) => {
    if (!validationSchema || !validationSchema[name]) return null;

    // Add validation logic here based on your validation schema
    // This is a simplified example
    const rules = validationSchema[name];
    
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }
    
    if (rules.email && value && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    
    if (rules.minLength && value && typeof value === 'string' && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    return null;
  }, [validationSchema]);

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    const isValid = validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
  };
};

// Hook for local storage with type safety
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
};

// Hook for media queries
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Hook for detecting outside clicks
export const useOutsideClick = (callback: () => void) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref && !ref.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback, ref]);

  return [ref, setRef] as const;
};