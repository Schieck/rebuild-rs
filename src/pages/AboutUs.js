import React from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
} from "@mui/material";
import PublicHeader from "../components/common/PublicHeader";

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const volunteers = [
    {
      name: "Ricardo Schieck",
      description: "Founder",
      imgSrc: "/volunteers/rick.png",
    },
    {
      name: "Adria Meira",
      description: "Product Design",
      imgSrc: "/volunteers/adria.png",
    },
    {
      name: "Katrine Silveira",
      description: "UX/UI Design",
      imgSrc: "/volunteers/katrine.png",
    },
    {
      name: "Karoline Braatz",
      description: "Digital Media",
      imgSrc: "/volunteers/karoline.png",
    },
    {
      name: "Diônifer Alan",
      description: "Strategic Consultant",
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
              Junte-se a nós nessa jornada de esperança e renovação.{" "}
              <span style={{ color: theme.palette.secondary.main }}>
                Juntos, somos mais fortes.
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ p: isMobile ? 2 : "3rem" }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Sobre a Reconstrói RS
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Reconstrói RS é uma plataforma digital sem fins lucrativos
              dedicada a conectar vítimas das enchentes no Rio Grande do Sul com
              voluntários e gestores públicos. Nossa missão é facilitar a
              reconstrução das comunidades atingidas, promovendo solidariedade e
              eficiência no auxílio.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Nossa Missão
            </Typography>
            <Typography variant="body1">
              "Reconstruindo juntos" é nossa filosofia. Conectamos quem precisa
              de ajuda com quem pode ajudar, proporcionando auxílio imediato e
              eficaz.
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
          <span style={{ fontWeight: "bold" }}>Voluntários |</span>{" "}
          <span style={{ fontWeight: "normal" }}>Reconstrói RS</span>
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {volunteers.map((volunteer, index) => (
            <Grid item key={index}>
              <Box sx={{ textAlign: "center" }}>
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
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default AboutUs;
