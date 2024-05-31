import React, { useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, Grid, Divider, Dialog } from "@mui/material";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import HelpMap from "../components/ui/HelpMap";
import { TypeAnimation } from "react-type-animation";
import { keyframes } from "@emotion/react";
import CitySelectionModal from "../components/modals/CitySelectionModal";
import LoginForm from "../components/common/LoginForm";
import { useAuth } from "../services/AuthProvider";
import { useNavigate } from "react-router-dom";
import { haversineDistance } from "../utils/utils";
import PublicHeader from "../components/common/PublicHeader";

const singlePop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

function MainPage() {
  const checkUrlForHash = () => {
    const hash = window.location.hash;
    return {
      needHelp: hash.includes("#needHelp"),
      cityHallAccess: hash.includes("#cityHallAccess"),
    };
  };

  const { needHelp, cityHallAccess } = checkUrlForHash();
  const [allRequests, setAllRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("helpedmap");
  const [loginOpen, setLoginOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -29.6488, lng: -53.2517 }); // Default to a fallback location
  const [mapBounds, setMapBounds] = useState(null);
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const { needHelp, cityHallAccess } = checkUrlForHash();
      setIsModalOpen(needHelp);
      setLoginOpen(cityHallAccess);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleCloseModal = () => setIsModalOpen(false);
  const handleLoginCancel = () => setLoginOpen(false);
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (user && user.role !== "helping") {
      navigate(`/${user.role}`);
    }
  };

  const fetchCitiesInRange = useCallback(async (center) => {
    try {
      console.log("updating cities");
      const citiesRef = collection(db, "cities");
      const citiesQuery = query(citiesRef);
      const citiesSnapshot = await getDocs(citiesQuery);

      let newRequests = [];

      let cityArray = citiesSnapshot.docs.map((cityDoc) => {
        const city = cityDoc.data();

        return {
          id: cityDoc.id,
          lat: city.lat,
          lng: city.lng,
          total: 0,
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

      setAllRequests(newRequests);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  }, []);

  useEffect(() => {
    const initialCenter = {
      lat: -29.6488,
      lng: -53.2517,
    };

    if (db) {
      fetchCitiesInRange(15, undefined, initialCenter);
    } else {
      console.log("Database not initialized");
    }
  }, [fetchCitiesInRange]);

  const handleRequestHelp = () => setIsModalOpen(true);
  const handleVolunteer = () => {
    navigate("todos/public-help");
  };
  const handleLoginClick = () => setLoginOpen(true);

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

  useEffect(() => {
    if (db) {
      fetchCitiesInRange(15, mapBounds, mapCenter);
    } else {
      console.log("Database not initialized");
    }
  }, [mapCenter, mapBounds]);

  const handleMapChange = useCallback(
    (zoom, bounds, center) => {
      setMapBounds(bounds);
      fetchCitiesInRange(center, bounds);
    },
    [fetchCitiesInRange]
  );

  return (
    <Box p={4}>
      <PublicHeader cityHallAccess={cityHallAccess} />
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={5}>
          <Box mb={4}>
            <Typography
              variant="h4"
              style={{ paddingLeft: "5rem" }}
              gutterBottom
            >
              Para
              <br />
              Quem
              <br />
              <TypeAnimation
                sequence={[
                  " Precisa de ajuda.",
                  1000,
                  " Quer ajudar.",
                  1000,
                  " Gerencia.",
                  1000,
                ]}
                style={{ fontWeight: "bold" }}
                repeat={Infinity}
              />
            </Typography>

            <Divider style={{ margin: "20px 0" }} />

            <Box
              mt={5}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => {
                  setModalMode("helpedmap");
                  handleRequestHelp();
                }}
                sx={{
                  mx: { xs: 0, md: 2 },
                  mb: { xs: 2, md: 0 },
                  animation: `${singlePop} 1s ease-in-out`,
                  animationIterationCount: 3,
                  height: "4rem",
                }}
              >
                Preciso de Ajuda
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => {
                  setModalMode("public-help");
                  handleVolunteer();
                }}
                sx={{
                  mx: { xs: 0, md: 2 },
                  animation: `${singlePop} 1s ease-in-out`,
                  animationIterationCount: 3,
                  animationDelay: "3s",
                  height: "4rem",
                }}
              >
                Quero Ajudar
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box height="60vh">
            <HelpMap
              requests={allRequests}
              onMapChange={handleMapChange}
              onCitySelect={() => {}}
              externalMapCenter={mapCenter}
              initialMapZoom={8}
            />
          </Box>
        </Grid>
      </Grid>

      <CitySelectionModal
        mode={modalMode}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      <Dialog open={loginOpen} onClose={handleLoginCancel}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
          hideRegister={true}
        />
      </Dialog>
    </Box>
  );
}

export default MainPage;
