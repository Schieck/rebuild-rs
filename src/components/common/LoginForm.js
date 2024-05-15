import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Autocomplete,
  FormControl,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { toCityName } from "../../utils/utils";

const LoginForm = ({
  onSuccess,
  onCancel,
  hideRegister,
  initialIsRegistration,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistration, setIsRegistration] = useState(
    initialIsRegistration || false
  );
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (isRegistration) {
      const fetchCities = async () => {
        const querySnapshot = await getDocs(collection(db, "cities"));
        const citiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCities(citiesData);
      };
      fetchCities();
    }
  }, [db, isRegistration]);

  useEffect(() => {
    if (navigator.geolocation && isRegistration) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const closestCity = cities?.reduce((prev, curr) => {
            const prevDistance = Math.sqrt(
              Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2)
            );
            const currDistance = Math.sqrt(
              Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2)
            );
            return prevDistance < currDistance ? prev : curr;
          });
          setSelectedCity(closestCity.id);
          setLoadingLocation(false);
        },
        () => {
          setError("Não foi possível obter a localização.");
          setLoadingLocation(false);
        }
      );
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isRegistration) {
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log({
          phoneNumber,
          city: selectedCity,
          role: "helping",
        });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          phoneNumber,
          email,
          city: selectedCity,
          role: "helping",
        });
        setError("");
        onSuccess("Registrado e logado com sucesso!");
      } catch (err) {
        setError(`Falha ao registrar. Verifique seus dados. (${err.message})`);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setError("");
        onSuccess("Logado com sucesso!");
      } catch (err) {
        setError(`Login falhou. Verifique suas credenciais. (${err.message})`);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRegistrationMode = () => setIsRegistration(!isRegistration);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Typography variant="h5">
        {isRegistration ? "Ser Voluntário!" : "Acessar"}
      </Typography>
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "400px" }}>
        <TextField
          label="E-mail"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Senha"
          fullWidth
          required
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {isRegistration && (
          <>
            <TextField
              label="Confirme a Senha"
              fullWidth
              required
              margin="normal"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <TextField
              label="Telefone"
              fullWidth
              required
              margin="normal"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <TextField
              label="Nome"
              fullWidth
              required
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <Autocomplete
                options={cities.map((city) => toCityName(city.name))}
                value={toCityName(selectedCity)}
                onChange={(event, newValue) => {
                  setSelectedCity(
                    cities.find((city) => toCityName(city.name) === newValue)
                      ?.id || ""
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Cidade" margin="normal" />
                )}
              />
            </FormControl>
          </>
        )}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Box width={"100%"} display={"flex"} justifyContent={"center"} p={1}>
          {!hideRegister && (
            <Button
              onClick={toggleRegistrationMode}
              variant="outlined"
              color="warning"
            >
              {isRegistration ? "Já tenho conta" : "Quero me cadastrar"}
            </Button>
          )}
        </Box>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button type="submit" variant="contained" color="primary">
            {isRegistration ? "Registrar" : "Entrar"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;
