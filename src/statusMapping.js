import AssignmentIcon from "@mui/icons-material/Assignment";
import SyncIcon from "@mui/icons-material/Sync";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";

export const statusMapping = {
  triage: {
    label: "Em Análise",
    icon: <AssignmentIcon style={{ color: "#FF9800" }} />, // Orange
    color: "error",
    hexColor: "#FF9800",
  },
  inProgress: {
    label: "Em Progresso",
    icon: <SyncIcon style={{ color: "#2196F3" }} />, // Blue
    color: "warning",
    hexColor: "#2196F3",
  },
  done: {
    label: "Concluído",
    icon: <DoneIcon style={{ color: "#4CAF50" }} />, // Green
    color: "success",
    hexColor: "#4CAF50",
  },
  cancelled: {
    label: "Cancelado",
    icon: <CancelIcon style={{ color: "#F44336" }} />, // Red
    color: "default",
    hexColor: "#F44336",
  },
};
