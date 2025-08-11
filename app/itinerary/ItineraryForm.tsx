"use client";

import React, { useState } from "react";
import { createItinerary } from "./action";
import { useRouter } from "next/navigation";

export default function ItineraryForm() {
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
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      
      // Refresh the page to show the new itinerary in the list
      setTimeout(() => {
        router.refresh();
      }, 1000);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Title
          </label>
          <input 
            type="text" 
            name="title" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500" 
            placeholder="e.g., Japan Adventure, Europe Tour"
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input 
            type="text" 
            name="description" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500" 
            placeholder="Brief description of your trip"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input 
            type="date" 
            name="startDate" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input 
            type="date" 
            name="endDate" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
            required 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
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
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {feedback}
          </div>
        )}
      </div>
    </form>
  );
}