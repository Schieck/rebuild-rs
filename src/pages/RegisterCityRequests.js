import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import ReviewCityRequestModal from "../components/modals/ReviewCityRequestModal";

const RegisterCityRequests = () => {
  const [cityRequests, setCityRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const q = collection(db, "cityRequest");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCityRequests(data);
    });

    return unsubscribe;
  }, []);

  const openReviewModal = (request) => setSelectedRequest(request);

  const closeReviewModal = () => setSelectedRequest(null);

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Solicitações de Nova Cidade
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome da Cidade</TableCell>
              <TableCell>Avaliar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cityRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => openReviewModal(request)}
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
        <ReviewCityRequestModal
          open={Boolean(selectedRequest)}
          onClose={closeReviewModal}
          request={selectedRequest}
        />
      )}
    </Box>
  );
};

export default RegisterCityRequests;
