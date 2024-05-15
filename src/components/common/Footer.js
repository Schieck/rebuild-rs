import React from "react";
import {
  Box,
  Typography,
  Link,
  Grid,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.palette.primary.dark,
          color: "white",
          p: "2rem 15%",
        }}
      >
        <Grid container>
          <img
            src="/icons/logo-nova.png"
            alt="Logo"
            style={{ height: "80px", marginRight: "16px" }}
          />
        </Grid>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={4}>
            <Grid>
              <Typography variant="body1" fontWeight="200">
                Cada Doação,
              </Typography>
              <Typography variant="body1" fontWeight="200">
                Cada Voluntário,
              </Typography>
              <Typography variant="body1" fontWeight="200">
                Cada Ação Conta.
              </Typography>
              <Typography variant="body1" fontWeight="600">
                Faça parte da reconstrução.
              </Typography>
            </Grid>
            <></>
            <Box mt={2}>
              <Button
                variant="outlined"
                underline="hover"
                target="_blank"
                href="https://www.instagram.com/reconstroirs.me"
                color="inherit"
                case
              >
                <InstagramIcon />
                <Typography
                  variant="body2"
                  fontWeight={400}
                  marginLeft={1}
                  maxWidth={"15rem"}
                  textTransform={"none"}
                >
                  Nos siga no Instagram e fique por dentro das atualizações.
                </Typography>
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}></Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Navegar
            </Typography>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/"
              color="inherit"
              display="block"
            >
              Home
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/#needHelp"
              color="inherit"
              display="block"
            >
              Preciso de ajuda
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/todos/public-help"
              color="inherit"
              display="block"
            >
              Quero ajudar
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/#cityHallAccess"
              color="inherit"
              display="block"
            >
              Acesso prefeitura
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/about-us"
              color="inherit"
              display="block"
            >
              Sobre nós
            </Link>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Cadastros
            </Typography>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="/todos/public-help"
              color="inherit"
              display="block"
            >
              Quero ser voluntário
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="https://wa.me/+5555996258202?text=Quero%20cadastrar%20a%20prefeitura%20do%20meu%20munic%C3%ADpio!"
              target="_blank"
              color="inherit"
              display="block"
            >
              Cadastro de prefeituras
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              href="https://github.com/schieck/rebuild-rs"
              target="_blank"
              color="inherit"
              display="block"
            >
              Github => Ajudar no Código
            </Link>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Ajuda
            </Typography>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              color="inherit"
              display="block"
              target="_blank"
              href="https://www.instagram.com/reel/C63_Npcud4J/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA=="
            >
              Como pedir ajuda
            </Link>
            <Link
              variant="body1"
              fontWeight="200"
              underline="hover"
              target="_blank"
              href="https://www.instagram.com/reel/C66ryJkpUID/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
              color="inherit"
              display="block"
            >
              Como ajudar
            </Link>
          </Grid>
        </Grid>
        <Divider
          sx={{ marginTop: "2rem", marginBottom: "1rem", borderColor: "white" }}
        ></Divider>
        <Grid container width={"100%"}>
          <Typography textAlign={"center"} width={"100%"} variant="body2">
            Criado com ❤️: para os municípios afetados pelas enchentes em 2024
            no Rio Grande do Sul, Brasil.
            <br />© {new Date().getFullYear()} Reconstrói RS. Licensed under the
            MIT License.
          </Typography>
        </Grid>
      </Box>
      <Box
        height="1rem"
        bgcolor={theme.palette.secondary.main}
        width={"100%"}
      ></Box>
      <Box
        height="1rem"
        bgcolor={theme.palette.warning.main}
        width={"100%"}
      ></Box>
    </>
  );
};

export default Footer;
