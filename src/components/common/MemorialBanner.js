import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const MemorialBanner = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px 0',
        borderBottom: '4px solid #FFD700',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          🕊️ Memorial - Rebuild RS
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          Este projeto ajudou milhares de pessoas durante as enchentes de 2024 no Rio Grande do Sul.
          Os dados pessoais foram protegidos para resguardar a privacidade das vítimas.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            marginTop: '8px',
            opacity: 0.7,
            fontStyle: 'italic',
          }}
        >
          Esta é uma versão somente leitura preservada como memorial histórico.
        </Typography>
      </Container>
    </Box>
  );
};

export default MemorialBanner;


