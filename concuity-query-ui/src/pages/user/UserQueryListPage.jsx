import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '../../context/QueryContext';
import QueryTable from '../../components/QueryTable';
import '../../styles/query-list.css';

// BRD Screen 1 — Client User: Query List (Dashboard)
export default function UserQueryListPage() {
  const { queries, loading, error, fetchQueries, softDeleteQueries } = useQueries();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const visibleQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return queries;
    return queries.filter((q) => q.queryName.toLowerCase().includes(term));
  }, [queries, search]);

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll(visibleQueryIds) {
    setSelectedIds((prev) => {
      const allSelected = visibleQueryIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(visibleQueryIds);
    });
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected quer${ids.length > 1 ? 'ies' : 'y'}? They will no longer be available.`)) {
      return;
    }
    await softDeleteQueries(ids);
    setSelectedIds(new Set());
    setMessage(`${ids.length} quer${ids.length > 1 ? 'ies' : 'y'} deleted.`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Queries</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/queries/new')}
        >
          + New Query
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="list-toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Search by Query Name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0}
        >
          Delete Selected{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading queries…</p>
      ) : (
        <QueryTable
          queries={visibleQueries}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onOpenQuery={() => {
            // Screen 3 (Query Detail View) is a later step.
            setMessage('Query detail view is coming in the next build step.');
          }}
        />
      )}
    </div>
  );
}
