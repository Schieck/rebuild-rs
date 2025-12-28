import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      style={{ marginBottom: "1rem" }}
    >
      <Toolbar>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="/icons/logo-nova.png"
            alt="Rebuild RS Logo"
            style={{ height: "40px", marginRight: "16px" }}
          />
        </Link>
        <Typography variant="h6" style={{ flexGrow: 1, color: "#333" }}>
          Rebuild RS
        </Typography>
        <Button component={Link} to="/about-us" color="inherit">
          Sobre o Projeto
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
