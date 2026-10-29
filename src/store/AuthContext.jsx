import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Autenticação de demonstração.
 *
 * Guarda o projetista logado em sessionStorage (mesmas chaves do login
 * antigo: `neodemanda_user` / `neodemanda_role`). Quando o backend Java
 * tiver login de verdade, basta trocar o corpo de `login()` por uma
 * chamada à API e gravar o token em `neodemanda:token` (ver lib/api.js).
 */
const AuthContext = createContext(null);

const KEY_NOME = "neodemanda_user";
const KEY_CARGO = "neodemanda_role";

const iniciaisDe = (nome) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

function lerSessao() {
  try {
    const nome = sessionStorage.getItem(KEY_NOME);
    if (!nome) return null;
    return {
      nome,
      cargo: sessionStorage.getItem(KEY_CARGO) || "Projetista",
      iniciais: iniciaisDe(nome),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  const login = useCallback(({ nome, cargo = "Projetista" }) => {
    const limpo = nome.trim();
    try {
      sessionStorage.setItem(KEY_NOME, limpo);
      sessionStorage.setItem(KEY_CARGO, cargo);
    } catch {
      /* sessionStorage indisponível: segue só em memória */
    }
    setUsuario({ nome: limpo, cargo, iniciais: iniciaisDe(limpo) });
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY_NOME);
      sessionStorage.removeItem(KEY_CARGO);
    } catch {
      /* ignora */
    }
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
