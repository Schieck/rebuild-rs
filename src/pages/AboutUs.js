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
import { Construction, Group, Public, Code } from "@mui/icons-material";
import DynamicText from "../components/common/DynamicText";
import PublicHeader from "../components/common/PublicHeader";

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
            <DynamicText
              text="Reconstrói RS é a plataforma que une solidariedade e eficiência
              para reconstruir comunidades afetadas pelas enchentes no Rio
              Grande do Sul. Aqui, conectamos vítimas, voluntários e gestores
              públicos com o objetivo de facilitar a ajuda rápida e organizada."
              maxFontSize={18}
              minFontSize={14}
            />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Nossa Missão
            </Typography>
            <DynamicText
              text={`"Reconstruir juntos" é mais do que nossa missão: É nossa promessa.`}
              maxFontSize={18}
              minFontSize={14}
            />
            <DynamicText
              text={`Conectamos quem precisa de auxílio com quem está pronto para ajudar, garantindo respostas imediatas e eficazes, de forma segura.`}
              maxFontSize={18}
              minFontSize={14}
            />
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
                width: "160px",
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
      <Box sx={{ p: isMobile ? 2 : 4, textAlign: "center" }}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="center"
          sx={{ textAlign: "left", px: isMobile ? 2 : 8 }}
        >
          <Grid item xs={12} md={10} lg={8} sx={{ p: isMobile ? 2 : "3rem" }}>
            <Typography
              variant="h4"
              sx={{ mt: 2, mb: 4, fontWeight: "bold", textAlign: "center" }}
            >
              A Inspiração por Trás do Reconstrói RS
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box display="flex" gap="1rem">
                <Construction
                  fontSize="large"
                  sx={{ color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6">Na Linha de Frente</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Imagine uma cidade pequena, onde todos se conhecem e se ajudam
                nos momentos difíceis. Esse é Agudo, o município natal de
                Ricardo Schieck. Quando as enchentes devastaram o interior e
                parte da cidade de Agudo, assim como grandes cidades como POA e
                Canoas, Ricardo viu sua comunidade unida enfrentando a
                tempestade. Ao mesmo tempo, ele também observou muitos lugares
                onde o poder público e os voluntários brigavam entre si. Foi
                ali, no meio da devastação, que nasceu a ideia do{" "}
                <strong>Reconstrói RS</strong>.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box display="flex" gap="1rem">
                <Group
                  fontSize="large"
                  sx={{ color: "secondary.main", mb: 2 }}
                />
                <Typography variant="h6">União Sem Diferenças</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Ricardo não apenas testemunhou a destruição, mas também a
                incrível força de vontade das pessoas ao seu redor. Determinado
                a fazer mais, ele começou a sonhar com uma plataforma que
                pudesse conectar aqueles que precisam de ajuda com aqueles
                dispostos a oferecer auxílio. Uma ferramenta que transformasse
                solidariedade em ação concreta.
              </Typography>
            </Box>

            <Box sx={{ mb: 5 }}>
              <Box display="flex" gap="1rem">
                <Public
                  fontSize="large"
                  sx={{ color: "success.main", mb: 2 }}
                />
                <Typography variant="h6">Expertise Em Ação</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Assim nasceu o <strong>Reconstrói RS</strong>, sua primeira
                versão em 6 horas. Não se trata apenas de reconstruir casas ou
                ruas, mas de restaurar o espírito comunitário e a solidariedade
                entre os gaúchos. A plataforma se tornou um símbolo de
                esperança, mostrando que juntos podemos superar qualquer
                desafio.
              </Typography>
            </Box>

            <Box sx={{ p: 10, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, fontStyle: "italic", fontSize: "1.2rem" }}
              >
                "A solidariedade é a alma da nossa plataforma. Juntos, podemos
                reconstruir e fortalecer nossa comunidade."
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box display="flex" gap="1rem">
                <Code fontSize="large" sx={{ color: "warning.main", mb: 2 }} />
                <Typography variant="h6">Totalmente Transparente</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                O <strong>Reconstrói RS</strong> é também uma iniciativa
                open-source, abrindo as portas para desenvolvedores e
                voluntários de todo o mundo contribuírem e melhorarem a
                plataforma. Essa colaboração global é um testemunho de que a
                solidariedade não tem fronteiras. Junte-se a nós nesta jornada
                de reconstrução e esperança.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AboutUs;
