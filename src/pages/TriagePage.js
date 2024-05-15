import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../services/AuthProvider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import ReviewRequestModal from "../components/modals/ReviewRequestModal";

const Triage = () => {
  const [markers, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const user = useAuth();
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `cities/${user.city}/markers`),
      where("status", "==", "triage"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });

    return unsubscribe;
  }, [user, db]);

  const filteredRequests = markers.filter((req) =>
    req.description.toLowerCase().includes(search.toLowerCase())
  );

  const openReviewModal = (marker) => {
    setSelectedRequest(marker);
  };

  const closeReviewModal = () => {
    setSelectedRequest(null);
  };

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        Triagem
      </Typography>
      <Box mb={2} display="flex" alignItems="center">
        <SearchIcon style={{ marginRight: "8px" }} />
        <TextField
          label="Procurar"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "300px" }}
        />
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Avaliar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((marker) => (
              <TableRow key={marker.id}>
                <TableCell>
                  {marker.description.substring(0, 16) + "**"}
                </TableCell>
                <TableCell>{marker.contact.substring(0, 6) + "**"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => openReviewModal(marker)}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewRequestModal
          open={Boolean(selectedRequest)}
          onClose={closeReviewModal}
          marker={selectedRequest}
        />
      )}
    </Box>
  );
};

export default Triage;
