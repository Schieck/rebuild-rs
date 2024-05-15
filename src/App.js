// src/App.js
import React, { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import theme from "./utils/theme";
import HelpedMapComponent from "./components/ui/HelpedMapComponent";
import AdminPanel from "./pages/AdminPanel";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import MenuOverlay from "./components/common/MenuOverlay";
import { LoadScript } from "@react-google-maps/api";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/common/Header";
import TriagePage from "./pages/TriagePage";
import ManagementMapPage from "./pages/ManagementMapPage";
import HelperPage from "./pages/HelperPage";
import PublicHelpPage from "./pages/PublicHelpPage";
import { AuthProvider, useAuth } from "./services/AuthProvider";
import MarkerDetailsPage from "./pages/MarkerDetailsPage";
import withRole from "./utils/withRole";
import RegisterCities from "./pages/RegisterCities";
import MainPage from "./pages/MainPage";
import CityReportPage from "./pages/CityReportPage";

import "./styles/App.css";
import Footer from "./components/common/Footer";
import AboutUs from "./pages/AboutUs";

const AdminPanelWithRole = withRole(AdminPanel, ["admin", "super"]);
const TriagePageWithRole = withRole(TriagePage, [
  "admin",
  "city_hall",
  "triage",
  "super",
]);
const ManagementMapPageWithRole = withRole(ManagementMapPage, [
  "management",
  "city_hall",
  "admin",
  "super",
]);
const HelperPageWithRole = withRole(HelperPage, [
  "admin",
  "super",
  "city_hall",
  "management",
]);
const CityReportPageWithRole = withRole(CityReportPage, [
  "management",
  "city_hall",
  "admin",
  "super",
]);
const RegisterCitiesWithRole = withRole(RegisterCities, ["super"]);

function App() {
  return (
    <AuthProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_KEY}
      >
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
          language="pt-br"
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <Router>
              <div style={{ minHeight: "100vh" }}>
                <Header />
                <Routes>
                  <Route path="/about-us" element={<AboutUs />} />

                  {/* Route to select a city */}
                  <Route path="/" element={<MainPage />} />

                  {/* Route to show markers for a specific city */}
                  <Route path="/:citySlug" element={<HelpedMapContainer />} />

                  {/* Route to the Admin Panel */}
                  <Route
                    path="/:citySlug/admin"
                    element={<AdminPanelWithRole />}
                  />

                  {/* Route to the Admin Panel */}
                  <Route
                    path="/:citySlug/report"
                    element={<CityReportPageWithRole />}
                  />

                  {/* Route to the Register Cities page */}
                  <Route
                    path="/:citySlug/super"
                    element={<RegisterCitiesWithRole />}
                  />

                  {/* Route to the Triage page */}
                  <Route
                    path="/:citySlug/triage"
                    element={<TriagePageWithRole />}
                  />

                  {/* Route to the Helpers page */}
                  <Route
                    path="/:citySlug/helping"
                    element={<HelperPageWithRole />}
                  />

                  <Route
                    path="/:citySlug/marker/:markerId"
                    element={<MarkerDetailsPage />}
                  />

                  {/* Route to the Management page */}
                  <Route
                    path="/:citySlug/management"
                    element={<ManagementMapPageWithRole />}
                  />

                  {/* Route to the helped map page */}
                  <Route
                    path="/:citySlug/helpedMap"
                    element={<HelpedMapComponent addRequest={true} />}
                  />

                  {/* Route to the helped map page */}
                  <Route
                    path="/:citySlug/city_hall"
                    element={<HelpedMapContainerNude addRequest="true" />}
                  />

                  {/* New Route to the Public Help page */}
                  <Route
                    path="/:citySlug/public-help"
                    element={<PublicHelpPage />}
                  />

                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </Router>
            <Footer />
          </ThemeProvider>
        </LoadScript>
      </GoogleReCaptchaProvider>
    </AuthProvider>
  );
}

function HelpedMapContainer() {
  const { citySlug } = useParams();
  const [overlayVisible, setOverlayVisible] = useState(true);

  const handleRequestHelp = () => {
    setOverlayVisible(false);
  };

  return (
    <>
      <HelpedMapComponent citySlug={citySlug} addRequest={!overlayVisible} />
      {overlayVisible && (
        <MenuOverlay citySlug={citySlug} onRequestHelp={handleRequestHelp} />
      )}
    </>
  );
}

function HelpedMapContainerNude() {
  const { citySlug } = useParams();
  const user = useAuth();

  return (
    <>
      <HelpedMapComponent citySlug={citySlug} user={user} addRequest={true} />
    </>
  );
}

export default App;
