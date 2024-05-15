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
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
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
import InputMask from "react-input-mask";
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
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [description, setDescription] = useState("");
  const [needs, setNeeds] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [isCityHall, setIsCityHall] = useState(cityHallPeople || false);
  const [shelterOption, setShelterOption] = useState("none");
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  const [elderly, setElderly] = useState(0);
  const [pcd, setPcd] = useState(false);
  const navigate = useNavigate();

  const options = Object.entries(needsMapping)
    .filter(([key]) => key !== "familyShelter" && key !== "temporaryShelter")
    .map(([key, { label, icon }]) => ({
      key,
      label,
      icon,
    }));

  const handleAutocompleteChange = (event, value) => {
    setNeeds(value);
  };

  const handleCaptchaVerification = (token) => {
    setRecaptchaToken(token);
  };

  const handleCityHallChange = (event) => {
    setIsCityHall(event.target.checked);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files).slice(0, 5); // Limit to 5 images
    setImages(files);
  };

  const handleShelterChange = (event, newShelterOption) => {
    setShelterOption(newShelterOption);
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
      contact: `${name} - ${contact}`,
      document,
      isCityHall,
      description,
      needs: {
        ...needs.reduce((acc, need) => ({ ...acc, [need.key]: true }), {}),
        ...(shelterOption === "familyShelter" && { familyShelter: true }),
        ...(shelterOption === "temporaryShelter" && { temporaryShelter: true }),
      },
      status: isCityHall ? "inProgress" : "triage",
      index: 100000000,
      createdAt: Timestamp.now(),
      adults,
      kids,
      elderly,
      pcd,
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
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <Typography variant="h5" textAlign={"center"}>
        Preciso de Ajuda
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" mt={2}>
          1. Dados Básicos
        </Typography>
        <Box sx={{ display: "flex", columnGap: "1rem" }}>
          <TextField
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <InputMask
            mask={"(99) 99999-9999"}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          >
            {() => (
              <TextField
                label="Telefone"
                fullWidth
                margin="normal"
                type="tel"
              />
            )}
          </InputMask>
        </Box>
        <TextField
          label="Identificação (CPF, RG, CNH, etc.)"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <TextField
            label="Adultos"
            type="number"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Crianças (até 12 anos)"
            type="number"
            value={kids}
            onChange={(e) => setKids(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Idosos"
            type="number"
            value={elderly}
            onChange={(e) => setElderly(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={pcd}
              onChange={(e) => setPcd(e.target.checked)}
            />
          }
          label="Há pessoa com deficiência física (PCD)"
          style={{ marginTop: "16px" }}
        />
        <Typography variant="h6" mt={2}>
          2. Qual a sua situação?
        </Typography>
        <FormControl component="fieldset" style={{ marginTop: "16px" }}>
          <Typography variant="body2" mt={2}>
            Estou em:
          </Typography>
          <ToggleButtonGroup
            value={shelterOption}
            exclusive
            onChange={handleShelterChange}
            aria-label="shelter"
            row
          >
            <ToggleButton value="none" aria-label="none">
              {shelterOption === "none" && <HomeIcon color="primary" />}
              Casa
            </ToggleButton>
            <ToggleButton value="familyShelter" aria-label="familyShelter">
              {shelterOption === "familyShelter" &&
                needsMapping["familyShelter"].icon}
              Familiares
            </ToggleButton>
            <ToggleButton
              value="temporaryShelter"
              aria-label="temporaryShelter"
            >
              {shelterOption === "temporaryShelter" &&
                needsMapping["temporaryShelter"].icon}
              Abrigo
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <TextField
          label="Conte o que aconteceu aqui."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          margin="normal"
        />
        <FormGroup>
          <Autocomplete
            mt={2}
            multiple
            options={options}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                {option.icon}
                <Typography style={{ marginLeft: "8px" }}>
                  {option.label}
                </Typography>
              </Box>
            )}
            value={needs}
            onChange={handleAutocompleteChange}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            renderInput={(params) => (
              <TextField {...params} label="Recursos Necessários" />
            )}
          />
        </FormGroup>
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
        <br />
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
