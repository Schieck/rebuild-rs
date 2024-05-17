import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { debounce } from "lodash";
import { Button, Tooltip, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

const containerStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
};

const mapStyles = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
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

const defaultCenter = { lat: -29.6488, lng: -53.2517 };

function HelpMap({
  requests,
  onMapChange,
  externalMapCenter,
  initialMapZoom,
  notShowSearch = false,
}) {
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(8);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMapCenter(externalMapCenter);
    setMapZoom(initialMapZoom ? initialMapZoom : 13);
  }, [externalMapCenter, initialMapZoom]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setMapCenter(defaultCenter);
        }
      );
    } else {
      setMapCenter(defaultCenter);
    }
  }, []);

  const debouncedUpdateMapDetails = useCallback(
    debounce(() => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        const zoom = mapRef.current.getZoom();
        const center = mapRef.current.getCenter();
        if (bounds) {
          const northeast = bounds.getNorthEast();
          const southwest = bounds.getSouthWest();
          const mapBounds = {
            north: northeast.lat(),
            east: northeast.lng(),
            south: southwest.lat(),
            west: southwest.lng(),
          };
          onMapChange(zoom, mapBounds, center);
        }
      }
    }, 1000),
    [onMapChange]
  );

  const handleZoomChanged = () => {
    setMapZoom(mapRef.current?.getZoom() || 8);
    debouncedUpdateMapDetails();
  };

  const handleBoundsChanged = () => {
    debouncedUpdateMapDetails();
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
    debouncedUpdateMapDetails();
  };

  const handleSearchBoxPlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newCenter);
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(13);
      }
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    mapRef.current.panTo({ lat: marker.lat, lng: marker.lng });
  };

  return (
    <div style={containerStyle}>
      {!notShowSearch && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <StandaloneSearchBox
            onLoad={(searchBox) => (searchBoxRef.current = searchBox)}
            onPlacesChanged={handleSearchBoxPlacesChanged}
          >
            <input
              type="text"
              placeholder="Procurar regiões"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid gray",
              }}
            />
          </StandaloneSearchBox>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={mapZoom}
        options={{ styles: mapStyles, mapTypeId: "hybrid" }}
        onZoomChanged={handleZoomChanged}
        onBoundsChanged={handleBoundsChanged}
        onLoad={handleMapLoad}
      >
        <MarkerClusterer>
          {(clusterer) =>
            requests.map((request) => (
              <Marker
                key={request.id}
                position={{ lat: request.lat, lng: request.lng }}
                clusterer={clusterer}
                onClick={() => handleMarkerClick(request)}
              />
            ))
          }
        </MarkerClusterer>
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h2>{selectedMarker.title}</h2>
              <p>
                {selectedMarker.description?.substring(0, 16) + "..." ||
                  "Sem Descrição."}
              </p>

              {selectedMarker.isCityHall && (
                <Tooltip title="Este pedido foi criado e verificado pela prefeitura, recebendo um cuidado extra.">
                  <Chip icon={<SecurityIcon />} color="primary" />
                </Tooltip>
              )}

              <Button
                variant="outlined"
                onClick={() =>
                  navigate(
                    `/${selectedMarker.city}/marker/${selectedMarker.id}`
                  )
                }
                startIcon={<VisibilityIcon />}
              >
                Ver
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default HelpMap;
