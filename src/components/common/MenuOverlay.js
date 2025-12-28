import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toCityName } from "../../utils/utils";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  textAlign: "center",
  justifyContent: "center",
  padding: "1rem",
  zIndex: 1000,
};

const MenuOverlay = ({ citySlug }) => {
  const navigate = useNavigate();
  const cityName = citySlug ? toCityName(citySlug) : "Cidade Desconhecida";

  const onViewMemorial = () => {
    navigate(`/${citySlug}/public-help`);
  };

  return (
    <div style={overlayStyle}>
      <Box sx={{ maxWidth: "600px" }}>
        <img
          src="/icons/logo-nova.png"
          alt="Logo"
          width="50%"
          style={{ borderRadius: "2rem", maxWidth: "30rem" }}
        />
        <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
          {cityName} - RS
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
          Memorial das Enchentes de 2024
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Visualize os registros históricos do esforço humanitário que ajudou
          centenas de famílias durante a crise.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onViewMemorial}
          size="large"
          sx={{ mt: 2 }}
        >
          Ver Memorial
        </Button>
      </Box>
    </div>
  );
};

export default MenuOverlay;
