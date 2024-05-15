import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShareLocation from "../components/ui/ShareLocation";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../services/AuthProvider";
import {
  showConfirmationAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../utils/alerts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const HelperPage = () => {
  const [requests, setRequests] = useState([]);
  const user = useAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `cities/${user.city}/markers`),
      where("status", "==", "inProgress"),
      orderBy("index", "asc"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });

    return unsubscribe;
  }, [user, db]);

  const markAsDone = async (id) => {
    const confirmed = await showConfirmationAlert(
      "Marcar como Concluído?",
      "Você tem certeza que quer marcar esse pedido como concluído?"
    );
    if (!confirmed) return;

    try {
      const requestRef = doc(db, `cities/${user.city}/markers`, id);
      await updateDoc(requestRef, { status: "done" });
      const logUserUpdate = async () => {
        const userReadRef = collection(db, "userUpdates");
        await addDoc(userReadRef, {
          userId: user.uid,
          markerId: id,
          newObject: { status: "done" },
          type: "helper_page_complete",
          timestamp: new Date(),
        });
      };
      logUserUpdate();
      showSuccessAlert("Concluído", "O pedido foi marcado como concluído.");
    } catch (error) {
      console.error("Error updating request status:", error);
      showErrorAlert("Erro", "Não foi possível concluir o pedido.");
    }
  };

  const shareRequestInfo = (req) => {
    const url = `${window.location.origin}/${user.city}/marker/${req.id}`;
    const text =
      `Este pedido precisa de ajuda urgente!\n\n` +
      `Descrição: ${req.description}\n` +
      `Contato: ${req.contact}\n` +
      `Saiba mais aqui: ${url}`;

    if (navigator.share) {
      if (user && req) {
        const logUserAccess = async () => {
          const userReadRef = collection(db, "userReads");
          await addDoc(userReadRef, {
            userId: user.uid,
            markerId: req.id,
            type: "helper_page_share",
            timestamp: new Date(),
          });
        };
        logUserAccess();
      }

      navigator.share({
        title: "Pedido de Ajuda",
        text,
        url,
      });
    } else {
      navigator.clipboard.writeText(text);
      showSuccessAlert(
        "Informação Copiada",
        "Informações copiadas para compartilhar."
      );
    }
  };

  const openDetailsPage = (req) => {
    navigate(`/${user.city}/marker/${req.id}`);
  };

  const getUrgencyIcon = (priority) => {
    return priority === 0 ? <PriorityHighIcon color="error" /> : null;
  };

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        Prioridade de Ajuda
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.description}</TableCell>
                <TableCell>{req.contact}</TableCell>
                <TableCell>
                  <ShareLocation latitude={req.lat} longitude={req.lng} />
                </TableCell>
                <TableCell>
                  {getUrgencyIcon(req.index)} #{req.index + 1}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => markAsDone(req.id)}
                  >
                    <DoneIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => shareRequestInfo(req)}
                  >
                    <ShareIcon />
                  </IconButton>
                  <IconButton
                    color="default"
                    onClick={() => openDetailsPage(req)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default HelperPage;
