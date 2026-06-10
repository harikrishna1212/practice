import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/format';

// BRD Screens 1 & 4 — shared sortable grid.
// `selectable` enables row checkboxes (Client User soft delete).
const COLUMNS = [
  { key: 'queryName', label: 'Query Name' },
  { key: 'submittedBy', label: 'Submitted By' },
  { key: 'status', label: 'Status' },
  { key: 'dateSubmitted', label: 'Date Submitted' },
  { key: 'dateResolved', label: 'Date Approved/Rejected' },
  { key: 'notes', label: 'Notes' },
];

export default function QueryTable({
  queries,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onOpenQuery,
  defaultComparator,
}) {
  const [sort, setSort] = useState(null); // { key, direction } | null

  function toggleSort(key) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null; // third click restores default order
    });
  }

  const sorted = useMemo(() => {
    const rows = [...queries];
    if (!sort) {
      if (defaultComparator) rows.sort(defaultComparator);
      return rows;
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
    return rows;
  }, [queries, sort, defaultComparator]);

  const allSelected =
    selectable && sorted.length > 0 && sorted.every((q) => selectedIds.has(q.id));

  return (
    <table className="query-table">
      <thead>
        <tr>
          {selectable && (
            <th className="col-checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(sorted.map((q) => q.id))}
                aria-label="Select all queries"
              />
            </th>
          )}
          {COLUMNS.map((col) => (
            <th key={col.key} onClick={() => toggleSort(col.key)} className="sortable">
              {col.label}
              <span className="sort-indicator">
                {sort?.key === col.key ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td colSpan={COLUMNS.length + (selectable ? 1 : 0)} className="empty-row">
              No queries found.
            </td>
          </tr>
        ) : (
          sorted.map((q) => (
            <tr key={q.id}>
              {selectable && (
                <td className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(q.id)}
                    onChange={() => onToggleSelect(q.id)}
                    aria-label={`Select ${q.queryName}`}
                  />
                </td>
              )}
              <td>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => onOpenQuery?.(q)}
                >
                  {q.queryName}
                </button>
              </td>
              <td>{q.submittedBy}</td>
              <td>
                <StatusBadge status={q.status} />
              </td>
              <td>{formatDate(q.dateSubmitted)}</td>
              <td>{formatDate(q.dateResolved)}</td>
              <td className="col-notes">{q.notes || '—'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
