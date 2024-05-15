import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { showSuccessAlert, showErrorAlert } from "../utils/alerts";
import { setUserRole } from "../utils/roles";
import { roleMapping } from "../utils/roleMapping";
import { useNavigate, useParams } from "react-router-dom";
import { toCityName } from "../utils/utils";

function generatePassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+?><:{}[]";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function AdminPanel() {
  const auth = getAuth();
  const db = getFirestore();
  const { citySlug } = useParams();
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("city_hall");
  const [city, setCity] = useState(citySlug || "");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (citySlug && auth.city && citySlug !== auth.city) {
      navigate(`/${citySlug}`);
    }

    const userQuery = query(
      collection(db, "users"),
      where("city", "==", citySlug)
    );
    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });
    return unsubscribe;
  }, [db, citySlug, auth.city, navigate]);

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUserId(user.id);
      setEmail(user.email);
      setName(user.name);
      setRole(user.role);
      setCity(citySlug);
    } else {
      setEditingUserId(null);
      setEmail("");
      setName("");
      setRole("city_hall");
      setCity(citySlug);
      setPassword(generatePassword());
    }
    setError("");
    setModalOpen(true);
  };

  const closeUserModal = () => {
    setModalOpen(false);
  };

  const handleSaveUser = async () => {
    if (editingUserId) {
      const userRef = doc(db, "users", editingUserId);
      await updateDoc(userRef, { name, role, citySlug });
      showSuccessAlert(
        "Usuário Atualizado",
        `Dados de ${name} atualizados com sucesso.`
      );
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await setUserRole(
          userCredential.user.uid,
          role.toLowerCase(),
          email,
          toCityName(name),
          city
        );
        showSuccessAlert(
          "Usuário Criado",
          `Usuário ${name} criado com sucesso. Senha: ${password}`
        );
      } catch (err) {
        showErrorAlert("Erro ao Salvar Usuário", err.message);
        setError(err.message);
      }
    }
    closeUserModal();
  };

  return (
    <Paper style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Painel do Administrador
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => openUserModal()}
        style={{ marginBottom: "20px" }}
      >
        Novo Usuário
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>E-mail</TableCell>
            <TableCell>Função</TableCell>
            <TableCell>Cidade</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {roleMapping[user.role] ? (
                  <span>
                    {roleMapping[user.role].icon} {roleMapping[user.role].label}
                  </span>
                ) : (
                  user.role
                )}
              </TableCell>
              <TableCell>{user.city}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => openUserModal(user)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={modalOpen} onClose={closeUserModal}>
        <DialogTitle>
          {editingUserId ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            fullWidth
          />
          {!editingUserId && (
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              fullWidth
            />
          )}
          <FormControl margin="normal" fullWidth required>
            <InputLabel>Função</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Função"
            >
              {Object.entries(roleMapping).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography>{toCityName(citySlug)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} color="primary" variant="contained">
            {editingUserId ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
      {error && <Typography color="error">{error}</Typography>}
    </Paper>
  );
}

export default AdminPanel;
