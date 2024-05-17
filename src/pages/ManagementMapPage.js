import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  IconButton,
  MenuItem,
  ListItemText,
  Select,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import ManagementHelpDetailsModal from "../components/modals/ManagementHelpDetailsModal";
import { useAuth } from "../services/AuthProvider";
import * as debounce from "lodash/debounce";
import { needsMapping } from "../utils/needsMapping";
import { statusMapping } from "../utils/statusMapping";
import KanbanBoard from "../components/ui/KanbanBoard";

const containerStyle = {
  width: "100vw",
  height: "70vh",
};

const sidebarStyle = {
  width: 250,
};

const DEFAULT_LOCATION = {
  lat: -29.6488,
  lng: -53.2517,
};

const ManagementMapPage = ({ citySlug }) => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [view, setView] = useState("map");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("inProgress");
  const user = useAuth();
  const mapRef = useRef(null);

  const [hoveredMarker, setHoveredMarker] = useState(null);

  const handleMarkerMouseOver = debounce((marker) => {
    setHoveredMarker(marker);
  }, 200);

  const handleMarkerMouseOut = () => {
    setHoveredMarker(null);
  };

  const generateQuery = (citySlug, filterStatus) => {
    let queryConstraints = [
      orderBy("index", "asc"),
      orderBy("createdAt", "asc"),
    ];

    if (filterStatus) {
      queryConstraints.push(where("status", "==", filterStatus));
    }

    return query(
      collection(db, `cities/${user.city}/markers`),
      ...queryConstraints
    );
  };

  const mapStyles = [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
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

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedMarkers = Array.from(markers);
    const [movedMarker] = reorderedMarkers.splice(source.index, 1);
    reorderedMarkers.splice(destination.index, 0, movedMarker);

    setMarkers(reorderedMarkers);

    try {
      reorderedMarkers.forEach(async (marker, index) => {
        const markerRef = doc(db, `cities/${user.city}/markers`, marker.id);
        await updateDoc(markerRef, { index });
      });
    } catch (error) {
      console.error("Error updating marker indexes:", error);
    }
  };

  useEffect(() => {
    const q = generateQuery(citySlug, filterStatus);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMarkers = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        index,
      }));
      setMarkers(updatedMarkers);
    });

    return () => unsubscribe();
  }, [citySlug, filterStatus]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const closeDetailsModal = () => {
    setSelectedMarker(null);
  };

  const statusCounts = markers?.reduce((acc, marker) => {
    const status = marker.status;
    if (acc[status]) {
      acc[status] += 1;
    } else {
      acc[status] = 1;
    }
    return acc;
  }, {});

  const handleKanbanDragEnd = async (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const updatedMarkers = [...markers];
    const movedMarkerIndex = updatedMarkers.findIndex(
      (marker) => marker.id === draggableId
    );
    updatedMarkers[movedMarkerIndex].status = destination.droppableId;

    setMarkers(updatedMarkers);

    const markerRef = doc(db, `cities/${user.city}/markers`, draggableId);
    await updateDoc(markerRef, { status: destination.droppableId });
    const logUserUpdate = async () => {
      const userReadRef = collection(db, "userUpdates");
      await addDoc(userReadRef, {
        userId: user.uid,
        markerId: draggableId,
        newObject: { status: destination.droppableId },
        type: "helper_page_complete",
        timestamp: new Date(),
      });
    };
    logUserUpdate();
  };

  const getStatusColumns = () => {
    return Object.keys(statusMapping).map((key) => ({
      id: key,
      title: statusMapping[key].label,
      markers: markers.filter((marker) => marker.status === key),
    }));
  };

  return (
    <Box display="flex">
      {/* Sidebar for ordering */}
      <Drawer open={sidebarOpen} onClose={toggleSidebar} anchor="left">
        <Box style={sidebarStyle} role="presentation">
          <Typography variant="h6" p={2}>
            Ordenar Pedidos
          </Typography>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="order-list">
              {(provided, snapshot) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {markers.map((marker, index) => (
                    <Draggable
                      key={marker.id}
                      draggableId={marker.id}
                      index={index}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ListItemText
                            primary={`#${index + 1}`}
                            secondary={`${
                              marker.contact.substring(0, 6) + "**"
                            } - ${marker.description.substring(0, 16) + "**"}`}
                          />
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Drawer>

      {/* Map and Filters */}
      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between" p={2}>
          <IconButton onClick={toggleSidebar}>
            <MenuIcon />
            <Typography>Ordenar Pedidos</Typography>
          </IconButton>
          <Box display="flex" justifyContent="center" alignItems="center">
            {Object.entries(statusMapping).map(([key, { label, icon }]) => (
              <Box
                key={key}
                display="flex"
                flexDirection="column"
                alignItems="center"
                mx={2}
              >
                {icon}
                <Typography variant="subtitle2">{label}</Typography>
                <Typography variant="h6">{statusCounts[key] || 0}</Typography>
              </Box>
            ))}
          </Box>
          <Button
            onClick={() =>
              setView((prev) => (prev === "map" ? "kanban" : "map"))
            }
          >
            {view === "map" ? "Ver Kanban" : "Ver Mapa"}
          </Button>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            style={{ width: "200px" }}
          >
            <MenuItem value="">Todos os Status</MenuItem>
            {Object.entries(statusMapping).map(([key, { label }]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {view === "map" ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={DEFAULT_LOCATION}
            zoom={11}
            onLoad={(map) => (mapRef.current = map)}
            options={{
              styles: mapStyles,
              mapTypeId: "hybrid",
            }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                variant="danger"
                label={{
                  text: `${marker.index + 1}`, // Display the index starting from 1
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => {
                  handleMarkerClick(marker);
                  setHoveredMarker(null);
                }}
                onMouseOver={() => handleMarkerMouseOver(marker)}
                onMouseOut={handleMarkerMouseOut}
              >
                <Typography variant="subtitle2">Detalhes do Pedido</Typography>
              </Marker>
            ))}
            {/* Show tooltip when hovering over a marker */}
            {hoveredMarker && (
              <InfoWindow
                position={{ lat: hoveredMarker.lat, lng: hoveredMarker.lng }}
                onCloseClick={() => setHoveredMarker(null)}
              >
                <Box
                  onClick={() => {
                    handleMarkerClick(hoveredMarker);
                    setHoveredMarker(null);
                  }}
                >
                  <Typography variant="subtitle2">
                    {/* Reference summary for the hovered marker */}
                    S: {statusMapping[hoveredMarker.status].icon} <br />
                    N:
                    {Object.keys(hoveredMarker.needs || {})
                      .filter((key) => hoveredMarker.needs[key])
                      .map((key) => needsMapping[key].icon)}
                    <br />
                    C: {hoveredMarker.contact.substring(0, 6) + "..."}
                  </Typography>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <KanbanBoard
            columns={getStatusColumns()}
            onDragEnd={handleKanbanDragEnd}
            onMarkerClick={handleMarkerClick}
          />
        )}
      </Box>

      {/* Details Modal */}
      {selectedMarker && (
        <ManagementHelpDetailsModal
          open={Boolean(selectedMarker)}
          onClose={closeDetailsModal}
          marker={selectedMarker}
          citySlug={user.city}
        />
      )}
    </Box>
  );
};

export default ManagementMapPage;
