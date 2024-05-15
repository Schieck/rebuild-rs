import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { toCityName } from "./utils";
import { useAuth } from "../components/common/AuthProvider";
import { showSuccessAlert } from "./alerts";

function CitySelectionPage() {
  const [city, setCity] = useState("");
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    if (user && user.role) {
      navigate(`/${user.city}/${user.role}`);
    }
  });

  useEffect(() => {
    async function fetchCities() {
      const citiesCollection = collection(db, "cities");
      const citiesSnapshot = await getDocs(citiesCollection);
      const citiesData = citiesSnapshot.docs.map((doc) => doc.id);
      setAllCities(citiesData);
      setFilteredCities(citiesData);
    }

    fetchCities();
  }, []);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setCity(searchValue);
    setFilteredCities(
      allCities.filter((name) => name.toLowerCase().includes(searchValue))
    );
  };

  const handleCitySelection = (selectedCity) => {
    const citySlug = selectedCity.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${citySlug}`);
  };

  const openRequestDialog = () => setIsDialogOpen(true);

  const closeRequestDialog = () => {
    setIsDialogOpen(false);
    setNewCityName("");
  };

  const submitCityRequest = async () => {
    if (newCityName) {
      try {
        await addDoc(collection(db, "cityRequest"), {
          name: newCityName,
          requestedAt: new Date(),
        });
        closeRequestDialog();

        showSuccessAlert(
          "Sucesso",
          "Nova cidade requisitada com sucesso, acesse em 15 minutos para solicitar ajuda!"
        );
      } catch (error) {
        console.error("Erro ao solicitar nova cidade:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          maxWidth: "30rem",
          width: "100%",
          textAlign: "center",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src="/icons/logo-nova.png"
          width="60%"
          style={{ borderRadius: "2rem" }}
        />
        <h1>Selecione a sua cidade</h1>
        <TextField
          label="Buscar Cidade"
          value={city}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
        />
        <List style={{ maxHeight: "21vh", overflow: "scroll" }}>
          {filteredCities.map((name, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleCitySelection(name)}
            >
              <ListItemText primary={toCityName(name)} />
            </ListItem>
          ))}
        </List>

        <Typography
          variant="body2"
          sx={{ marginTop: "20px", color: "#696969" }}
        >
          Ao mesmo tempo que nos conectamos com você, estamos nos conectando
          diretamente com as prefeituras, por isso nem todas as cidades estão
          cadastradas.
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={openRequestDialog}
          sx={{ marginTop: "10px" }}
        >
          Solicitar nova cidade
        </Button>

        {/* Dialog for Requesting a New City */}
        <Dialog open={isDialogOpen} onClose={closeRequestDialog}>
          <DialogTitle>Solicitar Nova Cidade</DialogTitle>
          <DialogContent>
            <TextField
              label="Nome da Cidade"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Typography variant="body2">
              Por favor, forneça o nome da cidade que você gostaria de
              adicionar.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeRequestDialog} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={submitCityRequest}
              color="primary"
              variant="contained"
            >
              Solicitar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default CitySelectionPage;
