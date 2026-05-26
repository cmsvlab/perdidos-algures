// Perdidos Algures — Desktop shell + fases 1–3 (dinâmicas via AppStore).

const { useState: dUseState, useMemo: dUseMemo, useContext: dUseContext,
        createContext: dCreateContext, useEffect: dUseEffect } = React;

const PhaseCtx = dCreateContext({ phase: 1, setPhase: () => {}, reset: () => {}, canEdit: false });

// ─── Helpers ────────────────────────────────────────────────
// Todos os utilizadores: admin + membros registados
function getAllMembers() {
  const registered = AuthStore.getUsers().map(({ passHash, ...u }) => u);
  const ids = new Set(registered.map((u) => u.id));
  const base = D.members.filter((m) => !ids.has(m.id));
  return [...base, ...registered];
}

// ─────────────────────────────────────────────────────────────
// Admin phase navigator
// ─────────────────────────────────────────────────────────────
function AdminPhaseNav() {
  const { phase, setPhase, reset } = dUseContext(PhaseCtx);
  const [open, setOpen] = dUseState(false);
  const [confirmReset, setConfirmReset] = dUseState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) { setConfirmReset(false); return; }
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [open]);

  const total = D.phases.length;
  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      <button onClick={() => setPhase(Math.max(1, phase - 1))} disabled={phase === 1}
        style={{ width:30, height:30, borderRadius:999, border:'1px solid var(--pa-line)', background:'#fff',
          cursor: phase===1?'default':'pointer', opacity: phase===1?0.4:1,
          display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M7 2L3 5.5l4 3.5" stroke="var(--pa-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <button onClick={() => setOpen((o) => !o)} style={{
        height:30, padding:'0 12px', borderRadius:999, cursor:'pointer',
        background:'var(--pa-ink)', color:'#fff', border:'none',
        fontFamily:'var(--pa-mono)', fontSize:11, letterSpacing:0.8, fontWeight:600,
        display:'inline-flex', alignItems:'center', gap:6 }}>
        FASE {String(phase).padStart(2,'0')} / {String(total).padStart(2,'0')}
        <svg width="9" height="6" viewBox="0 0 9 6"><path d="M1 1l3.5 3.5L8 1" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <button onClick={() => setPhase(Math.min(total, phase + 1))} disabled={phase === total}
        style={{ width:30, height:30, borderRadius:999, border:'1px solid var(--pa-line)', background:'#fff',
          cursor: phase===total?'default':'pointer', opacity: phase===total?0.4:1,
          display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M4 2l4 3.5L4 9" stroke="var(--pa-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div style={{ position:'absolute', top:'100%', right:0, marginTop:6,
          background:'#fff', borderRadius:12, padding:6,
          boxShadow:'0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
          minWidth:280, zIndex:100 }}>
          <div style={{ padding:'8px 10px 6px', fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase' }}>
            Saltar para
          </div>
          {D.phases.map((p) => (
            <button key={p.n} onClick={() => { setPhase(p.n); setOpen(false); }} style={{
              display:'flex', alignItems:'center', gap:12, width:'100%', padding:'8px 10px',
              borderRadius:8, background: p.n===phase?'var(--pa-bg)':'transparent',
              border:'none', cursor:'pointer', textAlign:'left' }}>
              <span style={{ width:22, height:22, borderRadius:22,
                background: p.n===phase?'var(--pa-accent)':'rgba(31,26,20,0.06)',
                color: p.n===phase?'#fff':'var(--pa-muted)',
                fontFamily:'var(--pa-mono)', fontSize:11, fontWeight:700,
                display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{p.n}</span>
              <span style={{ fontFamily:'var(--pa-body)', fontSize:13, fontWeight: p.n===phase?600:500, color:'var(--pa-ink)' }}>{p.name}</span>
            </button>
          ))}
          <div style={{ borderTop:'1px solid var(--pa-line)', margin:'4px 0' }} />
          <button onClick={() => { if (confirmReset) { reset(); setOpen(false); } else setConfirmReset(true); }}
            style={{ display:'block', width:'100%', padding:'8px 10px', borderRadius:8,
              background: confirmReset?'rgba(217,119,87,0.14)':'transparent', border:'none', cursor:'pointer', textAlign:'left',
              fontFamily:'var(--pa-body)', fontSize:12.5, fontWeight:600,
              color: confirmReset?'#8a4220':'var(--pa-muted)' }}>
            {confirmReset ? '⚠ Clica de novo para confirmar — vai para a Fase 1' : '⟲ Reset · voltar à fase 1'}
          </button>
        </div>
      )}
    </div>
  );
}

function DTopBar({ me, edition, onLogout }) {
  return (
    <div style={{ height:64, padding:'0 32px', borderBottom:'1px solid var(--pa-line)',
      background:'var(--pa-bg)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:18 }}>
        <Logo size={15} />
        <div style={{ width:1, height:18, background:'var(--pa-line)' }} />
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <span style={{ fontFamily:'var(--pa-mono)', fontSize:11, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase' }}>
            {edition.number}ª edição
          </span>
          <span style={{ fontFamily:'var(--pa-display)', fontSize:16, fontWeight:600, letterSpacing:-0.3, color:'var(--pa-ink)' }}>
            {edition.title}
          </span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {me.isAdmin && <AdminPhaseNav />}
        {onLogout && (
          <button onClick={onLogout} title="Sair" style={{
            width:36, height:36, borderRadius:999, background:'#fff',
            border:'1px solid var(--pa-line)', cursor:'pointer', padding:0,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 4V2.5a1 1 0 00-1-1H3a1 1 0 00-1 1v9a1 1 0 001 1h5a1 1 0 001-1V10" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M6 7h7m0 0L10.5 4.5M13 7l-2.5 2.5" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:8, paddingLeft:10, borderLeft:'1px solid var(--pa-line)' }}>
          <Avatar member={me} size={32} />
          <div>
            <div style={{ fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600, lineHeight:1.1 }}>{me.name}</div>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:9.5, letterSpacing:0.8, color:'var(--pa-muted)', textTransform:'uppercase' }}>
              {me.isAdmin ? 'admin' : 'tripulante'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Left rail ───────────────────────────────────────────────
function DLeftRail({ phase, me }) {
  const appData = useAppStore();
  const allMembers = getAllMembers();
  const rsvp = appData.rsvp || {};
  const inCount = Object.values(rsvp).filter((s) => s === 'in').length;
  const history = appData.history || [];

  return (
    <div style={{ width:240, padding:'24px 18px', flexShrink:0, borderRight:'1px solid var(--pa-line)',
      background:'var(--pa-bg)', display:'flex', flexDirection:'column', gap:20, overflow:'auto' }}>
      <div>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.3, color:'var(--pa-muted)', textTransform:'uppercase' }}>Fluxo</div>
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:1 }}>
          {D.phases.map((p) => {
            const done = p.n < phase, active = p.n === phase, locked = p.n > phase;
            return (
              <div key={p.n} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:8,
                background: active?'var(--pa-ink)':'transparent', color: active?'#fff':'var(--pa-ink)' }}>
                <div style={{ width:20, height:20, borderRadius:20,
                  background: active?'var(--pa-accent)': done?'#3d5e44':'transparent',
                  border: locked?'1.5px dashed var(--pa-line)': (done||active)?'none':'1.5px solid var(--pa-line)',
                  color: active||done?'#fff':'var(--pa-muted)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--pa-mono)', fontSize:10, fontWeight:700, flexShrink:0 }}>
                  {done ? <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg> : p.n}
                </div>
                <div style={{ fontFamily:'var(--pa-body)', fontSize:12.5, fontWeight: active?600:500,
                  color: locked?'var(--pa-muted)':'inherit', lineHeight:1.2 }}>{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop:'1px solid var(--pa-line)', paddingTop:20 }}>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.3, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:12 }}>
          A tripulação
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Stack members={allMembers.filter((m) => rsvp[m.id] === 'in')} max={5} size={28} />
          <div>
            <div style={{ fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600 }}>{inCount} a bordo</div>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, color:'var(--pa-muted)' }}>de {allMembers.length}</div>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop:'auto', paddingTop:20, borderTop:'1px solid var(--pa-line)' }}>
          <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.3, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:8 }}>
            Edições anteriores
          </div>
          {history.slice(0, 2).map((h) => (
            <div key={h.n} style={{ display:'flex', gap:10, padding:'8px 0', alignItems:'center' }}>
              <div style={{ width:28, height:28, borderRadius:6, flexShrink:0,
                background: `repeating-linear-gradient(135deg, ${h.cover}44 0 6px, ${h.cover}22 6px 12px)` }} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--pa-ink)' }}>{h.n}ª · {h.title}</div>
                <div style={{ fontSize:10.5, color:'var(--pa-muted)' }}>{h.winner} · {h.dates}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right rail ──────────────────────────────────────────────
function DRightRail({ phase, me }) {
  const [tab, setTab] = dUseState('chat');
  return (
    <div style={{ width:320, flexShrink:0, borderLeft:'1px solid var(--pa-line)', background:'var(--pa-bg)',
      display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'16px 16px 0', display:'flex', gap:4 }}>
        {[{ id:'activity', label:'Atividade' }, { id:'chat', label:'Chat' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab===t.id?'var(--pa-ink)':'transparent',
            color: tab===t.id?'#fff':'var(--pa-muted)',
            fontFamily:'var(--pa-body)', fontSize:12.5, fontWeight:600 }}>{t.label}</button>
        ))}
      </div>
      <div style={{ flex:1, minHeight:0, padding:'12px 16px 16px', display:'flex', flexDirection:'column' }}>
        {tab === 'activity' ? <DActivityList phase={phase} /> : <ChatPanel me={me} />}
      </div>
    </div>
  );
}

function DActivityList({ phase }) {
  const feed = useActivityFeed(phase);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, overflow:'auto', flex:1 }}>
      {feed.length === 0 && (
        <div style={{ padding:'20px 0', textAlign:'center', fontSize:12, color:'var(--pa-muted)' }}>
          Sem atividade ainda.
        </div>
      )}
      {feed.map((item, i) => {
        const m = memberById(item.who) || { name: item.who, color:'var(--pa-muted)', initials:'?' };
        return (
          <div key={i} style={{ display:'flex', gap:10 }}>
            <Avatar member={m} size={26} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--pa-body)', fontSize:12.5, color:'var(--pa-ink)', lineHeight:1.35 }}>
                <span style={{ fontWeight:600 }}>{m.name}</span> {item.text}
              </div>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, color:'var(--pa-muted)', marginTop:2 }}>{item.when}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useActivityFeed(phase) {
  const appData = useAppStore();
  const rsvp = appData.rsvp || {};
  const inMembers = getAllMembers().filter((m) => rsvp[m.id] === 'in');
  const locSuggs = appData.locSuggs || [];
  const accSuggs = appData.accSuggs || [];
  const feed = [];

  if (phase >= 1) {
    inMembers.forEach((m) => {
      feed.push({ who: m.id, text: 'está dentro 🙋', when: 'esta edição' });
    });
  }
  if (phase >= 2) {
    locSuggs.slice(0, 3).forEach((s) => {
      feed.push({ who: s.by, text: `sugeriu ${s.name}`, when: 'recentemente' });
    });
  }
  if (phase >= 4) {
    accSuggs.slice(0, 3).forEach((s) => {
      feed.push({ who: s.by, text: `lançou alojamento em ${s.area}`, when: 'recentemente' });
    });
  }
  return feed.reverse();
}

// ─── Phase header ────────────────────────────────────────────
function DPhaseHeader({ phase, title, sub, status, statusTone = 'accent' }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <Pill tone="dark" size="sm">
          <span style={{ fontFamily:'var(--pa-mono)', letterSpacing:0.8 }}>FASE {String(phase).padStart(2,'0')} / {String(D.phases.length).padStart(2,'0')}</span>
        </Pill>
        {status && <Pill tone={statusTone} size="sm">
          <span style={{ width:5, height:5, borderRadius:5, background:'currentColor' }} />
          {status}
        </Pill>}
      </div>
      <div style={{ fontFamily:'var(--pa-display)', fontSize:44, fontWeight:600, letterSpacing:-1.5, lineHeight:0.98, color:'var(--pa-ink)' }}>{title}</div>
      {sub && <div style={{ marginTop:10, fontFamily:'var(--pa-body)', fontSize:15, color:'var(--pa-muted)', maxWidth:580, lineHeight:1.45 }}>{sub}</div>}
    </div>
  );
}

function DAdminBar({ children, hint, showNext = true }) {
  const { phase, setPhase } = dUseContext(PhaseCtx);
  const total = D.phases.length;
  return (
    <div style={{ marginTop:'auto', paddingTop:24, borderTop:'1px dashed var(--pa-line)',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <Avatar member={memberById(D.adminId)} size={28} />
        <div>
          <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1, color:'var(--pa-muted)', textTransform:'uppercase' }}>Ações do admin</div>
          <div style={{ fontFamily:'var(--pa-body)', fontSize:12.5, color:'var(--pa-ink)' }}>{hint}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {phase > 1 && <Btn variant="ghost" size="sm" onClick={() => setPhase(phase - 1)}>← Voltar</Btn>}
        {children}
        {showNext && phase < total && <Btn onClick={() => setPhase(phase + 1)}>Próxima fase →</Btn>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 1 — RSVP (dinâmico via AppStore)
// ─────────────────────────────────────────────────────────────
function DPhase1({ me }) {
  const appData = useAppStore();
  const rsvp = appData.rsvp || {};
  const allMembers = getAllMembers();
  const counts = dUseMemo(() => {
    const c = { in:0, out:0, maybe:0, pending:0 };
    allMembers.forEach((m) => { const s = rsvp[m.id] || 'pending'; c[s]++; });
    return c;
  }, [rsvp, allMembers.length]);

  const myChoice = rsvp[me.id] || null;
  const [picking, setPicking] = dUseState(false);

  const handleRsvp = (status) => {
    AppStore.setRsvp(me.id, status);
    setPicking(false);
  };

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={1} status="Em curso" statusTone="accent"
        title={<>Quem entra na <span style={{ color:'var(--pa-accent)' }}>{(appData.editionNumber||1)}ª</span>?</>}
        sub={<>O {memberById(D.adminId)?.name || 'admin'} iniciou esta edição — <em style={{ color:'var(--pa-ink)' }}>"{appData.editionTitle || 'Nova Aventura'}"</em>. Diz se estás dentro.</>} />

      {/* balcões */}
      <div style={{ display:'flex', gap:12, marginBottom:24 }}>
        {[
          { l:'Dentro', n:counts.in, tone:'#3d5e44', bg:'rgba(107,142,111,0.16)' },
          { l:'Fora', n:counts.out, tone:'#8a4220', bg:'rgba(217,119,87,0.18)' },
          { l:'A pensar', n:counts.maybe, tone:'var(--pa-muted)', bg:'rgba(31,26,20,0.05)' },
        ].map((c) => (
          <div key={c.l} style={{ background:c.bg, borderRadius:14, padding:'14px 18px', flex:1 }}>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:32, fontWeight:600, color:c.tone, letterSpacing:-0.6 }}>{c.n}</div>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, color:c.tone, letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>{c.l}</div>
          </div>
        ))}
      </div>

      {/* botões RSVP para não-admin */}
      {!me.isAdmin && (
        <div style={{ marginBottom:20, padding:16, background:'#fff', borderRadius:14, border:'1px solid var(--pa-line)' }}>
          <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:12 }}>
            A tua resposta
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[{ id:'in', label:'Dentro 🙋', tone:'success' }, { id:'maybe', label:'A pensar 🤔', tone:'default' }, { id:'out', label:'Fora 😩', tone:'warn' }].map((o) => (
              <button key={o.id} onClick={() => handleRsvp(o.id)} style={{
                flex:1, padding:'10px 8px', borderRadius:10, cursor:'pointer', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600,
                background: myChoice===o.id ? 'var(--pa-ink)' : '#fff',
                color: myChoice===o.id ? '#fff' : 'var(--pa-ink)',
                border: myChoice===o.id ? 'none' : '1px solid var(--pa-line)',
              }}>{o.label}</button>
            ))}
          </div>
          {myChoice && <div style={{ marginTop:10, fontSize:12, color:'var(--pa-muted)', textAlign:'center' }}>
            Resposta guardada. Podes mudar até o admin fechar esta fase.
          </div>}
        </div>
      )}

      {/* lista de membros */}
      <div style={{ background:'#fff', borderRadius:18, border:'1px solid var(--pa-line)', overflow:'hidden' }}>
        {allMembers.length === 0 && (
          <div style={{ padding:24, textAlign:'center', color:'var(--pa-muted)', fontSize:13 }}>
            Ninguém registado ainda. Partilha o link com o grupo!
          </div>
        )}
        {allMembers.map((m, i) => {
          const s = rsvp[m.id] || 'pending';
          const labels = { in:'Dentro', out:'Fora', maybe:'A pensar', pending:'Sem responder' };
          const tones = { in:'success', out:'warn', maybe:'default', pending:'muted' };
          return (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
              borderTop: i===0?'none':'1px solid var(--pa-line)' }}>
              <Avatar member={m} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--pa-body)', fontSize:15, fontWeight:600, color:'var(--pa-ink)' }}>
                  {m.name} {m.isAdmin && <span style={{ color:'var(--pa-accent)', fontSize:12, fontWeight:500 }}>· admin</span>}
                </div>
              </div>
              <Pill tone={tones[s]}>{labels[s]}</Pill>
            </div>
          );
        })}
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${counts.in} confirmados. Quando estiver completo, avança.`}>
          <Btn variant="ghost" size="sm" onClick={() => {
            if (window.confirm('Limpar todos os RSVPs?')) {
              const d = AppStore.load(); d.rsvp = {}; AppStore._save(d);
            }
          }}>Reiniciar</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 2 — Sugerir localizações (dinâmico via AppStore)
// ─────────────────────────────────────────────────────────────
function DPhase2({ me }) {
  const appData = useAppStore();
  const suggestions = appData.locSuggs || [];
  const mineCount = suggestions.filter((s) => s.by === me.id).length;
  const limit = D.phase2.perPersonLimit;
  const [adding, setAdding] = dUseState(false);

  const handleAdd = ({ name, city, tags, accent }) => {
    AppStore.addLocSuggestion({
      id: 'loc_' + Date.now().toString(36),
      name, city, tags: tags || [], accent: accent || 'var(--pa-accent)',
      by: me.id,
    });
    setAdding(false);
  };

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={2} status="Em curso" statusTone="accent"
        title={<>Cada um lança<br/><span style={{ color:'var(--pa-accent)' }}>até {limit} sítios.</span></>}
        sub="Sem censura. Convencer o grupo é com o nome e os argumentos." />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:11, letterSpacing:1, color:'var(--pa-muted)', textTransform:'uppercase' }}>
          {suggestions.length} destino{suggestions.length !== 1 ? 's' : ''} no chapéu
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Pill>Os teus: {mineCount} / {limit}</Pill>
          {mineCount < limit && !adding && (
            <Btn variant="accent" size="sm" onClick={() => setAdding(true)} icon={<span style={{ fontSize:14 }}>+</span>}>
              Lançar destino
            </Btn>
          )}
        </div>
      </div>

      {adding && <LocSuggestionForm onCancel={() => setAdding(false)} onSubmit={handleAdd} />}

      {suggestions.length === 0 && !adding && (
        <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
          Ainda ninguém sugeriu nada. Vai lá! 🗺️
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
        {suggestions.map((s) => {
          const by = memberById(s.by) || { name: s.by, color:'var(--pa-muted)', initials:'?' };
          const mine = s.by === me.id;
          return (
            <div key={s.id} style={{ background:'#fff', borderRadius:14, overflow:'hidden',
              border: mine?'1.5px solid var(--pa-accent)':'1px solid var(--pa-line)', position:'relative' }}>
              <PhotoSlot accent={s.accent || 'var(--pa-accent)'} label={s.city} height={108} radius={0} />
              {(me.isAdmin || mine) && (
                <button onClick={() => AppStore.removeLocSuggestion(s.id)}
                  title="Remover" style={{ position:'absolute', top:8, right:8, width:24, height:24,
                    borderRadius:999, border:'none', background:'rgba(0,0,0,0.4)', color:'#fff',
                    cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              )}
              <div style={{ padding:'12px 14px 14px' }}>
                <div style={{ fontFamily:'var(--pa-display)', fontSize:17, fontWeight:600, letterSpacing:-0.3, lineHeight:1.15 }}>
                  {s.name}
                </div>
                {s.tags && s.tags.length > 0 && (
                  <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
                    {s.tags.map((t) => <Pill key={t} size="sm">{t}</Pill>)}
                  </div>
                )}
                <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--pa-line)',
                  display:'flex', alignItems:'center', gap:6 }}>
                  <Avatar member={by} size={20} />
                  <span style={{ fontSize:11.5, color:'var(--pa-muted)' }}>{mine ? 'tu' : by.name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${suggestions.length} destinos. Quando fechar, avança para votação.`}>
          <Btn variant="ghost" size="sm" onClick={() => { if (window.confirm('Limpar todas as sugestões?')) { const d = AppStore.load(); d.locSuggs = []; AppStore._save(d); } }}>
            Limpar tudo
          </Btn>
        </DAdminBar>
      )}
    </div>
  );
}

function LocSuggestionForm({ onCancel, onSubmit }) {
  const [name, setName] = dUseState('');
  const [city, setCity] = dUseState('');
  const [tag, setTag] = dUseState('');
  const [tags, setTags] = dUseState([]);
  const ok = name.trim() && city.trim();

  const addTag = () => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTag('');
  };

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:22, marginBottom:14, border:'2px solid var(--pa-accent)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontFamily:'var(--pa-display)', fontSize:18, fontWeight:600, letterSpacing:-0.3 }}>Lançar destino</div>
        <button onClick={onCancel} style={{ border:'none', background:'transparent', cursor:'pointer', color:'var(--pa-muted)', fontSize:18, padding:4 }}>×</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        <Field label="Nome do sítio" placeholder="Ilhas Cíes, Comporta..." value={name} onChange={setName} />
        <Field label="Cidade / país" placeholder="Vigo, ES" value={city} onChange={setCity} />
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:6 }}>Tags</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
          {tags.map((t) => (
            <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:999, background:'rgba(31,26,20,0.08)', fontSize:12 }}>
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ border:'none', background:'transparent', cursor:'pointer', color:'var(--pa-muted)', padding:0, fontSize:13 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key==='Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Praia, Cidade, Glamping..."
            style={{ flex:1, padding:'8px 12px', borderRadius:10, border:'1px solid var(--pa-line)', fontFamily:'var(--pa-body)', fontSize:13, outline:'none' }} />
          <button onClick={addTag} style={{ padding:'8px 14px', borderRadius:10, border:'none', background:'var(--pa-ink)', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}>+</button>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="accent" size="sm" onClick={() => onSubmit({ name:name.trim(), city:city.trim(), tags })} disabled={!ok}>Lançar</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 3 — Votar local (VoteStore, sugestões do AppStore)
// ─────────────────────────────────────────────────────────────
function DPhase3({ me }) {
  const appData = useAppStore();
  const suggestions = appData.locSuggs || [];
  const [vote, setVote] = dUseState(() => VoteStore.getVote(me.id, 'loc'));
  const [saved, setSaved] = dUseState(false);

  const handleVote = (id) => {
    setVote(id);
    VoteStore.setVote(me.id, 'loc', id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (suggestions.length === 0) {
    return (
      <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
        <DPhaseHeader phase={3} status="Sem destinos" statusTone="muted"
          title={<>Ainda não há<br/><span style={{ color:'var(--pa-accent)' }}>destinos para votar.</span></>}
          sub="Volta à fase 2 e pede ao grupo para sugerir sítios primeiro." />
        {me.isAdmin && <DAdminBar hint="Sem sugestões ainda." />}
      </div>
    );
  }

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={3} status="A decorrer" statusTone="accent"
        title={<>Vota no teu<br/><span style={{ color:'var(--pa-accent)' }}>sítio favorito.</span></>}
        sub="Voto secreto. Um por pessoa." />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:8 }}>
        {suggestions.map((s) => {
          const by = memberById(s.by) || { name:s.by, color:'var(--pa-muted)', initials:'?' };
          const sel = vote === s.id;
          return (
            <button key={s.id} onClick={() => handleVote(s.id)} style={{
              background:'#fff', borderRadius:14, overflow:'hidden', textAlign:'left',
              border: sel?'2px solid var(--pa-accent)':'1px solid var(--pa-line)',
              cursor:'pointer', padding:0, position:'relative' }}>
              <PhotoSlot accent={s.accent || 'var(--pa-accent)'} label="" height={96} radius={0} />
              {sel && (
                <div style={{ position:'absolute', top:10, right:10, width:28, height:28, borderRadius:28,
                  background: saved?'#3d5e44':'var(--pa-accent)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 12px rgba(217,119,87,0.5)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div style={{ padding:'12px 14px 14px' }}>
                <div style={{ fontFamily:'var(--pa-display)', fontSize:16, fontWeight:600, letterSpacing:-0.2, lineHeight:1.15 }}>{s.name}</div>
                <div style={{ fontSize:11, color:'var(--pa-muted)', marginTop:2 }}>{s.city}</div>
                <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6 }}>
                  <Avatar member={by} size={18} />
                  <span style={{ fontSize:10.5, color:'var(--pa-muted)' }}>por {by.name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop:18, padding:14, borderRadius:12, background:'rgba(31,26,20,0.04)', display:'flex', alignItems:'center', gap:12 }}>
        <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="var(--pa-muted)" strokeWidth="1.2" fill="none"/><path d="M8 5v3.5M8 11v.5" stroke="var(--pa-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <div style={{ fontSize:12.5, color:'var(--pa-muted)' }}>
          Cada um vota numa só opção.{' '}
          {saved
            ? <span style={{ color:'#3d5e44', fontWeight:600 }}>✓ Voto guardado!</span>
            : vote
              ? <span style={{ color:'var(--pa-ink)', fontWeight:600 }}>Voto em {suggestions.find((s) => s.id === vote)?.name}.</span>
              : 'Ainda não votaste.'}
        </div>
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${suggestions.length} destinos a votar. Quando fechar, avança.`}>
          <Btn variant="ghost" size="sm">Reabrir votação</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

Object.assign(window, {
  getAllMembers,
  DTopBar, DLeftRail, DRightRail, DPhaseHeader, DAdminBar,
  DPhase1, DPhase2, DPhase3, LocSuggestionForm,
  useActivityFeed,
});
