// Perdidos Algures — Tie-break methods (v2: 7 methods).
// Admin picks the method; some involve only admin, others re-engage the group.

const { useState: tbUseState, useEffect: tbUseEffect, useRef: tbUseRef } = React;

const TIE_METHODS = [
  { id: 'admin',  icon: '👑', title: 'Admin decide',           who: 'Admin',  blurb: 'Miguel pica uma das opções. Rápido, sem rodeios.', adminOnly: true },
  { id: 'borda',  icon: '🏆', title: 'Ranking por ordem',       who: 'Grupo',  blurb: 'Cada um ordena as empatadas do favorito ao menos favorito. Pontos somados — é o método mais justo para grupos.' },
  { id: 'score',  icon: '⭐', title: 'Votação por pontos',      who: 'Grupo',  blurb: 'Cada um dá 1–5 estrelas a cada opção. A média mais alta ganha. Permite "gosto dos dois mas prefiro este".' },
  { id: 'elim',   icon: '🔥', title: 'Eliminação progressiva',  who: 'Grupo',  blurb: 'Rondas: o menos votado sai, toda a gente vota de novo entre as restantes. Garante sempre um vencedor.' },
  { id: 'runoff', icon: '🔁', title: 'Segunda volta',           who: 'Grupo',  blurb: 'Re-votação secreta entre as empatadas. Simples e rápido.' },
  { id: 'public', icon: '💬', title: 'Voto público',            who: 'Grupo',  blurb: 'Cada um declara a sua escolha com um comentário. Quem argumenta, convence.' },
  { id: 'random', icon: '🎲', title: 'Lançar à sorte',          who: 'O acaso',blurb: 'Moeda ao ar. Ninguém leva a mal.', adminOnly: true },
];

// ─────────────────────────────────────────────────────────────
// Method picker grid
// ─────────────────────────────────────────────────────────────
function TieMethodPicker({ tied, me, onPick }) {
  return (
    <div style={{
      background: 'rgba(217,119,87,0.08)', borderRadius: 18, padding: 24, marginBottom: 20,
      border: '1.5px dashed var(--pa-accent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#8a4220" strokeWidth="1.4" fill="none"/><path d="M8 4v4l2 2" stroke="#8a4220" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        <span style={{ fontFamily: 'var(--pa-body)', fontSize: 13.5, color: '#8a4220', fontWeight: 600 }}>
          Empate a {Math.max(...tied.map((_, i) => i + 1))} opções
        </span>
      </div>
      <div style={{ fontFamily: 'var(--pa-display)', fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginBottom: 4 }}>
        {me.isAdmin ? 'Escolhe o método de desempate.' : 'A malta está empatada.'}
      </div>
      <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, color: 'var(--pa-muted)', marginBottom: 20, maxWidth: 520 }}>
        {me.isAdmin
          ? 'Cada método decide de forma diferente. Os métodos marcados "Grupo" envolvem toda a malta.'
          : 'Miguel está a escolher como desempatar. Alguns métodos requerem que voltes a votar.'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {TIE_METHODS.map((m) => (
          <button key={m.id} onClick={() => me.isAdmin && onPick(m.id)} disabled={!me.isAdmin} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            padding: 14, borderRadius: 12, textAlign: 'left',
            background: '#fff', border: '1px solid var(--pa-line)',
            cursor: me.isAdmin ? 'pointer' : 'default',
            opacity: me.isAdmin ? 1 : 0.65,
            transition: 'box-shadow .12s, transform .12s',
          }}
            onMouseEnter={(e) => me.isAdmin && (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {m.title}
              </div>
              <Pill tone={m.adminOnly ? 'default' : 'success'} size="sm">
                {m.who}
              </Pill>
            </div>
            <div style={{ fontFamily: 'var(--pa-body)', fontSize: 11.5, color: 'var(--pa-muted)', lineHeight: 1.4 }}>
              {m.blurb}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared frame wrapper
// ─────────────────────────────────────────────────────────────
function TieMethodFrame({ method, me, children, onBack, meta }) {
  const m = TIE_METHODS.find((x) => x.id === method);
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 24, marginBottom: 20,
      border: '2px solid var(--pa-accent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 44, flexShrink: 0,
            background: 'var(--pa-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
          }}>{m.icon}</div>
          <div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase' }}>
              Método de desempate
            </div>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 20, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.1 }}>
              {m.title}
              {meta && <span style={{ marginLeft: 10, fontFamily: 'var(--pa-body)', fontSize: 12, fontWeight: 400, color: 'var(--pa-muted)' }}>
                · {meta}
              </span>}
            </div>
            <div style={{ marginTop: 2, fontFamily: 'var(--pa-body)', fontSize: 12.5, color: 'var(--pa-muted)' }}>
              {m.blurb}
            </div>
          </div>
        </div>
        {me.isAdmin && onBack && (
          <Btn variant="ghost" size="sm" onClick={onBack}>← Mudar método</Btn>
        )}
      </div>
      {children}
    </div>
  );
}

// Participation tracker row
function ParticipantRow({ allMembers, submitted, pending }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: 'var(--pa-bg)', borderRadius: 10,
      border: '1px solid var(--pa-line)', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Stack members={submitted} max={6} size={24} ringColor="#fff" />
        <div>
          <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>
            {submitted.length} de {allMembers.length} prontos
          </div>
          {pending.length > 0 && (
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10.5, color: 'var(--pa-muted)' }}>
              A aguardar: {pending.map((m) => m.name).join(', ')}
            </div>
          )}
        </div>
      </div>
      {pending.length === 0 && (
        <Pill tone="success" size="sm">todos prontos</Pill>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Admin decide
// ─────────────────────────────────────────────────────────────
function TieMethodAdmin({ tied, me, onResolve, onBack }) {
  return (
    <TieMethodFrame method="admin" me={me} onBack={onBack}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tied.length, 3)}, 1fr)`, gap: 12 }}>
        {tied.map((t) => {
          const by = memberById(t.by);
          return (
            <div key={t.id} style={{
              background: 'var(--pa-bg)', borderRadius: 14, padding: 18, border: '1px solid var(--pa-line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Pill tone="dark" size="sm">{t.type}</Pill>
                <span style={{ fontSize: 12, color: 'var(--pa-muted)' }}>{t.area} · {t.price}€/n</span>
              </div>
              <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, lineHeight: 1.45, color: 'var(--pa-ink)', marginBottom: 14, minHeight: 60 }}>
                {t.note}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Avatar member={by} size={18} />
                <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{by.name} sugeriu</span>
              </div>
              {me.isAdmin ? (
                <Btn variant="accent" size="sm" style={{ width: '100%' }} onClick={() => onResolve(t.id, 'admin')}>
                  Escolher: {t.type} de {t.area}
                </Btn>
              ) : (
                <div style={{ padding: 10, background: '#fff', borderRadius: 8, fontSize: 12, color: 'var(--pa-muted)', textAlign: 'center' }}>
                  À espera do Miguel
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Borda Count — rank all tied options 1st→last
// ─────────────────────────────────────────────────────────────
function TieMethodBorda({ tied, me, onResolve, onBack }) {
  const allMembers = D.members.filter((m) => D.phase1.state[m.id] === 'in');
  const n = tied.length;

  // Seed: everyone has submitted except me
  const seedRankings = {};
  allMembers.forEach((m, i) => {
    if (m.id !== me.id) {
      // Each member has a different shuffle
      const order = tied.map((_, j) => j).sort(() => (Math.sin(i * 7 + j * 13) > 0 ? 1 : -1));
      seedRankings[m.id] = order.map((idx) => tied[idx].id);
    }
  });

  const [submitted, setSubmitted] = tbUseState(seedRankings);
  const [myRanking, setMyRanking] = tbUseState(tied.map((t) => t.id)); // drag order
  const [done, setDone] = tbUseState(false);
  const [dragging, setDragging] = tbUseState(null);
  const [dragOver, setDragOver] = tbUseState(null);

  const allSubmitted = { ...submitted };
  if (done) allSubmitted[me.id] = myRanking;

  const submittedMembers = allMembers.filter((m) => allSubmitted[m.id]);
  const pendingMembers = allMembers.filter((m) => !allSubmitted[m.id]);

  // Borda tally: n pts for 1st, n-1 for 2nd, …
  const tally = tied.map((t) => {
    const pts = submittedMembers.reduce((sum, m) => {
      const rank = (allSubmitted[m.id] || []).indexOf(t.id);
      return sum + (rank >= 0 ? (n - rank) : 0);
    }, 0);
    return { opt: t, pts };
  }).sort((a, b) => b.pts - a.pts);

  const maxPts = tally[0]?.pts || 0;
  const winner = tally[0]?.opt;

  // Drag-to-reorder
  const onDragStart = (e, idx) => { setDragging(idx); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const next = myRanking.slice();
    const [item] = next.splice(dragging, 1);
    next.splice(idx, 0, item);
    setMyRanking(next);
    setDragging(null); setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  return (
    <TieMethodFrame method="borda" me={me} onBack={onBack}
      meta={`${submittedMembers.length} de ${allMembers.length} ordenaram`}>

      <ParticipantRow allMembers={allMembers} submitted={submittedMembers} pending={pendingMembers} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* My ranking drag-list */}
        {!done ? (
          <div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              A tua ordem — arrasta para reordenar
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {myRanking.map((id, i) => {
                const opt = tied.find((t) => t.id === id);
                if (!opt) return null;
                return (
                  <div key={id}
                    draggable
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={(e) => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, cursor: 'grab',
                      background: dragOver === i ? 'rgba(217,119,87,0.10)' : '#fff',
                      border: dragOver === i ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
                      transition: 'background .12s, border .12s',
                      opacity: dragging === i ? 0.4 : 1,
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 28, flexShrink: 0,
                      background: i === 0 ? 'var(--pa-accent)' : i === 1 ? 'rgba(31,26,20,0.12)' : 'rgba(31,26,20,0.06)',
                      color: i === 0 ? '#fff' : 'var(--pa-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--pa-mono)', fontSize: 13, fontWeight: 700,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13.5, fontWeight: 600 }}>
                        {opt.type} · {opt.area}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>
                        {n - i} {n - i === 1 ? 'ponto' : 'pontos'}
                      </div>
                    </div>
                    <svg width="10" height="16" viewBox="0 0 10 16" fill="var(--pa-muted)">
                      <circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/>
                      <circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/>
                      <circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/>
                    </svg>
                  </div>
                );
              })}
            </div>
            <Btn variant="accent" size="sm" style={{ width: '100%' }} onClick={() => setDone(true)}>
              Submeter ranking
            </Btn>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              O teu ranking
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {myRanking.map((id, i) => {
                const opt = tied.find((t) => t.id === id);
                return (
                  <div key={id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 10, background: '#fff', border: '1px solid var(--pa-line)',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 24,
                      background: i === 0 ? 'var(--pa-accent)' : 'rgba(31,26,20,0.07)',
                      color: i === 0 ? '#fff' : 'var(--pa-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--pa-mono)', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 500 }}>
                      {opt?.type} · {opt?.area}
                    </span>
                    <Pill size="sm">{n - i}pts</Pill>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setDone(false)} style={{
              marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--pa-body)', fontSize: 12, color: 'var(--pa-muted)', padding: '4px 0',
            }}>corrigir ranking</button>
          </div>
        )}

        {/* Live tally */}
        <div>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            Pontuação Borda
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tally.map(({ opt, pts }, i) => {
              const isWinner = i === 0;
              const maxPossible = n * submittedMembers.length;
              const pct = maxPossible > 0 ? (pts / maxPossible) * 100 : 0;
              return (
                <div key={opt.id} style={{
                  padding: 12, borderRadius: 10,
                  background: isWinner && submittedMembers.length > 0 ? 'rgba(217,119,87,0.08)' : '#fff',
                  border: isWinner && submittedMembers.length > 0 ? '1.5px solid var(--pa-accent)' : '1px solid var(--pa-line)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isWinner && submittedMembers.length > 0 && <span style={{ fontSize: 13 }}>🏆</span>}
                      <span style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>
                        {opt.type} · {opt.area}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 14, fontWeight: 700, color: isWinner ? 'var(--pa-accent)' : 'var(--pa-ink)' }}>
                      {pts} pts
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: 'rgba(31,26,20,0.06)' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 6,
                      background: isWinner ? 'var(--pa-accent)' : 'var(--pa-ink)',
                      transition: 'width .4s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {me.isAdmin && pendingMembers.length === 0 && (
            <Btn variant="accent" size="sm" style={{ width: '100%', marginTop: 14 }}
              onClick={() => onResolve(winner.id, 'borda')}>
              Fechar — vence {winner.type} de {winner.area}
            </Btn>
          )}
          {me.isAdmin && pendingMembers.length > 0 && (
            <Btn variant="ghost" size="sm" style={{ width: '100%', marginTop: 14 }}
              onClick={() => onResolve(winner.id, 'borda')}>
              Fechar antecipado ({submittedMembers.length}/{allMembers.length})
            </Btn>
          )}
        </div>
      </div>
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Score voting (1–5 stars per option)
// ─────────────────────────────────────────────────────────────
function TieMethodScore({ tied, me, onResolve, onBack }) {
  const allMembers = D.members.filter((m) => D.phase1.state[m.id] === 'in');

  // Seed some existing scores
  const seedScores = {};
  allMembers.forEach((m, mi) => {
    if (m.id !== me.id) {
      seedScores[m.id] = tied.map((_, ti) => Math.max(1, Math.min(5, 3 + Math.round(Math.sin(mi * 5 + ti * 7) * 1.5))));
    }
  });

  const [allScores, setAllScores] = tbUseState(seedScores);
  const [myScores, setMyScores] = tbUseState(tied.map(() => null));
  const [submitted, setSubmitted] = tbUseState(false);

  const combinedScores = submitted ? { ...allScores, [me.id]: myScores } : allScores;
  const submittedMembers = allMembers.filter((m) => combinedScores[m.id]);
  const pendingMembers = allMembers.filter((m) => !combinedScores[m.id]);

  const averages = tied.map((t, ti) => {
    const vals = submittedMembers.map((m) => combinedScores[m.id][ti]).filter((v) => v !== null);
    return { opt: t, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, count: vals.length };
  }).sort((a, b) => b.avg - a.avg);
  const winner = averages[0]?.opt;

  const setMyStar = (ti, star) => {
    setMyScores((prev) => { const n = [...prev]; n[ti] = star; return n; });
  };

  const canSubmit = myScores.every((s) => s !== null);

  return (
    <TieMethodFrame method="score" me={me} onBack={onBack}
      meta={`${submittedMembers.length} de ${allMembers.length} avaliaram`}>

      <ParticipantRow allMembers={allMembers} submitted={submittedMembers} pending={pendingMembers} />

      {/* Star rating ballot */}
      {!submitted && (
        <div style={{ background: 'var(--pa-bg)', borderRadius: 12, padding: 18, marginBottom: 16, border: '1.5px solid var(--pa-accent)' }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            A tua avaliação (1–5 ★ por opção)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {tied.map((t, ti) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#fff', borderRadius: 10, gap: 16,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>
                    {t.type} · {t.area}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{t.price}€/noite</div>
                </div>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setMyStar(ti, star)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px',
                      fontSize: 22, lineHeight: 1,
                      filter: (myScores[ti] !== null && star <= myScores[ti]) ? 'none' : 'grayscale(1) opacity(0.3)',
                      transform: 'scale(1)',
                      transition: 'filter .1s, transform .1s',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="accent" size="sm" style={{ width: '100%' }} disabled={!canSubmit} onClick={() => setSubmitted(true)}>
            Submeter avaliação
          </Btn>
        </div>
      )}

      {/* Live averages */}
      <div>
        <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Médias · {submittedMembers.length} avaliações
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {averages.map(({ opt, avg, count }, i) => {
            const isFirst = i === 0 && count > 0;
            const filled = Math.round(avg);
            return (
              <div key={opt.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12,
                background: isFirst ? 'rgba(217,119,87,0.08)' : '#fff',
                border: isFirst ? '1.5px solid var(--pa-accent)' : '1px solid var(--pa-line)',
              }}>
                {isFirst && <span style={{ fontSize: 16 }}>🏆</span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13.5, fontWeight: 600 }}>
                    {opt.type} · {opt.area}
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ fontSize: 14, filter: s <= filled ? 'none' : 'grayscale(1) opacity(0.25)' }}>⭐</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--pa-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: isFirst ? 'var(--pa-accent)' : 'var(--pa-ink)' }}>
                    {avg > 0 ? avg.toFixed(1) : '—'}
                  </div>
                  <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, color: 'var(--pa-muted)' }}>
                    /{count} pessoas
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {me.isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {pendingMembers.length > 0 && (
              <Btn variant="ghost" size="sm" onClick={() => onResolve(winner.id, 'score')}>
                Fechar agora ({submittedMembers.length}/{allMembers.length})
              </Btn>
            )}
            {pendingMembers.length === 0 && (
              <Btn variant="accent" size="sm" style={{ flex: 1 }} onClick={() => onResolve(winner.id, 'score')}>
                Fechar — vence {winner.type} de {winner.area}
              </Btn>
            )}
          </div>
        )}
      </div>
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Progressive elimination — rounds until winner
// ─────────────────────────────────────────────────────────────
function TieMethodElim({ tied, me, onResolve, onBack }) {
  const allMembers = D.members.filter((m) => D.phase1.state[m.id] === 'in');

  // Each round: remaining options, mock votes from others, my vote
  const [round, setRound] = tbUseState(0);
  const [remaining, setRemaining] = tbUseState(tied.map((t) => t.id));
  const [history, setHistory] = tbUseState([]); // [{eliminated, round, votes}]
  const [roundVotes, setRoundVotes] = tbUseState({}); // memberId → optId
  const [myVote, setMyVote] = tbUseState(null);
  const [roundClosed, setRoundClosed] = tbUseState(false);

  const remainingOpts = remaining.map((id) => tied.find((t) => t.id === id)).filter(Boolean);
  const submittedMembers = allMembers.filter((m) => roundVotes[m.id] || (m.id === me.id && roundClosed));
  const pendingMembers = allMembers.filter((m) => !roundVotes[m.id] && !(m.id === me.id && roundClosed));

  // Seed mock votes for current round
  const seedRoundVotes = () => {
    const v = {};
    allMembers.forEach((m, i) => {
      if (m.id !== me.id) {
        const opts = remainingOpts;
        v[m.id] = opts[i % opts.length]?.id;
      }
    });
    return v;
  };

  const submitMyVote = () => {
    if (!myVote) return;
    const allVotes = { ...seedRoundVotes(), [me.id]: myVote };
    setRoundVotes(allVotes);
    setRoundClosed(true);
  };

  const closeRound = () => {
    const allVotes = { ...seedRoundVotes(), [me.id]: myVote };
    // Tally
    const tally = {};
    remaining.forEach((id) => { tally[id] = 0; });
    Object.values(allVotes).forEach((id) => { if (tally[id] !== undefined) tally[id]++; });
    const sorted = Object.entries(tally).sort((a, b) => a[1] - b[1]);
    const minVotes = sorted[0][1];
    const eliminated = sorted.filter(([, v]) => v === minVotes).map(([id]) => id);

    const newRemaining = remaining.filter((id) => !eliminated.includes(id));
    setHistory((h) => [...h, { round: round + 1, eliminated, tally }]);

    if (newRemaining.length === 1) {
      onResolve(newRemaining[0], 'elim');
      return;
    }
    // Next round
    setRemaining(newRemaining);
    setRound((r) => r + 1);
    setRoundVotes({});
    setMyVote(null);
    setRoundClosed(false);
  };

  return (
    <TieMethodFrame method="elim" me={me} onBack={onBack}
      meta={`Ronda ${round + 1} · ${remaining.length} opções restantes`}>

      {/* History */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {history.map((h) => (
            h.eliminated.map((id) => {
              const opt = tied.find((t) => t.id === id);
              return (
                <div key={id} style={{
                  padding: '6px 10px', borderRadius: 999, background: 'rgba(31,26,20,0.06)',
                  fontFamily: 'var(--pa-body)', fontSize: 11.5, color: 'var(--pa-muted)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ textDecoration: 'line-through' }}>{opt?.type} · {opt?.area}</span>
                  <span style={{ color: '#c44', fontWeight: 600 }}>✕ ronda {h.round}</span>
                </div>
              );
            })
          ))}
        </div>
      )}

      {/* Current round ballot */}
      {!roundClosed && (
        <div style={{ background: 'var(--pa-bg)', borderRadius: 12, padding: 16, marginBottom: 14, border: '1.5px solid var(--pa-accent)' }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            Ronda {round + 1} · votas em qual?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(remainingOpts.length, 3)}, 1fr)`, gap: 8, marginBottom: 12 }}>
            {remainingOpts.map((t) => {
              const sel = myVote === t.id;
              return (
                <button key={t.id} onClick={() => setMyVote(t.id)} style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: sel ? 'var(--pa-ink)' : '#fff',
                  color: sel ? '#fff' : 'var(--pa-ink)',
                  border: sel ? 'none' : '1px solid var(--pa-line)',
                }}>
                  <div style={{ fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 600 }}>{t.type}</div>
                  <div style={{ fontSize: 11.5, opacity: .7 }}>{t.area}</div>
                </button>
              );
            })}
          </div>
          <Btn variant="accent" size="sm" style={{ width: '100%' }} disabled={!myVote} onClick={submitMyVote}>
            Votar nesta ronda
          </Btn>
        </div>
      )}

      {/* Current round tally + close */}
      {roundClosed && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, border: '1px solid var(--pa-line)' }}>
          <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--pa-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            Resultado ronda {round + 1}
          </div>
          {(() => {
            const allVotes = { ...seedRoundVotes(), [me.id]: myVote };
            const tally = {};
            remaining.forEach((id) => { tally[id] = 0; });
            Object.values(allVotes).forEach((id) => { if (tally[id] !== undefined) tally[id]++; });
            const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
            const minVotes = sorted[sorted.length - 1][1];
            return sorted.map(([id, votes]) => {
              const opt = tied.find((t) => t.id === id);
              const isElim = votes === minVotes;
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                  opacity: isElim ? 0.5 : 1,
                }}>
                  <div style={{ flex: 1, fontFamily: 'var(--pa-body)', fontSize: 13, fontWeight: 500 }}>
                    {isElim ? <s>{opt?.type} · {opt?.area}</s> : `${opt?.type} · ${opt?.area}`}
                  </div>
                  <Pill tone={isElim ? 'warn' : 'success'} size="sm">
                    {votes} {isElim ? '— eliminado' : ''}
                  </Pill>
                </div>
              );
            });
          })()}
          {me.isAdmin && (
            <Btn variant="accent" size="sm" style={{ width: '100%', marginTop: 12 }} onClick={closeRound}>
              Eliminar e avançar →
            </Btn>
          )}
        </div>
      )}

      <ParticipantRow allMembers={allMembers} submitted={submittedMembers} pending={pendingMembers} />
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Runoff (existing, cleaned up)
// ─────────────────────────────────────────────────────────────
function TieMethodRunoff({ tied, me, onResolve, onBack }) {
  const allMembers = D.members.filter((m) => D.phase1.state[m.id] === 'in');
  const [runoffVotes, setRunoffVotes] = tbUseState({
    rita: tied[0].id, tiago: tied[0].id, ines: tied[0].id,
    matilde: tied[1].id, joao: tied[1].id,
  });
  const [myRunoff, setMyRunoff] = tbUseState(null);

  const allVotes = { ...runoffVotes, ...(myRunoff ? { [me.id]: myRunoff } : {}) };
  const tally = tied.map((t) => ({
    opt: t,
    count: Object.values(allVotes).filter((v) => v === t.id).length,
    voters: allMembers.filter((m) => allVotes[m.id] === t.id),
  }));
  const submittedMembers = allMembers.filter((m) => allVotes[m.id]);
  const pendingMembers = allMembers.filter((m) => !allVotes[m.id]);
  const winner = [...tally].sort((a, b) => b.count - a.count)[0]?.opt;

  return (
    <TieMethodFrame method="runoff" me={me} onBack={onBack}
      meta={`${submittedMembers.length} de ${allMembers.length} votaram`}>
      <ParticipantRow allMembers={allMembers} submitted={submittedMembers} pending={pendingMembers} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tied.length}, 1fr)`, gap: 12, marginBottom: 14 }}>
        {tally.map(({ opt, count, voters }) => {
          const sel = myRunoff === opt.id;
          return (
            <button key={opt.id} onClick={() => setMyRunoff(opt.id)} style={{
              background: '#fff', borderRadius: 12, padding: 16, textAlign: 'left',
              border: sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)', cursor: 'pointer',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: 'var(--pa-display)', fontSize: 24, fontWeight: 700, color: 'var(--pa-accent)' }}>{count}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Pill tone="dark" size="sm">{opt.type}</Pill>
                <span style={{ fontSize: 11.5, color: 'var(--pa-muted)' }}>{opt.area}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--pa-ink)', lineHeight: 1.4, marginBottom: 10 }}>{opt.note}</div>
              <Stack members={voters} max={5} size={20} ringColor="#fff" />
            </button>
          );
        })}
      </div>
      {me.isAdmin && (
        <Btn variant="accent" size="sm" onClick={() => onResolve(winner.id, 'runoff')}>
          Fechar segunda volta
        </Btn>
      )}
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Public vote with comments (existing, cleaned up)
// ─────────────────────────────────────────────────────────────
function TieMethodPublic({ tied, me, onResolve, onBack }) {
  const allMembers = D.members.filter((m) => D.phase1.state[m.id] === 'in');
  const [publicVotes, setPublicVotes] = tbUseState({
    miguel:  { choice: tied[0].id, comment: 'Casa com cama a sério. Noites de junho ainda são frescas para tendas.' },
    rita:    { choice: tied[0].id, comment: 'Bouzas tem o melhor jantar pós-praia.' },
    matilde: { choice: tied[1].id, comment: 'Cíes só uma vez na vida. A noite na ilha é outra coisa.' },
    tiago:   { choice: tied[0].id, comment: 'Já lá fui — a casa é mesmo bonita.' },
    joao:    { choice: tied[1].id, comment: 'Glamping é uma vibe completamente diferente.' },
  });
  const [myPick, setMyPick] = tbUseState(null);
  const [myComment, setMyComment] = tbUseState('');
  const [submitted, setSubmitted] = tbUseState(false);

  const allVotes = { ...publicVotes, ...(submitted && myPick ? { [me.id]: { choice: myPick, comment: myComment } } : {}) };
  const tally = tied.map((t) => ({
    opt: t,
    voters: allMembers.filter((m) => allVotes[m.id]?.choice === t.id),
  }));
  const submittedMembers = allMembers.filter((m) => allVotes[m.id]);
  const pendingMembers = allMembers.filter((m) => !allVotes[m.id]);
  const winner = [...tally].sort((a, b) => b.voters.length - a.voters.length)[0]?.opt;

  return (
    <TieMethodFrame method="public" me={me} onBack={onBack}
      meta={`${submittedMembers.length} de ${allMembers.length} declararam`}>
      <ParticipantRow allMembers={allMembers} submitted={submittedMembers} pending={pendingMembers} />
      {!submitted && (
        <div style={{ background: 'var(--pa-bg)', borderRadius: 12, padding: 16, marginBottom: 14, border: '1.5px solid var(--pa-accent)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tied.length}, 1fr)`, gap: 8, marginBottom: 12 }}>
            {tied.map((t) => {
              const sel = myPick === t.id;
              return (
                <button key={t.id} onClick={() => setMyPick(t.id)} style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: sel ? 'var(--pa-ink)' : '#fff', color: sel ? '#fff' : 'var(--pa-ink)',
                  border: sel ? 'none' : '1px solid var(--pa-line)', textAlign: 'left',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.type}</div>
                  <div style={{ fontSize: 11, opacity: .7 }}>{t.area}</div>
                </button>
              );
            })}
          </div>
          <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)}
            placeholder="Em duas linhas, porquê este?" rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#fff', border: '1px solid var(--pa-line)', fontFamily: 'var(--pa-body)', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <Btn variant="accent" size="sm" disabled={!myPick} onClick={() => setSubmitted(true)}>Declarar</Btn>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tied.length}, 1fr)`, gap: 12, marginBottom: 14 }}>
        {tally.map(({ opt, voters }) => (
          <div key={opt.id} style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid var(--pa-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <Pill tone="dark" size="sm">{opt.type} · {opt.area}</Pill>
              <span style={{ fontFamily: 'var(--pa-display)', fontSize: 20, fontWeight: 700, color: 'var(--pa-accent)' }}>{voters.length}</span>
            </div>
            {voters.map((v) => (
              <div key={v.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderTop: '1px solid var(--pa-line)' }}>
                <Avatar member={v} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>{v.id === me.id ? 'tu' : v.name}</div>
                  {allVotes[v.id]?.comment && (
                    <div style={{ fontSize: 11, color: 'var(--pa-muted)', fontStyle: 'italic', lineHeight: 1.35 }}>
                      "{allVotes[v.id].comment}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {me.isAdmin && <Btn variant="accent" size="sm" disabled={submittedMembers.length === 0} onClick={() => onResolve(winner.id, 'public')}>Fechar voto público</Btn>}
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// METHOD: Random coin flip
// ─────────────────────────────────────────────────────────────
function TieMethodRandom({ tied, me, onResolve, onBack }) {
  const [state, setState] = tbUseState('idle');
  const [hover, setHover] = tbUseState(0);
  const [winner, setWinner] = tbUseState(null);
  const timerRef = tbUseRef(null);

  const roll = () => {
    if (state !== 'idle') return;
    setState('rolling');
    let speed = 80;
    let i = 0;
    const tick = () => {
      i = (i + 1) % tied.length;
      setHover(i);
      speed += 25;
      if (speed < 800) { timerRef.current = setTimeout(tick, speed); }
      else { const w = tied[Math.floor(Math.random() * tied.length)]; setWinner(w); setHover(tied.indexOf(w)); setState('done'); }
    };
    tick();
  };
  tbUseEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <TieMethodFrame method="random" me={me} onBack={state === 'idle' ? onBack : undefined}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🎲</div>
        <div style={{ fontFamily: 'var(--pa-body)', fontSize: 14, color: 'var(--pa-muted)', marginBottom: 18 }}>
          {state === 'idle' && (me.isAdmin ? 'Clica para lançar.' : 'Miguel vai lançar.')}
          {state === 'rolling' && '...'}
          {state === 'done' && `Saiu: ${winner?.type} de ${winner?.area}`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tied.length}, 1fr)`, gap: 10, marginBottom: 18 }}>
          {tied.map((t, i) => {
            const lit = (state === 'rolling' && hover === i) || (state === 'done' && winner?.id === t.id);
            return (
              <div key={t.id} style={{
                padding: 14, borderRadius: 12, transition: 'all .12s',
                background: lit ? 'var(--pa-accent)' : 'var(--pa-bg)',
                color: lit ? '#fff' : 'var(--pa-ink)',
                border: lit ? 'none' : '1px solid var(--pa-line)',
                transform: lit && state === 'done' ? 'scale(1.04)' : 'scale(1)',
                boxShadow: lit && state === 'done' ? '0 8px 24px rgba(217,119,87,0.4)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--pa-display)', fontSize: 16, fontWeight: 600 }}>{t.type}</div>
                <div style={{ fontSize: 12, opacity: .7 }}>{t.area}</div>
              </div>
            );
          })}
        </div>
        {me.isAdmin && state === 'idle' && <Btn variant="accent" size="lg" onClick={roll} style={{ width: '100%' }}>Lançar à sorte 🎲</Btn>}
        {me.isAdmin && state === 'done' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="md" style={{ flex: 1 }} onClick={onBack}>Trocar método</Btn>
            <Btn variant="accent" size="md" style={{ flex: 1 }} onClick={() => onResolve(winner.id, 'random')}>Confirmar {winner.type}</Btn>
          </div>
        )}
      </div>
    </TieMethodFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// TieBreakManager — top-level for phase 5
// ─────────────────────────────────────────────────────────────
function TieBreakManager({ tied, me, onResolve }) {
  const [method, setMethod] = tbUseState(null);
  if (!method) return <TieMethodPicker tied={tied} me={me} onPick={setMethod} />;
  const props = { tied, me, onBack: () => setMethod(null), onResolve };
  const map = { admin: TieMethodAdmin, borda: TieMethodBorda, score: TieMethodScore, elim: TieMethodElim, runoff: TieMethodRunoff, public: TieMethodPublic, random: TieMethodRandom };
  const Comp = map[method];
  return Comp ? <Comp {...props} /> : null;
}

Object.assign(window, {
  TIE_METHODS, TieBreakManager,
  TieMethodPicker, TieMethodAdmin, TieMethodBorda, TieMethodScore,
  TieMethodElim, TieMethodRunoff, TieMethodPublic, TieMethodRandom,
});
