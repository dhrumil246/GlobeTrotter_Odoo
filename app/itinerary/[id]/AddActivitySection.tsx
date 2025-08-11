"use client";
import { useState, useEffect } from "react";
import AddActivityForm from "./AddActivityForm";
import dayjs from "dayjs";

type Activity = {
  id: string;
  activity_name: string;
  cost: number;
  date: string;
  itinerary_id: string;
};

type Itinerary = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

type AddActivitySectionProps = {
  itinerary: Itinerary;
  days: string[];
  activitiesByDay: Record<string, Activity[]>;
  onTotalCostChange?: (totalCost: number) => void; // New prop to pass cost back to parent
};

export default function AddActivitySection({
  itinerary,
  days,
  activitiesByDay,
  onTotalCostChange,
}: AddActivitySectionProps) {
  const [showFormForDay, setShowFormForDay] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(days[0] || "");
  // Local state for real-time updates
  const [localActivitiesByDay, setLocalActivitiesByDay] = useState<Record<string, Activity[]>>(activitiesByDay);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [lastAddedActivityId, setLastAddedActivityId] = useState<string | null>(null);
  const [isCostUpdating, setIsCostUpdating] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);

  // Calculate total trip cost from all activities - THIS UPDATES IN REAL-TIME
  const totalTripCost = Object.values(localActivitiesByDay)
    .flat()
    .reduce((sum, activity) => sum + Number(activity.cost), 0);

  // Pass total cost to parent component whenever it changes
  useEffect(() => {
    if (onTotalCostChange) {
      onTotalCostChange(totalTripCost);
    }
  }, [totalTripCost, onTotalCostChange]);

  // Handle activity added for real-time update
  const handleActivityAdded = (newActivity?: Activity) => {
    if (newActivity) {
      console.log(" AddActivitySection received new activity:", newActivity);
      
      // Show cost updating animation
      setIsCostUpdating(true);
      
      // Add the new activity to local state for immediate UI update
      setLocalActivitiesByDay(prev => {
        const updatedState = {
          ...prev,
          [newActivity.date]: [...(prev[newActivity.date] || []), newActivity]
        };
        console.log("🔄 Updated local activities state:", updatedState);
        return updatedState;
      });
      
      // Mark this as the last added activity for highlighting
      setLastAddedActivityId(newActivity.id);
      
      // Remove the highlight after 3 seconds
      setTimeout(() => {
        setLastAddedActivityId(null);
      }, 3000);
      
      // Hide cost updating animation after a brief moment
      setTimeout(() => {
        setIsCostUpdating(false);
      }, 500);
      
      // Show a brief success indicator
      setIsAddingActivity(false);
    }
    // Close the form after successful addition
    setShowFormForDay(null);
  };

  // Handle activity deletion
  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    setDeletingActivityId(activityId);
    
    try {
      const response = await fetch('/api/delete-activity', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activity_id: activityId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete activity');
      }

      // Remove activity from local state
      setLocalActivitiesByDay(prev => {
        const updatedState = { ...prev };
        Object.keys(updatedState).forEach(day => {
          updatedState[day] = updatedState[day].filter(activity => activity.id !== activityId);
        });
        return updatedState;
      });

      // Show cost updating animation
      setIsCostUpdating(true);
      setTimeout(() => {
        setIsCostUpdating(false);
      }, 500);

    } catch (error) {
      console.error('Error deleting activity:', error);
      alert(`Failed to delete activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingActivityId(null);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsAddingActivity(false);
    setShowFormForDay(null);
  };

  // Handle showing form
  const handleShowForm = (day: string) => {
    setShowFormForDay(day);
    setIsAddingActivity(false);
  };

  // Get activities for selected day from local state
  const dayActivities = localActivitiesByDay[selectedDay] || [];
  const totalDayCost = dayActivities.reduce((sum, activity) => sum + Number(activity.cost), 0);

  return (
    <div className="space-y-6">
      {/* Selected Day Content */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg overflow-hidden">
        {/* Day Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {dayjs(selectedDay).format("dddd, MMMM DD")}
              </h2>
              <p className="text-red-200 text-sm">
                {dayjs(selectedDay).format("YYYY-MM-DD")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Total Spent</div>
              <div className="text-white font-bold text-lg">₹{totalDayCost.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="p-6 border-b border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Select Day</h3>
            <div className="text-right">
              <div className="text-sm text-gray-400">Day Cost</div>
              <div className="text-lg font-bold text-red-400">₹{totalDayCost.toLocaleString()}</div>
            </div>
          </div>
          
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white bg-gray-800"
          >
            {days.map((day: string) => (
              <option key={day} value={day}>
                {dayjs(day).format("dddd, MMMM DD, YYYY")}
              </option>
            ))}
          </select>
        </div>

        {/* Activities List */}
        <div className="p-6">
          {dayActivities.length > 0 ? (
            <div className="space-y-3 mb-4">
              {dayActivities.map((activity: Activity) => {
                const isNewlyAdded = activity.id === lastAddedActivityId;
                const isDeleting = activity.id === deletingActivityId;
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                      isNewlyAdded 
                        ? 'bg-red-500/10 border-2 border-red-500/30 animate-slide-in shadow-md' 
                        : isDeleting
                        ? 'bg-gray-700/50 opacity-75'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isNewlyAdded ? 'bg-red-500 animate-pulse' : 'bg-red-400'
                      }`}></div>
                      <span className="font-medium text-white">{activity.activity_name}</span>
                      {isNewlyAdded && (
                        <span className="text-xs text-red-300 bg-red-500/30 px-2 py-1 rounded-full font-medium animate-bounce">
                          ✨ Just added!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${
                        isNewlyAdded ? 'text-red-300' : 'text-gray-300'
                      }`}>₹{Number(activity.cost).toLocaleString()}</span>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        disabled={isDeleting}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDeleting
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                        }`}
                        title="Delete activity"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-sm">🗑</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>No activities planned for this day</p>
            </div>
          )}

          {/* Add Activity Button */}
          <button
            onClick={() => handleShowForm(selectedDay)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>+</span>
            <span>Add Activity</span>
          </button>

          {/* Activity Form */}
          {showFormForDay === selectedDay && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <AddActivityForm
                itineraryId={itinerary.id}
                date={selectedDay}
                onActivityAdded={handleActivityAdded}
                onCancel={handleFormCancel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {days.map((day: string) => {
            const dayActivities = localActivitiesByDay[day] || [];
            const dayCost = dayActivities.reduce((sum, activity) => sum + Number(activity.cost), 0);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <div>{dayjs(day).format("MMM DD")}</div>
                {dayCost > 0 && (
                  <div className="text-xs opacity-75">₹{dayCost.toLocaleString()}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}