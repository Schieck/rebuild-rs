import React, { useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
} from "@mui/material";
import DynamicText from "../components/common/DynamicText";
import PublicHeader from "../components/common/PublicHeader";

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const hiddenRef = useRef(null);

  const volunteers = [
    {
      name: "Ricardo Schieck",
      description: "Fundador",
      imgSrc: "/volunteers/rick.png",
    },
    {
      name: "Adria Meira",
      description: "Design de Produto",
      imgSrc: "/volunteers/adria.png",
    },
    {
      name: "Katrine Silveira",
      description: "Design UX/UI",
      imgSrc: "/volunteers/katrine.png",
    },
    {
      name: "Karoline Braatz",
      description: "Mídia Digital",
      imgSrc: "/volunteers/karoline.png",
    },
    {
      name: "Diônifer Alan",
      description: "Consultoria Estratégica",
      imgSrc: "/volunteers/dionifer.png",
    },
  ];

  return (
    <>
      <Box p={isMobile ? 2 : 4}>
        <PublicHeader cityHallAccess={false} hideCityHall={true} />
      </Box>
      <Box sx={{ p: isMobile ? 2 : 4, textAlign: "center" }}>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ textAlign: "left", px: isMobile ? 2 : 8 }}
        >
          <Grid item xs={12} md={6} sx={{ p: isMobile ? 2 : "3rem" }}>
            <Typography variant="h4" gutterBottom>
              Faça parte desta jornada de esperança e renovação.
              <span style={{ color: theme.palette.secondary.main }}>
                Juntos, reconstruímos mais forte.
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ p: isMobile ? 2 : "3rem" }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Sobre o Reconstrói RS
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2 }}
              ref={hiddenRef}
              style={{
                visibility: "hidden",
                height: "0",
                fontSize: "18px",
                margin: 0,
                padding: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              Reconstrói RS é a plataforma que une solidariedade e eficiência
              para reconstruir comunidades afetadas pelas enchentes no Rio
              Grande do Sul. Aqui, conectamos vítimas, voluntários e gestores
              públicos com o objetivo de facilitar a ajuda rápida e organizada.
            </Typography>
            <DynamicText
              hiddenRef={hiddenRef}
              maxFontSize={18}
              minFontSize={14}
            />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Nossa Missão
            </Typography>
            <Typography variant="body1">
              "Reconstruir juntos" é mais do que nossa missão — é nossa
              promessa. Conectamos quem precisa de auxílio com quem está pronto
              para ajudar, garantindo respostas imediatas e eficazes, de forma
              segura.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          pl: isMobile ? 4 : 8,
          pr: isMobile ? 4 : 8,
        }}
      >
        <Divider
          sx={{
            marginTop: "2rem",
            marginBottom: "1rem",
            borderColor: theme.palette.secondary.main,
          }}
        ></Divider>
      </Box>

      <Box
        sx={{
          textAlign: "center",
          p: isMobile ? 2 : 4,
          bgcolor: theme.palette.background.paper,
          borderRadius: "2rem",
          ml: "10%",
          mr: "10%",
          mt: "4rem",
          mb: "4rem",
        }}
      >
        <Typography variant="h5" gutterBottom pb={2}>
          <span style={{ fontWeight: "bold" }}>Nossos Voluntários |</span>{" "}
          <span style={{ fontWeight: "normal" }}>
            Conheça quem fez acontecer
          </span>
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {volunteers.map((volunteer, index) => (
            <Grid
              item
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar
                src={volunteer.imgSrc}
                alt={volunteer.name}
                sx={{
                  width: 100,
                  height: 100,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              />
              <Typography variant="body1" fontWeight="600">
                {volunteer.name}
              </Typography>
              <Typography variant="body2">{volunteer.description}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default AboutUs;
