import React, { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'
import {
  Navbar, PageLayout, PageBody, Card, Btn, StatusBadge,
  Modal, Spinner, EmptyState, Field, Input, Select, toast
} from '../components/UI'

const ROLE_COLORS = {
  admin: { bg: '#E8F4FD', color: '#185FA5' },
  student: { bg: '#D8EDDF', color: '#1B4332' },
  supervisor: { bg: '#FDF3DC', color: '#B5882A' },
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [stats, setStats] = useState({ total: 0, students: 0, supervisors: 0, pending: 0 })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await adminAPI.getUsers()
      const list = Array.isArray(data) ? data : data.results || []
      setUsers(list)
      setStats({
        total: list.length,
        students: list.filter(u => u.role === 'student').length,
        supervisors: list.filter(u => u.role === 'supervisor').length,
        pending: list.filter(u => !u.is_approved).length,
      })
    } catch {
      toast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleApprove(id) {
    setActionLoading(a => ({ ...a, [`approve_${id}`]: true }))
    try {
      await adminAPI.approveUser(id)
      toast('User approved successfully')
      fetchUsers()
    } catch {
      toast('Failed to approve user', 'error')
    } finally {
      setActionLoading(a => ({ ...a, [`approve_${id}`]: false }))
    }
  }

  async function handleToggleStatus(user) {
    const key = `status_${user.id}`
    setActionLoading(a => ({ ...a, [key]: true }))
    try {
      await adminAPI.toggleUserStatus(user.id, { is_active: !user.is_active })
      toast(`User ${user.is_active ? 'disabled' : 'enabled'} successfully`)
      fetchUsers()
    } catch {
      toast('Failed to update user status', 'error')
    } finally {
      setActionLoading(a => ({ ...a, [key]: false }))
    }
  }

  const filtered = users.filter(u => {
    const term = search.toLowerCase()
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.first_name?.toLowerCase().includes(term) ||
      u.last_name?.toLowerCase().includes(term)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <PageLayout>
      <Navbar title="ILES Admin" subtitle="Administration" />

      <PageBody>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#1A1714', letterSpacing: '-0.8px' }}>
              User Management
            </h1>
            <p style={{ color: '#9A938D', fontSize: 14, marginTop: 4 }}>
              Review, approve, and manage all system users
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.total, color: '#1A6FA8', bg: '#E8F4FD' },
              { label: 'Students', value: stats.students, color: '#1B4332', bg: '#D8EDDF' },
              { label: 'Supervisors', value: stats.supervisors, color: '#B5882A', bg: '#FDF3DC' },
              { label: 'Pending Approval', value: stats.pending, color: '#C0392B', bg: '#FDECEA' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: 12, padding: '1rem 1.25rem',
                border: `1px solid ${s.color}20`
              }}>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 4 }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                placeholder="Search by name, username, or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 340, flex: 1 }}
              />
              <Select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ maxWidth: 180 }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="supervisor">Supervisors</option>
                <option value="admin">Admins</option>
              </Select>
              <Btn variant="secondary" size="sm" onClick={fetchUsers}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4v5h5M20 20v-5h-5M20 9A9 9 0 006.8 6.8M4 15a9 9 0 0013.2 2.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </Btn>
            </div>
          </Card>

          {/* Table */}
          <Card padding="0">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="👤"
                title="No users found"
                description={search ? 'Try adjusting your search or filters.' : 'No users have registered yet.'}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2DDD6' }}>
                      {['User', 'Role', 'Email', 'Status', 'Approved', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 12, fontWeight: 600, color: '#9A938D',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => {
                      const rc = ROLE_COLORS[user.role] || { bg: '#F0EDE8', color: '#5A5450' }
                      return (
                        <tr key={user.id} style={{
                          borderBottom: i < filtered.length - 1 ? '1px solid #F0EDE8' : 'none',
                          transition: 'background 0.1s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F7F5F0'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: rc.bg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 13, fontWeight: 600, color: rc.color
                              }}>
                                {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1714' }}>
                                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                </div>
                                <div style={{ fontSize: 12, color: '#9A938D' }}>@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: rc.bg, color: rc.color,
                              fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 14, color: '#5A5450' }}>
                            {user.email || '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={user.is_approved ? 'approved' : 'pending'} />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                              {!user.is_approved && (
                                <Btn
                                  variant="primary" size="sm"
                                  loading={actionLoading[`approve_${user.id}`]}
                                  onClick={() => handleApprove(user.id)}
                                >
                                  Approve
                                </Btn>
                              )}
                              <Btn
                                variant={user.is_active ? 'danger' : 'secondary'} size="sm"
                                loading={actionLoading[`status_${user.id}`]}
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.is_active ? 'Disable' : 'Enable'}
                              </Btn>
                              <Btn
                                variant="ghost" size="sm"
                                onClick={() => setSelected(user)}
                              >
                                View
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pagination count */}
          {!loading && filtered.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: 13, color: '#9A938D', textAlign: 'right' }}>
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </PageBody>

      {/* User Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: ROLE_COLORS[selected.role]?.bg || '#F0EDE8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: ROLE_COLORS[selected.role]?.color || '#5A5450'
              }}>
                {(selected.first_name?.[0] || selected.username?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
                  {selected.first_name ? `${selected.first_name} ${selected.last_name || ''}`.trim() : selected.username}
                </div>
                <div style={{ fontSize: 13, color: '#9A938D' }}>@{selected.username}</div>
              </div>
            </div>
            {[
              ['Email', selected.email || '—'],
              ['Role', selected.role],
              ['Status', selected.is_active ? 'Active' : 'Inactive'],
              ['Approved', selected.is_approved ? 'Yes' : 'Pending'],
              ['Date Joined', selected.date_joined ? new Date(selected.date_joined).toLocaleDateString() : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #F0EDE8'
              }}>
                <span style={{ fontSize: 13, color: '#9A938D' }}>{k}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1714' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {!selected.is_approved && (
                <Btn
                  variant="primary"
                  loading={actionLoading[`approve_${selected.id}`]}
                  onClick={async () => {
                    await handleApprove(selected.id)
                    setSelected(null)
                  }}
                >
                  Approve User
                </Btn>
              )}
              <Btn
                variant={selected.is_active ? 'danger' : 'secondary'}
                loading={actionLoading[`status_${selected.id}`]}
                onClick={async () => {
                  await handleToggleStatus(selected)
                  setSelected(null)
                }}
              >
                {selected.is_active ? 'Disable Account' : 'Enable Account'}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  )
}
