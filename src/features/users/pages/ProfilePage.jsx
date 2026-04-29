import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useUserStore from "../../../shared/stores/useUserStore";
import userService from "../../../shared/api/services/userService";

/**
 * Página de perfil del usuario autenticado
 */
const ProfilePage = () => {
  const { token } = useUserStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil
  const loadProfile = async () => {
    setLoading(true);

    try {
      const res = await userService.getProfile(token);

      if (res.success) {
        setProfile(res.data);
      } else {
        toast.error(res.error || "Error al cargar perfil");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  if (loading) {
    return <p className="p-4">Cargando perfil...</p>;
  }

  if (!profile) {
    return <p className="p-4 text-red-500">No se pudo cargar el perfil</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>

      <div className="space-y-3">
        <p>
          <strong>Nombre:</strong> {profile.nombre}
        </p>

        <p>
          <strong>Email:</strong> {profile.email}
        </p>

        <p>
          <strong>Teléfono:</strong> {profile.telefono || "No registrado"}
        </p>

        <p>
          <strong>Rol:</strong> {profile.rol}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;