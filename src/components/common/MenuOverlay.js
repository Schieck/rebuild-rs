import React, { useState, useEffect } from "react";
import { Button, Typography, Dialog } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toCityName } from "../../utils/utils";
import LoginForm from "../common/LoginForm";
import { useAuth } from "../../services/AuthProvider";

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

const MenuOverlay = ({ onRequestHelp, citySlug }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuth();
  const cityName = citySlug ? toCityName(citySlug) : "Cidade Desconhecida";

  useEffect(() => {
    if (user && user.role) {
      navigate(`/${citySlug}/${user.role}`);
    }
  }, [user, citySlug, navigate]);

  const handlePanelClick = () => {
    if (user && user.role) {
      navigate(`/${citySlug}/${user.role}`);
    } else {
      setLoginOpen(true);
    }
  };

  const onPublicHelp = () => {
    navigate(`/${citySlug}/public-help`);
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    console.log("Login", user);
    if (user && user.role) {
      navigate(`/${citySlug}/${user.role}`);
    }
  };

  const handleLoginCancel = () => {
    setLoginOpen(false);
  };

  return (
    <div style={overlayStyle}>
      <div>
        <img
          src="/icons/logo-nova.png"
          alt="Logo"
          width="50%"
          style={{ borderRadius: "2rem", maxWidth: "30rem" }}
        />
        <Typography variant="h3" component="h1" gutterBottom>
          {cityName} - RS
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={onRequestHelp}
          style={{ marginTop: "2rem" }}
        >
          {"Preciso de ajuda!"}
        </Button>
        <br />
        <br />
        <Button
          variant="contained"
          color="info"
          onClick={onPublicHelp}
          style={{ marginTop: "2rem" }}
        >
          {"Quero Ajudar"}
        </Button>
        <br />
        <Button
          variant="outlined"
          color="primary"
          onClick={handlePanelClick}
          style={{ marginTop: "1rem" }}
        >
          Acessar Painel
        </Button>
      </div>
      <Dialog open={loginOpen} onClose={handleLoginCancel}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
        />
      </Dialog>
    </div>
  );
};

export default MenuOverlay;
