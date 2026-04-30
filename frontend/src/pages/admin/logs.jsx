import React, { useState } from 'react';
import { ENDPOINTS } from '../../api/config';
import useListQuery from '../../hooks/useListQuery';
import ListPage from '../../components/list/ListPage';
import Table from '../../components/list/Table';
import Pagination from '../../components/list/Pagination';
import SearchBar from '../../components/list/SearchBar';
import FilterBar from '../../components/list/FilterBar';
import { Modal, StatusBadge, Btn, Field, EmptyState } from '../../components/UI';

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
];

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function AdminLogs() {
  const list = useListQuery({
    endpoint: ENDPOINTS.ADMIN_LOGS,
    initialFilters: { status: '' },
    initialOrdering: '-created_at',
  });

  const [viewing, setViewing] = useState(null);

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (l) => l.student?.full_name || l.student_name || '—',
    },
    {
      key: 'week_number',
      header: 'Week',
      render: (l) => `Week ${l.week_number}`,
    },
    {
      key: 'start_date',
      header: 'Period',
      render: (l) => `${formatDate(l.start_date)} — ${formatDate(l.end_date)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (l) => formatDate(l.submitted_at),
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      render: (l) => (
        <Btn variant="secondary" size="sm" onClick={() => setViewing(l)}>View</Btn>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  ];

  return (
    <>
      <ListPage
        title="All Logs"
        controls={
          <>
            <SearchBar
              value={list.search}
              onChange={list.setSearch}
              placeholder="Search by student name..."
            />
            <FilterBar
              filters={filters}
              values={list.filters}
              onChange={list.setFilter}
            />
          </>
        }
      >
        <Table
          columns={columns}
          rows={list.data}
          loading={list.loading}
          rowKey="id"
          empty={<EmptyState title="No logs found" description="No weekly logs have been submitted yet." />}
        />
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          pageSize={list.pageSize}
          total={list.count}
          onChange={list.setPage}
        />
      </ListPage>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Week ${viewing.week_number} — ${viewing.student?.full_name || viewing.student_name || ''}` : ''}
        width={600}
      >
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Period">
                <div style={detailStyle}>{formatDate(viewing.start_date)} — {formatDate(viewing.end_date)}</div>
              </Field>
              <Field label="Status">
                <div><StatusBadge status={viewing.status} /></div>
              </Field>
            </div>
            {viewing.activities && (
              <Field label="Activities">
                <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{viewing.activities}</div>
              </Field>
            )}
            {viewing.learning && (
              <Field label="Learning Outcomes">
                <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{viewing.learning}</div>
              </Field>
            )}
            {viewing.challenges && (
              <Field label="Challenges">
                <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{viewing.challenges}</div>
              </Field>
            )}
            {viewing.next_week && (
              <Field label="Plans for Next Week">
                <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{viewing.next_week}</div>
              </Field>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setViewing(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

const detailStyle = {
  padding: '8px 12px',
  background: 'var(--surface-container-low)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  color: 'var(--on-surface)',
};