import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import InputMask from "react-input-mask";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistration, setIsRegistration] = useState(
    initialIsRegistration || false
  );

  const [error, setError] = useState("");

  const auth = getAuth();
  const db = getFirestore();

  const [usePhone, setUsePhone] = useState(true); // State to track whether to use phone or email

  const handleToggle = (event) => {
    setUsePhone(!event.target.checked);
    setEmail("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const userIdentifier = phoneNumber
      ? `${phoneNumber
          .replaceAll(" ", "")
          .replaceAll("(", "")
          .replaceAll(")", "")
          .replaceAll("-", "")
          .trim()}@reconstroirs.me`
      : email;

    console.log(userIdentifier);

    if (isRegistration) {
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userIdentifier,
          password
        );
        console.log({
          phoneNumber,
          role: "helping",
        });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          phoneNumber,
          userIdentifier,
          role: "helping",
        });
        setError("");
        onSuccess("Registrado e logado com sucesso!");
      } catch (err) {
        setError(`Falha ao registrar. Verifique seus dados. (${err.message})`);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, userIdentifier, password);
        setError("");
        onSuccess("Logado com sucesso!");
      } catch (err) {
        setError(`Login falhou. Verifique suas credenciais. (${err.message})`);
      }
    }
  };

  const renderPhoneNumber = () => (
    <InputMask
      mask={"(99) 99999-9999"}
      value={phoneNumber}
      onChange={(e) => setPhoneNumber(e.target.value)}
      disabled={!usePhone}
    >
      {() => <TextField label="Telefone" fullWidth required margin="normal" />}
    </InputMask>
  );

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRegistrationMode = () => setIsRegistration(!isRegistration);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Typography variant="h5">
        {isRegistration ? "Quero Ajudar" : "Acessar"}
      </Typography>

      {isRegistration && (
        <Typography variant="body1" p={2}>
          Para ajudar eficazmente nas enchentes do RS, precisamos apenas de
          alguns dados básicos seus.
        </Typography>
      )}
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "400px" }}>
        {isRegistration && (
          <>
            <TextField
              label="Nome"
              fullWidth
              required
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {renderPhoneNumber()}
          </>
        )}
        {!isRegistration && (
          <>
            <FormControlLabel
              control={<Switch checked={!usePhone} onChange={handleToggle} />}
              label={usePhone ? "Usar E-mail" : "Usar Telefone"}
            />

            {usePhone && renderPhoneNumber()}

            {!usePhone && (
              <TextField
                label={"E-mail"}
                fullWidth
                required
                margin="normal"
                type={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </>
        )}
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
            <Typography variant="body2">
              Compartilharemos sua ajuda. Ao ajudar, você aceita os{" "}
              <a href="/Termos_e_Condicoes.pdf">Termos e Condições</a>.
            </Typography>
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
            {isRegistration ? "Continuar" : "Entrar"}
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
