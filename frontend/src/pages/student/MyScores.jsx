import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Alert, Skeleton, Chip } from "@mui/material";
import { getMyScores } from "../../api/evaluations";

function ScoreRow({ label, score }) {
  const color = score >= 8 ? "success" : score >= 6 ? "warning" : "error";
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{score}/10</Typography>
      </Box>
      <LinearProgress variant="determinate" value={score * 10} color={color} sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  );
}

export default function MyScores() {
  const [scores, setScores]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    getMyScores()
      .then((res) => setScores(res.data))
      .catch((err) => {
        if (err.response?.status !== 404) setError("Failed to load scores.");
      })
      .finally(() => setLoading(false));
  }, []);

  const combined = scores ? ((scores.workplace_avg + scores.academic_avg) / 2).toFixed(2) : null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>My Evaluation Scores</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Performance and academic grades from your supervisors
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      ) : scores ? (
        <>
          <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Workplace Supervisor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{scores.workplace_supervisor}</Typography>
                {scores.workplace?.map(({ label, score }) => <ScoreRow key={label} label={label} score={score} />)}
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Average: {scores.workplace_avg}/10</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Academic Supervisor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{scores.academic_supervisor}</Typography>
                {scores.academic?.map(({ label, score }) => <ScoreRow key={label} label={label} score={score} />)}
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Average: {scores.academic_avg}/10</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          {combined && (
            <Card sx={{ mt: 3, textAlign: "center" }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {combined}<Typography component="span" variant="body1">/10</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">Combined Average</Typography>
                <Chip
                  label={combined >= 8 ? "Good Standing - Keep it up!" : "Needs Improvement"}
                  color={combined >= 8 ? "success" : "warning"}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No scores available yet. Scores will appear once your supervisors submit evaluations.</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}