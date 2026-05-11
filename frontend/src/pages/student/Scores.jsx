import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/config';
import { Card, Spinner, EmptyState } from '../../components/UI';

export default function StudentScores() {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.MY_SCORES)
      .then(res => setScores(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner /></div>;
  }

  if (!scores || (!scores.workplace && !scores.academic)) {
    return (
      <EmptyState
        title="No evaluations yet"
        description="Your supervisors have not submitted evaluations yet. Check back later."
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 700, marginBottom: '1.5rem' }}>
        My Evaluation Scores
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {scores.workplace && (
          <Card>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#1A1714' }}>
              Workplace Evaluation
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <ScoreRow label="Professionalism" value={scores.workplace.professionalism} />
              <ScoreRow label="Technical Skills" value={scores.workplace.technical_skills} />
              <ScoreRow label="Communication" value={scores.workplace.communication} />
              <ScoreRow label="Punctuality" value={scores.workplace.punctuality} />
            </div>
            {scores.workplace.average != null && (
              <div style={{ marginTop: '1rem', padding: '10px 12px', background: '#D8EDDF', borderRadius: 8, fontWeight: 600, color: '#1B4332', fontSize: 15 }}>
                Average: {Number(scores.workplace.average).toFixed(1)} / 10
              </div>
            )}
          </Card>
        )}

        {scores.academic && (
          <Card>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem', color: '#1A1714' }}>
              Academic Evaluation
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <ScoreRow label="Quality of Work" value={scores.academic.quality_of_work} />
              <ScoreRow label="Internship Report" value={scores.academic.internship_report} />
              <ScoreRow label="Problem Solving" value={scores.academic.problem_solving} />
              <ScoreRow label="Learning Outcomes" value={scores.academic.learning_outcomes} />
            </div>
            {scores.academic.average != null && (
              <div style={{ marginTop: '1rem', padding: '10px 12px', background: '#D8EDDF', borderRadius: 8, fontWeight: 600, color: '#1B4332', fontSize: 15 }}>
                Average: {Number(scores.academic.average).toFixed(1)} / 10
              </div>
            )}
          </Card>
        )}

        {scores.combined_average != null && (
          <Card style={{ background: '#1A1714' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ fontSize: 13, color: '#9A938D', marginBottom: 4 }}>Combined Average</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#fff' }}>
                {Number(scores.combined_average).toFixed(1)} / 10
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div style={{ padding: '8px 12px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ fontSize: 12, color: '#9A938D' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1714' }}>
        {value != null ? `${value} / 10` : '—'}
      </div>
    </div>
  );
}