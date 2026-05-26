// Perdidos Algures — Desktop phases 4–8 + the DesktopShell that routes them.
// Phase numbering (v2):
//   4 = accommodation suggestions  (was: availability)
//   5 = accommodation vote          (was: lock dates)
//   6 = availability                (was: planning)
//   7 = lock dates
//   8 = planning

const { useState: dUseState2, useMemo: dUseMemo2 } = React;

// ─────────────────────────────────────────────────────────────
// Reused: Phase 3 winner banner — used by phase 4 to show context
// ─────────────────────────────────────────────────────────────
function DLocationWinnerStrip() {
  const w = D.phase2.suggestions.find((s) => s.id === D.phase3.winnerId);
  if (!w) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 16px', borderRadius: 14, marginBottom: 18,
      background: '#fff', border: '1px solid var(--pa-line)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: `repeating-linear-gradient(135deg, ${w.accent}66 0 6px, ${w.accent}33 6px 12px)`,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
          Local decidido · 4 votos
        </div>
        <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600, letterSpacing: -0.3, marginTop: 2 }}>
          {w.name} <span style={{ color: 'var(--pa-muted)', fontWeight: 400, fontSize: 13 }}>· {w.city}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 4 — Sugerir alojamentos (unlimited per person, rich form)
// ─────────────────────────────────────────────────────────────
function DPhase4({ me }) {
  const [adding, setAdding] = dUseState2(false);
  const mineCount = D.phase4.submittedBy[me.id] || 0;

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={4} status={`Fecha em ${D.phase4.deadline.replace('fecha em ', '')}`} statusTone="accent"
        title={<>Onde é que <span style={{ color: 'var(--pa-accent)' }}>dormimos?</span></>}
        sub="Cada um pode lançar quantos alojamentos quiser. Aprende a vender — o teu favorito merece argumentos." />

      <DLocationWinnerStrip />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
          {D.phase4.suggestions.length} alojamentos no chapéu · {Object.values(D.phase4.submittedBy).reduce((a, b) => a + b, 0)} submissões
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill>Os teus: {mineCount}</Pill>
          {!adding && <Btn variant="accent" size="sm" onClick={() => setAdding(true)} icon={<span style={{ fontSize: 14 }}>+</span>}>Lançar alojamento</Btn>}
        </div>
      </div>

      {adding && <AccommodationForm onCancel={() => setAdding(false)} onSubmit={() => setAdding(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {D.phase4.suggestions.map((s) => <AccommodationCard key={s.id} acc={s} me={me} />)}
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${D.phase4.suggestions.length} alojamentos no chapéu. Quando estiverem prontos, abre votação.`}>
          <Btn variant="ghost" size="sm">Limpar tudo</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

function AccommodationCard({ acc, me }) {
  const by = memberById(acc.by);
  const mine = acc.by === me.id;
  const host = (() => { try { return new URL(acc.link).host.replace('www.', ''); } catch { return acc.link; } })();
  return (
    <div style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      border: mine ? '1.5px solid var(--pa-accent)' : '1px solid var(--pa-line)',
      display: 'flex',
    }}>
      <div style={{
        width: 8, flexShrink: 0,
        background: `repeating-linear-gradient(180deg, var(--pa-accent) 0 8px, transparent 8px 16px)`,
        opacity: mine ? 1 : 0,
      }} />
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Pill tone="dark" size="sm">{acc.type}</Pill>
              <span style={{ fontFamily: 'var(--pa-body)', fontSize: 12.5, color: 'var(--pa-muted)' }}>
                {acc.area}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-ink)', lineHeight: 1.45, marginBottom: 8 }}>
              {acc.note}
            </div>
            <a href={acc.link} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--pa-mono)', fontSize: 11.5, color: 'var(--pa-accent)',
              fontWeight: 600, textDecoration: 'none',
            }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M3 8l5-5M5 2.5h2.5V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {host}
            </a>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>
              {acc.price}€
            </div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 9.5, color: 'var(--pa-muted)', letterSpacing: 0.5 }}>
              /NOITE
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--pa-line)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Avatar member={by} size={20} />
          <span style={{ fontFamily: 'var(--pa-body)', fontSize: 12, color: 'var(--pa-muted)' }}>
            {mine ? 'tu' : by.name} sugeriu
          </span>
        </div>
      </div>
    </div>
  );
}

function AccommodationForm({ onCancel, onSubmit }) {
  const [type, setType]   = dUseState2('Casa');
  const [price, setPrice] = dUseState2('');
  const [area, setArea]   = dUseState2('');
  const [link, setLink]   = dUseState2('');
  const [note, setNote]   = dUseState2('');
  const ok = type && price && area;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 22, marginBottom: 14,
      border: '2px solid var(--pa-accent)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
          Lançar alojamento
        </div>
        <button onClick={onCancel} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--pa-muted)',
          fontSize: 18, padding: 4,
        }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Tipo
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {D.phase4.types.map((t) => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                background: type === t ? 'var(--pa-ink)' : '#fff',
                color: type === t ? '#fff' : 'var(--pa-ink)',
                border: type === t ? 'none' : '1px solid var(--pa-line)',
                fontFamily: 'var(--pa-body)', fontSize: 12, fontWeight: 500,
              }}>{t}</button>
            ))}
          </div>
        </div>
        <Field label="€ por noite" placeholder="65" prefix="€" value={price} onChange={setPrice} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <Field label="Zona / bairro" placeholder="Bouzas, Cíes ilha, Casco Vello..." value={area} onChange={setArea} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <Field label="Link" placeholder="https://airbnb.com/..." value={link} onChange={setLink} prefix="🔗" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <Field label="Comentário" textarea placeholder="O que tem de especial? Já lá foste? Custos extra?" value={note} onChange={setNote} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="accent" size="sm" onClick={onSubmit} disabled={!ok}>Lançar</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 5 — Vote on accommodation. Includes TIE scenario + admin tiebreak.
// ─────────────────────────────────────────────────────────────
function DPhase5({ me }) {
  const [vote, setVote] = dUseState2(D.phase5.myVote);
  // pickedTiebreak: { id, method } | null
  const [resolved, setResolved] = dUseState2(null);

  const closed = D.phase5.pendingBy.length === 0 || resolved;
  const counts = D.phase4.suggestions.map((s) => ({
    acc: s, count: (D.phase5.results[s.id] || { count: 0 }).count,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count));
  const tied = counts.filter((c) => c.count === maxCount && c.count > 0).map((c) => c.acc);
  const isTie = closed && tied.length > 1 && !resolved;
  const winner = resolved
    ? D.phase4.suggestions.find((s) => s.id === resolved.id)
    : (tied.length === 1 ? tied[0] : null);

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={5}
        status={isTie ? 'EMPATE · a desempatar' : winner ? 'Decidido' : `Fecha em ${D.phase5.deadline.replace('fecha em ', '')}`}
        statusTone={isTie ? 'warn' : winner ? 'success' : 'accent'}
        title={isTie ? <>Empate.<br/><span style={{ color: 'var(--pa-accent)' }}>Hora de desempatar.</span></>
                     : winner ? <>{winner.type} em <span style={{ color: 'var(--pa-accent)' }}>{winner.area}.</span></>
                     : <>Onde é que <span style={{ color: 'var(--pa-accent)' }}>dormimos mesmo?</span></>}
        sub={isTie
          ? `${tied.length} alojamentos empatados a ${maxCount} votos. Escolhe como desempatar.`
          : winner ? `${maxCount} votos · ${winner.area} · ${winner.price}€/noite`
          : 'Voto secreto. Cada um vota num alojamento. Podes mudar até fechar.'} />

      {isTie && (
        <TieBreakManager tied={tied} me={me}
          onResolve={(id, method) => setResolved({ id, method })} />
      )}

      {winner && (
        <div style={{
          background: 'var(--pa-ink)', color: '#fff', borderRadius: 16,
          padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            background: 'repeating-linear-gradient(135deg, var(--pa-accent) 0 8px, rgba(217,119,87,0.4) 8px 16px)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              {resolved ? `Decidido via ${TIE_METHODS.find(t => t.id === resolved.method)?.title || resolved.method}` : 'Vencedor da votação'}
            </div>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 22, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>
              {winner.type} · {winner.area}
            </div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {winner.price}€/noite · sugerido por {memberById(winner.by).name}
            </div>
          </div>
          <a href={winner.link} target="_blank" rel="noreferrer" style={{
            padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.12)',
            color: '#fff', textDecoration: 'none', fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600,
          }}>Ver anúncio →</a>
        </div>
      )}

      {!closed && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: '#fff', borderRadius: 14, border: '1px solid var(--pa-line)',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Stack members={D.phase5.votedBy.map(memberById)} max={5} size={28} ringColor="#fff" />
            <div>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600 }}>
                {D.phase5.votedBy.length} de {D.phase5.votedBy.length + D.phase5.pendingBy.length} já votaram
              </div>
              <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10.5, color: 'var(--pa-muted)' }}>
                Falta: {D.phase5.pendingBy.map((id) => memberById(id).name).join(', ') || 'ninguém'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {D.phase4.suggestions.map((s) => {
          const r = D.phase5.results[s.id] || { count: 0, voters: [] };
          const sel = vote === s.id;
          const isWinner = winner && winner.id === s.id;
          return (
            <button key={s.id} onClick={() => !closed && setVote(s.id)} style={{
              background: '#fff', borderRadius: 14, padding: 16, textAlign: 'left',
              border: isWinner ? '2px solid var(--pa-accent)' : sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
              cursor: closed ? 'default' : 'pointer', position: 'relative',
              opacity: isTie && !tied.includes(s) ? 0.5 : 1,
            }}>
              {(closed || isWinner) && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  fontFamily: 'var(--pa-display)', fontSize: 20, fontWeight: 700,
                  color: r.count > 0 ? 'var(--pa-accent)' : 'var(--pa-muted)',
                }}>{r.count}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Pill tone="dark" size="sm">{s.type}</Pill>
                <span style={{ fontSize: 11, color: 'var(--pa-muted)' }}>{s.area}</span>
              </div>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 12.5, color: 'var(--pa-ink)', lineHeight: 1.4, minHeight: 36 }}>
                {s.note.length > 90 ? s.note.slice(0, 90) + '…' : s.note}
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 12, fontWeight: 600 }}>{s.price}€/n</span>
                {sel && !closed && <Pill tone="accent" size="sm">✓ Voto teu</Pill>}
              </div>
            </button>
          );
        })}
      </div>

      {me.isAdmin && !winner && !isTie && (
        <DAdminBar hint="Faltam votos. Podes esperar ou fechar já.">
          <Btn variant="ghost" size="sm">Enviar lembrete</Btn>
          <Btn variant="accent" size="sm">Fechar votação 🔒</Btn>
        </DAdminBar>
      )}
      {me.isAdmin && winner && (
        <DAdminBar hint={resolved ? 'Desempate fechado.' : 'Votação fechada com resultado claro.'}>
          {resolved && <Btn variant="ghost" size="sm" onClick={() => setResolved(null)}>Anular resultado</Btn>}
          <Btn variant="soft" size="sm">Reabrir votação</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 6 — Availability (renamed from old DPhase4)
// ─────────────────────────────────────────────────────────────
function DPhase6({ me }) {
  const winnerLoc = D.phase2.suggestions.find((s) => s.id === D.phase3.winnerId);
  const [days, setDays] = dUseState2(D.phase6.availability[me.id] || []);

  const toggle = (d) => setDays((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]);

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={6} status="A recolher disponibilidades" statusTone="accent"
        title={<>Toca nos dias<br/>em que <span style={{ color: 'var(--pa-accent)' }}>podes ir.</span></>}
        sub="Marca generoso. Quanto mais opções, melhor o consenso." />

      <div style={{
        background: 'var(--pa-ink)', color: '#fff', borderRadius: 16,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: `repeating-linear-gradient(135deg, ${winnerLoc.accent}88 0 6px, ${winnerLoc.accent}44 6px 12px)`,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
            Destino · alojamento
          </div>
          <div style={{ fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 600, letterSpacing: -0.3, marginTop: 1 }}>
            {winnerLoc.name} · Casa do Faro (Bouzas)
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22, alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 20, border: '1px solid var(--pa-line)' }}>
          <Calendar onCellClick={toggle} renderCell={(d) => {
            const sel = days.includes(d);
            return (
              <div style={{
                width: '100%', height: '100%', borderRadius: 8,
                background: sel ? 'var(--pa-accent)' : '#fff',
                color: sel ? '#fff' : 'var(--pa-ink)',
                border: sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: sel ? 700 : 500,
                cursor: 'pointer',
                boxShadow: sel ? '0 2px 8px rgba(217,119,87,0.3)' : 'none',
              }}>{d}</div>
            );
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid var(--pa-line)' }}>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
              A tua disponibilidade
            </div>
            <div style={{ marginTop: 4, fontFamily: 'var(--pa-display)', fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
              {days.length} <span style={{ fontSize: 14, color: 'var(--pa-muted)', fontWeight: 400 }}>dias marcados</span>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--pa-line)', fontSize: 11.5, color: 'var(--pa-muted)' }}>
              Mín. recomendado: 7 dias (para overlap com toda a gente).
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid var(--pa-line)' }}>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Estado do grupo
            </div>
            {D.members.filter((m) => D.phase1.state[m.id] === 'in').map((m) => {
              const submitted = D.phase6.submittedBy.includes(m.id);
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <Avatar member={m} size={22} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--pa-ink)' }}>{m.name}</span>
                  {submitted ? <Pill tone="success" size="sm">✓ pronto</Pill> : <Pill tone="muted" size="sm">a marcar…</Pill>}
                </div>
              );
            })}
          </div>

          <Btn variant="accent" size="lg" style={{ width: '100%' }}>Guardar disponibilidade</Btn>
        </div>
      </div>

      {me.isAdmin && (
        <DAdminBar hint="6 de 7 já submeteram. Falta o Pedro.">
          <Btn variant="ghost" size="sm">Picar o Pedro</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 7 — Lock dates (renamed from old DPhase5)
// ─────────────────────────────────────────────────────────────
function DPhase7({ me }) {
  const totalIn = Object.values(D.phase1.state).filter((s) => s === 'in').length;
  const heat = dUseMemo2(() => {
    const h = {};
    Object.values(D.phase6.availability).forEach((arr) => {
      arr.forEach((d) => { h[d] = (h[d] || 0) + 1; });
    });
    return h;
  }, []);

  const [range, setRange] = dUseState2({ from: 12, to: 14 });
  const ranked = dUseMemo2(() => {
    return Object.entries(heat).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([d, n]) => ({ day: +d, count: n }));
  }, []);

  return (
    <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DPhaseHeader phase={7} status={me.isAdmin ? 'Tu decides' : 'A aguardar o Miguel'} statusTone={me.isAdmin ? 'accent' : 'muted'}
        title={<>O calendário falou.<br/><span style={{ color: 'var(--pa-accent)' }}>{me.isAdmin ? 'Tranca os dias.' : 'Miguel está a escolher.'}</span></>}
        sub="Quanto mais escura a célula, mais gente está disponível. O admin escolhe um intervalo e tranca." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22, alignItems: 'flex-start', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid var(--pa-line)' }}>
          <Calendar renderCell={(d) => {
            const n = heat[d] || 0;
            const inRange = d >= range.from && d <= range.to;
            const intensity = totalIn > 0 ? n / totalIn : 0;
            return (
              <div style={{
                width: '100%', height: '100%', borderRadius: 8,
                background: inRange ? 'var(--pa-ink)'
                  : intensity > 0 ? `rgba(217,119,87,${0.10 + intensity * 0.6})` : '#fff',
                color: inRange ? '#fff' : 'var(--pa-ink)',
                border: inRange ? '2px solid var(--pa-ink)' : intensity === 0 ? '1px solid var(--pa-line)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: me.isAdmin ? 'pointer' : 'default',
              }} onClick={() => me.isAdmin ? setRange({ from: d, to: Math.min(d + 2, 30) }) : null}>
                <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600 }}>{d}</div>
                {n > 0 && <div style={{
                  fontFamily: 'var(--pa-mono)', fontSize: 9, marginTop: 1,
                  color: inRange ? 'rgba(255,255,255,0.7)' : 'var(--pa-muted)', fontWeight: 600,
                }}>{n}/{totalIn}</div>}
              </div>
            );
          }} />

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--pa-line)', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--pa-body)', fontSize: 11.5, color: 'var(--pa-muted)' }}>
            <span>Disponibilidade:</span>
            {[0.15, 0.35, 0.55, 0.75].map((a, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: `rgba(217,119,87,${a})` }} />
                {i === 0 ? 'poucos' : i === 3 ? 'todos' : ''}
              </span>
            ))}
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--pa-ink)' }} />
              Trancado
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '1px solid var(--pa-line)' }}>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
              Melhor janela
            </div>
            <div style={{ marginTop: 6, fontFamily: 'var(--pa-display)', fontSize: 28, fontWeight: 600, letterSpacing: -0.7, lineHeight: 1.05 }}>
              {range.from}–{range.to} Jun
            </div>
            <div style={{ marginTop: 2, fontSize: 12, color: 'var(--pa-muted)' }}>
              {heat[range.from] || 0}, {heat[range.from + 1] || 0} e {heat[range.to] || 0} disponíveis · 3 noites
            </div>

            <div style={{ marginTop: 16 }}>
              {me.isAdmin ? (
                <Btn variant="accent" size="lg" style={{ width: '100%' }}>
                  Trancar estes dias 🔒
                </Btn>
              ) : (
                <div style={{ padding: 12, background: 'rgba(31,26,20,0.04)', borderRadius: 10, fontSize: 12, color: 'var(--pa-muted)', textAlign: 'center' }}>
                  Miguel decide.
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid var(--pa-line)' }}>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Top dias
            </div>
            {ranked.map((r) => (
              <div key={r.day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                <div style={{
                  width: 32, height: 28, borderRadius: 6,
                  background: `rgba(217,119,87,${0.15 + (r.count / totalIn) * 0.6})`,
                  fontFamily: 'var(--pa-body)', fontSize: 12, fontWeight: 600, color: 'var(--pa-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{r.day}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 4, borderRadius: 4, background: 'rgba(31,26,20,0.06)' }}>
                    <div style={{ width: `${(r.count / totalIn) * 100}%`, height: '100%', background: 'var(--pa-accent)', borderRadius: 4 }} />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, color: 'var(--pa-ink)', fontWeight: 600 }}>
                  {r.count}/{totalIn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 8 — Planning (renamed from old DPhase6)
// ─────────────────────────────────────────────────────────────
function DPhase8({ me }) {
  const [tab, setTab] = dUseState2('estadia');
  const tabs = [
    { id: 'estadia', label: 'Estadia',    icon: '🏡' },
    { id: 'custos',  label: 'Contas',     icon: '€' },
    { id: 'itin',    label: 'Itinerário', icon: '📍' },
    { id: 'ativ',    label: 'Atividades', icon: '🎯' },
    { id: 'compras', label: 'Compras',    icon: '🛒' },
  ];

  return (
    <div style={{ flex: 1, padding: '32px 36px 28px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Pill tone="dark" size="sm">
              <span style={{ fontFamily: 'var(--pa-mono)', letterSpacing: 0.8 }}>
                FASE {String(D.phases.length).padStart(2, '0')} / {String(D.phases.length).padStart(2, '0')}
              </span>
            </Pill>
            <Pill tone="success" size="sm">
              <span style={{ width: 5, height: 5, borderRadius: 5, background: 'currentColor' }} />
              Trancado
            </Pill>
          </div>
          <div style={{
            fontFamily: 'var(--pa-display)', fontSize: 44, fontWeight: 600,
            letterSpacing: -1.5, lineHeight: 0.98,
          }}>Vamos a <span style={{ color: 'var(--pa-accent)' }}>Vigo</span>.</div>
          <div style={{ marginTop: 10, fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-muted)' }}>
            12 – 14 Junho 2026 · 3 noites · 7 pessoas · Casa do Faro, Bouzas
          </div>
        </div>
        <div style={{
          background: 'var(--pa-ink)', color: '#fff', borderRadius: 16,
          padding: '14px 18px', textAlign: 'right', flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
            Faltam
          </div>
          <div style={{ fontFamily: 'var(--pa-display)', fontSize: 36, fontWeight: 600, letterSpacing: -1, lineHeight: 1 }}>
            27 <span style={{ fontSize: 18, opacity: 0.7 }}>dias</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, background: '#fff', borderRadius: 999, border: '1px solid var(--pa-line)', marginBottom: 20, width: 'fit-content' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'var(--pa-ink)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--pa-ink)',
            fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ opacity: 0.7 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'estadia' && <PlanEstadia />}
      {tab === 'custos' && <PlanCustos />}
      {tab === 'itin' && <PlanItinerario />}
      {tab === 'ativ' && <PlanAtividades />}
      {tab === 'compras' && <PlanCompras />}
    </div>
  );
}

// Estadia tab — read-only summary of the winning accommodation (phase 5)
function PlanEstadia() {
  const acc = D.phase4.suggestions[0]; // Casa do Faro = a1 (winning by tiebreak in demo)
  const by = memberById(acc.by);
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
      <PhotoSlot accent="#6b8e6f" label={`alojamento decidido · ${acc.area}`} height={180} radius={0} />
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Pill tone="dark" size="sm">{acc.type}</Pill>
              <Pill tone="accent" size="sm">★ Escolhido</Pill>
            </div>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
              {acc.area}
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-ink)', lineHeight: 1.5, maxWidth: 540 }}>
              {acc.note}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 32, fontWeight: 600 }}>{acc.price}€</div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, color: 'var(--pa-muted)' }}>/NOITE</div>
          </div>
        </div>
        <div style={{
          marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--pa-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar member={by} size={22} />
            <span style={{ fontSize: 12, color: 'var(--pa-muted)' }}>{by.name} sugeriu</span>
          </div>
          <a href={acc.link} target="_blank" rel="noreferrer" style={{
            padding: '8px 14px', borderRadius: 999, background: 'var(--pa-ink)', color: '#fff',
            textDecoration: 'none', fontFamily: 'var(--pa-body)', fontSize: 12.5, fontWeight: 600,
          }}>Ver anúncio →</a>
        </div>
      </div>
    </div>
  );
}

function PlanCustos() {
  const c = D.phase8.costs;
  const total = c.breakdown.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 22, border: '1px solid var(--pa-line)' }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
          Por pessoa
        </div>
        <div style={{ marginTop: 6, fontFamily: 'var(--pa-display)', fontSize: 56, fontWeight: 600, letterSpacing: -2, lineHeight: 0.95 }}>
          {c.perPerson}€
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--pa-muted)' }}>
          Estimativa · não inclui transporte
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {c.breakdown.map((b) => {
            const pct = (b.value / total) * 100;
            return (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{b.label}</span>
                  <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 12, fontWeight: 600 }}>
                    {b.value}€ <span style={{ color: 'var(--pa-muted)', fontWeight: 400 }}>· {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'rgba(31,26,20,0.06)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--pa-accent)', borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 22, border: '1px solid var(--pa-line)' }}>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
          Quem já pagou
        </div>
        {Object.entries(c.paid).map(([id, paid]) => {
          const m = memberById(id);
          const pct = (paid / c.perPerson) * 100;
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <Avatar member={m} size={26} />
              <span style={{ flex: 0.5, fontSize: 13, fontWeight: 500 }}>{m.name}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 6, background: 'rgba(31,26,20,0.06)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, pct)}%`, height: '100%',
                  background: pct >= 100 ? '#3d5e44' : pct > 0 ? 'var(--pa-accent)' : 'transparent',
                  borderRadius: 6,
                }} />
              </div>
              <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 11.5, fontWeight: 600, width: 60, textAlign: 'right' }}>
                {paid}€<span style={{ color: 'var(--pa-muted)', fontWeight: 400 }}>/{c.perPerson}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanItinerario() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {D.phase8.itinerary.map((day, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: 'rgba(31,26,20,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--pa-display)', fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>
              {day.day}
            </span>
            <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 11, color: 'var(--pa-muted)', letterSpacing: 0.8 }}>
              {day.items.length} momentos
            </span>
          </div>
          {day.items.map((it, j) => {
            const m = memberById(it.who);
            return (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderTop: '1px solid var(--pa-line)',
              }}>
                <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 13, fontWeight: 600, color: 'var(--pa-accent)', width: 50 }}>{it.t}</span>
                <div style={{ flex: 1, fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-ink)', fontWeight: 500 }}>{it.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar member={m} size={20} />
                  <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{m.name}</span>
                </div>
              </div>
            );
          })}
          <button style={{
            width: '100%', padding: '10px 20px', textAlign: 'left',
            background: 'transparent', border: 'none', borderTop: '1px dashed var(--pa-line)',
            color: 'var(--pa-muted)', cursor: 'pointer',
            fontFamily: 'var(--pa-body)', fontSize: 12.5,
          }}>+ adicionar momento</button>
        </div>
      ))}
    </div>
  );
}

function PlanAtividades() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {D.phase8.activities.map((a) => {
        const by = memberById(a.by);
        return (
          <div key={a.id} style={{
            background: '#fff', borderRadius: 14, padding: '14px 18px',
            border: '1px solid var(--pa-line)', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 44,
              background: 'rgba(217,119,87,0.14)', color: 'var(--pa-accent)',
              fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{a.votes}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, fontWeight: 600 }}>{a.label}</div>
              <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar member={by} size={16} />
                <span style={{ fontSize: 11, color: 'var(--pa-muted)' }}>{by.name} propôs</span>
              </div>
            </div>
            <Btn variant="ghost" size="sm">👍</Btn>
          </div>
        );
      })}
      <button style={{
        background: 'transparent', border: '1.5px dashed var(--pa-line)',
        borderRadius: 14, padding: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
        fontFamily: 'var(--pa-body)', fontSize: 13, color: 'var(--pa-muted)', fontWeight: 500,
      }}>+ propor atividade</button>
    </div>
  );
}

function PlanCompras() {
  const items = D.phase8.shopping;
  const done = items.filter((x) => x.done).length;
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--pa-line)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--pa-line)' }}>
        <div>
          <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
            Lista de compras
          </div>
          <div style={{ fontSize: 12, color: 'var(--pa-muted)', marginTop: 2 }}>
            {done} / {items.length} feitos
          </div>
        </div>
        <Btn variant="soft" size="sm" icon={<span style={{ fontSize: 14 }}>+</span>}>Adicionar</Btn>
      </div>
      {items.map((it, i) => {
        const m = memberById(it.who);
        return (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 20px',
            borderTop: i === 0 ? 'none' : '1px solid var(--pa-line)',
            opacity: it.done ? 0.55 : 1,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: it.done ? '#3d5e44' : 'transparent',
              border: it.done ? 'none' : '1.5px solid var(--pa-line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {it.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{
              flex: 1, fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-ink)',
              textDecoration: it.done ? 'line-through' : 'none',
            }}>{it.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar member={m} size={20} />
              <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{m.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top-level desktop shell — provides PhaseCtx + persists current phase
// ─────────────────────────────────────────────────────────────
const PHASE_STORAGE_KEY = 'pa-current-phase';

function DesktopShell({ viewAs = 'admin', phase: initialPhase, liveUser, onLogout }) {
  const me = liveUser || (viewAs === 'admin' ? memberById(D.adminId) : memberById('rita'));

  // For canvas mode, phase is fixed by the artboard. For live mode, the
  // phase comes from session storage so admin nav decisions persist.
  const [livePhase, setLivePhase] = dUseState2(() => {
    if (initialPhase !== undefined) return initialPhase;
    try {
      const saved = parseInt(safeStore.get(PHASE_STORAGE_KEY) || '', 10);
      if (saved >= 1 && saved <= D.phases.length) return saved;
    } catch {}
    return D.edition.currentPhase;
  });

  const phase = initialPhase !== undefined ? initialPhase : livePhase;

  const setPhase = (n) => {
    if (initialPhase !== undefined) return; // canvas mode is frozen
    const clamped = Math.max(1, Math.min(D.phases.length, n));
    setLivePhase(clamped);
    safeStore.set(PHASE_STORAGE_KEY, String(clamped));
  };
  const reset = () => setPhase(1);

  const ctx = { phase, setPhase, reset, canEdit: me.isAdmin };

  const phases = { 1: DPhase1, 2: DPhase2, 3: DPhase3, 4: DPhase4, 5: DPhase5, 6: DPhase6, 7: DPhase7, 8: DPhase8 };
  const PhaseView = phases[phase] || DPhase3;

  return (
    <PhaseCtx.Provider value={ctx}>
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'var(--pa-bg)', overflow: 'hidden',
        fontFamily: 'var(--pa-body)', color: 'var(--pa-ink)',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <DTopBar me={me} edition={D.edition} onLogout={onLogout} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <DLeftRail phase={phase} me={me} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fcf9f3' }}>
            <PhaseView me={me} />
          </div>
          <DRightRail phase={phase} me={me} />
        </div>
      </div>
    </PhaseCtx.Provider>
  );
}

Object.assign(window, {
  DPhase4, DPhase5, DPhase6, DPhase7, DPhase8,
  AccommodationCard, AccommodationForm, DLocationWinnerStrip,
  PlanEstadia, PlanCustos, PlanItinerario, PlanAtividades, PlanCompras,
  DesktopShell, PHASE_STORAGE_KEY,
});
