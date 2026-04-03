import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Alert, Skeleton, Chip } from "@mui/material";
import { getMyPlacement } from "../../api/placements";

export default function MyPlacement() {
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    getMyPlacement()
      .then((res) => setPlacement(res.data))
      .catch((err) => {
        if (err.response?.status !== 404) setError("Failed to load placement.");
      })
      .finally(() => setLoading(false));
  }, []);

  const currentWeek = placement?.current_week ?? 0;
  const totalWeeks  = placement?.duration_weeks ?? 16;
  const progress    = totalWeeks ? Math.round((currentWeek / totalWeeks) * 100) : 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>My Placement</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Details of your current internship placement</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} /> : placement ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{placement.company}</Typography>
              <Chip label="Active" color="success" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{placement.job_title}</Typography>
            {[
              { label: "Job Title",     value: placement.job_title },
              { label: "Start Date",    value: placement.start_date },
              { label: "End Date",      value: placement.end_date },
              { label: "WP Supervisor", value: placement.workplace_supervisor_name },
              { label: "AC Supervisor", value: placement.academic_supervisor_name },
              { label: "Duration",      value: `${totalWeeks} Weeks` },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? "-"}</Typography>
              </Box>
            ))}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography variant="body2" color="text.secondary">Progress - Week {currentWeek} of {totalWeeks}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No placement assigned yet. Please contact your administrator.</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}