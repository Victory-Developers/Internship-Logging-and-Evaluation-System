import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Field, Textarea, Btn, StatusBadge, Spinner } from '../../components/UI';

const formatDate = (s) => s
  ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export default function WorkplaceReviewLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.get(`${ENDPOINTS.WP_LOGS}${id}/`)
      .then(res => setLog(res.data))
      .catch(() => {
        // Systemic routing and retrieval anomalies are handled by the global HTTP interceptor.
      });

    api.get(ENDPOINTS.LOG_COMMENTS(id))
      .then(res => setComments(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch(() => {});
  }, [id]);

  const handleReview = async (action) => {
    if (action === 'reject' && !comment.trim()) {
      toast.warning('Mandatory commentary required for rejection payload.');
      return;
    }
    setReviewing(true);
    try {
      const payload = { action };
      if (comment.trim()) payload.comment = comment;
      await api.post(ENDPOINTS.WP_LOG_REVIEW(id), payload);
      toast.success(`Activity log status successfully mutated to: ${action}.`);
      navigate('/workplace/logs');
    } catch (err) {
      // Systemic routing errors handled by the global HTTP interceptor.
    } finally {
      setReviewing(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(ENDPOINTS.LOG_COMMENTS(id), { content: comment });
      setComments(prev => [...prev, res.data]);
      setComment('');
      toast.success('Supervisory commentary successfully appended to the central registry.');
    } catch {
      // Systemic routing errors handled by the global HTTP interceptor.
    } finally {
      setPosting(false);
    }
  };

  if (!log) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Btn variant="ghost" size="sm" onClick={() => navigate('/workplace/logs')} style={{ marginBottom: 8 }}>
        &larr; Back to Logs
      </Btn>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700 }}>
          Week {log.week_number} — {log.student?.full_name || ''}
        </h1>
        <StatusBadge status={log.status} />
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
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
        </div>
      </Card>

      {/* Comments */}
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#1A1714' }}>Comments & Review</h2>

        {comments.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {comments.map((c, i) => (
              <div key={c.id || i} style={{
                padding: '10px 12px', background: '#F0EDE8', borderRadius: 8, marginBottom: 8,
              }}>
                <div style={{ fontSize: 12, color: '#9A938D', marginBottom: 4 }}>
                  {c.author?.full_name || 'Supervisor'} — {formatDate(c.created_at)}
                </div>
                <div style={{ fontSize: 14, color: '#1A1714', whiteSpace: 'pre-wrap' }}>{c.content || c.comment}</div>
              </div>
            ))}
          </div>
        )}

        <Field label="Add Comment">
          <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Write your comment..." />
        </Field>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <Btn variant="ghost" onClick={handleComment} loading={posting} disabled={!comment.trim()}>
            Post Comment Only
          </Btn>
          {log.status === 'submitted' && (
            <>
              <Btn variant="danger" onClick={() => handleReview('reject')} loading={reviewing}>
                Reject
              </Btn>
              <Btn variant="primary" onClick={() => handleReview('approve')} loading={reviewing}>
                Approve
              </Btn>
            </>
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