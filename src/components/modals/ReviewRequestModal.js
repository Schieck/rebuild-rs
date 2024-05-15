import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { updateDoc, doc, Timestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useAuth } from "../../services/AuthProvider";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import HotelIcon from "@mui/icons-material/Hotel";
import GroupIcon from "@mui/icons-material/Group";
import ShareLocation from "../ui/ShareLocation";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import MedicationIcon from "@mui/icons-material/Medication";
import { showConfirmationAlert, showSuccessAlert } from "../../utils/alerts";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const ReviewRequestModal = ({ open, onClose, marker }) => {
  const db = getFirestore();
  const user = useAuth();
  const [reason, setReason] = useState("");

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    marginTop: "15px",
  };

  const iconsMapping = {
    cleanup: <CleanHandsIcon color="primary" />,
    foodWater: <LocalOfferIcon color="primary" />,
    reconstruction: <HomeRepairServiceIcon color="primary" />,
    medicalAid: <LocalHospitalIcon color="primary" />,
    temporaryShelter: <HotelIcon color="primary" />,
    familyShelter: <GroupIcon color="primary" />,
    clothCleanup: <CleaningServicesIcon color="primary" />,
    medicines: <MedicationIcon color="primary" />,
    cloth: <CheckroomIcon color="primary" />,
    civilDefenseCheckup: <HealthAndSafetyIcon color="primary" />,
  };

  const needsList = Object.keys(marker.needs || {})
    .filter((key) => marker.needs[key])
    .map((key) => ({
      key,
      label: {
        cleanup: "Limpeza no local",
        foodWater: "Comida & Água",
        reconstruction: "Reconstrução",
        medicalAid: "Assistência Médica",
        temporaryShelter: "Em Abrigo",
        familyShelter: "Em Familiares",
        clothCleanup: "Limpeza de Roupas",
        medicines: "Medicamento",
        cloth: "Roupas",
        civilDefenseCheckup: "Visita da Defesa Civil",
      }[key],
      icon: iconsMapping[key],
    }));

  const handleApprove = async () => {
    onClose();
    const confirmed = await showConfirmationAlert(
      "Confirmar Aprovação",
      "Tem certeza de que deseja aprovar este pedido de ajuda?"
    );

    if (confirmed) {
      const markerRef = doc(db, `cities/${user.city}/markers`, marker.id);
      await updateDoc(markerRef, {
        status: "inProgress",
        updatedBy: user.email,
        updatedAt: Timestamp.now(),
        updateReason: reason,
      });
      showSuccessAlert("Sucesso", "Aprovado");
    }
  };

  const handleDecline = async () => {
    onClose();

    const confirmed = await showConfirmationAlert(
      "Confirmar Recusa",
      "Tem certeza de que deseja recusar este pedido de ajuda?"
    );

    if (confirmed) {
      const markerRef = doc(db, `cities/${user.city}/markers`, marker.id);
      await updateDoc(markerRef, {
        status: "cancelled",
        updatedBy: user.email,
        updatedAt: Timestamp.now(),
        updateReason: reason,
      });
    }
  };

  const mapStyles = [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
  ];

  const renderImageGallery = () => {
    if (!marker.imageUrls || marker.imageUrls.length === 0) {
      return <Typography>Sem fotos disponíveis.</Typography>;
    }

    return (
      <Grid container spacing={1} style={{ marginTop: "15px" }}>
        {marker.imageUrls.map((url, index) => (
          <Grid item xs={6} key={index}>
            <img
              src={url}
              alt={`Pedido de Ajuda ${index + 1}`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Avaliar Pedido de Ajuda</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Descrição:</Typography>
        <Typography>{marker.description || "Sem descrição."}</Typography>

        <Box my={2}>
          <Typography variant="h6">Contato:</Typography>
          <Typography>{marker.contact || "Não disponível."}</Typography>
        </Box>

        <Box my={2}>
          <Typography variant="h6">Galeria de Fotos:</Typography>
          {renderImageGallery()}
        </Box>

        <Box my={2}>
          <Typography variant="h6">Criado em:</Typography>
          <Typography>
            {marker.createdAt
              ? new Date(marker.createdAt.seconds * 1000).toLocaleString()
              : "Data desconhecida"}
          </Typography>
        </Box>

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Recursos Necessários
        </Typography>
        <Grid container spacing={1}>
          {needsList.length > 0 ? (
            needsList.map((need) => (
              <Grid item xs={6} key={need.key}>
                <Box display="flex" alignItems="center">
                  {need.icon}
                  <Typography style={{ marginLeft: "8px" }}>
                    {need.label}
                  </Typography>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography>Sem recursos necessários.</Typography>
          )}
        </Grid>

        {/* Google Map displaying the marker location */}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: marker.lat, lng: marker.lng }}
          zoom={19}
          options={{ styles: mapStyles, mapTypeId: "hybrid" }}
        >
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        </GoogleMap>

        <ShareLocation latitude={marker.lat} longitude={marker.lng} />

        <TextField
          label="Motivo (Aprovação/Recusa)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDecline} color="secondary" variant="outlined">
          Recusar
        </Button>
        <Button onClick={handleApprove} color="primary" variant="contained">
          Aprovar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewRequestModal;
