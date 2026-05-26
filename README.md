# Perdidos Algures

App para o teu grupo do WhatsApp escolher viagens. Oito fases:

1. **RSVP** — quem está dentro
2. **Localizações** — cada um sugere até 3 sítios
3. **Votar local** — voto secreto, um por pessoa
4. **Alojamentos** — sem limite por pessoa, com tipo, preço, zona, link e comentário
5. **Votar alojamento** — voto secreto; empate → admin escolhe entre os empatados
6. **Disponibilidade** — cada um marca os dias em que pode
7. **Datas finais** — admin tranca o intervalo
8. **Planeamento** — estadia, contas, itinerário, atividades, compras

O admin (Miguel) pode navegar entre fases a qualquer momento, reabrir submissões/votos, e fazer reset à edição inteira pelo controlo no topo da barra.

---

## Como abrir

- **Live app** (default): abre `perdidos-algures.html` directamente no browser
- **Vista de design** (canvas com todas as fases lado a lado): adiciona `?canvas=1` ao URL
  - Ex: `https://miguel.github.io/perdidos-algures/?canvas=1`

## Contas

- **Admin**: nome `Miguel`, password `7415963a` — só tu vês as acções de admin (fechar fases, trancar datas)
- **Membros**: registam-se com nome + foto + password no primeiro acesso. O nome "Miguel" está reservado

Por agora os dados ficam guardados no `localStorage` do browser de cada um (não atravessa entre computadores nem é partilhado entre o grupo). Para passar a ser partilhado, ver secção [Base de dados real](#base-de-dados-real) abaixo.

---

## Pôr no GitHub Pages

Passo a passo:

### 1. Criar repositório no GitHub
- Vai a [github.com/new](https://github.com/new)
- Nome: `perdidos-algures` (ou o que quiseres)
- Público (GitHub Pages free é só público) ou privado se tiveres conta Pro
- **Não** adiciones README/license — vais sobrescrever

### 2. Carregar os ficheiros
Na pasta deste projeto, abre o terminal e corre:

```bash
git init
git add .
git commit -m "primeira versão"
git branch -M main
git remote add origin https://github.com/<o-teu-username>/perdidos-algures.git
git push -u origin main
```

> Alternativa sem terminal: na página do repo, "uploading an existing file" → arrasta todos os ficheiros → commit.

### 3. Ativar GitHub Pages
- No repo, vai a **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main` · Folder: `/ (root)`
- Salva. Espera 1–2 minutos.

### 4. Renomear o ficheiro principal
GitHub Pages procura `index.html` por defeito. Renomeia `perdidos-algures.html` para `index.html`:

```bash
git mv perdidos-algures.html index.html
git commit -m "index"
git push
```

### 5. Aceder
O URL fica: `https://<o-teu-username>.github.io/perdidos-algures/`

Partilha com a malta.

---

## Base de dados real

Como já expliquei: GitHub Pages só serve ficheiros estáticos — não tem backend nem base de dados. Para o grupo partilhar dados (votos, sugestões, contas) entre computadores precisas de um backend.

**Recomendo Supabase** — free tier dá-te:
- Autenticação real (sem hardcoded passwords)
- Postgres com 500MB
- Storage para as fotos
- Realtime para ver votos a chegar em tempo real

### Passos para migrar para Supabase

1. Cria conta em [supabase.com](https://supabase.com) → novo projeto
2. SQL Editor: cria as tabelas

   ```sql
   create table editions (
     id uuid primary key default gen_random_uuid(),
     number int, title text, subtitle text,
     current_phase int default 1,
     admin_id uuid, created_at timestamp default now()
   );

   create table memberships (
     edition_id uuid references editions(id),
     user_id uuid references auth.users(id),
     rsvp text, -- 'in' | 'out' | 'maybe' | null
     primary key (edition_id, user_id)
   );

   create table suggestions (
     id uuid primary key default gen_random_uuid(),
     edition_id uuid references editions(id),
     by_user uuid references auth.users(id),
     name text, city text, price int,
     tags text[], accent text, created_at timestamp default now()
   );

   create table votes (
     edition_id uuid references editions(id),
     user_id uuid references auth.users(id),
     suggestion_id uuid references suggestions(id),
     primary key (edition_id, user_id)
   );

   create table availability (
     edition_id uuid, user_id uuid,
     day date,
     primary key (edition_id, user_id, day)
   );
   ```
3. Authentication → Settings: ativa email/password
4. No projeto, vai a **Settings → API** e copia `URL` + `anon key`
5. No `index.html`, no `<head>`:

   ```html
   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
   <script>
     window.supabase = supabase.createClient(
       'https://<o-teu-projeto>.supabase.co',
       '<anon-key>'
     );
   </script>
   ```
6. Em `auth.jsx`, substitui o `AuthStore` por chamadas Supabase:

   ```js
   const AuthStore = {
     async login(name, password) {
       const { data, error } = await window.supabase.auth.signInWithPassword({
         email: name + '@perdidos.local',  // ou usa email a sério
         password
       });
       if (error) throw new Error(error.message);
       return data.user;
     },
     async register({ name, password, photoDataUrl }) {
       const { data, error } = await window.supabase.auth.signUp({
         email: name + '@perdidos.local',
         password,
         options: { data: { name, photo: photoDataUrl } }
       });
       if (error) throw new Error(error.message);
       return data.user;
     },
     getSession() {
       return window.supabase.auth.getUser().then(r => r.data.user);
     },
     async logout() {
       await window.supabase.auth.signOut();
     },
   };
   ```
7. Para os dados das fases, segue o padrão:

   ```js
   // ler
   const { data } = await window.supabase.from('suggestions').select('*').eq('edition_id', editionId);
   // gravar
   await window.supabase.from('votes').upsert({ edition_id, user_id, suggestion_id });
   ```

> **Avisa-me quando quiseres fazer esta migração** — posso reescrever os ficheiros para usar Supabase em vez de localStorage. Demora ~1h.

---

## Estrutura dos ficheiros

```
perdidos-algures.html  ← o ficheiro inlined que vai para produção
data.js                ← dados mock (substituir por Supabase depois)
auth.jsx               ← login/registo/store
atoms.jsx              ← Avatar, Pill, Btn, Calendar, etc
desktop-1.jsx          ← shell desktop + fases 1–3
desktop-2.jsx          ← fases 4–6 + DesktopShell
mobile.jsx             ← versão mobile das fases
live-app.jsx           ← LiveApp (entrada por defeito)
design-canvas.jsx      ← componente de canvas (só usado no modo ?canvas=1)
tweaks-panel.jsx       ← painel de tweaks
ios-frame.jsx          ← frame de iPhone (só canvas)
_template.html         ← template; o inlined final é gerado a partir daqui
```

Os ficheiros `.jsx` ficam inlined no `perdidos-algures.html` por causa de uma limitação do ambiente (subresources iam buscar 401). Se quiseres regenerar o inlined a partir dos `.jsx` separados, vê o script no histórico do projeto.

---

