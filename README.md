# ÔnibusAgora

Projeto fullstack (React + Node.js + Supabase) para rastreamento colaborativo de ônibus em tempo real.

## Estrutura do Projeto

- `frontend/`: App React criado com Vite, Tailwind CSS, Leaflet e React Router.
- `backend/`: API em Node.js com Express e conexão com Supabase.
- `supabase.sql`: Script para criação das tabelas no banco de dados.

## Instruções de Instalação Local

1. **Clone o repositório**
2. **Execute o script SQL** do arquivo `supabase.sql` no SQL Editor do seu projeto no [Supabase](https://supabase.com).
3. **Configure as Variáveis de Ambiente**:
   - No `frontend/`, crie um arquivo `.env` baseado no `.env.example`.
   - No `backend/`, crie um arquivo `.env` baseado no `.env.example`.
   - Adicione suas credenciais do Supabase (URL, Anon Key e Service Role Key).
4. **Inicie o Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
5. **Inicie o Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Especificações de Deploy

### 1. Frontend (Netlify)
O deploy do frontend está configurado para o Netlify com o arquivo `netlify.toml`.
- Conecte o repositório no Netlify.
- Certifique-se de configurar o "Build command" como `npm run build` e o "Publish directory" como `dist`.
- Em "Environment Variables" no painel do Netlify, adicione as variáveis:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` (URL do seu backend hospedado no Render, ex: `https://onibusagora-backend.onrender.com`)

### 2. Backend (Render)
O deploy do backend está preparado para o Render via `Procfile` e `package.json`.
- No Render, crie um novo "Web Service" e conecte o repositório.
- A pasta "Root Directory" deve ser `backend` (ou dependendo da configuração de repositório, importe a branch com a raiz adaptada ou defina no Render). Alternativamente, suba os arquivos do backend para a raiz de outro repositório ou use Monorepo config.
- Configure o comando de Start como `npm start`.
- Adicione as Environment Variables do Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) e defina a porta.

### 3. Supabase (Banco de Dados e Auth)
- Crie um projeto no Supabase.
- Habilite "Email/Password" ou outros métodos em Authentication > Providers.
- Vá no "SQL Editor" e rode o conteúdo de `supabase.sql`.
- Assegure que as políticas RLS estão aplicadas.
