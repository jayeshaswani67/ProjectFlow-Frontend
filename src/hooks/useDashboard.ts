import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../api/dashboardApi";

export const dashboardQueryKey = [
  "dashboard",
];

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: getDashboard,
    staleTime: 30_000,
  });
}