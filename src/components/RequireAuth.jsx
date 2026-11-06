import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

/**
 * Protege rotas: sem login, manda para /login com um aviso e guarda a rota
 * pretendida para voltar depois. `papel` restringe a rota a um perfil;
 * quem tem outro papel é levado ao dashboard.
 */
export default function RequireAuth({ papel, children }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          aviso: "Faça login para acessar essa área do portal.",
        }}
      />
    );
  }

  if (papel && usuario.papel !== papel) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
