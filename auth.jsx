// Perdidos Algures — Authentication store + UI screens.
// localStorage-backed for now. Designed to be swappable for Supabase later
// (see README.md). Admin is reserved: name "Miguel" + a fixed password.

const { useState: aUseState, useRef: aUseRef } = React;

// ─────────────────────────────────────────────────────────────
// Constants — admin credentials and storage keys.
// In production these should live in env vars + a real auth backend.
// ─────────────────────────────────────────────────────────────
const ADMIN_NAME = 'Miguel';
const ADMIN_PASS = '7415963a';
const STORE_USERS   = 'pa-users';
const STORE_SESSION = 'pa-session';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// localStorage with in-memory fallback. Some sandboxed iframes (preview
// environments, embedded contexts) throw SecurityError on localStorage
// access — we want the app to keep working there for testing, even though
// the data won't persist across reloads.
const _memStore = {};
const safeStore = {
  get(key) {
    try { return localStorage.getItem(key); }
    catch { return _memStore[key] || null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); }
    catch { _memStore[key] = value; }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch { delete _memStore[key]; }
  },
};

// ─────────────────────────────────────────────────────────────
// Auth store — pure JS, no React
// ─────────────────────────────────────────────────────────────
const AuthStore = {
  getUsers() {
    try { return JSON.parse(safeStore.get(STORE_USERS) || '[]'); }
    catch { return []; }
  },
  saveUsers(users) { safeStore.set(STORE_USERS, JSON.stringify(users)); },
  getSession() {
    try { return JSON.parse(safeStore.get(STORE_SESSION) || 'null'); }
    catch { return null; }
  },
  setSession(user) { safeStore.set(STORE_SESSION, JSON.stringify(user)); },
  clearSession() { safeStore.remove(STORE_SESSION); },

  initialsFromName(name) {
    const parts = name.trim().split(/\s+/);
    const head = parts[0]?.[0] || '';
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (head + tail).toUpperCase() || '?';
  },
  colorFromName(name) {
    const palette = ['#d97757','#6b8e6f','#b08968','#8b6f47','#c08552','#7a8c5a','#a47148','#5a8caa','#8a4220','#5e7a5a','#9a7b4f','#6b7d8a'];
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
  },

  async login(name, password) {
    const n = (name || '').trim();
    if (!n) throw new Error('Falta o nome.');
    if (!password) throw new Error('Falta a password.');

    // Admin path
    if (n.toLowerCase() === ADMIN_NAME.toLowerCase()) {
      if (password !== ADMIN_PASS) throw new Error('Password do admin não bate certo.');
      const session = {
        id: 'miguel', name: ADMIN_NAME, initials: 'M',
        color: '#1f1a14', photoDataUrl: null, isAdmin: true,
      };
      this.setSession(session);
      return session;
    }

    // Regular user
    const users = this.getUsers();
    const u = users.find((x) => x.name.toLowerCase() === n.toLowerCase());
    if (!u) throw new Error('Conta não encontrada. Regista-te primeiro.');
    const hash = await sha256(password);
    if (u.passHash !== hash) throw new Error('Password errada.');
    const { passHash, ...session } = u;
    this.setSession(session);
    return session;
  },

  async register({ name, password, passwordRepeat, photoDataUrl }) {
    const n = (name || '').trim();
    if (!n) throw new Error('Falta o nome.');
    if (n.toLowerCase() === ADMIN_NAME.toLowerCase()) throw new Error('Esse nome é reservado. Escolhe outro.');
    if (!password || password.length < 4) throw new Error('Password tem de ter 4+ caracteres.');
    if (password !== passwordRepeat) throw new Error('As passwords não batem certo.');
    const users = this.getUsers();
    if (users.find((u) => u.name.toLowerCase() === n.toLowerCase())) {
      throw new Error('Já existe alguém com esse nome.');
    }
    const passHash = await sha256(password);
    const user = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: n,
      initials: this.initialsFromName(n),
      color: this.colorFromName(n),
      photoDataUrl: photoDataUrl || null,
      passHash,
      isAdmin: false,
      createdAt: Date.now(),
    };
    users.push(user);
    this.saveUsers(users);
    const { passHash: _, ...session } = user;
    this.setSession(session);
    return session;
  },
};

function useAuth() {
  const [user, setUser] = aUseState(() => AuthStore.getSession());
  return {
    user,
    login: async (name, pw) => { const u = await AuthStore.login(name, pw); setUser(u); return u; },
    register: async (data) => { const u = await AuthStore.register(data); setUser(u); return u; },
    logout: () => { AuthStore.clearSession(); setUser(null); },
  };
}

// File → data URL with downscale (keeps localStorage manageable)
async function readPhotoFile(file) {
  if (!file) return null;
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = dataUrl;
  });
  const max = 400;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

// ─────────────────────────────────────────────────────────────
// AuthLayout — split-screen brand + form
// ─────────────────────────────────────────────────────────────
function AuthLayout({ children, narrow }) {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 700,
      background: 'var(--pa-bg)',
      display: 'flex', flexDirection: narrow ? 'column' : 'row',
      fontFamily: 'var(--pa-body)',
      color: 'var(--pa-ink)',
      overflow: 'auto',
    }}>
      {/* brand panel */}
      <div style={{
        flex: narrow ? '0 0 auto' : 1,
        minHeight: narrow ? 220 : 'auto',
        padding: narrow ? '48px 28px 36px' : '64px 56px',
        background: 'var(--pa-ink)', color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 360, height: 360,
          borderRadius: '50%', background: 'var(--pa-accent)', opacity: 0.22,
        }} />
        <div style={{ position: 'relative' }}>
          <Logo size={16} color="#fff" />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, letterSpacing: 1.4, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
            14ª edição · em curso
          </div>
          <div style={{
            marginTop: 10,
            fontFamily: 'var(--pa-display)', fontSize: narrow ? 32 : 52, fontWeight: 600,
            letterSpacing: -1.5, lineHeight: 0.98,
          }}>
            Tropa<br/><span style={{ color: 'var(--pa-accent)' }}>Mediterrânica.</span>
          </div>
          {!narrow && <div style={{
            marginTop: 16, fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 340, lineHeight: 1.5,
          }}>
            Algures entre o sol e o vinho. Entra com a tua conta para votar, sugerir e planear.
          </div>}
        </div>
        {!narrow && (
          <div style={{ position: 'relative', fontFamily: 'var(--pa-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>
            Só para o grupo · sem partilha pública
          </div>
        )}
      </div>

      {/* form panel */}
      <div style={{
        flex: narrow ? '1 1 auto' : 1,
        padding: narrow ? '32px 28px 56px' : '64px 56px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Login screen
// ─────────────────────────────────────────────────────────────
function LoginScreen({ auth, onSwitch, narrow }) {
  const [name, setName] = aUseState('');
  const [pw, setPw]     = aUseState('');
  const [busy, setBusy] = aUseState(false);
  const [err, setErr]   = aUseState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await auth.login(name, pw); }
    catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <AuthLayout narrow={narrow}>
      <div style={{ fontFamily: 'var(--pa-display)', fontSize: 36, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1 }}>
        Bem-vindo<br/>de volta.
      </div>
      <div style={{ marginTop: 10, color: 'var(--pa-muted)', fontSize: 14 }}>
        Inicia sessão para entrar na edição em curso.
      </div>

      <form onSubmit={submit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="O teu nome" placeholder="Rita / Tiago / ..." value={name} onChange={setName} />
        <AuthPasswordField label="Password" value={pw} onChange={setPw} />
        {err && <AuthError msg={err} />}
        <button type="submit" disabled={busy} style={{
          marginTop: 6, height: 52, borderRadius: 999, border: 'none',
          background: 'var(--pa-ink)', color: '#fff', cursor: busy ? 'default' : 'pointer',
          fontFamily: 'var(--pa-body)', fontSize: 15, fontWeight: 600,
          opacity: busy ? 0.5 : 1,
        }}>{busy ? 'A entrar...' : 'Entrar'}</button>
      </form>

      <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--pa-line)', textAlign: 'center', fontSize: 13.5, color: 'var(--pa-muted)' }}>
        Ainda não tens conta? <button type="button" onClick={onSwitch} style={{
          background: 'none', border: 'none', color: 'var(--pa-accent)',
          fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, cursor: 'pointer', padding: 0,
        }}>Cria a tua →</button>
      </div>
    </AuthLayout>
  );
}

// ─────────────────────────────────────────────────────────────
// Register screen
// ─────────────────────────────────────────────────────────────
function RegisterScreen({ auth, onSwitch, narrow }) {
  const [name, setName]   = aUseState('');
  const [pw, setPw]       = aUseState('');
  const [pw2, setPw2]     = aUseState('');
  const [photo, setPhoto] = aUseState(null);
  const [busy, setBusy]   = aUseState(false);
  const [err, setErr]     = aUseState(null);
  const fileRef = aUseRef(null);

  const onPick = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const url = await readPhotoFile(f);
      setPhoto(url);
    } catch { setErr('Não consegui ler a foto.'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await auth.register({ name, password: pw, passwordRepeat: pw2, photoDataUrl: photo }); }
    catch (ex) { setErr(ex.message); setBusy(false); }
  };

  const previewMember = {
    initials: name ? AuthStore.initialsFromName(name) : '?',
    color: name ? AuthStore.colorFromName(name) : 'var(--pa-muted)',
    photoDataUrl: photo,
  };

  return (
    <AuthLayout narrow={narrow}>
      <div style={{ fontFamily: 'var(--pa-display)', fontSize: 36, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1 }}>
        Bora arrancar.
      </div>
      <div style={{ marginTop: 10, color: 'var(--pa-muted)', fontSize: 14 }}>
        Nome, foto e uma password. Mais nada.
      </div>

      <form onSubmit={submit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Photo dropzone */}
        <button type="button" onClick={() => fileRef.current?.click()} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: 14, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
          background: '#fff', border: '1px solid var(--pa-line)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 56, flexShrink: 0,
            background: photo ? `#000 center/cover no-repeat url(${photo})` : previewMember.color,
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--pa-display)', fontWeight: 600, fontSize: 20,
            overflow: 'hidden',
          }}>
            {!photo && previewMember.initials}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>
              {photo ? 'Trocar foto' : 'Põe a tua cara'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--pa-muted)', marginTop: 2 }}>
              Opcional. Se saltares, fica com as iniciais.
            </div>
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />

        <Field label="Como te chamas" placeholder="Tiago, Matilde, ..." value={name} onChange={setName} />
        <AuthPasswordField label="Password" value={pw} onChange={setPw} />
        <AuthPasswordField label="Repete" value={pw2} onChange={setPw2} />

        {err && <AuthError msg={err} />}

        <button type="submit" disabled={busy} style={{
          marginTop: 6, height: 52, borderRadius: 999, border: 'none',
          background: 'var(--pa-accent)', color: '#fff', cursor: busy ? 'default' : 'pointer',
          fontFamily: 'var(--pa-body)', fontSize: 15, fontWeight: 600,
          opacity: busy ? 0.5 : 1,
        }}>{busy ? 'A criar...' : 'Criar conta'}</button>
      </form>

      <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--pa-line)', textAlign: 'center', fontSize: 13.5, color: 'var(--pa-muted)' }}>
        Já tens? <button type="button" onClick={onSwitch} style={{
          background: 'none', border: 'none', color: 'var(--pa-accent)',
          fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, cursor: 'pointer', padding: 0,
        }}>Inicia sessão →</button>
      </div>
    </AuthLayout>
  );
}

// Password input with reveal toggle
function AuthPasswordField({ label, value, onChange }) {
  const [show, setShow] = aUseState(false);
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2,
        color: 'var(--pa-muted)', textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{
        marginTop: 6, padding: '12px 14px', borderRadius: 12,
        background: '#fff', border: '1px solid var(--pa-line)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <input value={value || ''} onChange={(e) => onChange(e.target.value)}
          type={show ? 'text' : 'password'} placeholder="••••••••"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--pa-body)', fontSize: 15, color: 'var(--pa-ink)',
          }} />
        <button type="button" onClick={() => setShow((s) => !s)} style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          padding: 4, color: 'var(--pa-muted)',
        }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 7s2.5-5 8-5 8 5 8 5-2.5 5-8 5S1 7 1 7z" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="9" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
            {!show && <path d="M2 12L16 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>}
          </svg>
        </button>
      </div>
    </label>
  );
}

function AuthError({ msg }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      background: 'rgba(217,119,87,0.14)', color: '#8a4220',
      fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M7 4v3.5M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      {msg}
    </div>
  );
}

// AuthGate — chooses login vs register
function AuthGate({ auth, narrow }) {
  const [mode, setMode] = aUseState('login');
  if (mode === 'register') return <RegisterScreen auth={auth} onSwitch={() => setMode('login')} narrow={narrow} />;
  return <LoginScreen auth={auth} onSwitch={() => setMode('register')} narrow={narrow} />;
}

Object.assign(window, {
  AuthStore, useAuth, AuthLayout, LoginScreen, RegisterScreen, AuthGate,
  AuthPasswordField, AuthError, readPhotoFile, ADMIN_NAME,
});
