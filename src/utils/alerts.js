import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "@sweetalert2/theme-material-ui/material-ui.min.css";

export const showAlert = (title, text, icon) => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
  });
};

export const showSuccessAlert = (
  title = "Success",
  text = "Operação realizada com sucesso."
) => {
  showAlert(title, text, "success");
};

export const showErrorAlert = (
  title = "Error",
  text = "Ocorreu um probleminha, tente novamente."
) => {
  showAlert(title, text, "error");
};

export const showConfirmationAlert = async (
  title,
  text,
  confirmButtonText = "Sim"
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Não",
  });

  return result.isConfirmed;
};
