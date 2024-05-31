import React, { useState, useCallback } from "react";
import { Grid, Typography, Button, Dialog } from "@mui/material";
import { debounce } from "lodash";
import { TypeAnimation } from "react-type-animation";
import LoginForm from "./LoginForm";
import { useAuth } from "../../services/AuthProvider";
import { useNavigate } from "react-router-dom";

const PublicHeader = ({ cityHallAccess, hideCityHall }) => {
  const [showName, setShowName] = useState(false);
  const [loginOpen, setLoginOpen] = useState(cityHallAccess);
  const user = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => setLoginOpen(true);

  const debouncedHandleShowText = useCallback(
    debounce((showText) => setShowName(showText), 200),
    []
  );

  const handleMouseEnter = () => debouncedHandleShowText(true);
  const handleMouseLeave = () => debouncedHandleShowText(false);

  const handleLoginCancel = () => setLoginOpen(false);
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (user && user.role !== "helping") {
      navigate(`/${user.role}`);
    }
  };

  return (
    <>
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
            sx={{ marginLeft: 2 }}
          >
            {showName ? (
              <TypeAnimation sequence={["Reconstrói RS"]} repeat={1} />
            ) : (
              "RS"
            )}
          </Typography>
        </Grid>

        {!hideCityHall && (
          <Grid item>
            <Button
              sx={{ marginRight: "1rem" }}
              variant="outlined"
              color="secondary"
              href="/about-us"
            >
              Sobre o Projeto
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleLoginClick}
            >
              Prefeituras
            </Button>
          </Grid>
        )}

        {hideCityHall && (
          <Grid item>
            <Button
              sx={{ marginRight: "1rem" }}
              variant="outlined"
              color="primary"
              href="/"
            >
              Página Inicial
            </Button>
          </Grid>
        )}
      </Grid>
      <Dialog open={loginOpen} onClose={handleLoginCancel}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
          hideRegister={true}
        />
      </Dialog>
    </>
  );
};

export default PublicHeader;
