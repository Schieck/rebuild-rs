import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AssessmentIcon from "@mui/icons-material/Assessment";

export const roleMapping = {
  admin: {
    label: "Administrador",
    icon: <AdminPanelSettingsIcon style={{ color: "#3f51b5" }} />,
  },
  city_hall: {
    label: "Funcionário Municipal",
    icon: <WorkIcon style={{ color: "#ff5722" }} />,
  },
  triage: {
    label: "Triagem",
    icon: <AssignmentIcon style={{ color: "#ff9800" }} />,
  },
  helping: {
    label: "Ajudando",
    icon: <VolunteerActivismIcon style={{ color: "#8bc34a" }} />,
  },
  management: {
    label: "Gestão",
    icon: <AssessmentIcon style={{ color: "#2196f3" }} />,
  },
  super: {
    label: "super",
    icon: <AdminPanelSettingsIcon style={{ color: "#2196f3" }} />,
  },
};
