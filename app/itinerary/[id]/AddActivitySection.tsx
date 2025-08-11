"use client";
import { useState } from "react";
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
};

export default function AddActivitySection({
  itinerary,
  days,
  activitiesByDay,
}: AddActivitySectionProps) {
  const [showFormForDay, setShowFormForDay] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(days[0] || "");
  // Local state for real-time updates
  const [localActivitiesByDay, setLocalActivitiesByDay] = useState<Record<string, Activity[]>>(activitiesByDay);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [lastAddedActivityId, setLastAddedActivityId] = useState<string | null>(null);

  // Handle activity added for real-time update
  const handleActivityAdded = (newActivity?: Activity) => {
    if (newActivity) {
      console.log("🎯 AddActivitySection received new activity:", newActivity);
      
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
      
      // Show a brief success indicator
      setIsAddingActivity(false);
    }
    // Close the form after successful addition
    setShowFormForDay(null);
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

  // Calculate total trip cost from all activities
  const totalTripCost = Object.values(localActivitiesByDay)
    .flat()
    .reduce((sum, activity) => sum + Number(activity.cost), 0);

  return (
    <div className="space-y-6">
      {/* Total Trip Cost Display */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Trip Overview</h2>
            <p className="text-gray-600">Total expenses across all days</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Trip Cost</div>
            <div className="text-3xl font-bold text-blue-600">₹{totalTripCost.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Day</h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">Day Cost</div>
            <div className="text-lg font-bold text-blue-600">₹{totalDayCost.toLocaleString()}</div>
          </div>
        </div>
        
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          {days.map((day: string) => (
            <option key={day} value={day}>
              {dayjs(day).format("dddd, MMMM DD, YYYY")}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Day Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Day Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {dayjs(selectedDay).format("dddd, MMMM DD")}
              </h2>
              <p className="text-blue-100 text-sm">
                {dayjs(selectedDay).format("YYYY-MM-DD")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Total Spent</div>
              <div className="text-white font-bold text-lg">₹{totalDayCost.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="p-6">
          {dayActivities.length > 0 ? (
            <div className="space-y-3 mb-4">
              {dayActivities.map((activity: Activity) => {
                const isNewlyAdded = activity.id === lastAddedActivityId;
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
                      isNewlyAdded 
                        ? 'bg-green-50 border-2 border-green-200 animate-slide-in shadow-md' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isNewlyAdded ? 'bg-green-600 animate-pulse' : 'bg-green-500'
                      }`}></div>
                      <span className="font-medium text-gray-800">{activity.activity_name}</span>
                      {isNewlyAdded && (
                        <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded-full font-medium animate-bounce">
                          ✨ Just added!
                        </span>
                      )}
                    </div>
                    <span className={`font-semibold ${
                      isNewlyAdded ? 'text-green-700' : 'text-gray-700'
                    }`}>₹{Number(activity.cost).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No activities planned for this day</p>
            </div>
          )}

          {/* Add Activity Button */}
          <button
            onClick={() => handleShowForm(selectedDay)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>+</span>
            <span>Add Activity</span>
          </button>

          {/* Activity Form */}
          {showFormForDay === selectedDay && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Navigation</h3>
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
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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