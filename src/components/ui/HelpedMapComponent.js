import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  where,
} from "firebase/firestore";
import HelpedRequestFormModal from "../modals/HelpedRequestFormModal";
import HelpDetailsModal from "../modals/HelpDetailsModal";
import { getDistanceInKm } from "../../utils/utils";
import { debounce } from "lodash";
import { needsMapping } from "../../utils/needsMapping";
import { statusMapping } from "../../utils/statusMapping";
import { useParams } from "react-router-dom";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const DEFAULT_LOCATION = {
  lat: -29.6488,
  lng: -53.2517,
};

const MAX_DISTANCE_KM = 200;

const HelpedMapComponent = ({ addRequest, user }) => {
  const [markers, setMarkers] = useState([]);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const { citySlug } = useParams();

  const mapStyles = [
    {
      featureType: "poi",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
  ];

  useEffect(() => {
    async function fetchCityCoordinates() {
      const cityDocRef = doc(db, "cities", citySlug);
      const citySnapshot = await getDoc(cityDocRef);

      if (
        citySnapshot.exists() &&
        citySnapshot.data().lat &&
        citySnapshot.data().lng
      ) {
        setUserLocation({
          lat: citySnapshot.data().lat,
          lng: citySnapshot.data().lng,
        });
      } else {
        setUserLocation(DEFAULT_LOCATION);
      }
    }

    fetchCityCoordinates();
  }, [citySlug]);

  useEffect(() => {
    const q = query(
      collection(db, `cities/${citySlug}/markers`),
      where("status", "in", ["inProgress", "pending", "triage"])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMarkers = [];

      querySnapshot.forEach((doc) => {
        const marker = doc.data();
        const distance = getDistanceInKm(
          userLocation.lat,
          userLocation.lng,
          marker.lat,
          marker.lng
        );

        if (distance <= MAX_DISTANCE_KM) {
          updatedMarkers.push({ id: doc.id, ...marker });
        }
      });

      setMarkers(updatedMarkers);
    });

    return () => unsubscribe();
  }, [citySlug, userLocation]);

  const handleSelect = async (selectedAddress) => {
    try {
      const results = await geocodeByAddress(selectedAddress);
      const latLng = await getLatLng(results[0]);

      setAddress(selectedAddress);
      setUserLocation(latLng);

      if (mapRef.current) {
        mapRef.current.panTo(latLng);
        mapRef.current.setZoom(15);
      }
    } catch (error) {
      console.error("Error selecting address:", error);
    }
  };

  const onMapClick = useCallback((event) => {
    const coordinates = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedCoordinates(coordinates);
    setModalOpen(true);
  }, []);

  const addMarker = (newMarker) => {
    setMarkers((current) => [...current, newMarker]);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setShowModal(true);
  };

  const handleMarkerHover = (marker) => {
    setHoveredMarker(marker);
  };

  const handleMouseOut = debounce(() => setHoveredMarker(null), 5000);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => console.log("Copied to clipboard: " + text),
      (err) => console.error("Failed to copy text: ", err)
    );
  };

  const renderInfoWindow = () => {
    if (!hoveredMarker) return null;

    const needsList = Object.keys(hoveredMarker.needs || {})
      .filter((key) => hoveredMarker.needs[key])
      .map((key) => ({
        key,
        icon: needsMapping[key].icon,
      }));

    return (
      <InfoWindow
        position={{ lat: hoveredMarker.lat, lng: hoveredMarker.lng }}
        onCloseClick={() => setHoveredMarker(null)}
      >
        <div
          style={{ display: "flex", flexDirection: "column" }}
          onClick={() => handleMarkerClick(hoveredMarker)}
        >
          {hoveredMarker.description && (
            <>
              <Typography variant="subtitle2">Descrição:</Typography>
              <Typography paragraph>
                {hoveredMarker.description.substring(0, 16) + "..." ||
                  "Sem Descrição."}
              </Typography>
            </>
          )}

          {hoveredMarker.contact && (
            <>
              <Typography variant="subtitle2">Contato:</Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography paragraph>
                  {hoveredMarker.contact.substring(0, 6) + "..." ||
                    "Sem contato."}
                </Typography>
              </div>
            </>
          )}

          {hoveredMarker.status && (
            <>
              <Typography variant="subtitle2">Status:</Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                {statusMapping[hoveredMarker.status].icon}
                <Typography style={{ marginLeft: "8px" }}>
                  {statusMapping[hoveredMarker.status].label}
                </Typography>
              </div>
            </>
          )}

          {needsList.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              {needsList.map((need) => (
                <div
                  key={need.key}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {need.icon}
                </div>
              ))}
            </div>
          ) : (
            <Typography>Sem recursos necessários.</Typography>
          )}
        </div>
      </InfoWindow>
    );
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={12}
        onClick={onMapClick}
        options={{
          styles: mapStyles,
          mapTypeId: "hybrid",
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => handleMarkerClick(marker)}
            onMouseOver={() => handleMarkerHover(marker)}
            onMouseOut={handleMouseOut}
          />
        ))}
        {renderInfoWindow()}
      </GoogleMap>

      {!modalOpen && addRequest && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <h2>Toque no mapa e marque seu pedido de ajuda 📍</h2>
          <PlacesAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={handleSelect}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div>
                <input
                  {...getInputProps({
                    placeholder: "Pesquisar localidade",
                    className: "location-search-input",
                    style: {
                      width: "300px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    },
                  })}
                />
                <div className="autocomplete-dropdown-container">
                  {loading && <div>Carregando...</div>}
                  {suggestions.map((suggestion, index) => {
                    const style = suggestion.active
                      ? { backgroundColor: "#fafafa", cursor: "pointer" }
                      : { backgroundColor: "#ffffff", cursor: "pointer" };

                    return (
                      <div
                        key={index}
                        {...getSuggestionItemProps(suggestion, { style })}
                      >
                        <span>{suggestion.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
        </div>
      )}

      <HelpedRequestFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddMarker={addMarker}
        coordinates={selectedCoordinates}
        citySlug={citySlug}
        userRole={user?.role}
      />

      {selectedMarker && (
        <HelpDetailsModal
          open={showModal}
          onClose={() => setShowModal(false)}
          marker={selectedMarker}
        />
      )}
    </>
  );
};

export default HelpedMapComponent;
