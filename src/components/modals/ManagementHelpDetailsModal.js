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

const ManagementHelpDetailsModal = ({ open, onClose, marker, citySlug }) => {
  const [description, setDescription] = useState(marker.description || "");
  const [contact, setContact] = useState(marker.contact || "");
  const [document, setDocument] = useState(marker.document || "");
  const [status, setStatus] = useState(marker.status || "triage");
  const [needs, setNeeds] = useState(marker.needs || {});
  const [createdAt, setCreatedAt] = useState(
    marker.createdAt?.toDate().toISOString().split("T")[0] || ""
  );
  const [isCityHall, setIsCityHall] = useState(marker.isCityHall || false);
  const user = useAuth();

  const handleNeedChange = (needKey) => {
    setNeeds((prev) => ({
      ...prev,
      [needKey]: !prev[needKey],
    }));
  };

  const handleCityHallChange = (event) => {
    setIsCityHall(event.target.checked);
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
      needs,
      createdAt: Timestamp.fromDate(new Date(createdAt)),
      isCityHall,
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
        {/* Description */}
        <Typography variant="h6">Descrição</Typography>
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          margin="normal"
        />

        {/* Contact */}
        <Typography variant="h6">Contato</Typography>
        <TextField
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* Document */}
        <Typography variant="h6">Documento</Typography>
        <TextField
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* Created At */}
        <Typography variant="h6">Criado em</Typography>
        <TextField
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          fullWidth
          disabled="disabled"
          margin="normal"
        />

        {/* Status */}
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

        {/* Needs */}
        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Recursos Necessários
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(needsMapping).map(([key, { label, icon }]) => (
            <Grid item xs={6} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(needs[key])}
                    onChange={() => handleNeedChange(key)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    {icon}
                    <Typography style={{ marginLeft: "8px" }}>
                      {label}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>

        {/* City Hall Checkbox */}
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
