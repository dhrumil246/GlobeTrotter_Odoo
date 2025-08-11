// Utility functions for GlobeTrotter application

import { Trip, Budget, Activity, ValidationRule, FormField } from '../types';

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
};

export const calculateDuration = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// Currency utilities
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const convertCurrency = async (
  amount: number,
  _fromCurrency: string,
  _toCurrency: string
): Promise<number> => {
  // In a real app, this would call a currency exchange API
  // For now, return the same amount as a placeholder
  return amount;
};

// Budget utilities
export const calculateTripBudget = (trip: Trip): Budget => {
  let accommodation = 0;
  let transportation = 0;
  let activities = 0;
  let food = 0;
  let shopping = 0;
  const miscellaneous = 0;

  trip.destinations.forEach(destination => {
    // Calculate accommodation costs
    if (destination.accommodation) {
      accommodation += destination.accommodation.cost.total;
    }

    // Calculate activity costs
    destination.activities.forEach(activity => {
      const avgCost = (activity.cost.min + activity.cost.max) / 2;
      
      switch (activity.type) {
        case 'transportation':
          transportation += avgCost;
          break;
        case 'food':
          food += avgCost;
          break;
        case 'shopping':
          shopping += avgCost;
          break;
        default:
          activities += avgCost;
      }
    });
  });

  const total = accommodation + transportation + activities + food + shopping + miscellaneous;
  const duration = calculateDuration(trip.startDate, trip.endDate);
  const dailyAverage = duration > 0 ? total / duration : 0;

  return {
    total,
    currency: 'USD', // Default currency
    breakdown: {
      accommodation,
      transportation,
      activities,
      food,
      shopping,
      miscellaneous
    },
    dailyAverage
  };
};

export const getBudgetStatus = (budget: Budget, maxBudget?: number): 'under' | 'on-track' | 'over' => {
  if (!maxBudget) return 'on-track';
  
  const percentage = (budget.total / maxBudget) * 100;
  
  if (percentage < 90) return 'under';
  if (percentage <= 110) return 'on-track';
  return 'over';
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Form validation utilities
export const validateField = (value: unknown, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && typeof value === 'string' && !emailRegex.test(value)) {
          return rule.message;
        }
        break;
      
      case 'minLength':
        if (value && typeof value === 'string' && typeof rule.value === 'number' && value.length < rule.value) {
          return rule.message;
        }
        break;
      
      case 'maxLength':
        if (value && typeof value === 'string' && typeof rule.value === 'number' && value.length > rule.value) {
          return rule.message;
        }
        break;
      
      case 'pattern':
        if (typeof rule.value === 'string') {
          const regex = new RegExp(rule.value);
          if (value && typeof value === 'string' && !regex.test(value)) {
            return rule.message;
          }
        }
        break;
    }
  }
  
  return null;
};

export const validateForm = (formData: Record<string, unknown>, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    if (field.validation) {
      const error = validateField(formData[field.name], field.validation);
      if (error) {
        errors[field.name] = error;
      }
    }
  });
  
  return errors;
};

// URL and routing utilities
export const generatePublicTripUrl = (tripId: string): string => {
  return `/trips/shared/${tripId}`;
};

export const generateShareableUrl = (tripId: string, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/trips/shared/${tripId}`;
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue || null);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};

// Debounce utility for search
export const debounce = (
  func: (...args: unknown[]) => unknown,
  delay: number
): ((...args: unknown[]) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Class name utility (similar to clsx)
export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Image utilities
export const getImageUrl = (path: string, defaultImage?: string): string => {
  if (!path) return defaultImage || '/images/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `/images/${path}`;
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Activity utilities
export const getActivityIcon = (type: Activity['type']): string => {
  const icons = {
    sightseeing: '🏛️',
    adventure: '🏔️',
    cultural: '🎭',
    food: '🍽️',
    nightlife: '🌃',
    shopping: '🛍️',
    nature: '🌿',
    relaxation: '🧘',
    transportation: '🚗'
  };
  
  return icons[type] || '📍';
};

export const getActivityColor = (type: Activity['type']): string => {
  const colors = {
    sightseeing: 'text-blue-600',
    adventure: 'text-green-600',
    cultural: 'text-purple-600',
    food: 'text-orange-600',
    nightlife: 'text-indigo-600',
    shopping: 'text-pink-600',
    nature: 'text-emerald-600',
    relaxation: 'text-teal-600',
    transportation: 'text-gray-600'
  };
  
  return colors[type] || 'text-gray-600';
};