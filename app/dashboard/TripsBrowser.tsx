"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";

type Trip = {
  id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
};

type Props = { itineraries: Trip[] };

export default function TripsBrowser({ itineraries }: Props) {
  const [query, setQuery] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [groupBy, setGroupBy] = useState<"none" | "status" | "month">("none");
  const [sortBy, setSortBy] = useState<
    "start_asc" | "start_desc" | "title_asc" | "title_desc"
  >("start_asc");

  const isActive = (t: Trip) =>
    dayjs(t.end_date).isAfter(dayjs(), "day") ||
    dayjs(t.end_date).isSame(dayjs(), "day");

  const filtered = useMemo(() => {
    let list = itineraries;

    // search (black text enforced via class)
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    // filter
    if (activeOnly) list = list.filter((t) => isActive(t));

    // sort
    const sorted = [...list].sort((a, b) => {
      switch (sortBy) {
        case "start_asc":
          return dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf();
        case "start_desc":
          return dayjs(b.start_date).valueOf() - dayjs(a.start_date).valueOf();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [itineraries, query, activeOnly, sortBy]);

  // grouping
  const grouped = useMemo(() => {
    if (groupBy === "none") return { All: filtered };
    if (groupBy === "status") {
      return {
        Active: filtered.filter(isActive),
        Past: filtered.filter((t) => !isActive(t)),
      };
    }
    // groupBy month
    const map = new Map<string, Trip[]>();
    for (const t of filtered) {
      const key = dayjs(t.start_date).format("MMM YYYY");
      map.set(key, [...(map.get(key) || []), t]);
    }
    return Object.fromEntries(map.entries());
  }, [filtered, groupBy]);

  const sections = Object.entries(grouped); // [heading, trips[]]

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-red-500/30 rounded-lg shadow-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
          <input
            type="text"
            placeholder="Search trips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:flex-1 px-4 py-3 border border-gray-600 bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
          />

          {/* Group by */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Group by</label>
            <select
              value={groupBy}
              onChange={(e) =>
                setGroupBy(e.target.value as "none" | "status" | "month")
              }
              className="px-3 py-2 bg-black border border-red-500/30 text-white rounded-lg hover:bg-gray-900 transition-colors focus:ring-2 focus:ring-red-500"
            >
              <option value="none">None</option>
              <option value="status">Status (Active/Past)</option>
              <option value="month">Month</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Filter</label>
            <button
              type="button"
              onClick={() => setActiveOnly((v) => !v)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeOnly
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-black border border-red-500/30 text-gray-300 hover:bg-gray-900"
              }`}
              aria-pressed={activeOnly}
            >
              {activeOnly ? "Active only ✓" : "Active only"}
            </button>
          </div>

          {/* Sort by */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "start_asc"
                    | "start_desc"
                    | "title_asc"
                    | "title_desc"
                )
              }
              className="px-3 py-2 bg-black border border-red-500/30 text-white rounded-lg hover:bg-gray-900 transition-colors focus:ring-2 focus:ring-red-500"
            >
              <option value="start_asc">Start date (asc)</option>
              <option value="start_desc">Start date (desc)</option>
              <option value="title_asc">Title (A–Z)</option>
              <option value="title_desc">Title (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped result sections */}
      <div className="space-y-6">
        {sections.map(([heading, trips]) => (
          <div key={heading}>
            {heading !== "All" && (
              <h3 className="text-xl font-semibold text-white mb-4 border-l-4 border-red-500 pl-3">
                {heading}
              </h3>
            )}
            {trips.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/itinerary/${trip.id}`}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/30 rounded-lg shadow-lg p-6 hover:shadow-xl hover:border-red-500/50 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white text-lg">
                        {trip.title}
                      </h4>
                      <span className="text-red-500 text-xl">→</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <p className="text-sm text-gray-300">
                        {dayjs(trip.start_date).format("MMM DD")} -{" "}
                        {dayjs(trip.end_date).format("MMM DD, YYYY")}
                      </p>
                    </div>
                    {trip.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 border-t border-gray-700 pt-3">
                        {trip.description}
                      </p>
                    )}
                    <div className="flex items-center mt-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        isActive(trip) 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {isActive(trip) ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 bg-gradient-to-r from-gray-800 to-gray-900 border border-red-500/20 border-dashed rounded-lg p-8">
                <div className="text-4xl mb-2">📝</div>
                <p>No trips found.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}