import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueries } from '../../context/QueryContext';
import StatusBadge from '../../components/StatusBadge';
import { QUERY_STATUS } from '../../constants';
import { formatDate } from '../../utils/format';
import * as queryService from '../../services/queryService';
import '../../styles/query-detail.css';

// BRD Screen 5 — Admin: Query Detail / Approval View.
// Read-only review of the submitted query with Approve / Reject actions and
// a Notes field (rejection reason is required). After an action the screen
// closes and returns the Admin to the queue, per the BRD.
export default function AdminQueryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approveQuery, rejectQuery, disableQuery } = useQueries();

  const [query, setQuery] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    queryService
      .getQueryById(id)
      .then((q) => {
        setQuery(q);
        setNotes(q.notes || '');
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  async function handleAction(action) {
    if (action === rejectQuery && !notes.trim()) {
      setActionError('Please enter a note with the reason for rejection.');
      return;
    }
    setActionError(null);
    setActing(true);
    try {
      await action(query.id, notes.trim());
      navigate('/admin/queries');
    } catch (err) {
      setActionError(err.message);
      setActing(false);
    }
  }

  if (loadError) {
    return (
      <div className="page">
        <div className="alert alert-error">{loadError}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/queries')}>
          Back to Queue
        </button>
      </div>
    );
  }

  if (!query) return <p className="loading-text">Loading query…</p>;

  const isAwaiting = query.status === QUERY_STATUS.AWAITING_APPROVAL;
  const isApproved = query.status === QUERY_STATUS.APPROVED;

  return (
    <div className="page detail-page">
      <div className="page-header">
        <h2>{query.queryName}</h2>
        <StatusBadge status={query.status} />
      </div>

      <div className="detail-card">
        <dl className="detail-meta">
          <div>
            <dt>Submitted By</dt>
            <dd>{query.submittedBy}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{query.version}</dd>
          </div>
          <div>
            <dt>Date Submitted</dt>
            <dd>{formatDate(query.dateSubmitted)}</dd>
          </div>
          <div>
            <dt>Date Approved/Rejected</dt>
            <dd>{formatDate(query.dateResolved)}</dd>
          </div>
          <div>
            <dt>Expected Volume</dt>
            <dd>{query.expectedVolume}</dd>
          </div>
          <div>
            <dt>Expected Frequency</dt>
            <dd>{query.expectedFrequency}</dd>
          </div>
          {query.uniqueQueryId && (
            <div>
              <dt>Unique Query ID</dt>
              <dd className="unique-id">{query.uniqueQueryId}</dd>
            </div>
          )}
        </dl>

        <section className="detail-section">
          <h3>SQL Text</h3>
          <pre className="sql-block">{query.sqlText}</pre>
        </section>

        <section className="detail-section">
          <h3>Parameters</h3>
          {query.parameters.length === 0 ? (
            <p className="param-empty">This query has no parameters.</p>
          ) : (
            <table className="param-table">
              <thead>
                <tr>
                  <th>Parameter Name</th>
                  <th>Data Type</th>
                </tr>
              </thead>
              <tbody>
                {query.parameters.map((p) => (
                  <tr key={p.name}>
                    <td><code>{p.name}</code></td>
                    <td>{p.dataType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="detail-section">
          <h3>Business Reason</h3>
          <p>{query.businessReason}</p>
        </section>

        <section className="detail-section">
          <h3>Notes</h3>
          <textarea
            rows={3}
            placeholder="Enter notes (e.g. reason for rejection). Visible to the Client User."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="detail-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/queries')}
            disabled={acting}
          >
            Back
          </button>
          {isAwaiting && (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleAction(rejectQuery)}
                disabled={acting}
              >
                Reject
              </button>
              <button
                type="button"
                className="btn btn-approve"
                onClick={() => handleAction(approveQuery)}
                disabled={acting}
              >
                Approve
              </button>
            </>
          )}
          {isApproved && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleAction(disableQuery)}
              disabled={acting}
            >
              Disable Query
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
