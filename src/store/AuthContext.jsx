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

function normalizarUsuario(dados) {
  const email = dados.email;
  return {
    id: dados.id,
    email,
    perfil: dados.perfil,
    nome: email,
    cargo: nomeDoPerfil(dados.perfil),
    iniciais: iniciaisDe(email),
  };
}

function lerSessao() {
  try {
    const salvo = sessionStorage.getItem(KEY_USUARIO);
    if (!salvo) return null;
    const dados = JSON.parse(salvo);
    if (dados.perfil === "DEMO") {
      return {
        ...dados,
        iniciais: iniciaisDe(dados.nome || "Demonstração"),
      };
    }
    return normalizarUsuario(dados);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  // Autenticação real: envia email/senha ao endpoint do Spring Boot.
  const autenticar = useCallback(async ({ email, senha }) => {
    const resposta = await api.post(endpoints.login, {
      email: email.trim(),
      senha,
    });

    const autenticado = normalizarUsuario(resposta.data);
    try {
      // O backend atual retorna id, email e perfil, mas ainda não emite JWT.
      sessionStorage.setItem(
        KEY_USUARIO,
        JSON.stringify({
          id: autenticado.id,
          email: autenticado.email,
          perfil: autenticado.perfil,
        })
      );
    } catch {
      // A sessão continua disponível em memória se o storage estiver bloqueado.
    }
    setUsuario(autenticado);
    return autenticado;
  }, []);

  // Mantém o acesso demonstrativo separado do login validado pela API.
  const loginDemo = useCallback(({ nome, cargo = "Modo Demonstração" }) => {
    const demonstracao = {
      id: null,
      email: null,
      perfil: "DEMO",
      nome: nome.trim(),
      cargo,
      iniciais: iniciaisDe(nome),
    };
    try {
      sessionStorage.setItem(
        KEY_USUARIO,
        JSON.stringify({
          id: null,
          email: null,
          perfil: "DEMO",
          nome: demonstracao.nome,
          cargo,
        })
      );
    } catch {
      // Continua em memória.
    }
    setUsuario(demonstracao);
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
    () => ({ usuario, autenticar, loginDemo, logout }),
    [usuario, autenticar, loginDemo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
