import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
} from "@mui/material";
import {
  updateDoc,
  doc,
  Timestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { statusMapping } from "../../utils/statusMapping";
import { needsMapping } from "../../utils/needsMapping";
import { db } from "../../utils/firebase";
import { useAuth } from "../../services/AuthProvider";
import { GoogleMap, Marker } from "@react-google-maps/api";
import HomeIcon from "@mui/icons-material/Home";

const ManagementHelpDetailsModal = ({ open, onClose, marker, citySlug }) => {
  const [description, setDescription] = useState(marker.description || "");
  const [contact, setContact] = useState(marker.contact || "");
  const [document, setDocument] = useState(marker.document || "");
  const [status, setStatus] = useState(marker.status || "triage");

  const [createdAt, setCreatedAt] = useState(
    marker.createdAt?.toDate().toISOString().split("T")[0] || ""
  );
  const [isCityHall, setIsCityHall] = useState(marker.isCityHall || false);
  const [lat, setLat] = useState(marker.lat || "");
  const [lng, setLng] = useState(marker.lng || "");
  const [adults, setAdults] = useState(marker.adults || 0);
  const [kids, setKids] = useState(marker.kids || 0);
  const [elderly, setElderly] = useState(marker.elderly || 0);
  const [pcd, setPcd] = useState(marker.pcd || false);
  const [shelterOption, setShelterOption] = useState(
    marker.needs.familyShelter
      ? "familyShelter"
      : marker.needs.temporaryShelter
      ? "temporaryShelter"
      : "none"
  );
  const user = useAuth();

  const options = Object.entries(needsMapping)
    .filter(([key]) => key !== "familyShelter" && key !== "temporaryShelter")
    .map(([key, { label, icon }]) => ({
      key,
      label,
      icon,
    }));

  const initialNeeds = Object.entries(marker.needs || {})
    .filter(([key, value]) => value && needsMapping[key])
    .map(([key]) => ({
      key,
      label: needsMapping[key].label,
      icon: needsMapping[key].icon,
    }));

  const [needs, setNeeds] = useState(initialNeeds);

  const handleNeedChange = (event, value) => {
    setNeeds(value);
  };

  const handleCityHallChange = (event) => {
    setIsCityHall(event.target.checked);
  };

  const handleShelterChange = (event, newShelterOption) => {
    setShelterOption(newShelterOption);
  };

  useEffect(() => {
    if (user && marker) {
      const logUserAccess = async () => {
        const userReadRef = collection(db, "userReads");
        await addDoc(userReadRef, {
          userId: user.uid,
          markerId: marker.id,
          type: "marker_details_page",
          timestamp: new Date(),
        });
      };
      logUserAccess();
    }
  }, [user, marker]);

  const handleSave = async () => {
    const updatedMarker = {
      ...marker,
      description,
      contact,
      document,
      status,
      needs: {
        ...needs.reduce(
          (acc, need) => ({
            ...acc,
            [need.key]: true,
          }),
          {}
        ),
        ...(shelterOption === "familyShelter" && { familyShelter: true }),
        ...(shelterOption === "temporaryShelter" && { temporaryShelter: true }),
      },
      createdAt: Timestamp.fromDate(new Date(createdAt)),
      isCityHall,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      adults: parseInt(adults),
      kids: parseInt(kids),
      elderly: parseInt(elderly),
      pcd,
    };

    const markerRef = doc(db, `cities/${citySlug}/markers`, marker.id);

    try {
      await updateDoc(markerRef, updatedMarker);
      const logUserUpdate = async () => {
        const userReadRef = collection(db, "userUpdates");
        await addDoc(userReadRef, {
          userId: user.uid,
          markerId: marker.id,
          oldObject: marker,
          newObject: updatedMarker,
          type: "marker_help_details_modal",
          timestamp: new Date(),
        });
      };
      logUserUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating marker:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerenciamento de Pedido de Ajuda</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Descrição</Typography>
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          margin="normal"
        />

        <Typography variant="h6">Contato</Typography>
        <TextField
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Typography variant="h6">Documento</Typography>
        <TextField
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Typography variant="h6">Criado em</Typography>
        <TextField
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          fullWidth
          disabled
          margin="normal"
        />

        <Typography variant="h6">Status</Typography>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          margin="normal"
        >
          {Object.entries(statusMapping).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>

        <Autocomplete
          sx={{ marginTop: "1rem" }}
          multiple
          options={options}
          getOptionLabel={(option) => option.label}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option.icon}
              <Typography style={{ marginLeft: "8px" }}>
                {option.label}
              </Typography>
            </Box>
          )}
          value={needs}
          onChange={handleNeedChange}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          renderInput={(params) => (
            <TextField {...params} label="Recursos Necessários" />
          )}
        />

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Local do atingido:
        </Typography>
        <Box display="flex" justifyContent="center" margin="normal">
          <ToggleButtonGroup
            value={shelterOption}
            exclusive
            onChange={handleShelterChange}
            aria-label="shelter option"
          >
            <ToggleButton value="none" aria-label="none">
              {shelterOption === "none" && <HomeIcon color="primary" />}
              Casa
            </ToggleButton>
            <ToggleButton value="familyShelter" aria-label="familyShelter">
              {shelterOption === "familyShelter" &&
                needsMapping["familyShelter"].icon}
              Familiares
            </ToggleButton>
            <ToggleButton
              value="temporaryShelter"
              aria-label="temporaryShelter"
            >
              {shelterOption === "temporaryShelter" &&
                needsMapping["temporaryShelter"].icon}
              Abrigo
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Detalhes Adicionais
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <TextField
            label="Adultos"
            type="number"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Crianças"
            type="number"
            value={kids}
            onChange={(e) => setKids(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Idosos"
            type="number"
            value={elderly}
            onChange={(e) => setElderly(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={pcd}
              onChange={(e) => setPcd(e.target.checked)}
            />
          }
          label="Há pessoa com deficiência física (PCD)"
          style={{ marginTop: "16px" }}
        />

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Localização
        </Typography>
        <TextField
          label="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          fullWidth
          margin="normal"
        />

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
          zoom={15}
          onClick={(e) => {
            setLat(e.latLng.lat());
            setLng(e.latLng.lng());
          }}
        >
          <Marker position={{ lat: parseFloat(lat), lng: parseFloat(lng) }} />
        </GoogleMap>

        <FormControlLabel
          control={
            <Checkbox checked={isCityHall} onChange={handleCityHallChange} />
          }
          label="Acesso exclusivo à prefeitura"
          style={{ marginTop: "20px" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagementHelpDetailsModal;
