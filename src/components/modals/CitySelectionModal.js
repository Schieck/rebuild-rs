import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
  Box,
  Typography,
  ListItemIcon,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { showSuccessAlert } from "../../utils/alerts";

const CitySelectionModal = ({ open, onClose, mode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      const citiesCollection = collection(db, "cities");
      const citiesSnapshot = await getDocs(citiesCollection);
      const citiesData = citiesSnapshot.docs.map((doc) => {
        doc = { id: doc.id, ...doc.data() };
        return { id: doc.id, name: doc.name };
      });
      setAllCities(citiesData);
      setFilteredCities(citiesData);
    }

    if (open) {
      fetchCities();
    }
  }, [open]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(
      allCities.filter(
        (city) =>
          city.id.toLowerCase().includes(query) ||
          city.name.toLowerCase().includes(query)
      )
    );
  };

  const handleCitySelection = (city) => {
    const cityId = city.toLowerCase().replace(/\s+/g, "-");
    navigate(
      `/${cityId}/${mode === "helpedmap" ? "helpedmap" : "public-help"}`
    );
    onClose();
  };

  const openRequestDialog = () => setIsRequestDialogOpen(true);

  const closeRequestDialog = () => {
    setIsRequestDialogOpen(false);
    setNewCityName("");
  };

  const submitCityRequest = async () => {
    const normalizedNewCityName = newCityName.trim().toLowerCase();
    const selectedCity = allCities.find(
      (city) =>
        city.id.toLowerCase().includes(normalizedNewCityName) ||
        city.name.toLowerCase().includes(newCityName)
    );
    if (normalizedNewCityName && !selectedCity) {
      try {
        await addDoc(collection(db, "cityRequest"), {
          name: normalizedNewCityName,
          requestedAt: new Date(),
        });
        showSuccessAlert(
          "Sucesso",
          "Nova cidade requisitada com sucesso, acesse em 15 minutos para solicitar ajuda!"
        );
        closeRequestDialog();
        onClose();
      } catch (error) {
        console.error("Erro ao solicitar nova cidade:", error);
      }
    } else {
      showSuccessAlert(
        "Legal!",
        "Esta cidade já existe em nosso sistema, iremos te encaminhar."
      );
      closeRequestDialog();
      onClose();
      setTimeout(() => {
        navigate(`${selectedCity.id}/helpedMap`);
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: "16px",
          width: "100%",
          maxWidth: "700px",
        },
      }}
    >
      <DialogTitle>Selecione a Cidade</DialogTitle>
      <DialogContent>
        <TextField
          label="Buscar Cidade"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
        />
        <List>
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleCitySelection(city.id)}
              >
                <ListItemText primary={city.name} />
                <ListItemIcon>
                  <ArrowForwardIosIcon />
                </ListItemIcon>
              </ListItem>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "1rem 0",
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center", marginBottom: "1rem" }}
              >
                Cidade não encontrada. <br /> Como temos integrações com
                prefeituras, nem todas estão cadastradas ainda.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={openRequestDialog}
              >
                Solicitar cidade
              </Button>
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
      </DialogActions>

      {/* Request City Dialog */}
      <Dialog open={isRequestDialogOpen} onClose={closeRequestDialog}>
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
            Por favor, forneça o nome da cidade que você gostaria de adicionar.
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
    </Dialog>
  );
};

export default CitySelectionModal;
