export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// BRD §3 — query lifecycle statuses
export const QUERY_STATUS = {
  DRAFT: 'Draft',
  AWAITING_APPROVAL: 'Awaiting Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DISABLED: 'Disabled',
};

// BRD Screen 2 — Data Type dropdown (per parsed SQL parameter)
export const DATA_TYPES = ['Character', 'Number', 'Date'];

// BRD Screen 2 — Expected Frequency dropdown
export const FREQUENCIES = ['Ad-hoc', 'Daily', 'Weekly', 'Bi-weekly', 'Other'];
