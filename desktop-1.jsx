// Perdidos Algures — Desktop shell + 6 phase views.
// 1440 × 900 frame. Three columns: phase stepper · main · activity rail.

const { useState: dUseState, useMemo: dUseMemo, useContext: dUseContext, createContext: dCreateContext } = React;

// Context for admin-driven phase navigation. Provided by DesktopShell so
// any phase view's AdminBar (or the top bar nav) can advance / step back /
// jump / reset without prop drilling.
const PhaseCtx = dCreateContext({
  phase: 1, setPhase: () => {}, reset: () => {}, canEdit: false,
});

// ─────────────────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────────────────
// Admin phase navigator pill — prev/next + jump-to + reset.
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
      <button onClick={() => setPhase(Math.max(1, phase - 1))} disabled={phase === 1} title="Fase anterior"
        style={{
          width: 30, height: 30, borderRadius: 999, border: '1px solid var(--pa-line)',
          background: '#fff', cursor: phase === 1 ? 'default' : 'pointer', opacity: phase === 1 ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M7 2L3 5.5l4 3.5" stroke="var(--pa-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <button onClick={() => setOpen((o) => !o)} style={{
        height: 30, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
        background: 'var(--pa-ink)', color: '#fff', border: 'none',
        fontFamily: 'var(--pa-mono)', fontSize: 11, letterSpacing: 0.8, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        FASE {String(phase).padStart(2, '0')} / {String(total).padStart(2, '0')}
        <svg width="9" height="6" viewBox="0 0 9 6"><path d="M1 1l3.5 3.5L8 1" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <button onClick={() => setPhase(Math.min(total, phase + 1))} disabled={phase === total} title="Próxima fase"
        style={{
          width: 30, height: 30, borderRadius: 999, border: '1px solid var(--pa-line)',
          background: '#fff', cursor: phase === total ? 'default' : 'pointer', opacity: phase === total ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M4 2l4 3.5L4 9" stroke="var(--pa-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6,
          background: '#fff', borderRadius: 12, padding: 6,
          boxShadow: '0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
          minWidth: 280, zIndex: 100,
        }}>
          <div style={{ padding: '8px 10px 6px', fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
            Saltar para
          </div>
          {D.phases.map((p) => (
            <button key={p.n} onClick={() => { setPhase(p.n); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '8px 10px', borderRadius: 8,
              background: p.n === phase ? 'var(--pa-bg)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 22,
                background: p.n === phase ? 'var(--pa-accent)' : 'rgba(31,26,20,0.06)',
                color: p.n === phase ? '#fff' : 'var(--pa-muted)',
                fontFamily: 'var(--pa-mono)', fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{p.n}</span>
              <span style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: p.n === phase ? 600 : 500, color: 'var(--pa-ink)' }}>
                {p.name}
              </span>
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--pa-line)', margin: '4px 0' }} />
          <button onClick={() => {
            if (confirmReset) { reset(); setOpen(false); }
            else setConfirmReset(true);
          }} style={{
            display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8,
            background: confirmReset ? 'rgba(217,119,87,0.14)' : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--pa-body)', fontSize: 12.5, fontWeight: 600,
            color: confirmReset ? '#8a4220' : 'var(--pa-muted)',
          }}>
            {confirmReset ? '⚠ Clica de novo para confirmar — vai para a Fase 1' : '⟲ Reset · voltar à fase 1'}
          </button>
        </div>
      )}
    </div>
  );
}

function DTopBar({ me, edition, onLogout }) {
  return (
    <div style={{
      height: 64, padding: '0 32px',
      borderBottom: '1px solid var(--pa-line)',
      background: 'var(--pa-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Logo size={15} />
        <div style={{ width: 1, height: 18, background: 'var(--pa-line)' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
            {edition.number}ª edição
          </span>
          <span style={{ fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 600, letterSpacing: -0.3, color: 'var(--pa-ink)' }}>
            {edition.title}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {me.isAdmin && <AdminPhaseNav />}
        {onLogout && (
          <button onClick={onLogout} title="Sair" style={{
            width: 36, height: 36, borderRadius: 999, background: '#fff',
            border: '1px solid var(--pa-line)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 4V2.5a1 1 0 00-1-1H3a1 1 0 00-1 1v9a1 1 0 001 1h5a1 1 0 001-1V10" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M6 7h7m0 0L10.5 4.5M13 7l-2.5 2.5" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid var(--pa-line)' }}>
          <Avatar member={me} size={32} />
          <div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{me.name}</div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 9.5, letterSpacing: 0.8, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
              {me.isAdmin ? 'admin' : 'tripulante'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Left rail — phase stepper
// ─────────────────────────────────────────────────────────────
function DLeftRail({ phase, me }) {
  return (
    <div style={{
      width: 240, padding: '24px 18px', flexShrink: 0,
      borderRight: '1px solid var(--pa-line)',
      background: 'var(--pa-bg)',
      display: 'flex', flexDirection: 'column', gap: 20,
      overflow: 'auto',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.3, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
          Fluxo
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {D.phases.map((p) => {
            const done = p.n < phase;
            const active = p.n === phase;
            const locked = p.n > phase;
            return (
              <div key={p.n} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 8,
                background: active ? 'var(--pa-ink)' : 'transparent',
                color: active ? '#fff' : 'var(--pa-ink)',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 20,
                  background: active ? 'var(--pa-accent)' : (done ? '#3d5e44' : 'transparent'),
                  border: locked ? '1.5px dashed var(--pa-line)' : (done || active ? 'none' : '1.5px solid var(--pa-line)'),
                  color: active || done ? '#fff' : 'var(--pa-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--pa-mono)', fontSize: 10, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {done ? (
                    <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                  ) : p.n}
                </div>
                <div style={{
                  fontFamily: 'var(--pa-body)', fontSize: 12.5, fontWeight: active ? 600 : 500,
                  color: locked ? 'var(--pa-muted)' : 'inherit',
                  lineHeight: 1.2,
                }}>{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--pa-line)', paddingTop: 20 }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.3, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
          A tripulação
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stack members={D.members.filter((m) => D.phase1.state[m.id] === 'in')} max={5} size={28} />
          <div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>
              {Object.values(D.phase1.state).filter((s) => s === 'in').length} a bordo
            </div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, color: 'var(--pa-muted)' }}>
              de {D.members.length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--pa-line)' }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.3, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Edições anteriores
        </div>
        {D.history.slice(0, 2).map((h) => (
          <div key={h.n} style={{ display: 'flex', gap: 10, padding: '8px 0', alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: `repeating-linear-gradient(135deg, ${h.cover}44 0 6px, ${h.cover}22 6px 12px)`,
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pa-ink)' }}>{h.n}ª · {h.title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--pa-muted)' }}>{h.winner} · {h.dates}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Right rail — Atividade / Chat tabs
// ─────────────────────────────────────────────────────────────
function DRightRail({ phase, me }) {
  const [tab, setTab] = dUseState('chat');
  return (
    <div style={{
      width: 320, flexShrink: 0,
      borderLeft: '1px solid var(--pa-line)', background: 'var(--pa-bg)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 4 }}>
        {[
          { id: 'activity', label: 'Atividade' },
          { id: 'chat',     label: 'Chat' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'var(--pa-ink)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--pa-muted)',
            fontFamily: 'var(--pa-body)', fontSize: 12.5, fontWeight: 600,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '12px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {tab === 'activity' ? <DActivityList phase={phase} /> : <ChatPanel me={me} />}
      </div>
    </div>
  );
}

function DActivityList({ phase }) {
  const feed = useActivityFeed(phase);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', flex: 1 }}>
      {feed.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--pa-muted)' }}>
          Sem atividade nesta fase.
        </div>
      )}
      {feed.map((item, i) => {
        const m = memberById(item.who);
        return (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <Avatar member={m} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 12.5, color: 'var(--pa-ink)', lineHeight: 1.35 }}>
                <span style={{ fontWeight: 600 }}>{m.name}</span> {item.text}
              </div>
              <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, color: 'var(--pa-muted)', marginTop: 2 }}>
                {item.when}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useActivityFeed(phase) {
  // Phase-aware activity. Older items at the bottom.
  const base = {
    1: [
      { who: 'miguel', text: 'iniciou a 14ª edição — "Tropa Mediterrânica"', when: 'há 12 dias' },
      { who: 'rita',   text: 'está dentro 🙋‍♀️', when: 'há 11 dias' },
      { who: 'matilde',text: 'está dentro', when: 'há 11 dias' },
      { who: 'tiago',  text: 'está dentro', when: 'há 11 dias' },
      { who: 'sofia',  text: 'desta vez não consigo, desculpem 😩', when: 'há 10 dias' },
      { who: 'miguel', text: 'fechou a fase 1 · 7 a bordo', when: 'há 6 dias' },
    ],
    2: [
      { who: 'tiago',   text: 'sugeriu Praia de Samil', when: 'há 5 dias' },
      { who: 'matilde', text: 'sugeriu Ilhas Cíes + Bouzas', when: 'há 5 dias' },
      { who: 'joao',    text: 'sugeriu Casco Vello', when: 'há 4 dias' },
      { who: 'rita',    text: 'sugeriu Baiona', when: 'há 4 dias' },
      { who: 'pedro',   text: 'sugeriu Cangas do Morrazo', when: 'há 4 dias' },
      { who: 'miguel',  text: 'fechou submissões · 8 destinos', when: 'há 3 dias' },
    ],
    3: [
      { who: 'rita',    text: 'votou (secreto)', when: 'há 3 dias' },
      { who: 'matilde', text: 'votou', when: 'há 3 dias' },
      { who: 'tiago',   text: 'votou', when: 'há 2 dias' },
      { who: 'ines',    text: 'votou', when: 'há 2 dias' },
      { who: 'miguel',  text: 'fechou · Cíes + Bouzas ganhou', when: 'ontem' },
    ],
    4: [
      { who: 'tiago',   text: 'lançou Casa do Faro (Bouzas)', when: 'há 5 dias' },
      { who: 'matilde', text: 'lançou Glamping nas Cíes', when: 'há 4 dias' },
      { who: 'joao',    text: 'lançou apartamento no Casco Vello', when: 'há 3 dias' },
      { who: 'rita',    text: 'lançou hostel em Vigo centro', when: 'há 2 dias' },
      { who: 'ines',    text: 'lançou apartamento frente à marina', when: 'ontem' },
    ],
    5: [
      { who: 'rita',    text: 'votou (secreto)', when: 'há 2 dias' },
      { who: 'tiago',   text: 'votou', when: 'há 1 dia' },
      { who: 'matilde', text: 'votou', when: 'ontem' },
      { who: 'miguel',  text: 'votou', when: 'há 6h' },
      { who: 'miguel',  text: '"empate apertado entre as duas favoritas 👀"', when: 'há 2h' },
    ],
    6: [
      { who: 'miguel',  text: 'alojamento decidido · escolham os dias', when: 'há 6h' },
      { who: 'rita',    text: 'marcou 5 dias disponíveis', when: 'há 5h' },
      { who: 'matilde', text: 'marcou 6 dias', when: 'há 4h' },
      { who: 'tiago',   text: 'marcou 9 dias', when: 'há 3h' },
    ],
    7: [
      { who: 'pedro',   text: 'submeteu disponibilidade · todos prontos', when: 'há 2h' },
      { who: 'miguel',  text: 'a olhar para o calendário', when: 'agora' },
    ],
    8: [
      { who: 'miguel',  text: 'trancou 12–14 Junho 🚀', when: 'há 2 dias' },
      { who: 'tiago',   text: 'reservou A Marisqueira para sexta', when: 'ontem' },
      { who: 'joao',    text: 'comprou vinho × 6', when: 'ontem' },
      { who: 'rita',    text: 'partilhou um spreadsheet das contas', when: 'há 4h' },
      { who: 'matilde', text: 'adicionou "Aula de cozinha galega"', when: 'há 1h' },
    ],
  };
  return base[phase] || [];
}

// ─────────────────────────────────────────────────────────────
// Phase header — common to all 6 phase views
// ─────────────────────────────────────────────────────────────
function DPhaseHeader({ phase, title, sub, status, statusTone = 'accent' }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Pill tone="dark" size="sm">
          <span style={{ fontFamily: 'var(--pa-mono)', letterSpacing: 0.8 }}>
            FASE {String(phase).padStart(2, '0')} / {String(D.phases.length).padStart(2, '0')}
          </span>
        </Pill>
        {status && <Pill tone={statusTone} size="sm">
          <span style={{ width: 5, height: 5, borderRadius: 5, background: 'currentColor' }} />
          {status}
        </Pill>}
      </div>
      <div style={{
        fontFamily: 'var(--pa-display)', fontSize: 44, fontWeight: 600,
        letterSpacing: -1.5, lineHeight: 0.98, color: 'var(--pa-ink)',
      }}>{title}</div>
      {sub && <div style={{
        marginTop: 10, fontFamily: 'var(--pa-body)', fontSize: 15,
        color: 'var(--pa-muted)', maxWidth: 580, lineHeight: 1.45,
      }}>{sub}</div>}
    </div>
  );
}

// Admin action bar (bottom). Phase-specific actions; uses PhaseCtx for nav.
function DAdminBar({ children, hint, showNext = true }) {
  const { phase, setPhase } = dUseContext(PhaseCtx);
  const total = D.phases.length;
  return (
    <div style={{
      marginTop: 'auto', paddingTop: 24,
      borderTop: '1px dashed var(--pa-line)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar member={ADMIN} size={28} />
        <div>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
            Ações do admin
          </div>
          <div style={{ fontFamily: 'var(--pa-body)', fontSize: 12.5, color: 'var(--pa-ink)' }}>
            {hint}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {phase > 1 && <Btn variant="ghost" size="sm" onClick={() => setPhase(phase - 1)}>← Voltar</Btn>}
        {children}
        {showNext && phase < total && <Btn onClick={() => setPhase(phase + 1)}>Próxima fase →</Btn>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 1 — RSVP
// ─────────────────────────────────────────────────────────────
function DPhase1({ me }) {
  const counts = dUseMemo(() => {
    const c = { in: 0, out: 0, maybe: 0, pending: 0 };
    D.members.forEach((m) => {
      const s = D.phase1.state[m.id] || 'pending';
      c[s]++;
    });
    return c;
  }, []);

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={1} status="Encerrada" statusTone="success"
        title={<>Quem entra na <span style={{ color: 'var(--pa-accent)' }}>14ª</span>?</>}
        sub={<>O Miguel iniciou esta edição e baptizou-a de <em style={{ color: 'var(--pa-ink)' }}>“Tropa Mediterrânica”</em>. Cada um diz se está dentro — sem rodeios.</>} />

      {/* counters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'Dentro', n: counts.in, tone: '#3d5e44', bg: 'rgba(107,142,111,0.16)' },
          { l: 'Fora', n: counts.out, tone: '#8a4220', bg: 'rgba(217,119,87,0.18)' },
          { l: 'A pensar', n: counts.maybe, tone: 'var(--pa-muted)', bg: 'rgba(31,26,20,0.05)' },
        ].map((c) => (
          <div key={c.l} style={{
            background: c.bg, borderRadius: 14, padding: '14px 18px', flex: 1,
          }}>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 32, fontWeight: 600, color: c.tone, letterSpacing: -0.6 }}>
              {c.n}
            </div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, color: c.tone, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
              {c.l}
            </div>
          </div>
        ))}
      </div>

      {/* members */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
        {D.members.map((m, i) => {
          const s = D.phase1.state[m.id] || 'pending';
          const labels = { in: 'Dentro', out: 'Fora', maybe: 'A pensar', pending: 'Sem responder' };
          const tones = { in: 'success', out: 'warn', maybe: 'default', pending: 'muted' };
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--pa-line)',
            }}>
              <Avatar member={m} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--pa-body)', fontSize: 15, fontWeight: 600, color: 'var(--pa-ink)' }}>
                  {m.name} {m.isAdmin && <span style={{ color: 'var(--pa-accent)', fontSize: 12, fontWeight: 500 }}>· admin</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--pa-muted)' }}>
                  {s === 'in' ? 'respondeu há 11 dias' : s === 'out' ? '“desta vez não consigo, desculpem”' : 'a pensar'}
                </div>
              </div>
              <Pill tone={tones[s]}>{labels[s]}</Pill>
            </div>
          );
        })}
      </div>

      {me.isAdmin && (
        <DAdminBar hint="A fase fechou há 6 dias com 7 confirmações.">
          <Btn variant="ghost" size="sm">Reabrir</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 2 — Each person suggests up to 3 destinations
// ─────────────────────────────────────────────────────────────
function DPhase2({ me }) {
  const mineCount = D.phase2.submittedBy[me.id] || 0;
  const limit = D.phase2.perPersonLimit;

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={2} status="Encerrada" statusTone="success"
        title={<>Cada um lança<br/><span style={{ color: 'var(--pa-accent)' }}>até 3 sítios.</span></>}
        sub="Sem censura. Convencer o grupo é com o nome, a foto e os argumentos." />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
          {D.phase2.suggestions.length} destinos no chapéu
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill>As tuas: {mineCount} / {limit}</Pill>
          {!me.isAdmin && mineCount < limit && <Btn variant="accent" size="sm" icon={<span style={{ fontSize: 14 }}>+</span>}>Lançar destino</Btn>}
        </div>
      </div>

      {/* grid 3 wide */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
      }}>
        {D.phase2.suggestions.map((s) => {
          const by = memberById(s.by);
          const mine = s.by === me.id;
          return (
            <div key={s.id} style={{
              background: '#fff', borderRadius: 14, overflow: 'hidden',
              border: mine ? '1.5px solid var(--pa-accent)' : '1px solid var(--pa-line)',
            }}>
              <PhotoSlot accent={s.accent} label={s.city} height={108} radius={0} />
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontFamily: 'var(--pa-display)', fontSize: 17, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.15 }}>
                  {s.name}
                </div>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {s.tags.map((t) => <Pill key={t} size="sm">{t}</Pill>)}
                </div>
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--pa-line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar member={by} size={20} />
                    <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>
                      {mine ? 'tu' : by.name}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, color: 'var(--pa-ink)', fontWeight: 600 }}>
                    {s.price}€/n
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* slot to add — only when below limit */}
        {!me.isAdmin && mineCount < limit && (
          <button style={{
            background: 'transparent', border: '1.5px dashed var(--pa-line)',
            borderRadius: 14, minHeight: 240, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 10, padding: 20,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 38, background: 'var(--pa-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>Lançar destino</div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 11, color: 'var(--pa-muted)' }}>
              Tens {limit - mineCount} {limit - mineCount === 1 ? 'slot' : 'slots'} por gastar
            </div>
          </button>
        )}
      </div>

      {me.isAdmin && (
        <DAdminBar hint="As submissões fecharam há 3 dias. 8 destinos no chapéu.">
          <Btn variant="ghost" size="sm">Reabrir submissões</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 3 — Voting (secret until close)
// ─────────────────────────────────────────────────────────────
function DPhase3({ me }) {
  const [vote, setVote] = dUseState(D.phase3.myVote);

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={3} status={`Fecha em ${D.phase3.deadline.replace('fecha em ', '')}`} statusTone="accent"
        title={<>Vota no teu<br/><span style={{ color: 'var(--pa-accent)' }}>sítio favorito.</span></>}
        sub="Voto secreto. Só revela quando o Miguel fechar. Podes mudar até lá." />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
        padding: '14px 18px', background: '#fff', borderRadius: 14, border: '1px solid var(--pa-line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Stack members={D.phase3.votedBy.map(memberById)} max={5} size={28} ringColor="#fff" />
          <div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600 }}>
              {D.phase3.votedBy.length} de {D.phase3.votedBy.length + D.phase3.pendingBy.length} já votaram
            </div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10.5, letterSpacing: 0.8, color: 'var(--pa-muted)' }}>
              Falta: {D.phase3.pendingBy.map((id) => memberById(id).name).join(', ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 36,
            background: 'var(--pa-ink)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <rect x="3" y="6" width="8" height="6" rx="1" fill="#fff"/>
              <path d="M5 6V4a2 2 0 014 0v2" stroke="#fff" strokeWidth="1.4" fill="none"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--pa-body)', fontSize: 12, color: 'var(--pa-muted)' }}>
            Votos selados até<br/><span style={{ color: 'var(--pa-ink)', fontWeight: 600 }}>{D.phase3.deadline.replace('fecha em ', 'daqui a ')}</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 8,
      }}>
        {D.phase2.suggestions.map((s) => {
          const by = memberById(s.by);
          const sel = vote === s.id;
          return (
            <button key={s.id} onClick={() => !me.isAdmin || me.id === 'miguel' ? setVote(s.id) : null} style={{
              background: '#fff', borderRadius: 14, overflow: 'hidden', textAlign: 'left',
              border: sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
              cursor: 'pointer', padding: 0, position: 'relative',
            }}>
              <PhotoSlot accent={s.accent} label="" height={96} radius={0} />
              {sel && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 28, height: 28, borderRadius: 28, background: 'var(--pa-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217,119,87,0.5)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.15 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--pa-muted)', marginTop: 2 }}>
                  {s.city} · {s.price}€/n
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar member={by} size={18} />
                  <span style={{ fontSize: 10.5, color: 'var(--pa-muted)' }}>por {by.name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: 'rgba(31,26,20,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="var(--pa-muted)" strokeWidth="1.2" fill="none"/><path d="M8 5v3.5M8 11v.5" stroke="var(--pa-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <div style={{ fontSize: 12.5, color: 'var(--pa-muted)' }}>
          Cada um vota numa só opção. {vote ? <span style={{ color: 'var(--pa-ink)', fontWeight: 600 }}>Voto guardado em {D.phase2.suggestions.find(s => s.id === vote)?.name}.</span> : 'Ainda não votaste.'}
        </div>
      </div>

      {me.isAdmin && (
        <DAdminBar hint="Faltam 0 votos. A votação fechou — o resultado já é visível.">
          <Btn variant="ghost" size="sm">Reabrir votação</Btn>
          <Btn variant="soft" size="sm">Limpar votos</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

Object.assign(window, {
  DTopBar, DLeftRail, DRightRail, DPhaseHeader, DAdminBar,
  DPhase1, DPhase2, DPhase3,
});
