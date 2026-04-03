import { Chip } from '@mui/material';

const config = {
  approved:  { label: 'Approved',  color: 'success' },
  pending:   { label: 'Pending',   color: 'warning' },
  rejected:  { label: 'Rejected',  color: 'error'   },
  draft:     { label: 'Draft',     color: 'default' },
  submitted: { label: 'Submitted', color: 'info'    },
};

export default function StatusChip({ status }) {
  const s = config[status?.toLowerCase()] ?? { label: status, color: 'default' };
  return <Chip label={s.label} color={s.color} size="small" />;
}