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
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewed',  label: 'Reviewed' },
  { value: 'approved',  label: 'Approved' },
  { value: 'rejected',  label: 'Rejected' },
];

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function SupervisorPendingReviews() {
  const navigate = useNavigate();

  const list = useListQuery({
    endpoint: ENDPOINTS.ACADEMIC_LOGS,
    initialFilters: { status: '' },
    initialOrdering: '-submitted_at',
  });

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
      key: 'submitted_at',
      header: 'Submitted',
      render: (l) => formatDate(l.submitted_at),
    },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      render: (l) => (
        <Btn variant="secondary" size="sm" onClick={() => navigate(`/supervisor/review/${l.id}`)}>
          Review
        </Btn>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  ];

  return (
    <ListPage
      title="Student Logs"
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
            title="No logs to review"
            description="No student logs have been submitted yet."
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