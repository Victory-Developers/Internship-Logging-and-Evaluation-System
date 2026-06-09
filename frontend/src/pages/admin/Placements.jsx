import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import useListQuery from '../../hooks/useListQuery';
import ListPage from '../../components/list/ListPage';
import Table from '../../components/list/Table';
import Pagination from '../../components/list/Pagination';
import SearchBar from '../../components/list/SearchBar';
import FilterBar from '../../components/list/FilterBar';
import { Btn, Modal, StatusBadge, toast, Field, Select, EmptyState } from '../../components/UI';

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DAY_LABEL = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
  5: 'Friday', 6: 'Saturday', 7: 'Sunday',
};

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function PlacementsPage() {
  const navigate = useNavigate();

  const list = useListQuery({
    endpoint: ENDPOINTS.PLACEMENTS,
    initialFilters: { status: '' },
    initialOrdering: '-created_at',
  });

  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [academicSupervisors, setAcademicSupervisors] = useState([]);
  const [selectedAcSup, setSelectedAcSup] = useState('');

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_USERS, { params: { role: 'academic_supervisor', status: 'active', ordering: 'full_name' } })
      .then(res => {
        const data = res.data;
        setAcademicSupervisors(Array.isArray(data) ? data : data?.results || []);
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (placement) => {
    if (!confirm(`Delete placement at ${placement.company_name}? This cannot be undone.`)) return;
    setBusyId(placement.id);
    try {
      await api.delete(ENDPOINTS.PLACEMENT_DETAIL(placement.id));
      toast('Placement deleted');
      list.refetch();
      if (viewing?.id === placement.id) setViewing(null);
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete placement', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (placement) => {
    if (!selectedAcSup) {
      toast('Please select an academic supervisor first', 'warning');
      return;
    }
    setBusyId(placement.id);
    try {
      await api.patch(ENDPOINTS.PLACEMENT_DETAIL(placement.id), {
        academic_supervisor: selectedAcSup,
        status: 'active',
      });
      toast('Placement activated');
      setViewing(null);
      setSelectedAcSup('');
      list.refetch();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to activate placement', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'company_name', header: 'Company' },
    { key: 'job_title',    header: 'Job Title' },
    {
      key: 'student',
      header: 'Student',
      render: (p) => p.student?.full_name || <span style={{ color: 'var(--on-surface-variant)' }}>Unassigned</span>,
    },
    {
      key: 'workplace_supervisor',
      header: 'Workplace Supervisor',
      render: (p) => p.workplace_supervisor?.full_name || '—',
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
      header: 'Actions',
      width: 220,
      render: (p) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="secondary" size="sm" onClick={() => { setViewing(p); setSelectedAcSup(p.academic_supervisor?.id || ''); }}>View</Btn>
          <Btn
            variant="danger"
            size="sm"
            loading={busyId === p.id}
            onClick={() => handleDelete(p)}
          >
            Delete
          </Btn>
        </div>
      ),
    },
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  ];

  return (
    <>
      <ListPage
        title="Placements"
        actions={
          <Btn variant="primary" onClick={() => navigate('/admin/placements/new')}>
            + Add Placement
          </Btn>
        }
        controls={
          <>
            <SearchBar
              value={list.search}
              onChange={list.setSearch}
              placeholder="Search by company, job title, or student name..."
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
          empty={
            <EmptyState
              title="No placements yet"
              description="Click + Add Placement to register a new internship."
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

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? viewing.company_name : ''}
        width={600}
      >
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Job Title">
              <div style={detailStyle}>{viewing.job_title}</div>
            </Field>
            <Field label="Address">
              <div style={detailStyle}>{viewing.company_address}</div>
            </Field>
            {viewing.description && (
              <Field label="Description">
                <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{viewing.description}</div>
              </Field>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Start Date">
                <div style={detailStyle}>{formatDate(viewing.start_date)}</div>
              </Field>
              <Field label="End Date">
                <div style={detailStyle}>{formatDate(viewing.end_date)}</div>
              </Field>
            </div>
            <Field label="Weekly Log Deadline">
              <div style={detailStyle}>{DAY_LABEL[viewing.weekly_log_deadline] || '—'}</div>
            </Field>
            <Field label="Status">
              <div><StatusBadge status={viewing.status} /></div>
            </Field>
            <Field label="Student">
              <div style={detailStyle}>
                {viewing.student
                  ? `${viewing.student.full_name} (${viewing.student.email})`
                  : 'Unassigned'}
              </div>
            </Field>
            <Field label="Workplace Supervisor">
              <div style={detailStyle}>
                {viewing.workplace_supervisor
                  ? `${viewing.workplace_supervisor.full_name} (${viewing.workplace_supervisor.email})`
                  : viewing.invited_supervisor_email
                    ? `Invited: ${viewing.invited_supervisor_email}`
                    : '—'}
              </div>
            </Field>
            <Field label="Academic Supervisor">
              {viewing.status === 'pending' ? (
                <Select
                  value={selectedAcSup}
                  onChange={(e) => setSelectedAcSup(e.target.value)}
                >
                  <option value="">— Select Academic Supervisor —</option>
                  {academicSupervisors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </Select>
              ) : (
                <div style={detailStyle}>
                  {viewing.academic_supervisor
                    ? `${viewing.academic_supervisor.full_name} (${viewing.academic_supervisor.email})`
                    : '—'}
                </div>
              )}
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {viewing.status === 'pending' && (
                <Btn
                  variant="primary"
                  loading={busyId === viewing.id}
                  onClick={() => handleActivate(viewing)}
                >
                  Assign Supervisor & Activate
                </Btn>
              )}
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