import api from "./apiService";

const DEFAULT_SUCCESS_MESSAGE =
  "Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.";

export const requestPasswordResetLink = async ({ email } = {}) => {
  if (!email) {
    throw new Error("El correo es requerido");
  }

  try {
    const response = await api.post("/forgot-password", { email });

    if (response?.success === false) {
      const message =
        response?.message ||
        response?.error ||
        "No se pudo enviar el correo de recuperación";
      throw new Error(message);
    }

    return {
      success: true,
      message: response?.message || DEFAULT_SUCCESS_MESSAGE,
      payload: response,
    };
  } catch (error) {
    const message =
      error?.message ||
      error?.payload?.message ||
      "No se pudo enviar el correo de recuperación";
    throw new Error(message);
  }
};

export const resetPasswordWithToken = async ({
  token,
  email,
  password,
  password_confirmation,
} = {}) => {
  if (!token) throw new Error("Token requerido");
  if (!email) throw new Error("El correo es requerido");
  if (!password) throw new Error("La contraseña es requerida");

  try {
    const response = await api.post("/reset-password", {
      token,
      email,
      password,
      password_confirmation,
    });

    if (response?.success === false) {
      const message =
        response?.message || response?.error || "No se pudo restablecer";
      throw new Error(message);
    }

    return {
      success: true,
      message:
        response?.message ||
        "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
      payload: response,
    };
  } catch (error) {
    const message =
      error?.message ||
      error?.payload?.message ||
      "No se pudo restablecer la contraseña";
    throw new Error(message);
  }
};
