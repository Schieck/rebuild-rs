import React, { useState } from "react";
import Modal from "react-modal";
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";
import { debounce } from "lodash";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
} from "../../utils/alerts";
import { useNavigate } from "react-router-dom";
import { needsMapping } from "../../utils/needsMapping";

Modal.setAppElement("#root");

const HelpedRequestFormModal = ({
  isOpen,
  onClose,
  onAddMarker,
  coordinates,
  citySlug,
  userRole,
}) => {
  const cityHallPeople =
    userRole?.includes("admin") ||
    userRole?.includes("city_hall") ||
    userRole?.includes("super");
  const [contact, setContact] = useState("");
  const [document, setDocument] = useState("");
  const [description, setDescription] = useState("");
  const [needs, setNeeds] = useState({
    cleanup: false,
    foodWater: false,
    reconstruction: false,
    medicalAid: false,
    temporaryShelter: false,
    familyShelter: false,
    clothCleanup: false,
    cloth: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [isCityHall, setIsCityHall] = useState(cityHallPeople || false);
  const navigate = useNavigate();

  const handleCaptchaVerification = (token) => {
    setRecaptchaToken(token);
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setNeeds((prevNeeds) => ({ ...prevNeeds, [name]: checked }));
  };

  const handleCityHallChange = (event) => {
    setIsCityHall(event.target.checked);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files).slice(0, 5); // Limit to 5 images
    setImages(files);
  };

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    return await imageCompression(imageFile, options);
  };

  const uploadImages = async (docId) => {
    setLoading(true);
    const imageUrls = [];

    for (const [index, image] of images.entries()) {
      const compressedImage = await compressImage(image); // Compress each image
      const storageRef = ref(storage, `requests/${docId}/image_${index}`);
      await uploadBytes(storageRef, compressedImage);
      const downloadUrl = await getDownloadURL(storageRef);
      imageUrls.push(downloadUrl);
    }

    setLoading(false);
    return imageUrls;
  };

  const confirmAndSubmit = async () => {
    const confirmed = await showConfirmationAlert(
      "Confirmar Pedido",
      "Tem certeza que precisa de ajuda?",
      "Sim, eu preciso de ajuda."
    );

    if (confirmed) {
      handleSubmit();
    }
  };

  const handleSubmit = debounce(async (e) => {
    if (!recaptchaToken) {
      showErrorAlert(
        "Verificação necessária",
        "Tente de novo, verificação de reCAPTCHA falhou."
      );
      return;
    }

    const newMarker = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      contact,
      document,
      isCityHall,
      description,
      needs,
      status: isCityHall ? "inProgress" : "triage",
      index: 100000000,
      createdAt: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(
        collection(db, `cities/${citySlug}/markers`),
        newMarker
      );

      if (images.length > 0) {
        const imageUrls = await uploadImages(docRef.id);
        await updateDoc(doc(db, `cities/${citySlug}/markers`, docRef.id), {
          imageUrls,
        });
      }

      onAddMarker(newMarker);
      showSuccessAlert(
        "Sucesso",
        "Pedido enviado com sucesso, preste atenção ao meio de contato informado!"
      );
      navigate(`/${citySlug}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      showErrorAlert(
        "Desculpe",
        "Houve um problema solicitando a sua ajuda. Tente novamente, por favor."
      );
    }

    setRecaptchaToken("");
    onClose();
  }, 200);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Realizar pedido de ajuda"
    >
      <Typography variant="h5">Realizar pedido de ajuda</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Contato (Telefone, pessoa, etc.)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Identificação (Nome, CPF, RG, etc.)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Descrição do Ocorrido"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          multiline
          margin="normal"
        />
        <FormGroup>
          <Typography variant="subtitle1">Recursos Necessários:</Typography>
          <div>
            {Object.entries(needsMapping).map(([key, { label, icon }]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    name={key}
                    checked={Boolean(needs[key])}
                    onChange={(event) => handleCheckboxChange(event)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    {icon}
                    <Typography style={{ marginLeft: "8px" }}>
                      {label}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </div>
        </FormGroup>

        {cityHallPeople && (
          <FormGroup style={{ marginTop: "16px" }}>
            <Typography variant="subtitle1">
              Administrações Municipais:
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="cityHall"
                  checked={isCityHall}
                  onChange={handleCityHallChange}
                />
              }
              label="Acesso exclusivo à prefeitura"
            />
          </FormGroup>
        )}
        <Typography variant="subtitle1" style={{ marginTop: "16px" }}>
          Fotos (máximo 5)
        </Typography>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{ marginBottom: "16px" }}
        />
        <GoogleReCaptcha onVerify={handleCaptchaVerification} />
        <Typography
          variant="body2"
          sx={{
            width: "100%",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Compartilharemos o seu pedido. Documentos serão preservados apenas à
          triagem. Ao enviar seu pedido, você aceita os{" "}
          <a href="/Termos_e_Condicoes.pdf">Termos e Condições</a>.
        </Typography>
        {loading ? (
          <CircularProgress style={{ margin: "16px" }} />
        ) : (
          <>
            <Button
              type="button"
              variant="contained"
              color="primary"
              style={{ marginTop: "16px" }}
              onClick={confirmAndSubmit}
            >
              Realizar pedido
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outlined"
              color="secondary"
              style={{ marginTop: "16px", marginLeft: "8px" }}
            >
              Cancelar
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default HelpedRequestFormModal;
