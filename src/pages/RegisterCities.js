import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab } from "@mui/material";
import RegisterCityRequests from "./RegisterCityRequests";
import EditCities from "./EditCities";

function RegisterCities() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Cidades
      </Typography>

      <Paper>
        {/* Tabs for switching between requests and editing */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Solicitações de Cidade" />
          <Tab label="Editar Cidades Existentes" />
        </Tabs>

        {/* Render content based on active tab */}
        {tabIndex === 0 && <RegisterCityRequests />}
        {tabIndex === 1 && <EditCities />}
      </Paper>
    </Box>
  );
}

export default RegisterCities;
