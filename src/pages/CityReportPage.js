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
import { Bar, Doughnut } from "react-chartjs-2";
import { useParams, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
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
  BarElement
);

const primaryColor = "#FF6384"; // Red shade from logo
const secondaryColor = "#36A2EB"; // Yellow shade from logo
const tertiaryColor = "#FFCE56"; // Green shade from logo

const CityReportPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("America/Sao_Paulo").format("YYYY-MM-DD")
  );
  const { citySlug } = useParams();
  const db = getFirestore();

  const navigate = useNavigate();

  const fetchData = async () => {
    const dayStart = dayjs(selectedDate)
      .tz("America/Sao_Paulo")
      .startOf("day")
      .toDate();
    const dayEnd = dayjs(selectedDate)
      .tz("America/Sao_Paulo")
      .add(1, "day")
      .startOf("day")
      .toDate();

    const markersQuery = query(
      collection(db, `cities/${citySlug}/markers`),
      where("createdAt", ">=", dayStart),
      where("createdAt", "<", dayEnd)
    );
    const querySnapshot = await getDocs(markersQuery);
    const markersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: dayjs(doc.data().createdAt.toDate())
        .tz("America/Sao_Paulo")
        .format("HH:mm:ss"),
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
  }, [db, citySlug, selectedDate]);

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
            `relatorio-reconstroirs-${dayjs(selectedDate).format(
              "DD-MM-YYYY"
            )}.pdf`
          );
        }
      );
    }, 200);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "white" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" gutterBottom color="text.primary">
          Relatório de Pedidos{" "}
          <TextField
            label="Data"
            type="date"
            defaultValue={selectedDate}
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
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  display: { xs: "none", md: "block" },
                  height: "50vh",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <HelpMap
                  notShowSearch={true}
                  requests={data}
                  onMapChange={fetchData}
                  initialMapZoom={8}
                  externalMapCenter={mapCenter}
                />
              </Paper>
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
                      )}`}
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
