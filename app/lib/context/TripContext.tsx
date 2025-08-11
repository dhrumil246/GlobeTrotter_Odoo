'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Trip, Destination, Activity, TripContextType } from '../types';
import { storage, calculateTripBudget } from '../utils';
import { useAuth } from './AuthContext';

// Trip reducer actions
type TripAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: { id: string; data: Partial<Trip> } }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'ADD_DESTINATION'; payload: { tripId: string; destination: Destination } }
  | { type: 'UPDATE_DESTINATION'; payload: { id: string; data: Partial<Destination> } }
  | { type: 'REMOVE_DESTINATION'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: { destinationId: string; activity: Activity } }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; data: Partial<Activity> } }
  | { type: 'REMOVE_ACTIVITY'; payload: string };

// Trip reducer state
interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,
};

// Trip reducer
const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, isLoading: false, error: null };
    
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload, isLoading: false, error: null };
    
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload], isLoading: false, error: null };
    
    case 'UPDATE_TRIP':
      const updatedTrips = state.trips.map(trip =>
        trip.id === action.payload.id
          ? { ...trip, ...action.payload.data, updatedAt: new Date() }
          : trip
      );
      const updatedCurrentTrip = state.currentTrip?.id === action.payload.id
        ? { ...state.currentTrip, ...action.payload.data, updatedAt: new Date() }
        : state.currentTrip;
      
      return {
        ...state,
        trips: updatedTrips,
        currentTrip: updatedCurrentTrip,
        isLoading: false,
        error: null
      };
    
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip,
        isLoading: false,
        error: null
      };
    
    case 'ADD_DESTINATION':
      const tripWithNewDestination = state.trips.map(trip => {
        if (trip.id === action.payload.tripId) {
          const updatedTrip = {
            ...trip,
            destinations: [...trip.destinations, action.payload.destination],
            updatedAt: new Date()
          };
          updatedTrip.budget = calculateTripBudget(updatedTrip);
          return updatedTrip;
        }
        return trip;
      });
      
      const currentTripWithNewDestination = state.currentTrip?.id === action.payload.tripId
        ? (() => {
            const updated = {
              ...state.currentTrip,
              destinations: [...state.currentTrip.destinations, action.payload.destination],
              updatedAt: new Date()
            };
            updated.budget = calculateTripBudget(updated);
            return updated;
          })()
        : state.currentTrip;
      
      return {
        ...state,
        trips: tripWithNewDestination,
        currentTrip: currentTripWithNewDestination,
        isLoading: false,
        error: null
      };
    
    // Add other cases for destinations and activities...
    default:
      return state;
  }
};

// Create context
const TripContext = createContext<TripContextType | null>(null);

// Trip provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const { user } = useAuth();

  // Load user trips on mount
  useEffect(() => {
    const loadTrips = async () => {
      if (user) {
        await loadUserTrips();
      } else {
        dispatch({ type: 'SET_TRIPS', payload: [] });
      }
    };
    
    loadTrips();
  }, [user]); // Remove loadUserTrips from dependencies to avoid infinite loop

  const loadUserTrips = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load trips from localStorage (in a real app, fetch from API)
      const storedTrips = storage.get<Trip[]>(`trips_${user?.id}`, []) || [];
      dispatch({ type: 'SET_TRIPS', payload: storedTrips });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load trips';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const saveTripsToStorage = (trips: Trip[]): void => {
    if (user) {
      storage.set(`trips_${user.id}`, trips);
    }
  };

  // Create trip function
  const createTrip = async (tripData: Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      if (!user) throw new Error('User must be logged in');
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newTrip: Trip = {
        ...tripData,
        id: Date.now().toString(),
        userId: user.id,
        destinations: [],
        budget: {
          total: 0,
          currency: 'USD',
          breakdown: {
            accommodation: 0,
            transportation: 0,
            activities: 0,
            food: 0,
            shopping: 0,
            miscellaneous: 0
          },
          dailyAverage: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dispatch({ type: 'ADD_TRIP', payload: newTrip });
      saveTripsToStorage([...state.trips, newTrip]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create trip';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Update trip function
  const updateTrip = async (id: string, tripData: Partial<Trip>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'UPDATE_TRIP', payload: { id, data: tripData } });
      
      const updatedTrips = state.trips.map(trip =>
        trip.id === id ? { ...trip, ...tripData, updatedAt: new Date() } : trip
      );
      saveTripsToStorage(updatedTrips);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update trip';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Delete trip function
  const deleteTrip = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'DELETE_TRIP', payload: id });
      
      const filteredTrips = state.trips.filter(trip => trip.id !== id);
      saveTripsToStorage(filteredTrips);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete trip';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Get trip function
  const getTrip = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const trip = state.trips.find(t => t.id === id) || null;
      dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get trip';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Add destination function
  const addDestination = async (tripId: string, destinationData: Omit<Destination, 'id' | 'tripId'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newDestination: Destination = {
        ...destinationData,
        id: Date.now().toString(),
        tripId,
        activities: []
      };
      
      dispatch({ type: 'ADD_DESTINATION', payload: { tripId, destination: newDestination } });
      
      const updatedTrips = state.trips.map(trip => {
        if (trip.id === tripId) {
          const updatedTrip = {
            ...trip,
            destinations: [...trip.destinations, newDestination],
            updatedAt: new Date()
          };
          updatedTrip.budget = calculateTripBudget(updatedTrip);
          return updatedTrip;
        }
        return trip;
      });
      
      saveTripsToStorage(updatedTrips);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add destination';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Placeholder functions for other operations
  const updateDestination = async (destinationId: string, data: Partial<Destination>): Promise<void> => {
    // Implementation would be similar to updateTrip
    console.log('updateDestination', destinationId, data);
  };

  const removeDestination = async (destinationId: string): Promise<void> => {
    // Implementation would be similar to deleteTrip
    console.log('removeDestination', destinationId);
  };

  const addActivity = async (destinationId: string, activity: Omit<Activity, 'id' | 'destinationId'>): Promise<void> => {
    // Implementation would be similar to addDestination
    console.log('addActivity', destinationId, activity);
  };

  const updateActivity = async (activityId: string, data: Partial<Activity>): Promise<void> => {
    // Implementation would be similar to updateTrip
    console.log('updateActivity', activityId, data);
  };

  const removeActivity = async (activityId: string): Promise<void> => {
    // Implementation would be similar to deleteTrip
    console.log('removeActivity', activityId);
  };

  const value: TripContextType = {
    trips: state.trips,
    currentTrip: state.currentTrip,
    isLoading: state.isLoading,
    error: state.error,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    addDestination,
    updateDestination,
    removeDestination,
    addActivity,
    updateActivity,
    removeActivity,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

// Hook to use trip context
export const useTrips = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};