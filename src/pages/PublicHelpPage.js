import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Chip,
  Tooltip,
  useTheme,
  Divider,
  useMediaQuery,
  Dialog,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  VolunteerActivism as VolunteerActivismIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { needsMapping } from "../utils/needsMapping";
import { statusMapping } from "../utils/statusMapping";
import HelpMap from "../components/ui/HelpMap";
import { useAuth } from "../services/AuthProvider";
import LoginForm from "../components/common/LoginForm";
import HelpCommentModal from "../components/modals/HelpCommentModal";
import { showSuccessAlert } from "../utils/alerts";
import { haversineDistance } from "../utils/utils";
import { debounce } from "lodash";

const PublicHelpPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [helpTypeFilters, setHelpTypeFilters] = useState({
    cleanup: false,
    foodWater: false,
    reconstruction: false,
    medicalAid: false,
    temporaryShelter: false,
    familyShelter: false,
    clothCleanup: false,
    medicines: false,
    cloth: false,
    civilDefenseCheckup: false,
  });
  const db = getFirestore();
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const theme = useTheme();
  const [mapCenter, setMapCenter] = useState({ lat: -29.6488, lng: -53.2517 });
  const [mapBounds, setMapBounds] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [showHelpComment, setShowHelpComment] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(undefined);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        console.error("Geolocation is not supported by this browser.");
      }
    );
  }, []);

  const handleCitySelect = (newCitySlug) => {
    navigate(`/${newCitySlug}`);
  };

  const fetchCitiesInRange = useCallback(
    async (center) => {
      if (!db) return;

      try {
        let newRequests = [];
        if (citySlug === "todos") {
          const citiesRef = collection(db, "cities");
          const citiesQuery = query(citiesRef);
          const citiesSnapshot = await getDocs(citiesQuery);

          let cityArray = citiesSnapshot.docs.map((cityDoc) => {
            const city = cityDoc.data();

            return {
              id: cityDoc.id,
              lat: city.lat,
              lng: city.lng,
              distance: haversineDistance(
                { lat: center.lat, lng: center.lng },
                { lat: city.lat, lng: city.lng }
              ),
            };
          });

          cityArray.sort((a, b) => a.distance - b.distance);

          await Promise.all(
            cityArray.map(async (city) => {
              const markersRef = collection(db, `cities/${city.id}/markers`);
              const markersQuery = query(
                markersRef,
                where("status", "in", ["pending", "inProgress", "triage"])
              );
              const markersSnapshot = await getDocs(markersQuery);

              markersSnapshot.docs.forEach((doc) => {
                const marker = { id: doc.id, city: city.id, ...doc.data() };
                newRequests.push(marker);
              });
            })
          );
        } else {
          const markersRef = collection(db, `cities/${citySlug}/markers`);
          const markersQuery = query(
            markersRef,
            where("status", "in", ["pending", "inProgress", "triage"])
          );
          const markersSnapshot = await getDocs(markersQuery);
          markersSnapshot.docs.forEach((doc) => {
            newRequests.push({ id: doc.id, city: citySlug, ...doc.data() });
          });
        }
        setRequests(newRequests); // Update state once all data is fetched and processed
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    },
    [db, citySlug]
  );

  const handleHelp = (req) => {
    if (!user || !user.role) {
      setLoginOpen(true);
    } else {
      setShowHelpComment(true);
    }
  };

  const handleMapChange = useCallback(
    (zoom, bounds, center) => {
      setMapBounds(bounds);
      fetchCitiesInRange(center);
    },
    [fetchCitiesInRange]
  );

  useEffect(() => {
    if (db) {
      fetchCitiesInRange(mapCenter);
    } else {
      console.log("Database not initialized");
    }
  }, [mapCenter, mapBounds]);

  useEffect(() => {
    const q = query(
      collection(db, `cities/${citySlug}/markers`),
      where("status", "in", ["inProgress", "pending", "triage"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        city: citySlug,
        ...doc.data(),
      }));
      setRequests(data);
      setFilteredRequests(data);
    });

    return () => unsubscribe();
  }, [db, citySlug]);

  useEffect(() => {
    let result = requests.filter(
      (req) =>
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeHelpTypes = Object.keys(helpTypeFilters).filter(
      (key) => helpTypeFilters[key]
    );
    if (activeHelpTypes.length > 0) {
      result = result.filter((req) =>
        activeHelpTypes.some((type) => req.needs[type])
      );
    }

    setFilteredRequests(result);
  }, [searchQuery, helpTypeFilters, requests]);

  const handleFilterChange = (event) => {
    setHelpTypeFilters({
      ...helpTypeFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const handleShare = (req) => {
    const url = `${window.location.origin}/${citySlug}/marker/${req.id}`;
    const text = `Por favor, ajude com este pedido urgente!\n\nDescrição: ${req.description}\nContato: ${req.contact}\nMais informações aqui: ${url}`;
    if (navigator.share) {
      navigator.share({ title: "Pedido de Ajuda", text, url });
    } else {
      navigator.clipboard.writeText(text);
      alert("Informações copiadas para compartilhamento.");
    }
  };

  const openDetailsPage = (req) => {
    navigate(`/${req.city}/marker/${req.id}`);
  };

  const handleSendHelp = async (help) => {
    const commentsRef = collection(db, "comments");
    await addDoc(commentsRef, {
      text: help.text,
      markerId: selectedMarker.id,
      other: help.other,
      type: "helpSent",
      userId: user.uid,
      userName: user.name,
      selectedNeeds: help.selectedNeeds,
    });
    showSuccessAlert("Obrigado!", "Sua ajuda será muito bem-vinda.");
    navigate(`/${citySlug}/marker/${selectedMarker.id}`);
  };

  const handleLoginCancel = () => setLoginOpen(false);
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (user && user.role !== "helping") {
      navigate(`/${user.role}`);
    } else {
      setShowHelpComment(true);
    }
  };

  const renderNeeds = (needs) => (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {Object.keys(needs).map((need) =>
        needs[need] && needsMapping[need] ? (
          <Tooltip title={needsMapping[need].label} key={need}>
            <span>{needsMapping[need].icon}</span>
          </Tooltip>
        ) : null
      )}
    </Box>
  );

  const renderCityHallLabel = (isCityHall) => {
    if (isCityHall) {
      return (
        <Tooltip title="Este pedido foi criado e verificado pela prefeitura, recebendo um cuidado extra.">
          <Chip
            icon={<SecurityIcon />}
            color="primary"
            label={isMobile ? "Prefeitura" : "Verificado"}
          />
        </Tooltip>
      );
    }
    return null;
  };

  const needsList = Object.keys(selectedMarker?.needs || {})
    .filter((key) => selectedMarker.needs[key])
    .map((key) => ({
      key,
      label: needsMapping[key].label,
      icon: needsMapping[key].icon,
    }));

  const renderDescription = (description, isCityHall) => {
    const trimmedDescription =
      description.length > (isMobile ? 15 : 80)
        ? `${description.substring(0, isMobile ? 15 : 80)}...`
        : description;

    return (
      <>
        <React.Fragment>
          <Grid item xs={8}>
            {trimmedDescription}
          </Grid>
          <Grid item>{renderCityHallLabel(isCityHall)}</Grid>
        </React.Fragment>
      </>
    );
  };

  return (
    <Box m="2rem" height={"100vh"}>
      <Typography variant="h4" gutterBottom>
        Pedidos de Ajuda
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: "2rem",
          ...(isMobile ? { flexDirection: "column-reverse" } : {}),
        }}
      >
        <Box width="100%">
          <TextField
            variant="outlined"
            label="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
            margin="normal"
          />
          <FormGroup row>
            {Object.entries(needsMapping).map(([key, value]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={helpTypeFilters[key]}
                    onChange={handleFilterChange}
                    name={key}
                  />
                }
                label={value.label}
              />
            ))}
          </FormGroup>
          <Box sx={{ maxHeight: "50vh", overflow: "scroll" }}>
            {filteredRequests.map((req) => (
              <Card
                key={req.id}
                variant="outlined"
                sx={{
                  mb: 2,
                  borderLeft: `6px solid ${theme.palette.info.main}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: ".6rem",
                    }}
                  >
                    {renderDescription(req.description, req.isCityHall)}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>{renderNeeds(req.needs)}</Box>
                    <Typography>
                      <PhoneIcon fontSize="small" />
                      {" " +
                        `${req.contact?.substring(0, isMobile ? 3 : 15)}...`}
                    </Typography>
                    <Chip
                      label={statusMapping[req.status]?.label || req.status}
                      color={statusMapping[req.status]?.color || "default"}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <Divider variant="middle" />
                <CardActions>
                  <Button
                    variant="outlined"
                    onClick={() => handleShare(req)}
                    color="secondary"
                    startIcon={<SendIcon />}
                  >
                    Enviar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => openDetailsPage(req)}
                    startIcon={<VisibilityIcon />}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedMarker({ id: req.id, needs: req.needs });
                      handleHelp();
                    }}
                    color="primary"
                    startIcon={<VolunteerActivismIcon />}
                  >
                    Ajudar
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>

        <Box height={isMobile ? "40vh" : "80vh"} width={"100%"}>
          <HelpMap
            requests={filteredRequests}
            onCitySelect={handleCitySelect}
            onMapChange={handleMapChange}
            externalMapCenter={mapCenter}
          />
        </Box>
      </Box>

      <Dialog open={loginOpen} onClose={handleLoginCancel}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
          initialIsRegistration={true}
        />
      </Dialog>

      <HelpCommentModal
        open={showHelpComment}
        needs={needsList}
        onClose={() => setShowHelpComment(false)}
        onSendHelp={(help) => handleSendHelp(help)}
      />
    </Box>
  );
};

export default PublicHelpPage;
