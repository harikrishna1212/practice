import { QUERY_STATUS } from '../constants';

const STATUS_CLASS = {
  [QUERY_STATUS.DRAFT]: 'badge-draft',
  [QUERY_STATUS.AWAITING_APPROVAL]: 'badge-awaiting',
  [QUERY_STATUS.APPROVED]: 'badge-approved',
  [QUERY_STATUS.REJECTED]: 'badge-rejected',
  [QUERY_STATUS.DISABLED]: 'badge-disabled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || 'badge-draft'}`}>
      {status}
    </span>
  );
}
