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
  TextField,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import { Autocomplete } from "@react-google-maps/api";

const EditCities = () => {
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [cityNames, setCityNames] = useState({});
  const [autocompleteRef, setAutocompleteRef] = useState(null);

  // Fetch all existing cities from Firestore
  useEffect(() => {
    const q = collection(db, "cities");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCities(data);

      // Initialize city names for editing
      const nameMap = {};
      snapshot.docs.forEach((doc) => {
        nameMap[doc.id] = doc.data().name;
      });
      setCityNames(nameMap);
    });

    return unsubscribe;
  }, []);

  // Handle coordinates change via Google Places Autocomplete
  const handlePlaceChanged = async () => {
    if (autocompleteRef && selectedCityId) {
      const place = autocompleteRef.getPlace();
      if (place.geometry) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        // Update city coordinates in Firestore
        const cityDocRef = doc(db, "cities", selectedCityId);
        await updateDoc(cityDocRef, { lat: newLat, lng: newLng });
      }
    }
  };

  // Handle city name change directly in the table cell
  const handleCityNameChange = async (cityId, newName) => {
    setCityNames((prevNames) => ({ ...prevNames, [cityId]: newName }));

    // Update Firestore with new name
    const cityDocRef = doc(db, "cities", cityId);
    await updateDoc(cityDocRef, { name: newName });
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Editar Cidades Existentes
      </Typography>
      {/* External Autocomplete Search */}
      <Autocomplete
        onLoad={setAutocompleteRef}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          label="Pesquisar Localização"
          placeholder="Digite para procurar..."
          fullWidth
          margin="normal"
        />
      </Autocomplete>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome da Cidade</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Set Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell>
                  <Typography>{city.id}</Typography>
                </TableCell>
                {/* Editable City Name */}
                <TableCell>
                  <TextField
                    value={cityNames[city.id] || city.name}
                    onChange={(e) =>
                      handleCityNameChange(city.id, e.target.value)
                    }
                    fullWidth
                  />
                </TableCell>
                {/* Display coordinates */}
                <TableCell>{city.lat}</TableCell>
                <TableCell>{city.lng}</TableCell>
                {/* Set Location Icon */}
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => setSelectedCityId(city.id)}
                  >
                    <MyLocationIcon />
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

export default EditCities;
