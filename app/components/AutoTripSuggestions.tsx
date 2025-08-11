"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface TripSuggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  activities: string[];
  estimatedCost: number;
  bestTime: string;
  highlights: string[];
  imageUrl?: string;
  location: {
    name: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface SearchResult {
  place: string;
  suggestions: TripSuggestion[];
}

const GEMINI_API_KEY = 'AIzaSyAEkgQZCQwIXYSusag71jUluxEGGYPZu_4';
// Multiple API endpoints to try with different models
const GEMINI_API_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
];

const callGeminiAPI = async (prompt: string): Promise<string> => {
  let lastError = null;
  
  // Try each endpoint until one works
  for (const endpoint of GEMINI_API_ENDPOINTS) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Endpoint ${endpoint} failed: ${response.status} - ${errorText}`);
        lastError = new Error(`API call failed: ${response.status} - ${errorText}`);
        continue; // Try next endpoint
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid API response format');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(`Error with endpoint ${endpoint}:`, error);
      lastError = error;
      continue; // Try next endpoint
    }
  }
  
  // If all endpoints failed, throw the last error
  throw lastError || new Error('All API endpoints failed');
};

export default function AutoTripSuggestions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingDestinations, setTrendingDestinations] = useState<string[]>([]);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadTrendingDestinations();
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const loadTrendingDestinations = async () => {
    try {
      const { data: itineraries } = await supabase
        .from('itinerary')
        .select('title, description')
        .limit(100);

      if (itineraries) {
        const locationMentions = new Map<string, number>();
        
        itineraries.forEach(itinerary => {
          const text = `${itinerary.title} ${itinerary.description}`.toLowerCase();
          
          const cities = ['paris', 'tokyo', 'new york', 'london', 'bali', 'santorini', 'machu picchu', 'taj mahal', 'sydney', 'dubai', 'singapore', 'bangkok', 'amsterdam', 'rome', 'barcelona', 'prague', 'vienna', 'budapest', 'cairo', 'marrakech', 'cape town', 'rio de janeiro', 'buenos aires', 'mexico city', 'toronto', 'vancouver'];
          
          cities.forEach(city => {
            if (text.includes(city)) {
              locationMentions.set(city, (locationMentions.get(city) || 0) + 1);
            }
          });
        });

        const trending = Array.from(locationMentions.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([city]) => city.charAt(0).toUpperCase() + city.slice(1));

        setTrendingDestinations(trending);
      }
    } catch (error) {
      console.error('Error loading trending destinations:', error);
      setTrendingDestinations(['Paris', 'Tokyo', 'New York', 'Bali', 'Santorini']);
    }
  };

  const generateAITripSuggestions = async (destination: string): Promise<TripSuggestion[]> => {
    try {
      const prompt = `Generate 5 unique trip suggestions for ${destination}. For each suggestion, provide:

1. A creative title
2. A compelling description (2-3 sentences)
3. Recommended duration in days (3-10 days)
4. 4 specific activities to do there
5. Estimated total cost in USD (realistic range)
6. Best time to visit (consider weather and seasons)
7. 4 unique highlights or must-see attractions

Format the response as a JSON array with this structure:
[
  {
    "title": "Creative Trip Title",
    "description": "Compelling description",
    "duration": 5,
    "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4"],
    "estimatedCost": 1200,
    "bestTime": "March to May or September to November",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
  }
]

Make the suggestions diverse (cultural, adventure, luxury, budget, family-friendly, etc.) and specific to ${destination}. Be creative and provide unique insights that travelers would find valuable.`;

      const aiResponse = await callGeminiAPI(prompt);
      
      // Parse the AI response
      let suggestions;
      try {
        // Extract JSON from the response (sometimes AI adds extra text)
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', aiResponse);
        // Fallback to generated suggestions
        return generateFallbackSuggestions(destination);
      }

      // Transform AI suggestions to our format
      return suggestions.map((suggestion: any, index: number) => ({
        id: `${destination}-${index}`,
        title: suggestion.title,
        description: suggestion.description,
        duration: suggestion.duration,
        activities: suggestion.activities,
        estimatedCost: suggestion.estimatedCost,
        bestTime: suggestion.bestTime,
        highlights: suggestion.highlights,
        imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)}`,
        location: {
          name: destination.split(',')[0].trim(),
          country: destination.split(',').slice(1).join(',').trim() || 'Unknown'
        }
      }));

    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback to generated suggestions
      return generateFallbackSuggestions(destination);
    }
  };

  const generateFallbackSuggestions = (destination: string): TripSuggestion[] => {
    // Enhanced fallback suggestions that are more location-aware
    const destinationLower = destination.toLowerCase();
    
    // Analyze destination characteristics
    let isBeach = false, isMountain = false, isCity = false, isDesert = false, isTropical = false, isEuropean = false, isAsian = false;
    
    if (destinationLower.includes('beach') || destinationLower.includes('maldives') || destinationLower.includes('bali') || destinationLower.includes('hawaii') || destinationLower.includes('caribbean')) {
      isBeach = true; isTropical = true;
    }
    if (destinationLower.includes('mountain') || destinationLower.includes('alps') || destinationLower.includes('himalayas') || destinationLower.includes('rocky') || destinationLower.includes('andes')) {
      isMountain = true;
    }
    if (destinationLower.includes('new york') || destinationLower.includes('tokyo') || destinationLower.includes('london') || destinationLower.includes('paris') || destinationLower.includes('singapore')) {
      isCity = true;
    }
    if (destinationLower.includes('dubai') || destinationLower.includes('morocco') || destinationLower.includes('egypt') || destinationLower.includes('arizona')) {
      isDesert = true;
    }
    if (destinationLower.includes('paris') || destinationLower.includes('rome') || destinationLower.includes('barcelona') || destinationLower.includes('prague') || destinationLower.includes('vienna')) {
      isEuropean = true;
    }
    if (destinationLower.includes('tokyo') || destinationLower.includes('bali') || destinationLower.includes('bangkok') || destinationLower.includes('singapore') || destinationLower.includes('kyoto')) {
      isAsian = true;
    }

    const tripTypes = [];

    if (isBeach) {
      tripTypes.push({
        type: "Beach Paradise",
        description: `Experience ${destination}'s pristine beaches, crystal-clear waters, and tropical paradise atmosphere.`,
        duration: 5,
        activities: ["Beach relaxation", "Snorkeling in coral reefs", "Sunset beach walks", "Water sports"],
        costMultiplier: 1.3
      });
    }

    if (isMountain) {
      tripTypes.push({
        type: "Mountain Adventure",
        description: `Explore ${destination}'s breathtaking peaks, alpine trails, and mountain culture.`,
        duration: 6,
        activities: ["Mountain hiking", "Alpine photography", "Mountain biking", "Local mountain cuisine"],
        costMultiplier: 1.4
      });
    }

    if (isCity) {
      tripTypes.push({
        type: "Urban Explorer",
        description: `Discover ${destination}'s vibrant city life, modern attractions, and urban culture.`,
        duration: 4,
        activities: ["City tours", "Modern architecture", "Urban nightlife", "Local city markets"],
        costMultiplier: 1.6
      });
    }

    if (isDesert) {
      tripTypes.push({
        type: "Desert Experience",
        description: `Immerse yourself in ${destination}'s unique desert landscape and nomadic culture.`,
        duration: 5,
        activities: ["Desert safaris", "Camel rides", "Desert camping", "Local desert cuisine"],
        costMultiplier: 1.2
      });
    }

    if (isEuropean) {
      tripTypes.push({
        type: "European Heritage",
        description: `Explore ${destination}'s rich European history, classical architecture, and cultural heritage.`,
        duration: 5,
        activities: ["Historical tours", "Classical architecture", "Local European cuisine", "Cultural museums"],
        costMultiplier: 1.5
      });
    }

    if (isAsian) {
      tripTypes.push({
        type: "Asian Culture",
        description: `Experience ${destination}'s unique Asian traditions, temples, and cultural heritage.`,
        duration: 6,
        activities: ["Temple visits", "Local Asian cuisine", "Cultural ceremonies", "Traditional markets"],
        costMultiplier: 1.1
      });
    }

    // Always include these universal types with location-specific modifications
    tripTypes.push(
      {
        type: "Budget Backpacker",
        description: `Explore ${destination} affordably with local experiences and budget accommodations.`,
        duration: 7,
        activities: ["Local hostels", "Street food exploration", "Free attractions", "Local transport"],
        costMultiplier: 0.6
      },
      {
        type: "Luxury Experience",
        description: `Experience ${destination} in ultimate luxury with exclusive accommodations and premium services.`,
        duration: 6,
        activities: ["5-star hotels", "Private guided tours", "Fine dining experiences", "Exclusive local experiences"],
        costMultiplier: 2.5
      }
    );

    return tripTypes.map((tripType, index) => {
      const baseCost = Math.floor(Math.random() * 500) + 200;
      const estimatedCost = Math.floor(baseCost * tripType.costMultiplier);
      
      return {
        id: `${destination}-${index}`,
        title: tripType.type,
        description: tripType.description,
        duration: tripType.duration,
        activities: tripType.activities,
        estimatedCost,
        bestTime: getBestTimeForDestination(destination, tripType.type),
        highlights: generateLocationSpecificHighlights(destination, tripType.type),
        imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(destination)}`,
        location: {
          name: destination.split(',')[0].trim(),
          country: destination.split(',').slice(1).join(',').trim() || 'Unknown'
        }
      };
    });
  };

  const getBestTimeForDestination = (destination: string, tripType: string): string => {
    const dest = destination.toLowerCase();
    
    if (dest.includes('bali') || dest.includes('thailand') || dest.includes('maldives')) {
      return "Dry season (May-October)";
    } else if (dest.includes('alps') || dest.includes('switzerland') || dest.includes('canada')) {
      return "Summer months (June-August)";
    } else if (dest.includes('paris') || dest.includes('rome') || dest.includes('barcelona')) {
      return "Spring (April-June) or Fall (September-October)";
    } else if (dest.includes('tokyo') || dest.includes('japan')) {
      return "Cherry blossom season (March-April) or Fall (October-November)";
    } else if (dest.includes('dubai') || dest.includes('morocco')) {
      return "Winter months (November-March) - cooler temperatures";
    } else {
      return "Spring (March-May) or Fall (September-November)";
    }
  };

  const generateLocationSpecificHighlights = (destination: string, tripType: string): string[] => {
    const dest = destination.toLowerCase();
    const highlights = [];
    
    if (dest.includes('paris')) {
      highlights.push("Eiffel Tower and iconic landmarks", "Louvre Museum and art culture", "Charming Parisian cafes", "Seine River and romantic atmosphere");
    } else if (dest.includes('tokyo')) {
      highlights.push("Shibuya crossing and modern culture", "Traditional temples and shrines", "Tsukiji fish market", "Cherry blossom parks");
    } else if (dest.includes('bali')) {
      highlights.push("Sacred monkey forest", "Terraced rice paddies", "Traditional Balinese temples", "Beautiful beaches and sunsets");
    } else if (dest.includes('new york')) {
      highlights.push("Times Square and Broadway", "Central Park and urban nature", "Empire State Building", "Diverse cultural neighborhoods");
    } else if (dest.includes('london')) {
      highlights.push("Big Ben and Westminster", "British Museum and history", "Royal palaces and gardens", "Traditional pubs and culture");
    } else {
      highlights.push(
        `Explore the unique features of ${destination}`,
        "Immerse yourself in local culture and traditions",
        "Discover hidden gems and local secrets",
        "Experience authentic local lifestyle"
      );
    }
    
    return highlights;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Use AI to generate suggestions
      const suggestions = await generateAITripSuggestions(searchQuery);
      
      setSearchResults([{
        place: searchQuery,
        suggestions
      }]);

      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));

    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuggestion = async (destination: string) => {
    setSearchQuery(destination);
    setLoading(true);
    try {
      const suggestions = await generateAITripSuggestions(destination);
      setSearchResults([{
        place: destination,
        suggestions
      }]);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createItineraryFromSuggestion = async (suggestion: TripSuggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to create an itinerary');
        return;
      }

      // Calculate dates based on duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + suggestion.duration);

      const { data, error } = await supabase
        .from('itinerary')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating itinerary:', error);
        alert('Failed to create itinerary');
        return;
      }

      // Create activities for each day
      const activitiesPerDay = Math.ceil(suggestion.activities.length / suggestion.duration);
      for (let day = 0; day < suggestion.duration; day++) {
        const dayActivities = suggestion.activities.slice(day * activitiesPerDay, (day + 1) * activitiesPerDay);
        
        for (const activity of dayActivities) {
          await supabase
            .from('activities')
            .insert({
              activity_name: activity,
              cost: Math.floor(suggestion.estimatedCost / suggestion.duration / dayActivities.length),
              date: new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              itinerary_id: data.id
            });
        }
      }

      alert('Itinerary created successfully!');
      
      // Redirect to the new itinerary
      window.location.href = `/itinerary/${data.id}`;
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create itinerary');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-red-500 mb-6">
            🤖 AI-Powered Trip Discovery
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Powered by Google Gemini AI - Get intelligent, personalized trip recommendations for any destination
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any destination, activity, or travel style..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? ' AI Analyzing...' : 'Discover with AI'}
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4"> Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(search)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Destinations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">🔥 Trending Destinations</h3>
            <div className="flex flex-wrap gap-2">
              {trendingDestinations.map((destination) => (
                <button
                  key={destination}
                  onClick={() => handleQuickSuggestion(destination)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-full transition-colors text-sm border border-red-500/30"
                >
                  {destination}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-8">
            {searchResults.map((result, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-red-400">
                    🤖 AI-Generated Trip Suggestions for {result.place}
                  </h2>
                  <div className="ml-4 px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-500/30">
                    Powered by Gemini AI
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                      {suggestion.imageUrl && (
                        <img 
                          src={suggestion.imageUrl} 
                          alt={suggestion.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{suggestion.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{suggestion.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">{suggestion.duration} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Estimated Cost:</span>
                          <span className="text-white">${suggestion.estimatedCost}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Best Time:</span>
                          <span className="text-white">{suggestion.bestTime}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-red-400 mb-2">Activities:</h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.activities.map((activity, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-600/20 text-red-300 text-xs rounded">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-red-400 mb-2">Highlights:</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {suggestion.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-400 mr-2">•</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => createItineraryFromSuggestion(suggestion)}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Create This Trip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center"> How Our AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Location Analysis</h3>
              <p className="text-gray-300 text-sm">AI analyzes destination geography, culture, climate, and unique features</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Contextual Suggestions</h3>
              <p className="text-gray-300 text-sm">Creates location-specific activities, costs, and highlights unique to each place</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Real-time Intelligence</h3>
              <p className="text-gray-300 text-sm">Every search generates fresh, unique content tailored to the specific destination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
