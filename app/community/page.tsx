"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

interface CommunityPost {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  content: string;
  trip_destination: string;
  trip_dates: string;
  category: 'adventure' | 'cultural' | 'relaxation' | 'food' | 'budget' | 'luxury';
  rating: number;
  images: string[];
  created_at: string;
  likes: number;
  comments: number;
  itinerary_id?: string; // Link to existing itinerary
  itinerary_title?: string; // Title of the linked itinerary
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Enhanced query to include itinerary information
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          itinerary:itinerary_id(
            id,
            title,
            description,
            start_date,
            end_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Transform data to include itinerary info
      const transformedPosts = (data || []).map(post => ({
        ...post,
        itinerary_title: post.itinerary?.title || null
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.trip_destination.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "rating":
          return b.rating - a.rating;
        case "likes":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  const groupedPosts = () => {
    if (groupBy === "category") {
      const grouped: Record<string, CommunityPost[]> = {};
      filteredAndSortedPosts.forEach(post => {
        if (!grouped[post.category]) {
          grouped[post.category] = [];
        }
        grouped[post.category].push(post);
      });
      return grouped;
    } else if (groupBy === "destination") {
      const grouped: Record<string, CommunityPost[]> = {};
      filteredAndSortedPosts.forEach(post => {
        if (!grouped[post.trip_destination]) {
          grouped[post.trip_destination] = [];
        }
        grouped[post.trip_destination].push(post);
      });
      return grouped;
    }
    return { "All Posts": filteredAndSortedPosts };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'adventure': return 'bg-blue-500';
      case 'cultural': return 'bg-orange-500';
      case 'relaxation': return 'bg-green-500';
      case 'food': return 'bg-red-500';
      case 'budget': return 'bg-purple-500';
      case 'luxury': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'adventure': return '🏔️';
      case 'cultural': return '🏛️';
      case 'relaxation': return '🏖️';
      case 'food': return '🍽️';
      case 'budget': return '💰';
      case 'luxury': return '✨';
      default: return '✈️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-red-500 mb-6">
            🌍 Travel Community
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Share your travel experiences, discover amazing destinations, and connect with fellow travelers from around the world
          </p>
          {user && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center mx-auto space-x-2"
            >
              <span>✍️</span>
              <span>Share Your Experience</span>
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiences, destinations, or activities..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Group By */}
            <div>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              >
                <option value="none">Group by</option>
                <option value="category">Category</option>
                <option value="destination">Destination</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'adventure', 'cultural', 'relaxation', 'food', 'budget', 'luxury'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : 
                   `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Community Content */}
        <div className="space-y-8">
          {Object.entries(groupedPosts()).map(([groupName, groupPosts]) => (
            <div key={groupName}>
              {groupBy !== "none" && (
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">
                    {groupBy === "category" ? getCategoryIcon(groupName) : "📍"}
                  </span>
                  {groupName}
                  <span className="ml-3 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                    {groupPosts.length} {groupPosts.length === 1 ? 'post' : 'posts'}
                  </span>
                </h2>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupPosts.map((post) => (
                  <div key={post.id} className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Post Header */}
                    <div className="p-6 border-b border-red-500/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {post.user_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{post.user_email.split('@')[0]}</p>
                            <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(post.category)}`}>
                          {getCategoryIcon(post.category)} {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{post.content.substring(0, 120)}...</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>📍 {post.trip_destination}</span>
                        <span>📅 {post.trip_dates}</span>
                      </div>

                      {/* Show linked itinerary if exists */}
                      {post.itinerary_title && (
                        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-xs text-red-300">📋 Linked to: {post.itinerary_title}</p>
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                            <span>❤️</span>
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                            <span>💬</span>
                            <span>{post.comments}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < post.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Link
                        href={`/community/post/${post.id}`}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center block"
                      >
                        Read Full Story
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedPosts.length === 0 && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-semibold text-white mb-4">No experiences found</h3>
            <p className="text-gray-300 mb-6">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filters to find more experiences."
                : "Be the first to share your travel experience and inspire others!"}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Share Your First Experience
              </button>
            )}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateForm && (
          <CreatePostModal
            onClose={() => setShowCreateForm(false)}
            onPostCreated={() => {
              setShowCreateForm(false);
              fetchPosts();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Create Post Modal Component
function CreatePostModal({ onClose, onPostCreated }: { onClose: () => void; onPostCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    trip_destination: '',
    trip_dates: '',
    category: 'adventure' as const,
    rating: 5,
    itinerary_id: '' as string | undefined
  });
  const [submitting, setSubmitting] = useState(false);
  const [userItineraries, setUserItineraries] = useState<Itinerary[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserItineraries();
  }, []);

  const fetchUserItineraries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('itinerary')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserItineraries(data);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to create a post');
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          user_email: user.email,
          ...formData,
          likes: 0,
          comments: 0,
          images: []
        });

      if (error) {
        throw error;
      }

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleItinerarySelect = (itinerary: Itinerary) => {
    setFormData({
      ...formData,
      itinerary_id: itinerary.id,
      trip_destination: itinerary.description || '',
      trip_dates: `${new Date(itinerary.start_date).toLocaleDateString()} - ${new Date(itinerary.end_date).toLocaleDateString()}`,
      title: `My Experience: ${itinerary.title}`
    });
  };

  const handleDateSelect = (start: string, end: string) => {
    setSelectedDates({ start, end });
    setFormData({
      ...formData,
      trip_dates: `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
    });
    setShowDatePicker(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Your Travel Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link to Existing Itinerary */}
          <div>
            <label className="block text-white font-medium mb-2">Link to Existing Trip (Optional)</label>
            <select
              value={formData.itinerary_id || ''}
              onChange={(e) => {
                if (e.target.value) {
                  const itinerary = userItineraries.find(i => i.id === e.target.value);
                  if (itinerary) handleItinerarySelect(itinerary);
                } else {
                  setFormData({ ...formData, itinerary_id: undefined, trip_destination: '', trip_dates: '', title: '' });
                }
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
            >
              <option value="">Select an itinerary to link...</option>
              {userItineraries.map((itinerary) => (
                <option key={itinerary.id} value={itinerary.id}>
                  {itinerary.title} ({new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Linking to an itinerary will automatically fill in destination and dates</p>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Experience Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              placeholder="Give your experience a catchy title..."
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Your Story</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              rows={6}
              placeholder="Share the details of your amazing trip..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Destination</label>
              <input
                type="text"
                value={formData.trip_destination}
                onChange={(e) => setFormData({ ...formData, trip_destination: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                placeholder="Where did you go?"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Trip Dates</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.trip_dates}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white cursor-pointer"
                  placeholder="Click to select dates..."
                  required
                />
                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm mb-2">Start Date</label>
                        <input
                          type="date"
                          value={selectedDates.start}
                          onChange={(e) => setSelectedDates({ ...selectedDates, start: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-2">End Date</label>
                        <input
                          type="date"
                          value={selectedDates.end}
                          onChange={(e) => setSelectedDates({ ...selectedDates, end: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleDateSelect(selectedDates.start, selectedDates.end)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                        disabled={!selectedDates.start || !selectedDates.end}
                      >
                        Set Dates
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
              >
                <option value="adventure">🏔️ Adventure</option>
                <option value="cultural">🏛️ Cultural</option>
                <option value="relaxation">🏖️ Relaxation</option>
                <option value="food">🍽️ Food</option>
                <option value="budget">💰 Budget</option>
                <option value="luxury">✨ Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-2xl transition-all duration-200 hover:scale-110 ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Click stars to rate your experience</p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {submitting ? 'Sharing...' : 'Share Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
