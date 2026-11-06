import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api, { endpoints } from "../lib/api";

const AuthContext = createContext(null);

const KEY_USUARIO = "neodemanda:usuario";

const iniciaisDe = (nome) =>
  nome
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");

const nomeDoPerfil = (perfil) => {
  if (perfil === "ANALISTA") return "Analista";
  if (perfil === "PROJETISTA") return "Projetista";
  return perfil || "Usuário";
};

// `papel` é a área do portal escolhida no login ("projetista" ou "analista").
// A API valida as credenciais; o papel define qual dashboard a pessoa vê.
function normalizarPapel(papel) {
  return papel === "analista" ? "analista" : "projetista";
}

function normalizarUsuario(dados, papel) {
  const email = dados.email;
  const papelFinal = normalizarPapel(papel ?? dados.papel);
  return {
    id: dados.id,
    email,
    perfil: dados.perfil,
    papel: papelFinal,
    nome: email,
    cargo: papelFinal === "analista" ? "Analista" : nomeDoPerfil(dados.perfil),
    iniciais: iniciaisDe(email),
  };
}

function lerSessao() {
  try {
    const salvo = sessionStorage.getItem(KEY_USUARIO);
    if (!salvo) return null;
    const dados = JSON.parse(salvo);
    // Sessões antigas de demonstração não são mais aceitas.
    if (!dados || dados.perfil === "DEMO" || !dados.email) return null;
    return normalizarUsuario(dados);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  // Autenticação real: envia email/senha ao endpoint do Spring Boot.
  const autenticar = useCallback(async ({ email, senha, papel }) => {
    const resposta = await api.post(endpoints.login, {
      email: email.trim(),
      senha,
    });

    const autenticado = normalizarUsuario(resposta.data, papel);
    try {
      // O backend atual retorna id, email e perfil, mas ainda não emite JWT.
      sessionStorage.setItem(
        KEY_USUARIO,
        JSON.stringify({
          id: autenticado.id,
          email: autenticado.email,
          perfil: autenticado.perfil,
          papel: autenticado.papel,
        })
      );
    } catch {
      // A sessão continua disponível em memória se o storage estiver bloqueado.
    }
    setUsuario(autenticado);
    return autenticado;
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY_USUARIO);
      // Limpa também as chaves usadas pelo login demonstrativo antigo.
      sessionStorage.removeItem("neodemanda_user");
      sessionStorage.removeItem("neodemanda_role");
    } catch {
      // Ignora indisponibilidade do sessionStorage.
    }
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, autenticar, logout }),
    [usuario, autenticar, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
