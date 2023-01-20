import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useQuery(key: string): string | undefined {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  return query.get(key) ?? undefined;
}
