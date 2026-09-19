import { useEffect, useState, useCallback } from "react";
import api, { endpoints } from "../lib/api";
import { mockProjects } from "../data/mockProjects";

/**
 * Loads the project list from the Java backend. If the API isn't reachable
 * yet (common during frontend-first development), it falls back to local
 * mock data and flags `usingMock: true` so the UI can show a subtle notice.
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(endpoints.projects);
      setProjects(Array.isArray(data) ? data : data?.content ?? []);
      setUsingMock(false);
    } catch (err) {
      setProjects(mockProjects);
      setUsingMock(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, usingMock, error, reload: load };
}
