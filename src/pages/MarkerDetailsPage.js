import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Dialog,
} from "@mui/material";
import LoginForm from "../components/common/LoginForm";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import ShareLocation from "../components/ui/ShareLocation";
import SendIcon from "@mui/icons-material/Send";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "../styles/imageGallery.css";
import { needsMapping } from "../utils/needsMapping";
import { statusMapping } from "../utils/statusMapping";
import MarkerCommentSection from "../components/ui/MarkerCommentSection";
import { useAuth } from "../services/AuthProvider";
import HelpCommentModal from "../components/modals/HelpCommentModal";
import { showSuccessAlert } from "../utils/alerts";

const MarkerDetailsPage = () => {
  const { citySlug, markerId } = useParams();
  const [marker, setMarker] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showHelpComment, setShowHelpComment] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    const fetchMarkerDetails = async () => {
      const markerRef = doc(db, `cities/${citySlug}/markers`, markerId);
      const docSnapshot = await getDoc(markerRef);
      if (docSnapshot.exists()) {
        setMarker(docSnapshot.data());
      } else {
        navigate("/404");
      }
    };
    fetchMarkerDetails();
  }, [citySlug, markerId, db, navigate]);

  useEffect(() => {
    if (user && marker) {
      const logUserAccess = async () => {
        const userReadRef = collection(db, "userReads");
        await addDoc(userReadRef, {
          userId: user.uid,
          markerId,
          type: "marker_details_page",
          timestamp: new Date(),
        });
      };
      logUserAccess();
    }
  }, [user, marker, db, markerId]);

  const handleLoginCancel = () => setLoginOpen(false);
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (user && user.role !== "helping") {
      navigate(`/${user.role}`);
    } else {
      setShowHelpComment(true);
    }
  };

  const needsList = Object.keys(marker?.needs || {})
    .filter((key) => marker.needs[key])
    .map((key) => ({
      key,
      label: needsMapping[key].label,
      icon: needsMapping[key].icon,
    }));

  const handleShare = (req) => {
    const url = `${window.location.origin}/${req.city}/marker/${req.id}`;
    const text = `Por favor, ajude com este pedido urgente!\n\nDescrição: ${req.description}\nContato: ${req.contact}\nMais informações aqui: ${url}`;
    if (navigator.share) {
      navigator.share({ title: "Pedido de Ajuda", text, url });
    } else {
      navigator.clipboard.writeText(text);
      alert("Informações copiadas para compartilhamento.");
    }
  };

  const handleSendHelp = async (help) => {
    const commentsRef = collection(db, "comments");
    await addDoc(commentsRef, {
      text: help.text,
      markerId,
      other: help.other,
      type: "helpSent",
      userId: user.uid,
      userName: user.name,
      selectedNeeds: help.selectedNeeds,
    });
    showSuccessAlert("Obrigado!", "Sua ajuda será muito bem-vinda.");
  };

  const handleHelp = (req) => {
    if (!user || !user.role) {
      setLoginOpen(true);
    } else {
      setShowHelpComment(true);
    }
  };

  const formatGalleryImages = (imageUrls) =>
    imageUrls.map((url) => ({
      original: url,
      thumbnail: url,
    }));

  const renderActionItems = () => {
    return (
      <Box display={"flex"} width={"100%"} p={3} justifyContent={"center"}>
        <Box display={"flex"} flexDirection={"row"} columnGap={"1rem"}>
          <Chip
            label={statusMapping[marker.status]?.label || marker.status}
            color={statusMapping[marker.status]?.color || "default"}
            size="medium"
          />
          <Button
            variant="outlined"
            onClick={() => handleShare(marker)}
            color="secondary"
            startIcon={<SendIcon />}
          >
            Enviar
          </Button>

          <Button
            variant="outlined"
            onClick={handleHelp}
            color="primary"
            startIcon={<VolunteerActivismIcon />}
          >
            Ajudar
          </Button>
        </Box>
      </Box>
    );
  };

  const renderImageGallery = () => {
    if (!marker?.imageUrls || marker.imageUrls.length === 0) {
      return <Typography>Sem fotos disponíveis.</Typography>;
    }

    const galleryImages = formatGalleryImages(marker.imageUrls);

    return <ImageGallery items={galleryImages} showThumbnails />;
  };

  if (!marker) return null;

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        Pedido de Ajuda
      </Typography>

      <Paper style={{ padding: "24px", borderRadius: "8px" }}>
        {renderActionItems()}

        {/* Photos Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Galeria de Fotos
          </Typography>
          {renderImageGallery()}
        </Box>

        {/* Contact Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Contato
          </Typography>
          <Typography
            variant="body1"
            style={{
              fontWeight: "bold",
              backgroundColor: "#f0f0f0",
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            {user ? marker.contact : `${marker.contact.slice(0, 4)}****`}
          </Typography>
        </Box>

        {/* Description Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Descrição
          </Typography>
          <Typography
            variant="body1"
            style={{
              backgroundColor: "#f0f0f0",
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            {user
              ? marker.description
              : `${marker.description.slice(0, 20)}... (Ajude para ver mais)`}
          </Typography>
        </Box>

        {/* Necessary Resources Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
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
        </Box>

        {/* Location Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Localização
          </Typography>
          <ShareLocation latitude={marker.lat} longitude={marker.lng} />
        </Box>

        {renderActionItems()}

        <Box>
          <Typography variant="h5" gutterBottom>
            Quem está ajudando esse pedido:
          </Typography>
          <MarkerCommentSection
            markerId={markerId}
            user={user}
          ></MarkerCommentSection>
        </Box>
      </Paper>
      <Dialog open={loginOpen} onClose={handleLoginCancel}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onCancel={handleLoginCancel}
          initialIsRegistration={true}
        />
      </Dialog>

      <HelpCommentModal
        open={showHelpComment}
        needs={needsList}
        onClose={() => setShowHelpComment(false)}
        onSendHelp={(help) => handleSendHelp(help)}
      />
    </Box>
  );
};

export default MarkerDetailsPage;
