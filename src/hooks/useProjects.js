import { useCallback, useEffect, useState } from "react";
import { mockProjects } from "../data/mockProjects";

const STORAGE_KEY = "neodemanda:projects";

function readProjects() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockProjects;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : mockProjects;
  } catch {
    return mockProjects;
  }
}

/** Fonte local usada quando a aplicação é executada sem backend. */
export function useProjects() {
  const [projects, setProjects] = useState(() => readProjects());
  const [loading] = useState(false);
  const [usingMock] = useState(true);
  const [error] = useState(null);

  const load = useCallback(() => {
    setProjects(readProjects());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, loading, usingMock, error, reload: load };
}
