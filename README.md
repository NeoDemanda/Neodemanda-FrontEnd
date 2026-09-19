# NeoDemanda — Frontend

Frontend do projeto **NeoDemanda** (Grupo 2, Projeto 3 — CESAR School / Neoenergia
Pernambuco). Interface para acompanhar projetos elétricos e a validação da
demanda calculada em unidades consumidoras acima de 50 kVA.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS** (tokens do protótipo em `tailwind.config.js`: verde
  institucional `#003D1A`, laranja `#F7941D`, fundo `#EBF0EC`)
- **React Router** para Home, Dashboard, Cadastrar Projeto e Arquivados
- **Axios** como cliente HTTP, já preparado para o backend Java
- **Lucide React** para os ícones

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Conectando com a API Java

O frontend já está pronto para consumir uma API Java (ex: Spring Boot). Não é
necessário alterar nenhum componente — basta:

1. **Em desenvolvimento**: copie `.env.example` para `.env` e ajuste
   `VITE_API_PROXY_TARGET` para o endereço onde o backend Java está rodando
   (por padrão `http://localhost:8080`). O Vite faz o proxy de toda chamada
   para `/api/**`, então não há problema de CORS em dev.

2. **Em produção**: defina `VITE_API_BASE_URL` com a URL pública da API
   (ex: `https://api.neodemanda.neoenergia.com.br`). O cliente em
   `src/lib/api.js` monta a base automaticamente.

Toda a lógica de chamadas fica centralizada em `src/lib/api.js`
(`endpoints`) e `src/store/ProjectsContext.jsx`. Enquanto a API Java não
estiver disponível, a aplicação cai automaticamente para os dados de exemplo
(`src/data/mockProjects.js`), mostra um aviso na tela e mantém cadastro,
arquivamento e restauração funcionando em memória — o suficiente para
demonstrar o fluxo completo.

### Contrato sugerido para o backend Spring Boot

```
GET    /api/projetos                 -> lista de projetos
GET    /api/projetos/{id}            -> detalhe de um projeto
POST   /api/projetos                 -> cria um projeto (rascunho)
PUT    /api/projetos/{id}            -> atualiza um projeto
DELETE /api/projetos/{id}            -> remove um projeto
POST   /api/projetos/{id}/calcular   -> executa o motor de cálculo de demanda
GET    /api/dashboard/resumo         -> contadores para os cards do topo
```

Formato de um projeto (JSON):

```json
{
  "id": "cond-americas",
  "nome": "Condomínio Solar das Américas",
  "endereco": "Av. das Américas, 3500 — Barra da Tijuca, RJ",
  "status": "validado",
  "demandaCalculada": 87.4,
  "demandaContratada": 150,
  "tipoLigacao": "trifasico",
  "fatorPotencia": 0.92,
  "unidades": 48,
  "protocolo": "NEO-2026-0418",
  "atualizadoEm": "2026-08-24",
  "arquivado": false
}
```

Valores válidos de `status`: `rascunho`, `em_analise`, `validado`,
`inconsistente`, `submetido`, `arquivado`. Valores de `tipoLigacao`:
`monofasico`, `bifasico`, `trifasico` (ver `src/data/mockProjects.js`).

## Estrutura de pastas

```
src/
  components/    Navbar, PageBanner, ProjectCard, DemandGauge, StatusBadge, Footer
  pages/         Home, Dashboard, NewProject, Archived
  store/         ProjectsContext — estado dos projetos com fallback local
  lib/           cliente axios e mapa de endpoints
  data/          dados de exemplo e metadados de status/ligação
```

## Rotas

| Rota             | Tela                                         |
| ---------------- | -------------------------------------------- |
| `/`              | Home institucional                           |
| `/dashboard`     | Listagem de projetos com filtros por status  |
| `/novo-projeto`  | Formulário de cadastro (cria como rascunho)  |
| `/arquivados`    | Tabela de projetos arquivados                |

## Build

```bash
npm run build
npm run preview
```
