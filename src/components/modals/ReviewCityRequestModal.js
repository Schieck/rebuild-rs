import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";

const getNormalizedCityId = (name) => name.toLowerCase().replace(/\s+/g, "-");

const ReviewCityRequestModal = ({ open, onClose, request }) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const cityDocRef = doc(db, "cities", getNormalizedCityId(request.name));
      await setDoc(cityDocRef, {
        name: request.name,
        createdAt: new Date(),
      });
      await deleteDoc(doc(db, "cityRequest", request.id));
      onClose();
    } catch (error) {
      console.error("Erro ao aprovar cidade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "cityRequest", request.id));
      onClose();
    } catch (error) {
      console.error("Erro ao rejeitar cidade:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Revisar Solicitação de Cidade</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          <strong>Nome da Cidade:</strong> {request.name}
        </Typography>
        <Typography variant="body2" sx={{ marginTop: "10px" }}>
          Deseja aprovar ou rejeitar esta solicitação?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleReject} color="error" disabled={loading}>
          Rejeitar
        </Button>
        <Button
          onClick={handleApprove}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          Aprovar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewCityRequestModal;
