// Perdidos Algures — Mobile companion screens (one per phase, 8 phases).

const { useState: mUseState } = React;

function MShell({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--pa-bg)', fontFamily: 'var(--pa-body)',
      color: 'var(--pa-ink)', WebkitFontSmoothing: 'antialiased',
      paddingTop: 50, paddingBottom: 28, boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function MHeader({ phase, onLogout, onOpenChat }) {
  return (
    <div style={{ padding: '4px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Logo size={13} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill tone="dark" size="sm"><span style={{ fontFamily: 'var(--pa-mono)' }}>FASE {String(phase).padStart(2,'0')}/{String(D.phases.length).padStart(2,'0')}</span></Pill>
        {onOpenChat && (
          <button onClick={onOpenChat} title="Chat" style={{
            width: 28, height: 28, borderRadius: 999, background: '#fff',
            border: '1px solid var(--pa-line)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H6l-3 2.5V10H4a2 2 0 01-2-2V4z" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {onLogout && (
          <button onClick={onLogout} title="Sair" style={{
            width: 28, height: 28, borderRadius: 999, background: '#fff',
            border: '1px solid var(--pa-line)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M9 4V2.5a1 1 0 00-1-1H3a1 1 0 00-1 1v9a1 1 0 001 1h5a1 1 0 001-1V10" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M6 7h7m0 0L10.5 4.5M13 7l-2.5 2.5" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function MPhaseTitle({ kicker, title, sub }) {
  return (
    <div style={{ padding: '12px 22px 14px' }}>
      {kicker && <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
        {kicker}
      </div>}
      <div style={{
        marginTop: kicker ? 6 : 0,
        fontFamily: 'var(--pa-display)', fontSize: 30, fontWeight: 600,
        letterSpacing: -1, lineHeight: 1.02,
      }}>{title}</div>
      {sub && <div style={{ marginTop: 8, fontSize: 13.5, color: 'var(--pa-muted)', lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

// PHASE 1 — RSVP
function MPhase1({ me, onLogout, onOpenChat }) {
  const [choice, setChoice] = mUseState(D.phase1.state[me.id] || null);
  return (
    <MShell>
      <MHeader phase={1} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker={`${ADMIN.name} chamou-te`}
        title={<>Estás dentro<br/>da 14ª?</>}
        sub="“Tropa Mediterrânica” · algures entre o sol e o vinho." />
      <div style={{ padding: '6px 22px', flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'in',    label: 'Dentro',   emoji: '🙋‍♀️', sub: 'Conta comigo',     tone: '#3d5e44',         bg: 'rgba(107,142,111,0.16)' },
            { id: 'maybe', label: 'A pensar', emoji: '🤔',  sub: 'Digo até quinta',  tone: 'var(--pa-ink)',   bg: 'rgba(31,26,20,0.05)' },
            { id: 'out',   label: 'Fora',     emoji: '😩',  sub: 'Desta vez não',    tone: '#8a4220',         bg: 'rgba(217,119,87,0.18)' },
          ].map((o) => {
            const sel = choice === o.id;
            return (
              <button key={o.id} onClick={() => setChoice(o.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: sel ? o.bg : '#fff',
                border: sel ? `2px solid ${o.tone}` : '1px solid var(--pa-line)',
                borderRadius: 16, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontSize: 30 }}>{o.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600, color: o.tone, letterSpacing: -0.3 }}>
                    {o.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--pa-muted)', marginTop: 2 }}>{o.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MShell>
  );
}

// PHASE 2 — Sugerir localizações (up to 3)
function MPhase2({ me, onLogout, onOpenChat }) {
  const mine = D.phase2.suggestions.filter((s) => s.by === me.id);
  const limit = D.phase2.perPersonLimit;
  const empty = Math.max(0, limit - mine.length);
  return (
    <MShell>
      <MHeader phase={2} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker={`${mine.length} de ${limit} usados`}
        title={<>Sugere até<br/><span style={{ color: 'var(--pa-accent)' }}>3 sítios.</span></>} />
      <div style={{ padding: '6px 16px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mine.map((s) => (
          <div key={s.id} style={{
            background: '#fff', borderRadius: 14, padding: 12,
            border: '1.5px solid var(--pa-accent)',
          }}>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--pa-muted)', marginTop: 2 }}>{s.city}</div>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {s.tags.map((t) => <Pill key={t} size="sm">{t}</Pill>)}
            </div>
          </div>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <button key={i} style={{
            background: 'transparent', border: '1.5px dashed var(--pa-line)',
            borderRadius: 14, padding: '20px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 32, background: 'var(--pa-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13.5, fontWeight: 600 }}>
                Slot {mine.length + i + 1}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>Lança um destino</div>
            </div>
          </button>
        ))}
      </div>
    </MShell>
  );
}

// PHASE 3 — Vote local
function MPhase3({ me, onLogout, onOpenChat }) {
  const [vote, setVote] = mUseState(D.phase3.myVote);
  return (
    <MShell>
      <MHeader phase={3} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker="Voto secreto" title={<>Onde queres<br/><span style={{ color: 'var(--pa-accent)' }}>passar este?</span></>} />
      <div style={{ padding: '6px 16px 14px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {D.phase2.suggestions.slice(0, 4).map((s) => {
          const sel = vote === s.id;
          const by = memberById(s.by);
          return (
            <button key={s.id} onClick={() => setVote(s.id)} style={{
              background: '#fff', borderRadius: 14, textAlign: 'left', padding: '14px 16px',
              border: sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
              cursor: 'pointer', position: 'relative',
            }}>
              <div style={{ fontFamily: 'var(--pa-display)', fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{s.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--pa-muted)', marginTop: 2 }}>{s.city}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar member={by} size={18} />
                <span style={{ fontSize: 10.5, color: 'var(--pa-muted)' }}>{by.name}</span>
              </div>
              {sel && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 24, height: 24, borderRadius: 24, background: 'var(--pa-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6.5l2 2 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </MShell>
  );
}

// PHASE 4 — Sugerir alojamento (mobile: read + + button)
function MPhase4({ me, onLogout, onOpenChat }) {
  const winnerLoc = D.phase2.suggestions.find((s) => s.id === D.phase3.winnerId);
  return (
    <MShell>
      <MHeader phase={4} onLogout={onLogout} onOpenChat={onOpenChat} />
      <div style={{ padding: '0 22px 4px' }}>
        <Pill tone="success" size="sm">
          <span style={{ width: 5, height: 5, borderRadius: 5, background: '#3d5e44' }} />
          Local · {winnerLoc.name}
        </Pill>
      </div>
      <MPhaseTitle kicker={`${D.phase4.suggestions.length} alojamentos`}
        title={<>Onde é que<br/><span style={{ color: 'var(--pa-accent)' }}>dormimos?</span></>}
        sub="Sem limite — lança o que vires." />
      <div style={{ padding: '6px 16px 14px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {D.phase4.suggestions.slice(0, 4).map((s) => {
          const by = memberById(s.by);
          return (
            <div key={s.id} style={{
              background: '#fff', borderRadius: 12, padding: '12px 14px',
              border: '1px solid var(--pa-line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Pill tone="dark" size="sm">{s.type}</Pill>
                    <span style={{ fontSize: 11, color: 'var(--pa-muted)' }}>{s.area}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--pa-ink)', lineHeight: 1.4 }}>
                    {s.note.length > 60 ? s.note.slice(0, 60) + '…' : s.note}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {s.price}€
                </div>
              </div>
              <div style={{
                marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--pa-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Avatar member={by} size={16} />
                  <span style={{ fontSize: 10.5, color: 'var(--pa-muted)' }}>{by.name}</span>
                </div>
                <a href={s.link} target="_blank" rel="noreferrer" style={{
                  fontFamily: 'var(--pa-mono)', fontSize: 10.5, color: 'var(--pa-accent)',
                  fontWeight: 600, textDecoration: 'none',
                }}>ver →</a>
              </div>
            </div>
          );
        })}

        <button style={{
          marginTop: 4, background: 'var(--pa-accent)', color: '#fff', border: 'none',
          borderRadius: 999, padding: '14px', cursor: 'pointer',
          fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600,
        }}>+ Lançar alojamento</button>
      </div>
    </MShell>
  );
}

// PHASE 5 — Votar alojamento (with tie banner for admin)
function MPhase5({ me, onLogout, onOpenChat }) {
  const counts = D.phase4.suggestions.map((s) => ({ s, n: D.phase5.results[s.id]?.count || 0 }));
  const max = Math.max(...counts.map((c) => c.n));
  const tied = counts.filter((c) => c.n === max && c.n > 0).map((c) => c.s);
  const isTie = tied.length > 1;

  return (
    <MShell>
      <MHeader phase={5} onLogout={onLogout} onOpenChat={onOpenChat} />
      <div style={{ padding: '0 22px 4px' }}>
        {isTie ? <Pill tone="warn" size="sm">⚠ Empate · espera o Miguel</Pill>
               : <Pill tone="accent" size="sm">Voto secreto</Pill>}
      </div>
      <MPhaseTitle title={isTie ? <>Empate.<br/><span style={{ color: 'var(--pa-accent)' }}>Miguel desempata.</span></>
                                : <>Vota no <span style={{ color: 'var(--pa-accent)' }}>alojamento.</span></>}
        sub={isTie ? `${tied.length} alojamentos com ${max} votos cada.` : 'Um por pessoa, secreto até fechar.'} />

      <div style={{ padding: '6px 16px 14px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isTie && tied.map((t) => (
          <div key={t.id} style={{
            background: '#fff', borderRadius: 14, padding: 14, border: '2px solid var(--pa-accent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Pill tone="dark" size="sm">{t.type}</Pill>
              <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{t.area} · {t.price}€/n</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--pa-ink)', lineHeight: 1.4, marginBottom: 10 }}>
              {t.note}
            </div>
            {me.isAdmin ? (
              <button style={{
                width: '100%', padding: '10px', borderRadius: 999, border: 'none',
                background: 'var(--pa-accent)', color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--pa-body)', fontSize: 12.5, fontWeight: 600,
              }}>Escolher este ✓</button>
            ) : (
              <div style={{ padding: 8, background: 'rgba(31,26,20,0.05)', borderRadius: 8, fontSize: 11.5, color: 'var(--pa-muted)', textAlign: 'center' }}>
                À espera do Miguel
              </div>
            )}
          </div>
        ))}
        {!isTie && D.phase4.suggestions.slice(0, 5).map((s) => (
          <div key={s.id} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--pa-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Pill tone="dark" size="sm">{s.type}</Pill>
                <span style={{ fontSize: 11.5 }}>{s.area}</span>
              </div>
              <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 13, fontWeight: 700 }}>{s.price}€</span>
            </div>
          </div>
        ))}
      </div>
    </MShell>
  );
}

// PHASE 6 — Availability calendar
function MPhase6({ me, onLogout, onOpenChat }) {
  const [days, setDays] = mUseState(D.phase6.availability[me.id] || []);
  const toggle = (d) => setDays((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]);
  return (
    <MShell>
      <MHeader phase={6} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker={`${days.length} dias marcados`}
        title={<>Em que dias<br/><span style={{ color: 'var(--pa-accent)' }}>podes ir?</span></>} />
      <div style={{ padding: '6px 16px 14px', flex: 1, overflow: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid var(--pa-line)' }}>
          <Calendar dense onCellClick={toggle} renderCell={(d) => {
            const sel = days.includes(d);
            return (
              <div style={{
                width: '100%', height: '100%', borderRadius: 6,
                background: sel ? 'var(--pa-accent)' : '#fff',
                color: sel ? '#fff' : 'var(--pa-ink)',
                border: sel ? 'none' : '1px solid var(--pa-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--pa-body)', fontSize: 12, fontWeight: sel ? 700 : 500,
              }}>{d}</div>
            );
          }} />
        </div>
        <button style={{
          marginTop: 16, width: '100%', padding: '14px', borderRadius: 999, border: 'none',
          background: 'var(--pa-accent)', color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600,
        }}>Guardar disponibilidade</button>
      </div>
    </MShell>
  );
}

// PHASE 7 — Lock dates (mobile: read-only summary)
function MPhase7({ me, onLogout, onOpenChat }) {
  return (
    <MShell>
      <MHeader phase={7} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker="A aguardar"
        title={<>Miguel está<br/><span style={{ color: 'var(--pa-accent)' }}>a escolher os dias.</span></>}
        sub="Já submeteste. Brevemente sabes." />
      <div style={{ padding: '6px 16px 14px', flex: 1, overflow: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid var(--pa-line)' }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            Top janelas
          </div>
          {[
            { d: '12–14 Jun', n: 7 },
            { d: '19–21 Jun', n: 5 },
            { d: '26–28 Jun', n: 5 },
          ].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i ? '1px solid var(--pa-line)' : 'none' }}>
              <span style={{ fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 500 }}>{w.d}</span>
              <Pill tone={w.n === 7 ? 'success' : 'default'} size="sm">{w.n}/7</Pill>
            </div>
          ))}
        </div>
      </div>
    </MShell>
  );
}

// PHASE 8 — Planning (tabs at bottom)
function MPhase8({ me, onLogout, onOpenChat }) {
  const [tab, setTab] = mUseState('estadia');
  return (
    <MShell>
      <MHeader phase={8} onLogout={onLogout} onOpenChat={onOpenChat} />
      <div style={{ padding: '0 22px 4px' }}>
        <Pill tone="success" size="sm">
          <span style={{ width: 5, height: 5, borderRadius: 5, background: '#3d5e44' }} />
          12–14 Jun · trancado
        </Pill>
      </div>
      <MPhaseTitle title={<>Vamos a <span style={{ color: 'var(--pa-accent)' }}>Vigo.</span></>}
        sub="Faltam 27 dias. Há coisas a tratar." />

      <div style={{ padding: '4px 16px 8px', flex: 1, overflow: 'auto' }}>
        {tab === 'estadia' && <MPlanEstadia />}
        {tab === 'custos' && <MPlanCustos />}
        {tab === 'compras' && <MPlanCompras />}
        {tab === 'itin' && <MPlanItin />}
      </div>

      <div style={{
        padding: '8px 14px 4px', display: 'flex', gap: 4,
        borderTop: '1px solid var(--pa-line)', background: 'var(--pa-bg)',
      }}>
        {[
          { id: 'estadia', l: 'Estadia', i: '🏡' },
          { id: 'custos', l: 'Contas', i: '€' },
          { id: 'itin', l: 'Plano', i: '📍' },
          { id: 'compras', l: 'Compras', i: '🛒' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 0', border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: tab === t.id ? 'var(--pa-ink)' : 'var(--pa-muted)',
            fontFamily: 'var(--pa-body)', fontSize: 10.5, fontWeight: tab === t.id ? 700 : 500,
          }}>
            <span style={{ fontSize: 18, opacity: tab === t.id ? 1 : 0.5 }}>{t.i}</span>
            {t.l}
          </button>
        ))}
      </div>
    </MShell>
  );
}

function MPlanEstadia() {
  const acc = D.phase4.suggestions[0];
  const by = memberById(acc.by);
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '2px solid var(--pa-accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Pill tone="dark" size="sm">{acc.type}</Pill>
        <Pill tone="accent" size="sm">★ Escolhido</Pill>
      </div>
      <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600 }}>{acc.area}</div>
      <div style={{ fontSize: 12, color: 'var(--pa-muted)', marginTop: 4 }}>{acc.note}</div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--pa-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 14, fontWeight: 700 }}>{acc.price}€/n</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar member={by} size={18} />
          <span style={{ fontSize: 11, color: 'var(--pa-muted)' }}>{by.name}</span>
        </div>
      </div>
    </div>
  );
}

function MPlanCustos() {
  const c = D.phase8.costs;
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid var(--pa-line)' }}>
      <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
        Por pessoa
      </div>
      <div style={{ marginTop: 4, fontFamily: 'var(--pa-display)', fontSize: 40, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1 }}>
        {c.perPerson}€
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(c.paid).slice(0, 5).map(([id, paid]) => {
          const m = memberById(id);
          const pct = (paid / c.perPerson) * 100;
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar member={m} size={20} />
              <span style={{ flex: 0.5, fontSize: 12 }}>{m.name}</span>
              <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(31,26,20,0.06)' }}>
                <div style={{
                  width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 4,
                  background: pct >= 100 ? '#3d5e44' : 'var(--pa-accent)',
                }} />
              </div>
              <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 10.5, fontWeight: 600 }}>{paid}€</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MPlanCompras() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
      {D.phase8.shopping.slice(0, 5).map((it, i) => {
        const m = memberById(it.who);
        return (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px',
            borderTop: i === 0 ? 'none' : '1px solid var(--pa-line)',
            opacity: it.done ? 0.5 : 1,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: it.done ? '#3d5e44' : 'transparent',
              border: it.done ? 'none' : '1.5px solid var(--pa-line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {it.done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
            </div>
            <div style={{ flex: 1, fontSize: 13, textDecoration: it.done ? 'line-through' : 'none' }}>{it.label}</div>
            <Avatar member={m} size={18} />
          </div>
        );
      })}
    </div>
  );
}

function MPlanItin() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {D.phase8.itinerary.map((day, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: 'rgba(31,26,20,0.04)', fontFamily: 'var(--pa-display)', fontSize: 14, fontWeight: 600 }}>
            {day.day}
          </div>
          {day.items.map((it, j) => (
            <div key={j} style={{ padding: '10px 14px', borderTop: '1px solid var(--pa-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--pa-accent)', width: 42, flexShrink: 0 }}>{it.t}</span>
              <span style={{ fontSize: 12.5, color: 'var(--pa-ink)', flex: 1 }}>{it.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Top-level mobile router
function MobileApp({ viewAs = 'member', phase = D.edition.currentPhase, liveUser, onLogout }) {
  const me = liveUser || (viewAs === 'admin' ? memberById(D.adminId) : memberById('rita'));
  const [chatOpen, setChatOpen] = mUseState(false);
  const phases = { 1: MPhase1, 2: MPhase2, 3: MPhase3, 4: MPhase4, 5: MPhase5, 6: MPhase6, 7: MPhase7, 8: MPhase8 };
  const View = phases[phase] || MPhase3;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <View me={me} onLogout={onLogout} onOpenChat={() => setChatOpen(true)} />
      <MobileChatSheet me={me} open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

Object.assign(window, {
  MPhase1, MPhase2, MPhase3, MPhase4, MPhase5, MPhase6, MPhase7, MPhase8,
  MobileApp,
});
