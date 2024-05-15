import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import HotelIcon from "@mui/icons-material/Hotel";
import GroupIcon from "@mui/icons-material/Group";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import MedicationIcon from "@mui/icons-material/Medication";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import BedIcon from "@mui/icons-material/Bed";
import ChairOutlinedIcon from "@mui/icons-material/ChairOutlined";

export const needsMapping = {
  cleanup: {
    label: "Limpeza no Local",
    icon: <CleanHandsIcon color="primary" />,
  },
  foodWater: {
    label: "Comida & Água",
    icon: <LocalOfferIcon color="primary" />,
  },
  reconstruction: {
    label: "Reconstrução",
    icon: <HomeRepairServiceIcon color="primary" />,
  },
  medicalAid: {
    label: "Assistência Médica",
    icon: <LocalHospitalIcon color="primary" />,
  },
  temporaryShelter: {
    label: "Em Abrigo",
    icon: <HotelIcon color="primary" />,
  },
  cloth: {
    label: "Roupas",
    icon: <CheckroomIcon color="primary" />,
  },
  trousseau: {
    label: "Enxoval",
    icon: <BedIcon color="primary" />,
  },
  furniture: {
    label: "Móveis",
    icon: <ChairOutlinedIcon color="primary" />,
  },
  familyShelter: {
    label: "Em Familiares",
    icon: <GroupIcon color="primary" />,
  },
  clothCleanup: {
    label: "Limpeza de Roupas",
    icon: <CleaningServicesIcon color="primary" />,
  },
  medicines: {
    label: "Medicamentos",
    icon: <MedicationIcon color="primary" />,
  },
  civilDefenseCheckup: {
    label: "Visita Defesa Civil",
    icon: <HealthAndSafetyIcon color="primary" />,
  },
};
