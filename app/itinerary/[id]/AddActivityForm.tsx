"use client";
import { useState, useEffect } from "react";

type Activity = {
  id: string;
  activity_name: string;
  cost: number;
  date: string;
  itinerary_id: string;
};

type AddActivityFormProps = {
    itineraryId: string;
    date: string;
    onActivityAdded?: (activity?: Activity) => void;
    onCancel?: () => void;
  };

  export default function AddActivityForm({
    itineraryId,
    date,
    onActivityAdded,
    onCancel,
  }: AddActivityFormProps) {
    const [activityName, setActivityName] = useState("");
    const [cost, setCost] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  
    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
      if (success) {
        const timer = setTimeout(() => {
          setSuccess("");
        }, 3000); // 3 seconds
        return () => clearTimeout(timer);
      }
    }, [success]);
  
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      setError("");
      setSuccess("");
      
      const res = await fetch("/api/add-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary_id: itineraryId,
          date,
          activity_name: activityName,
          cost: Number(cost),
        }),
      });
      
      setLoading(false);
      
      if (res.ok) {
        const result = await res.json();
        console.log("✅ API Response:", result);
        
        setActivityName("");
        setCost("");
        setSuccess("Activity added successfully!");
        setError("");
        
        // Trigger real-time update by calling the callback with new activity data
        if (onActivityAdded && result.activity) {
          console.log("🔄 Calling onActivityAdded with:", result.activity);
          onActivityAdded(result.activity);
        } else if (onActivityAdded) {
          console.log("🔄 Calling onActivityAdded without data");
          // Fallback: just refresh the data
          onActivityAdded();
        } else {
          console.log("❌ No onActivityAdded callback provided");
        }
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Failed to add activity.");
        setSuccess("");
      }
    }
  
    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Activity Name
              </label>
              <input
                  type="text"
                  placeholder="e.g., Visit Temple, Lunch, Shopping"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cost (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={cost}
                onChange={e => setCost(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
/>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Add Activity</span>
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => onCancel && onCancel()}
              className="text-gray-400 hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
          
          {error && (
            <div className="text-red-300 bg-red-900/50 border border-red-500/50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </form>
        
        {/* Success Notification */}
        {success && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in">
            <span className="text-xl">✅</span>
            <span>{success}</span>
            <button 
              onClick={() => setSuccess("")}
              className="ml-4 text-white hover:text-gray-200 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </>
    );
  }