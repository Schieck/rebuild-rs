import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../services/AuthProvider";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toCityName } from "../../utils/utils";

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const user = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "";
    const initials = name.split(" ").map((word) => word[0].toUpperCase());
    return initials.slice(0, 2).join("");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth);
    handleMenuClose();
    navigate("/");
  };

  const canAccessTriage =
    user && ["admin", "city_hall", "triage", "super"].includes(user.role);

  const canAccessManagement =
    user && ["admin", "city_hall", "management", "super"].includes(user.role);

  const canAccessHelpers =
    user && ["admin", "city_hall", "management", "super"].includes(user.role);

  const canAccessCities = user && ["super"].includes(user.role);

  const canAccessAdmin = user && ["admin", "super"].includes(user.role);

  const canAccessReport =
    user && ["admin", "city_hall", "management", "super"].includes(user.role);

  return (
    <>
      {user ? (
        <AppBar
          position="static"
          color="default"
          style={{ marginBottom: "1rem" }}
        >
          <Toolbar>
            <img
              src="/icons/logo-nova.png"
              alt="Logo"
              style={{ height: "40px", marginRight: "16px" }}
            />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {user.role !== "helping" &&
                (user.city ? `${toCityName(user.city)} - RS` : "")}
            </Typography>
            {user.role !== "helping" && (
              <Button
                component={Link}
                to={`/${user.city}/city_hall`}
                color="error"
                variant="outlined"
                style={{ marginRight: "1rem" }}
              >
                Novo Pedido de Ajuda
              </Button>
            )}

            {canAccessTriage && (
              <Button
                component={Link}
                to={`/${user.city}/triage`}
                color="inherit"
              >
                Triagem
              </Button>
            )}
            {canAccessManagement && (
              <Button
                color="inherit"
                onClick={() => navigate(`/${user.city}/management`)}
              >
                Gestão
              </Button>
            )}
            {canAccessHelpers && (
              <Button
                component={Link}
                to={`/${user.city}/helping`}
                color="inherit"
              >
                Execução
              </Button>
            )}
            {canAccessCities && (
              <Button
                component={Link}
                to={`/${user.city}/super`}
                color="inherit"
              >
                Cidades
              </Button>
            )}
            {canAccessReport && (
              <Button
                color="inherit"
                onClick={() => navigate(`/${user.city}/report`)}
              >
                Relatórios
              </Button>
            )}
            {user && (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <Avatar>{getInitials(user.name || user.email)}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {canAccessAdmin && (
                    <Button
                      component={Link}
                      to={`/${user.city}/admin`}
                      color="inherit"
                    >
                      Meu Time
                    </Button>
                  )}
                  <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>
      ) : null}
    </>
  );
};

export default Header;
