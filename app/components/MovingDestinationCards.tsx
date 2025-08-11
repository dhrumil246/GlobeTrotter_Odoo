"use client";
import { useState, useEffect } from "react";

interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  description: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Santorini",
    country: "Greece",
    image: "⛱️",
    description: "Stunning sunsets and white architecture"
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Japan",
    image: "⛩️",
    description: "Ancient temples and cherry blossoms"
  },
  {
    id: 3,
    name: "Machu Picchu",
    country: "Peru",
    image: "🏔️",
    description: "Mystical Incan ruins in the Andes"
  },
  {
    id: 4,
    name: "Safari",
    country: "Kenya",
    image: "🐘",
    description: "Wildlife adventure in the savanna"
  },
  {
    id: 5,
    name: "Northern Lights",
    country: "Iceland",
    image: "🌌",
    description: "Aurora borealis magic"
  },
  {
    id: 6,
    name: "Great Barrier Reef",
    country: "Australia",
    image: "🐠",
    description: "Underwater wonderland"
  },
  {
    id: 7,
    name: "Taj Mahal",
    country: "India",
    image: "🕌",
    description: "Monument of eternal love"
  },
  {
    id: 8,
    name: "Swiss Alps",
    country: "Switzerland",
    image: "⛷️",
    description: "Mountain paradise for adventure"
  }
];

export default function MovingDestinationCards() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (destinations.length - 3)); // Show 4 cards at a time
    }, 6000); // Change every 6 seconds (slower)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden py-12 mb-12" 
         style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')",
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Discover Amazing Destinations
        </h2>
        
        <div className="relative">
          {/* Cards Container with slower sliding animation */}
          <div className="flex transition-transform duration-2000 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * 25}%)` }}>
            {destinations.map((destination, index) => (
              <div key={destination.id} className="flex-shrink-0 w-1/4 px-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-5 text-center transform transition-all duration-700 hover:scale-105 hover:bg-white h-full">
                  <div className="text-4xl mb-3">{destination.image}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-lg text-green-600 font-semibold mb-3">
                    {destination.country}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {destination.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {Array.from({ length: destinations.length - 3 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + (destinations.length - 3)) % (destinations.length - 3))}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-500 hover:scale-110 z-20"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % (destinations.length - 3))}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-500 hover:scale-110 z-20"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
