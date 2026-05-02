import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import useListQuery from '../../hooks/useListQuery';
import ListPage from '../../components/list/ListPage';
import Table from '../../components/list/Table';
import Pagination from '../../components/list/Pagination';
import FilterBar from '../../components/list/FilterBar';
import { Btn, StatusBadge, EmptyState } from '../../components/UI';

const STATUS_OPTIONS = [
  { value: '',          label: 'All' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
];

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function StudentWeeklyLogs() {
  const navigate = useNavigate();

  const list = useListQuery({
    endpoint: ENDPOINTS.MY_LOGS,
    initialFilters: { status: '' },
    initialOrdering: '-week_number',
  });

  const columns = [
    {
      key: 'week_number',
      header: 'Week',
      render: (l) => `Week ${l.week_number}`,
    },
    {
      key: 'dates',
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
      width: 160,
      render: (l) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="secondary" size="sm" onClick={() => navigate(`/student/logs/${l.id}`)}>
            View
          </Btn>
          {l.status === 'draft' && (
            <Btn variant="ghost" size="sm" onClick={() => navigate(`/student/logs/${l.id}/edit`)}>
              Edit
            </Btn>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  ];

  return (
    <ListPage
      title="Weekly Logs"
      actions={
        <Btn variant="primary" onClick={() => navigate('/student/logs/new')}>
          + New Log
        </Btn>
      }
      controls={
        <FilterBar
          filters={filters}
          values={list.filters}
          onChange={list.setFilter}
        />
      }
    >
      <Table
        columns={columns}
        rows={list.data}
        loading={list.loading}
        rowKey="id"
        empty={
          <EmptyState
            title="No logs yet"
            description="Click + New Log to submit your first weekly log."
          />
        }
      />
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        pageSize={list.pageSize}
        total={list.count}
        onChange={list.setPage}
      />
    </ListPage>
  );
}