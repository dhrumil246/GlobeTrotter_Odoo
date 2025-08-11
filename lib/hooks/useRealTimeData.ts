"use client";

import { useEffect, useRef, useState } from "react";

interface UseRealTimeDataOptions {
  refreshInterval?: number; // in milliseconds
  onRefresh?: () => void;
  dependencies?: any[];
}

export function useRealTimeData({
  refreshInterval = 30000, // 30 seconds default
  onRefresh,
  dependencies = []
}: UseRealTimeDataOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (onRefresh) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(onRefresh, refreshInterval);

      // Cleanup on unmount or dependency change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, onRefresh, ...dependencies]);

  // Manual refresh function
  const refresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return { refresh };
}

// Hook for immediate UI updates without waiting for server refresh
export function useOptimisticUpdates<T>(initialData: T) {
  const [optimisticData, setOptimisticData] = useState<T>(initialData);

  // Update optimistic data immediately
  const updateOptimistic = (updater: (prev: T) => T) => {
    setOptimisticData(updater);
  };

  // Sync with server data when it changes
  useEffect(() => {
    setOptimisticData(initialData);
  }, [initialData]);

  return [optimisticData, updateOptimistic] as const;
}
