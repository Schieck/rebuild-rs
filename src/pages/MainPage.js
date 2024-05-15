import React, { useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, Grid, Divider, Dialog } from "@mui/material";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import HelpMap from "../components/ui/HelpMap";
import { TypeAnimation } from "react-type-animation";
import { keyframes } from "@emotion/react";
import { debounce } from "lodash";
import CitySelectionModal from "../components/modals/CitySelectionModal";
import LoginForm from "../components/common/LoginForm";
import { useAuth } from "../services/AuthProvider";
import { useNavigate } from "react-router-dom";

const singlePop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

function MainPage() {
  const [allRequests, setAllRequests] = useState([]);
  const [showName, setShowName] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("helpedmap");
  const [loginOpen, setLoginOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -29.6488, lng: -53.2517 }); // Default to a fallback location
  const [mapBounds, setMapBounds] = useState(null);
  const navigate = useNavigate();
  const user = useAuth();

  const handleCloseModal = () => setIsModalOpen(false);
  const handleLoginCancel = () => setLoginOpen(false);
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (user && user.role !== "helping") {
      navigate(`/${user.role}`);
    }
  };

  function haversineDistance(coords1, coords2) {
    function toRad(x) {
      return (x * Math.PI) / 180;
    }

    var lon1 = coords1.lng;
    var lat1 = coords1.lat;

    var lon2 = coords2.lng;
    var lat2 = coords2.lat;

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
  }

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
  const handleVolunteer = () => setIsModalOpen(true);
  const handleLoginClick = () => setLoginOpen(true);

  const debouncedHandleShowText = debounce(
    (showText) => setShowName(showText),
    200
  );

  const handleMouseEnter = () => debouncedHandleShowText(true);
  const handleMouseLeave = () => debouncedHandleShowText(false);

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
      <Grid container justifyContent="space-between" alignItems="center" mb={4}>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/icons/logo-nova.png"
            alt="Logo"
            style={{ maxWidth: "80px" }}
          />
          <Typography
            variant="h1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {showName ? (
              <TypeAnimation sequence={["Reconstrói RS"]} repeat={1} />
            ) : (
              "RS"
            )}
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="warning" onClick={handleLoginClick}>
            Prefeituras
          </Button>
        </Grid>
      </Grid>

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
