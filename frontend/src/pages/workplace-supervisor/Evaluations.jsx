import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import useListQuery from '../../hooks/useListQuery';
import ListPage from '../../components/list/ListPage';
import Table from '../../components/list/Table';
import Pagination from '../../components/list/Pagination';
import { Btn, EmptyState } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function WorkplaceEvaluations() {
  const navigate = useNavigate();

  const list = useListQuery({
    endpoint: ENDPOINTS.WP_EVALUATIONS,
  });

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (e) => e.student?.full_name || e.placement_detail?.student?.full_name || '—',
    },
    {
      key: 'professionalism',
      header: 'Professionalism',
      render: (e) => e.professionalism ?? '—',
    },
    {
      key: 'technical_skills',
      header: 'Technical',
      render: (e) => e.technical_skills ?? '—',
    },
    {
      key: 'communication',
      header: 'Communication',
      render: (e) => e.communication ?? '—',
    },
    {
      key: 'punctuality',
      header: 'Punctuality',
      render: (e) => e.punctuality ?? '—',
    },
    {
      key: 'average',
      header: 'Avg',
      render: (e) => {
        const vals = [e.professionalism, e.technical_skills, e.communication, e.punctuality].filter(v => v != null);
        if (vals.length === 0) return '—';
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
      },
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (e) => formatDate(e.created_at),
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      render: (e) => (
        <Btn variant="ghost" size="sm" onClick={() => navigate(`/workplace/evaluate/${e.placement || e.placement_id}`)}>
          Edit
        </Btn>
      ),
    },
  ];

  return (
    <ListPage title="My Evaluations">
      <Table
        columns={columns}
        rows={list.data}
        loading={list.loading}
        rowKey="id"
        empty={
          <EmptyState
            title="No evaluations yet"
            description="You have not submitted any evaluations yet."
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