import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import HelpMap from "../components/ui/HelpMap";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { needsMapping } from "../utils/needsMapping";
import { statusMapping } from "../utils/statusMapping";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

dayjs.extend(utc);
dayjs.extend(timezone);

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  PointElement
);

const primaryColor = "#FF6384"; // Red shade from logo
const secondaryColor = "#36A2EB"; // Yellow shade from logo
const tertiaryColor = "#FFCE56"; // Green shade from logo

const CityReportPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: dayjs().tz("America/Sao_Paulo").format("YYYY-MM-DD"),
    end: dayjs().tz("America/Sao_Paulo").format("YYYY-MM-DD"),
  });
  const { citySlug } = useParams();
  const db = getFirestore();

  const navigate = useNavigate();

  const fetchData = async () => {
    const dayStart = dayjs(selectedDateRange.start)
      .tz("America/Sao_Paulo")
      .startOf("day")
      .toDate();
    const dayEnd = dayjs(selectedDateRange.end)
      .tz("America/Sao_Paulo")
      .endOf("day")
      .toDate();

    const markersQuery = query(
      collection(db, `cities/${citySlug}/markers`),
      where("createdAt", ">=", dayStart),
      where("createdAt", "<=", dayEnd)
    );
    const querySnapshot = await getDocs(markersQuery);
    const markersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: dayjs(doc.data().createdAt.toDate())
        .tz("America/Sao_Paulo")
        .format("DD/MM/YYYY HH:mm:ss"),
    }));
    setData(markersData);
    setLoading(false);
  };

  useEffect(() => {
    const fetchCityDetails = async () => {
      if (!citySlug) return;
      const cityRef = doc(db, "cities", citySlug);
      const cityDoc = await getDoc(cityRef);
      if (cityDoc.exists()) {
        const cityData = cityDoc.data();
        setMapCenter({ lat: cityData.lat, lng: cityData.lng });
      }
    };

    fetchCityDetails();
    fetchData();
  }, [db, citySlug, selectedDateRange]);

  const computeStats = (markers) => {
    const stats = {
      totalNeeds: {},
      statusCount: {},
      urgencyLevels: {
        high: 0,
        medium: 0,
        low: 0,
      },
      numMarkers: markers.length,
      totalAdults: 0,
      totalKids: 0,
      totalElderly: 0,
      totalPCD: 0,
      totalCityHallVerified: 0,
      timeSeries: {},
    };

    markers.forEach((marker) => {
      Object.entries(marker.needs).forEach(([key, value]) => {
        if (value) {
          stats.totalNeeds[key] = (stats.totalNeeds[key] || 0) + 1;
        }
      });
      stats.statusCount[marker.status] =
        (stats.statusCount[marker.status] || 0) + 1;
      stats.urgencyLevels.high += marker.needs.medicalAid ? 1 : 0;
      stats.urgencyLevels.medium += marker.needs.familyShelter ? 1 : 0;
      stats.urgencyLevels.low += marker.needs.foodWater ? 1 : 0;

      stats.totalAdults += Number(marker.adults) || 0;
      stats.totalKids += Number(marker.kids) || 0;
      stats.totalElderly += Number(marker.elderly) || 0;
      stats.totalPCD += marker.pcd ? 1 : 0;
      stats.totalCityHallVerified += marker.isCityHall ? 1 : 0;

      const date = marker.createdAt.split(" ")[0];
      stats.timeSeries[date] = (stats.timeSeries[date] || 0) + 1;
    });
    return stats;
  };
  const stats = computeStats(data);

  const statusChartData = {
    labels: Object.keys(stats.statusCount).map(
      (key) => statusMapping[key]?.label
    ),
    datasets: [
      {
        data: Object.values(stats.statusCount),
        backgroundColor: Object.keys(stats.statusCount).map(
          (key) => statusMapping[key]?.hexColor
        ),
      },
    ],
  };

  const chartData = {
    labels: Object.keys(stats.totalNeeds).map(
      (key) => needsMapping[key]?.label
    ),
    datasets: [
      {
        label: "Número de pedidos",
        data: Object.values(stats.totalNeeds),
        backgroundColor: [primaryColor, secondaryColor, tertiaryColor],
        borderColor: "black",
        borderWidth: 1,
      },
    ],
  };

  const timeSeriesData = {
    labels: Object.keys(stats.timeSeries),
    datasets: [
      {
        label: "Pedidos por Dia",
        data: Object.values(stats.timeSeries),
        fill: false,
        borderColor: primaryColor,
        tension: 0.1,
      },
    ],
  };

  const downloadPDF = () => {
    setTimeout(() => {
      const input = document.getElementById("report-content");

      html2canvas(input, { scale: 2, useCORS: true, logging: true }).then(
        (canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
          pdf.save(
            `relatorio-reconstroirs-${dayjs(selectedDateRange.start).format(
              "DD-MM-YYYY"
            )}_to_${dayjs(selectedDateRange.end).format("DD-MM-YYYY")}.pdf`
          );
        }
      );
    }, 200);
  };

  const handleDateChange = (event) => {
    setSelectedDateRange((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "white" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" gutterBottom color="text.primary">
          Relatório de Pedidos{" "}
          <TextField
            label="Data Inicial"
            type="date"
            name="start"
            defaultValue={selectedDateRange.start}
            onChange={handleDateChange}
            sx={{ mb: 2, ml: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final"
            type="date"
            name="end"
            defaultValue={selectedDateRange.end}
            onChange={handleDateChange}
            sx={{ mb: 2, ml: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </Typography>
        <Button
          onClick={downloadPDF}
          variant="outlined"
          sx={{ margin: "1rem" }}
        >
          Baixar
          <DownloadIcon />
        </Button>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress
            size={50}
            thickness={5}
            sx={{ color: primaryColor }}
          />
          <Typography sx={{ marginLeft: 2 }}>Carregando...</Typography>
        </Box>
      ) : (
        <div id="report-content">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  height: "50vh",
                  padding: "1rem",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Typography variant="h6">Necessidades</Typography>
                <Box width={"90%"} height={"80%"}>
                  <Bar
                    data={chartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  height: "50vh",
                  padding: "1rem",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Typography variant="h6">Status dos Pedidos</Typography>
                <Box width={"100%"} height={"80%"}>
                  <Doughnut
                    data={statusChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  height: "50vh",
                  padding: "1rem",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Typography variant="h6">Pedidos por Dia</Typography>
                <Box width={"100%"} height={"80%"}>
                  <Line
                    data={timeSeriesData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{
                  height: "auto",
                  padding: "1rem",
                  backgroundColor: "#f0f0f0",
                  marginBottom: "1rem",
                }}
              >
                <Typography variant="h6">
                  Estatísticas de Acompanhamento
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">
                      Total de Pedidos:
                    </Typography>
                    <Typography variant="h5">{stats.numMarkers}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">
                      Total de Adultos:
                    </Typography>
                    <Typography variant="h5">{stats.totalAdults}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">
                      Total de Crianças:
                    </Typography>
                    <Typography variant="h5">{stats.totalKids}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">
                      Total de Idosos:
                    </Typography>
                    <Typography variant="h5">{stats.totalElderly}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">Total de PCD:</Typography>
                    <Typography variant="h5">{stats.totalPCD}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle1">
                      Verificados pela Prefeitura:
                    </Typography>
                    <Typography variant="h5">
                      {stats.totalCityHallVerified}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid
              item
              sx={{
                width: "100%",
                height: "20rem",
              }}
            >
              <HelpMap
                notShowSearch={true}
                requests={data}
                onMapChange={fetchData}
                initialMapZoom={8}
                externalMapCenter={mapCenter}
              />
            </Grid>
            <Grid item xs={12}>
              <List dense>
                {data.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      marginBottom: 2,
                      backgroundColor: "#f0f0f0",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <ListItemText
                      primary={`${item.createdAt} - ${item.contact.substring(
                        0,
                        5
                      )}***`}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: "bold" }}
                      secondaryTypographyProps={{ color: "text.secondary" }}
                    />
                    <Chip
                      label={statusMapping[item.status]?.label || item.status}
                      color={statusMapping[item.status]?.color || "default"}
                      size="medium"
                    />
                    <ListItemIcon>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          navigate(`/${citySlug}/marker/${item.id}`)
                        }
                        sx={{ marginLeft: "auto" }}
                      >
                        Ver
                      </Button>
                    </ListItemIcon>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </div>
      )}
    </Box>
  );
};

export default CityReportPage;
