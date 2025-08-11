// Core entity types for GlobeTrotter application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    language: string;
    currency: string;
    timezone: string;
  };
  savedDestinations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  startDate: Date;
  endDate: Date;
  destinations: Destination[];
  budget: Budget;
  isPublic: boolean;
  publicUrl?: string;
  status: 'draft' | 'planned' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  id: string;
  tripId: string;
  cityId: string;
  city: City;
  arrivalDate: Date;
  departureDate: Date;
  activities: Activity[];
  accommodation?: Accommodation;
  order: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  currency: string;
  description?: string;
  imageUrl?: string;
  averageCost: {
    budget: number;
    midRange: number;
    luxury: number;
  };
  popularActivities: string[];
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  duration: number; // in minutes
  cost: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  rating?: number;
  tags: string[];
  bookingUrl?: string;
  destinationId?: string;
  scheduledTime?: Date;
}

export type ActivityType = 
  | 'sightseeing'
  | 'adventure'
  | 'cultural'
  | 'food'
  | 'nightlife'
  | 'shopping'
  | 'nature'
  | 'relaxation'
  | 'transportation';

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'guesthouse' | 'resort';
  address: string;
  checkIn: Date;
  checkOut: Date;
  cost: {
    total: number;
    currency: string;
  };
  rating?: number;
  amenities: string[];
  bookingUrl?: string;
}

export interface Budget {
  total: number;
  currency: string;
  breakdown: {
    accommodation: number;
    transportation: number;
    activities: number;
    food: number;
    shopping: number;
    miscellaneous: number;
  };
  dailyAverage: number;
}

export interface ItineraryDay {
  date: Date;
  destinationId: string;
  activities: Activity[];
  totalCost: number;
  notes?: string;
}

// UI and form types

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: string | number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  country?: string;
  region?: string;
  activityTypes?: ActivityType[];
  costRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
}

// Analytics types
export interface UserStats {
  totalTrips: number;
  completedTrips: number;
  totalDestinations: number;
  favoriteDestination?: string;
  totalSpent: number;
  averageTripDuration: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  topDestinations: Array<{
    city: string;
    count: number;
  }>;
  topActivities: Array<{
    activity: string;
    count: number;
  }>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  revenueMetrics?: {
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error?: string | null;
  createTrip: (tripData: Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrip: (id: string, tripData: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTrip: (id: string) => Promise<void>;
  addDestination: (tripId: string, destination: Omit<Destination, 'id' | 'tripId'>) => Promise<void>;
  updateDestination: (destinationId: string, data: Partial<Destination>) => Promise<void>;
  removeDestination: (destinationId: string) => Promise<void>;
  addActivity: (destinationId: string, activity: Omit<Activity, 'id' | 'destinationId'>) => Promise<void>;
  updateActivity: (activityId: string, data: Partial<Activity>) => Promise<void>;
  removeActivity: (activityId: string) => Promise<void>;
}