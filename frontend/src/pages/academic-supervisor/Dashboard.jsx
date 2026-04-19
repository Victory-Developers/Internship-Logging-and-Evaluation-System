import React, { useState, useEffect, useCallback } from 'react'
import api from "../../api/axios";
import {
  Navbar, PageLayout, PageBody, Card, Btn, StatusBadge,
  Modal, Spinner, EmptyState, Field, Textarea, Select, toast
} from '../../components/UI'

export default function SupervisorDashboard() {
  const [logs, setLogs] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [studentFilter, setStudentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [logsRes, studentsRes] = await Promise.allSettled([
        supervisorAPI.getSubmittedLogs(),
        supervisorAPI.getStudents(),
      ])
      if (logsRes.status === 'fulfilled') {
        const list = Array.isArray(logsRes.value.data) ? logsRes.value.data : logsRes.value.data.results || []
        setLogs(list)
      } else {
        toast('Failed to load logs', 'error')
      }
      if (studentsRes.status === 'fulfilled') {
        const list = Array.isArray(studentsRes.value.data) ? studentsRes.value.data : studentsRes.value.data.results || []
        setStudents(list)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openReview(log) {
    setSelectedLog(log)
    setComment(log.supervisor_comment || '')
  }

  async function handleReview() {
    if (!comment.trim()) {
      toast('Please add a comment before marking as reviewed', 'warning')
      return
    }
    setReviewing(true)
    try {
      await supervisorAPI.reviewLog(selectedLog.id, {
        supervisor_comment: comment,
        status: 'reviewed'
      })
      toast('Log reviewed successfully')
      setSelectedLog(null)
      fetchData()
    } catch {
      toast('Failed to submit review', 'error')
    } finally {
      setReviewing(false)
    }
  }

  async function handleSaveComment() {
    setReviewing(true)
    try {
      await supervisorAPI.reviewLog(selectedLog.id, { supervisor_comment: comment })
      toast('Comment saved')
      setSelectedLog(null)
      fetchData()
    } catch {
      toast('Failed to save comment', 'error')
    } finally {
      setReviewing(false)
    }
  }

  const filtered = logs.filter(log => {
    const matchStudent = studentFilter === 'all' || String(log.student?.id || log.student) === studentFilter
    const matchStatus = statusFilter === 'all' || log.status === statusFilter
    return matchStudent && matchStatus
  })

  const stats = {
    submitted: logs.filter(l => l.status === 'submitted').length,
    reviewed: logs.filter(l => l.status === 'reviewed').length,
    total: logs.length,
  }

  const uniqueStudents = students.length > 0 ? students : [
    ...new Map(logs.map(l => {
      const s = l.student_detail || l.student_info || {}
      return [l.student?.id || l.student, { id: l.student?.id || l.student, name: s.full_name || s.username || `Student ${l.student}` }]
    })).values()
  ]

  return (
    <PageLayout>
      <Navbar title="ILES" subtitle="Supervisor Portal" />

      <PageBody>
        <div className="fade-in">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#1A1714', letterSpacing: '-0.8px' }}>
              Log Reviews
            </h1>
            <p style={{ color: '#9A938D', fontSize: 14, marginTop: 4 }}>
              Review submitted internship logs and provide feedback to students
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: '2rem' }}>
            {[
              { label: 'Total Logs', value: stats.total, color: '#1A6FA8', bg: '#E8F4FD' },
              { label: 'Awaiting Review', value: stats.submitted, color: '#B5882A', bg: '#FDF3DC' },
              { label: 'Reviewed', value: stats.reviewed, color: '#1B4332', bg: '#D8EDDF' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: 12, padding: '1rem 1.25rem',
                border: `1px solid ${s.color}20`
              }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 4 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, color: '#9A938D', whiteSpace: 'nowrap' }}>Filter by student:</label>
                <Select
                  value={studentFilter}
                  onChange={e => setStudentFilter(e.target.value)}
                  style={{ maxWidth: 220 }}
                >
                  <option value="all">All Students</option>
                  {uniqueStudents.map(s => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name || s.username || s.full_name || `Student ${s.id}`}
                    </option>
                  ))}
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, color: '#9A938D', whiteSpace: 'nowrap' }}>Status:</label>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ maxWidth: 180 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                </Select>
              </div>
              <Btn variant="secondary" size="sm" onClick={fetchData}>Refresh</Btn>
            </div>
          </Card>

          {/* Log Cards / Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No logs to review"
              description="When students submit their logs, they'll appear here for your review."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(log => {
                const student = log.student_detail || log.student_info || {}
                const studentName = student.full_name || student.username ||
                  (log.student?.username) || `Student #${log.student?.id || log.student}`
                return (
                  <Card key={log.id} style={{ transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{
                            width: 36, height: 36, background: '#D8EDDF', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1B4332'
                          }}>
                            {log.week_number}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1714' }}>
                              Week {log.week_number}
                            </div>
                            <div style={{ fontSize: 13, color: '#9A938D' }}>
                              {log.date ? new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </div>
                          </div>
                          <StatusBadge status={log.status} />
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', background: '#E8F4FD',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 600, color: '#185FA5'
                            }}>
                              {studentName[0]?.toUpperCase() || 'S'}
                            </div>
                            <span style={{ fontSize: 13, color: '#5A5450', fontWeight: 500 }}>{studentName}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#5A5450', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 500 }}>Activities: </span>
                          {log.activities_performed?.substring(0, 120) || '—'}
                          {log.activities_performed?.length > 120 ? '…' : ''}
                        </div>

                        {log.supervisor_comment && (
                          <div style={{
                            marginTop: 8, padding: '8px 12px',
                            background: '#D8EDDF', borderRadius: 6, fontSize: 13, color: '#1B4332'
                          }}>
                            <strong>Your comment:</strong> {log.supervisor_comment.substring(0, 100)}
                            {log.supervisor_comment.length > 100 ? '…' : ''}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <Btn variant="primary" size="sm" onClick={() => openReview(log)}>
                          {log.status === 'reviewed' ? 'View / Edit' : 'Review Log'}
                        </Btn>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </PageBody>

      {/* Review Modal */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Reviewing — Week ${selectedLog.week_number}` : ''}
        width={680}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Student & Meta */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Week', value: selectedLog.week_number },
                { label: 'Date', value: selectedLog.date ? new Date(selectedLog.date).toLocaleDateString('en-GB') : '—' },
                { label: 'Status', value: <StatusBadge status={selectedLog.status} /> },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#F0EDE8', borderRadius: 8, padding: '8px 14px', minWidth: 100
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9A938D', letterSpacing: '0.4px', marginBottom: 2 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1714' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Log sections */}
            {[
              { title: 'Activities Performed', content: selectedLog.activities_performed, color: '#1A6FA8', bg: '#E8F4FD' },
              { title: 'Skills Gained', content: selectedLog.skills_gained, color: '#1B4332', bg: '#D8EDDF' },
              { title: 'Challenges Faced', content: selectedLog.challenges_faced, color: '#B5882A', bg: '#FDF3DC' },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: '0.4px', marginBottom: 6 }}>
                  {s.title.toUpperCase()}
                </div>
                <div style={{
                  background: s.bg, borderRadius: 8, padding: '12px 14px',
                  fontSize: 14, color: '#1A1714', lineHeight: 1.65, whiteSpace: 'pre-wrap'
                }}>
                  {s.content || <em style={{ color: '#9A938D' }}>Not provided</em>}
                </div>
              </div>
            ))}

            {/* Comment */}
            <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '1rem' }}>
              <Field
                label="Your Feedback / Comments"
                required
                hint="Provide constructive feedback to guide the student's learning"
              >
                <Textarea
                  rows={5}
                  placeholder="Write your feedback here. Acknowledge strengths, suggest improvements, and ask follow-up questions if needed…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </Field>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setSelectedLog(null)}>Cancel</Btn>
              <Btn variant="secondary" loading={reviewing} onClick={handleSaveComment}>
                Save Comment
              </Btn>
              {selectedLog.status !== 'reviewed' && (
                <Btn variant="primary" loading={reviewing} onClick={handleReview}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mark as Reviewed
                </Btn>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  )
}
