import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueries } from '../../context/QueryContext';
import { DATA_TYPES, FREQUENCIES } from '../../constants';
import { parseSqlParameters } from '../../utils/sqlParams';
import '../../styles/query-form.css';

const EMPTY_FORM = {
  queryName: '',
  sqlText: '',
  businessReason: '',
  expectedVolume: '',
  expectedFrequency: '',
};

// BRD Screen 2 — Client User: Create / Submit Query Form
export default function CreateQueryPage() {
  const { user } = useAuth();
  const { createQuery } = useQueries();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  // [{ name, dataType }] — names parsed from SQL, dataType chosen by user
  const [parameters, setParameters] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // After a successful submit, show confirmation + post-submit choices (BRD §2.5)
  const [submittedQuery, setSubmittedQuery] = useState(null);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSqlChange(value) {
    setField('sqlText', value);
    const names = parseSqlParameters(value);
    setParameters((prev) =>
      names.map((name) => ({
        name,
        dataType: prev.find((p) => p.name === name)?.dataType || '',
      }))
    );
  }

  function setParameterType(name, dataType) {
    setParameters((prev) =>
      prev.map((p) => (p.name === name ? { ...p, dataType } : p))
    );
  }

  function validate() {
    const next = {};
    if (!form.queryName.trim()) next.queryName = 'Query Name is required.';
    if (!form.sqlText.trim()) next.sqlText = 'SQL Text is required.';
    if (!form.businessReason.trim()) next.businessReason = 'Business Reason is required.';
    if (!form.expectedVolume.trim()) next.expectedVolume = 'Expected Volume is required.';
    if (!form.expectedFrequency) next.expectedFrequency = 'Expected Frequency is required.';
    if (parameters.some((p) => !p.dataType)) {
      next.parameters = 'Select a Data Type for every parameter.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(submit) {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await createQuery(
        {
          queryName: form.queryName.trim(),
          sqlText: form.sqlText.trim(),
          businessReason: form.businessReason.trim(),
          parameters,
          expectedVolume: form.expectedVolume.trim(),
          expectedFrequency: form.expectedFrequency,
          submittedBy: user.username,
        },
        { submit }
      );
      setSubmittedQuery(created);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    setForm(EMPTY_FORM);
    setParameters([]);
    setErrors({});
    setSubmittedQuery(null);
  }

  if (submittedQuery) {
    return (
      <div className="page form-page">
        <div className="alert alert-success submit-confirmation">
          <p>
            <strong>“{submittedQuery.queryName}”</strong> was saved with status{' '}
            <strong>{submittedQuery.status}</strong>.
          </p>
          <div className="confirmation-actions">
            <button type="button" className="btn btn-primary" onClick={resetForAnother}>
              Enter Another Query
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/queries')}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page form-page">
      <div className="page-header">
        <h2>New Query Request</h2>
      </div>

      <form className="query-form" onSubmit={(e) => e.preventDefault()} noValidate>
        <label className="field">
          <span className="field-label">Query Name *</span>
          <input
            type="text"
            value={form.queryName}
            onChange={(e) => setField('queryName', e.target.value)}
          />
          {errors.queryName && <span className="field-error">{errors.queryName}</span>}
        </label>

        <label className="field">
          <span className="field-label">SQL Text *</span>
          <textarea
            rows={8}
            spellCheck={false}
            placeholder="SELECT … FROM … WHERE column = :parameterName"
            value={form.sqlText}
            onChange={(e) => handleSqlChange(e.target.value)}
          />
          <span className="field-help">
            Bind parameters written as <code>:name</code> are detected automatically.
          </span>
          {errors.sqlText && <span className="field-error">{errors.sqlText}</span>}
        </label>

        <fieldset className="param-section">
          <legend>Parameters</legend>
          {parameters.length === 0 ? (
            <p className="param-empty">No parameters detected in the SQL text.</p>
          ) : (
            <table className="param-table">
              <thead>
                <tr>
                  <th>Parameter Name</th>
                  <th>Data Type *</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <code>{p.name}</code>
                    </td>
                    <td>
                      <select
                        value={p.dataType}
                        onChange={(e) => setParameterType(p.name, e.target.value)}
                      >
                        <option value="">Select…</option>
                        {DATA_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {errors.parameters && <span className="field-error">{errors.parameters}</span>}
        </fieldset>

        <label className="field">
          <span className="field-label">Business Reason *</span>
          <textarea
            rows={3}
            placeholder="Why is the query being requested? What is the business need/purpose?"
            value={form.businessReason}
            onChange={(e) => setField('businessReason', e.target.value)}
          />
          {errors.businessReason && (
            <span className="field-error">{errors.businessReason}</span>
          )}
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Expected Volume *</span>
            <input
              type="text"
              placeholder="Expected number of accounts returned"
              value={form.expectedVolume}
              onChange={(e) => setField('expectedVolume', e.target.value)}
            />
            {errors.expectedVolume && (
              <span className="field-error">{errors.expectedVolume}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Expected Frequency *</span>
            <select
              value={form.expectedFrequency}
              onChange={(e) => setField('expectedFrequency', e.target.value)}
            >
              <option value="">Select…</option>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {errors.expectedFrequency && (
              <span className="field-error">{errors.expectedFrequency}</span>
            )}
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/queries')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave(false)}
            disabled={submitting}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
