"use client";

import React, { useState } from "react";
import { createItinerary } from "./action";
import { useRouter } from "next/navigation";

type Itinerary = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  user_id: string;
};

type ItineraryFormProps = {
  onItineraryCreated?: (newItinerary: Itinerary) => void;
};

export default function ItineraryForm({ onItineraryCreated }: ItineraryFormProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setFeedback(null);
    
    const result = await createItinerary(formData);
    
    setLoading(false);
    
    if (result?.success === false) {
      setFeedback(result.message || "An error occurred while creating the itinerary.");
    } else {
      setFeedback("Itinerary created successfully!");
      
      // Use the actual created itinerary data from the server
      if (result?.itinerary && onItineraryCreated) {
        onItineraryCreated(result.itinerary);
      }
      
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trip Title
          </label>
          <input 
            type="text" 
            name="title" 
            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400" 
            placeholder="e.g., Japan Adventure, Europe Tour"
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <input 
            type="text" 
            name="description" 
            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400" 
            placeholder="Brief description of your trip"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          <input 
            type="date" 
            name="startDate" 
            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date
          </label>
          <input 
            type="date" 
            name="endDate" 
            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white" 
            required 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>✈️</span>
              <span>Create Itinerary</span>
            </>
          )}
        </button>
        
        {feedback && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            feedback.includes("successfully") 
              ? "bg-red-900/50 text-red-300 border border-red-600/50" 
              : "bg-red-900/80 text-red-200 border border-red-500"
          }`}>
            {feedback}
          </div>
        )}
      </div>
    </form>
  );
}