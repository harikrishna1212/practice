import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '../../context/QueryContext';
import QueryTable from '../../components/QueryTable';
import { QUERY_STATUS } from '../../constants';
import '../../styles/query-list.css';

// BRD Screen 4 — Admin: Query List (Approval Queue).
// Default order: Awaiting Approval first, then descending by Date Submitted.
function adminDefaultOrder(a, b) {
  const aAwaiting = a.status === QUERY_STATUS.AWAITING_APPROVAL;
  const bAwaiting = b.status === QUERY_STATUS.AWAITING_APPROVAL;
  if (aAwaiting !== bAwaiting) return aAwaiting ? -1 : 1;
  return (b.dateSubmitted || '').localeCompare(a.dateSubmitted || '');
}

export default function AdminQueryListPage() {
  const { queries, loading, error, fetchAdminQueries } = useQueries();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminQueries();
  }, [fetchAdminQueries]);

  const visibleQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return queries;
    return queries.filter((q) => q.queryName.toLowerCase().includes(term));
  }, [queries, search]);

  const pendingCount = useMemo(
    () => queries.filter((q) => q.status === QUERY_STATUS.AWAITING_APPROVAL).length,
    [queries]
  );

  const defaultComparator = useCallback(adminDefaultOrder, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Submitted Queries</h2>
        <span className="pending-count">
          {pendingCount} awaiting approval
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="list-toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Search by Query Name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading queries…</p>
      ) : (
        <QueryTable
          queries={visibleQueries}
          defaultComparator={defaultComparator}
          onOpenQuery={(q) => navigate(`/admin/queries/${q.id}`)}
        />
      )}
    </div>
  );
}
