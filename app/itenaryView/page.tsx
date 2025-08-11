import React from 'react';

const itinerary = [
  {
    day: 1,
    activities: [
      { time: '09:00', description: 'Arrival and check-in at hotel' },
      { time: '11:00', description: 'City walking tour' },
      { time: '14:00', description: 'Lunch at local restaurant' },
      { time: '16:00', description: 'Visit museum' },
    ],
  },
  {
    day: 2,
    activities: [
      { time: '08:00', description: 'Breakfast at hotel' },
      { time: '09:30', description: 'Excursion to national park' },
      { time: '13:00', description: 'Picnic lunch' },
      { time: '15:00', description: 'Return to city' },
      { time: '18:00', description: 'Dinner and free time' },
    ],
  },
];

export default function ItenaryViewPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Trip Itinerary</h1>
      {itinerary.map((day) => (
        <section key={day.day} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Day {day.day}</h2>
          <ul className="space-y-2">
            {day.activities.map((activity, idx) => (
              <li key={idx} className="flex items-center">
                <span className="w-20 font-mono text-gray-500">{activity.time}</span>
                <span>{activity.description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}