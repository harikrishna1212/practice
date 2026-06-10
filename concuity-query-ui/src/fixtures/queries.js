// Seed data for the mock API. Field names mirror what the backend
// (concuity-query-svc) is expected to return for GET /queries.
export const SEED_QUERIES = [
  {
    id: 1,
    queryName: 'Active Accounts by Facility',
    sqlText:
      'SELECT account_id, facility_code, balance FROM accounts WHERE facility_code = :facilityCode AND status = :status',
    businessReason:
      'MicroAutomation needs the list of active accounts per facility for the nightly placement run.',
    parameters: [
      { name: 'facilityCode', dataType: 'Character' },
      { name: 'status', dataType: 'Character' },
    ],
    expectedVolume: '450',
    expectedFrequency: 'Daily',
    status: 'Approved',
    version: 1,
    uniqueQueryId: 100001,
    submittedBy: 'jdoe',
    dateSubmitted: '2026-05-20T10:15:00Z',
    dateResolved: '2026-05-21T09:00:00Z',
    notes: 'Reviewed execution plan; index on facility_code confirmed.',
    deleted: false,
  },
  {
    id: 2,
    queryName: 'High Balance Accounts',
    sqlText:
      'SELECT account_id, balance FROM accounts WHERE balance > :minBalance',
    businessReason:
      'Operations team requires a weekly extract of high balance accounts for manual review.',
    parameters: [{ name: 'minBalance', dataType: 'Number' }],
    expectedVolume: '120',
    expectedFrequency: 'Weekly',
    status: 'Awaiting Approval',
    version: 1,
    submittedBy: 'jdoe',
    dateSubmitted: '2026-06-08T14:30:00Z',
    dateResolved: null,
    notes: '',
    deleted: false,
  },
  {
    id: 3,
    queryName: 'Discharged Patients Since Date',
    sqlText:
      'SELECT patient_id, discharge_date FROM encounters WHERE discharge_date >= :fromDate',
    businessReason:
      'Ad-hoc report requested by client services for discharge follow-up automation.',
    parameters: [{ name: 'fromDate', dataType: 'Date' }],
    expectedVolume: '2000',
    expectedFrequency: 'Ad-hoc',
    status: 'Rejected',
    version: 1,
    submittedBy: 'jdoe',
    dateSubmitted: '2026-06-01T08:05:00Z',
    dateResolved: '2026-06-02T11:45:00Z',
    notes: 'Missing index on discharge_date — full table scan. Please add date upper bound.',
    deleted: false,
  },
  {
    id: 4,
    queryName: 'Zero Balance Cleanup Candidates',
    sqlText: 'SELECT account_id FROM accounts WHERE balance = 0',
    businessReason: 'Identify zero balance accounts eligible for closure automation.',
    parameters: [],
    expectedVolume: '800',
    expectedFrequency: 'Bi-weekly',
    status: 'Draft',
    version: 1,
    submittedBy: 'jdoe',
    dateSubmitted: null,
    dateResolved: null,
    notes: '',
    deleted: false,
  },
];
