"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";

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
  itinerary_id?: string;
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: string;
}

interface Activity {
  id: string;
  activity_name: string;
  cost: number;
  date: string;
  itinerary_id: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
      checkUser();
    }
  }, [params.id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      
      // Fetch post details
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        return;
      }

      setPost(postData);

      // If post has linked itinerary, fetch it
      if (postData.itinerary_id) {
        await fetchItineraryDetails(postData.itinerary_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraryDetails = async (itineraryId: string) => {
    try {
      // Fetch itinerary
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('itinerary')
        .select('*')
        .eq('id', itineraryId)
        .single();

      if (!itineraryError && itineraryData) {
        setItinerary(itineraryData);
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('date', { ascending: true });

      if (!activitiesError && activitiesData) {
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching itinerary details:', error);
    }
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
      case 'cultural': return '️';
      case 'relaxation': return '🏖️';
      case 'food': return '️';
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
          <p className="text-gray-300">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Story not found</h1>
          <Link href="/community" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const totalTripCost = activities.reduce((sum, activity) => sum + Number(activity.cost), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/community"
            className="inline-flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <span>←</span>
            <span>Back to Community</span>
          </Link>
        </div>

        {/* Post Header */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {post.user_email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white font-medium text-lg">{post.user_email.split('@')[0]}</h2>
                <p className="text-gray-400 text-sm">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getCategoryColor(post.category)}`}>
              {getCategoryIcon(post.category)} {post.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-6 text-gray-300 mb-6">
            <span className="flex items-center space-x-2">
              <span>📍</span>
              <span>{post.trip_destination}</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>📅</span>
              <span>{post.trip_dates}</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>⭐</span>
              <span>{post.rating}/5</span>
            </span>
          </div>

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
        </div>

        {/* Story Content */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">The Story</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* Linked Itinerary Section */}
        {itinerary && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">📋</span>
              Complete Itinerary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{itinerary.title}</h4>
                <p className="text-gray-300">{itinerary.description}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>📅 {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}</p>
                  <p>💰 Total Cost: ₹{totalTripCost.toLocaleString()}</p>
                  <p>🎯 Activities: {activities.length}</p>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Quick Stats</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl text-red-400 font-bold">{activities.length}</div>
                    <div className="text-gray-400">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-red-400 font-bold">₹{totalTripCost.toLocaleString()}</div>
                    <div className="text-gray-400">Total Cost</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities List */}
            {activities.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-white mb-4">Day-by-Day Activities</h5>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400">•</span>
                        <span className="text-white">{activity.activity_name}</span>
                        <span className="text-gray-400 text-sm">
                          {dayjs(activity.date).format('MMM DD')}
                        </span>
                      </div>
                      <span className="text-red-400 font-medium">₹{Number(activity.cost).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Itinerary Button */}
            <div className="mt-6">
              <Link
                href={`/itinerary/${itinerary.id}`}
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <span>📋</span>
                <span>View Full Itinerary</span>
              </Link>
            </div>
          </div>
        )}

        {/* Comments Section (Future Feature) */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Comments</h3>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p>Comments feature coming soon!</p>
            <p className="text-sm">Share your thoughts and ask questions about this experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
