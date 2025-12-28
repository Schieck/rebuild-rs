import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Paper, Chip } from "@mui/material";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { needsMapping } from "../utils/needsMapping";
import { statusMapping } from "../utils/statusMapping";

function MainPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    completed: 0,
    citiesServed: 0,
    totalPeople: 0,
    needsBreakdown: {},
    statusBreakdown: {},
    timeline: [],
  });


  const fetchMemorialData = useCallback(async () => {
    try {
      const citiesRef = collection(db, "cities");
      const citiesQuery = query(citiesRef);
      const citiesSnapshot = await getDocs(citiesQuery);

      let completedCount = 0;
      let totalCount = 0;
      let totalPeople = 0;
      const needsBreakdown = {};
      const statusBreakdown = { triage: 0, inProgress: 0, done: 0, cancelled: 0 };

      await Promise.all(
        citiesSnapshot.docs.map(async (cityDoc) => {
          const markersRef = collection(db, `cities/${cityDoc.id}/markers`);
          const markersSnapshot = await getDocs(markersRef);

          markersSnapshot.docs.forEach((doc) => {
            const marker = doc.data();
            totalCount++;
            
            // Count completed and people helped (only from completed requests)
            if (marker.status === "done") {
              completedCount++;
              // Only count people from completed requests
              totalPeople += (marker.adults || 0) + (marker.kids || 0) + (marker.elderly || 0);
            }

            // Count status
            if (statusBreakdown[marker.status] !== undefined) {
              statusBreakdown[marker.status]++;
            }

            // Count needs
            if (marker.needs) {
              Object.keys(marker.needs).forEach((need) => {
                if (marker.needs[need]) {
                  needsBreakdown[need] = (needsBreakdown[need] || 0) + 1;
                }
              });
            }
          });
        })
      );

      setStats({
        totalRequests: totalCount,
        completed: completedCount,
        citiesServed: citiesSnapshot.size,
        totalPeople,
        needsBreakdown,
        statusBreakdown,
      });
    } catch (error) {
      console.error("Failed to fetch memorial data:", error);
    }
  }, []);

  useEffect(() => {
    if (db) {
      fetchMemorialData();
    }
  }, [fetchMemorialData]);

  const topNeeds = Object.entries(stats.needsBreakdown || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        {/* Header */}
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Memorial Enchentes RS 2024
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Um registro do esforço humanitário que uniu comunidades durante a
              crise das enchentes no Rio Grande do Sul.
            </Typography>
          </Box>
        </Grid>

        {/* Main Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h3" color="primary" gutterBottom>
                {stats.totalRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pedidos de Ajuda
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h3" color="success.main" gutterBottom>
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atendimentos Concluídos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h3" color="secondary.main" gutterBottom>
                {stats.citiesServed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Municípios Atendidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h3" color="info.main" gutterBottom>
                {stats.totalPeople}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pessoas Ajudadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution by Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Distribuição por Status
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
                <Grid item xs={6} key={status}>
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    {statusMapping[status]?.icon}
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {statusMapping[status]?.label || status}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Top Needs */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Necessidades Mais Solicitadas
            </Typography>
            <Box sx={{ mt: 2 }}>
              {topNeeds.map(([need, count]) => (
                <Box
                  key={need}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    p: 1.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {needsMapping[need]?.icon}
                    <Typography variant="body1">
                      {needsMapping[need]?.label || need}
                    </Typography>
                  </Box>
                  <Chip label={count} color="primary" size="small" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Impact Message */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              Impacto da Solidariedade
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Durante a crise das enchentes de 2024, nossa comunidade se uniu para
              ajudar {stats.totalPeople} pessoas em {stats.citiesServed} municípios.
              Foram {stats.totalRequests} pedidos de ajuda, com {stats.completed} atendimentos
              concluídos. Este memorial preserva a história deste esforço coletivo.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainPage;
