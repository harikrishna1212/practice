import { createContext, useContext, useState, useCallback } from 'react';
import * as queryService from '../services/queryService';

const QueryContext = createContext(null);

export function QueryProvider({ children }) {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueries(await queryService.getQueries());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueries(await queryService.getAdminQueries());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const replaceInList = useCallback((updated) => {
    setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  const approveQuery = useCallback(
    async (id, notes) => replaceInList(await queryService.approveQuery(id, notes)),
    [replaceInList]
  );

  const rejectQuery = useCallback(
    async (id, notes) => replaceInList(await queryService.rejectQuery(id, notes)),
    [replaceInList]
  );

  const disableQuery = useCallback(
    async (id, notes) => replaceInList(await queryService.disableQuery(id, notes)),
    [replaceInList]
  );

  const createQuery = useCallback(async (payload, options) => {
    const created = await queryService.createQuery(payload, options);
    setQueries((prev) => [...prev, created]);
    return created;
  }, []);

  const softDeleteQueries = useCallback(async (ids) => {
    await queryService.softDeleteQueries(ids);
    const idSet = new Set(ids);
    setQueries((prev) => prev.filter((q) => !idSet.has(q.id)));
  }, []);

  const value = {
    queries,
    loading,
    error,
    fetchQueries,
    fetchAdminQueries,
    createQuery,
    softDeleteQueries,
    approveQuery,
    rejectQuery,
    disableQuery,
  };

  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  );
}

export function useQueries() {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error('useQueries must be used within QueryProvider');
  return ctx;
}
