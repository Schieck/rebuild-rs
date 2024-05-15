import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { needsMapping } from "../../utils/needsMapping";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

const HelpCommentModal = ({ open, needs, onClose, onSendHelp }) => {
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [other, setOther] = useState([]);

  const handleToggleNeed = (need) => {
    const currentIndex = selectedNeeds.indexOf(need);
    const newChecked = [...selectedNeeds];

    if (currentIndex === -1) {
      newChecked.push(need);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedNeeds(newChecked);
  };

  const handleSubmit = () => {
    const formattedHelp = selectedNeeds
      .map((needKey) => {
        const found = needsMapping[needKey];
        return found ? found.label : null;
      })
      .filter((label) => label)
      .join(", ");

    onSendHelp({
      text: `Eu vou ajudar esse pedido com ${formattedHelp} ${
        other ? "e também com " + other : ""
      }`,
      other,
      selectedNeeds,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ajuda em Ação</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Siga estes passos para ajudar:
        </Typography>
        <Typography variant="body2" gutterBottom>
          1. Entre em contato com a pessoa que precisa de ajuda.
        </Typography>
        <Typography variant="body2" gutterBottom>
          2. Compartilhe como você pode ajudar com base nas necessidades abaixo.
        </Typography>
        <Typography variant="body2" gutterBottom>
          3. Coloque a ajuda em ação e coordene os esforços.
        </Typography>
        {needs.map((need) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedNeeds.indexOf(need.key) !== -1}
                onChange={() => handleToggleNeed(need.key)}
              />
            }
            label={need.label}
            key={need.key}
          />
        ))}
        <TextField
          label="Outro"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          fullWidth
        ></TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="outlined"
          startIcon={<VolunteerActivismIcon />}
        >
          Enviar Ajuda
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpCommentModal;
