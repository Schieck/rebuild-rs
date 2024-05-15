import React from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
} from "@mui/material";
import ShareLocation from "../ui/ShareLocation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import HotelIcon from "@mui/icons-material/Hotel";
import GroupIcon from "@mui/icons-material/Group";
import MedicationIcon from "@mui/icons-material/Medication";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const HelpDetailsModal = ({ open, onClose, marker }) => {
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
        cleanup: "Limpeza no Local",
        foodWater: "Comida & Água",
        reconstruction: "Reconstrução",
        medicalAid: "Assistência Médica",
        temporaryShelter: "Em Abrigo",
        familyShelter: "Em Familiares",
        clothCleanup: "Limpeza de Roupas",
        medicines: "Medicamentos",
        cloth: "Roupas",
        civilDefenseCheckup: "Visita da Defesa Civil",
      }[key],
      icon: iconsMapping[key],
    }));

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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Pedido de Ajuda</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Descrição</Typography>
        <Typography paragraph>
          {marker.description || "Sem descrição."}
        </Typography>

        <Typography variant="h6">Contato</Typography>
        <Typography paragraph>{marker.contact || "Sem contato."}</Typography>

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

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Galeria de Fotos
        </Typography>
        {renderImageGallery()}

        <Typography variant="h6" style={{ marginTop: "15px" }}>
          Localização
        </Typography>
        <ShareLocation latitude={marker.lat} longitude={marker.lng} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDetailsModal;
