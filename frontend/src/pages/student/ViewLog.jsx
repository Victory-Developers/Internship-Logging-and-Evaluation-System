import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Btn, StatusBadge, Spinner } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function StudentViewLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    api.get(ENDPOINTS.MY_LOG_DETAIL(id))
      .then(res => setLog(res.data))
      .catch(() => toast('Failed to load log details. Please try again.'));

    api.get(ENDPOINTS.LOG_COMMENTS(id))
      .then(res => setComments(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch(() => {});
  }, [id]);

  if (!log) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/student/logs')} style={{ marginBottom: 8 }}>
            &larr; Back to Logs
          </Btn>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700 }}>
            Week {log.week_number}
          </h1>
        </div>
        <StatusBadge status={log.status} />
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Period">
              <div style={detailStyle}>{formatDate(log.start_date)} — {formatDate(log.end_date)}</div>
            </Field>
            <Field label="Submitted">
              <div style={detailStyle}>{formatDate(log.submitted_at)}</div>
            </Field>
          </div>

          <Field label="Activities">
            <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{log.activities || '—'}</div>
          </Field>
          {log.learning && (
            <Field label="Learning Outcomes">
              <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{log.learning}</div>
            </Field>
          )}
          {log.challenges && (
            <Field label="Challenges">
              <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{log.challenges}</div>
            </Field>
          )}
          {log.next_week && (
            <Field label="Plans for Next Week">
              <div style={{ ...detailStyle, whiteSpace: 'pre-wrap' }}>{log.next_week}</div>
            </Field>
          )}

          {/* Supervisor comments */}
          {comments.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#5A5450', marginBottom: 8 }}>
                Supervisor Comments
              </div>
              {comments.map((c, i) => (
                <div key={c.id || i} style={{
                  padding: '10px 12px',
                  background: '#F0EDE8',
                  borderRadius: 8,
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 12, color: '#9A938D', marginBottom: 4 }}>
                    {c.author?.full_name || 'Supervisor'} — {formatDate(c.created_at)}
                  </div>
                  <div style={{ fontSize: 14, color: '#1A1714', whiteSpace: 'pre-wrap' }}>{c.content || c.comment}</div>
                </div>
              ))}
            </div>
          )}

          {log.status === 'draft' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="primary" onClick={() => navigate(`/student/logs/${id}/edit`)}>Edit Log</Btn>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

const detailStyle = {
  padding: '8px 12px',
  background: 'var(--surface-container-low)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  color: 'var(--on-surface)',
};