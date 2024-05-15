import React from "react";
import { Button, Box } from "@mui/material";
import { generateShareLinks } from "../../utils/utils";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";

const ShareLocation = ({ latitude, longitude }) => {
  const { googleMapsLink, wazeLink, appleMapsLink } = generateShareLinks(
    latitude,
    longitude
  );

  return (
    <Box
      display="flex"
      justifyContent="space-around"
      alignItems="center"
      mt={2}
    >
      <Button
        variant="contained"
        color="primary"
        href={googleMapsLink}
        target="_blank"
        startIcon={<GoogleIcon />}
        style={{ margin: "8px" }}
      >
        Maps
      </Button>
      <Button
        variant="contained"
        color="secondary"
        href={wazeLink}
        target="_blank"
        startIcon={
          <img
            src="/icons/waze-icon.svg"
            alt="Waze"
            style={{ width: "20px", height: "20px", color: "white" }}
          />
        }
        style={{ margin: "8px" }}
      >
        Waze
      </Button>
      <Button
        variant="contained"
        href={appleMapsLink}
        target="_blank"
        startIcon={<AppleIcon />}
        style={{ margin: "8px" }}
      >
        Maps
      </Button>
    </Box>
  );
};

export default ShareLocation;
