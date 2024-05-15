import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Typography variant="h2" color="textPrimary" gutterBottom>
        404 - Página Não Encontrada
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        A página que você procura não está disponível.
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/">
        Voltar para a Página Inicial
      </Button>
    </Box>
  );
};

export default NotFoundPage;
