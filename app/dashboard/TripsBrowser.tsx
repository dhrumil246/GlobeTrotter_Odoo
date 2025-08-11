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
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:space-x-4">
          <input
            type="text"
            placeholder="Search trips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 bg-white"
          />

          {/* Group by */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Group by</label>
            <select
              value={groupBy}
              onChange={(e) =>
                setGroupBy(e.target.value as "none" | "status" | "month")
              }
              className="px-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <option value="none">None</option>
              <option value="status">Status (Active/Past)</option>
              <option value="month">Month</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Filter</label>
            <button
              type="button"
              onClick={() => setActiveOnly((v) => !v)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
              aria-pressed={activeOnly}
            >
              {activeOnly ? "Active only ✓" : "Active only"}
            </button>
          </div>

          {/* Sort by */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by</label>
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
              className="px-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {heading}
              </h3>
            )}
            {trips.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/itinerary/${trip.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        {trip.title}
                      </h4>
                      <span className="text-blue-600">→</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {dayjs(trip.start_date).format("MMM DD")} -{" "}
                      {dayjs(trip.end_date).format("MMM DD, YYYY")}
                    </p>
                    {trip.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 bg-white rounded-lg border border-dashed p-6">
                No trips found.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}