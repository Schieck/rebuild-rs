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
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import MenuOverlay from "./components/common/MenuOverlay";
import { LoadScript } from "@react-google-maps/api";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/common/Header";
import PublicHelpPage from "./pages/PublicHelpPage";
import { AuthProvider } from "./services/AuthProvider";
import MainPage from "./pages/MainPage";

import "./styles/App.css";
import Footer from "./components/common/Footer";
import AboutUs from "./pages/AboutUs";
import MemorialBanner from "./components/common/MemorialBanner";

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
                <MemorialBanner />
                <Header />
                <Routes>
                  <Route path="/about-us" element={<AboutUs />} />

                  {/* Route to select a city */}
                  <Route path="/" element={<MainPage />} />

                  {/* Route to show markers for a specific city */}
                  <Route path="/:citySlug" element={<HelpedMapContainer />} />

                  {/* Memorial public view */}
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

  const handleViewMemorial = () => {
    setOverlayVisible(false);
  };

  return (
    <>
      <HelpedMapComponent citySlug={citySlug} addRequest={false} />
      {overlayVisible && (
        <MenuOverlay citySlug={citySlug} onViewMemorial={handleViewMemorial} />
      )}
    </>
  );
}

export default App;
