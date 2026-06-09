import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import useListQuery from '../../hooks/useListQuery';
import ListPage from '../../components/list/ListPage';
import Table from '../../components/list/Table';
import Pagination from '../../components/list/Pagination';
import { Btn, StatusBadge, EmptyState } from '../../components/UI';


const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';


export default function WorkplaceStudents() {
  const navigate = useNavigate();


  const list = useListQuery({
    endpoint: ENDPOINTS.WP_STUDENTS,
  });


  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (p) => p.student?.full_name || '—',
    },
    {
      key: 'job_title',
      header: 'Job Title',
    },
    {
      key: 'company_name',
      header: 'Company',
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (p) => `${formatDate(p.start_date)} — ${formatDate(p.end_date)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: '',
      width: 180,
      render: (p) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="secondary" size="sm" onClick={() => navigate('/workplace/logs')}>Logs</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate(`/workplace/evaluate/${p.id}`)}>Evaluate</Btn>
        </div>
      ),
    },
  ];


  return (
    <ListPage title="My Students">
      <Table
        columns={columns}
        rows={list.data}
        loading={list.loading}
        rowKey="id"
        empty={
          <EmptyState
            title="No students assigned"
            description="You have not been assigned any students yet."
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