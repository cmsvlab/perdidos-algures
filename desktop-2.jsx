// Perdidos Algures — Desktop fases 4–8 + DesktopShell.

const { useState: dUseState2, useMemo: dUseMemo2, useEffect: dUseEffect2 } = React;

// ─────────────────────────────────────────────────────────────
// PHASE 4 — Sugerir alojamentos (AppStore)
// ─────────────────────────────────────────────────────────────
function DLocationWinnerStrip() {
  const appData = useAppStore();
  const locSuggs = appData.locSuggs || [];
  const winnerId = appData.locWinner;
  const w = winnerId ? locSuggs.find((s) => s.id === winnerId) : locSuggs[0];
  if (!w) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:14, marginBottom:18,
      background:'#fff', border:'1px solid var(--pa-line)' }}>
      <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
        background:`repeating-linear-gradient(135deg,${w.accent||'var(--pa-accent)'}66 0 6px,${w.accent||'var(--pa-accent)'}33 6px 12px)` }} />
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase' }}>Local decidido</div>
        <div style={{ fontFamily:'var(--pa-display)', fontSize:18, fontWeight:600, letterSpacing:-0.3, marginTop:2 }}>
          {w.name} <span style={{ color:'var(--pa-muted)', fontWeight:400, fontSize:13 }}>· {w.city}</span>
        </div>
      </div>
    </div>
  );
}

function DPhase4({ me }) {
  const appData = useAppStore();
  const suggestions = appData.accSuggs || [];
  const mineCount = suggestions.filter((s) => s.by === me.id).length;
  const [adding, setAdding] = dUseState2(false);

  const handleAdd = (data) => {
    AppStore.addAccSuggestion({ id:'acc_' + Date.now().toString(36), ...data, by: me.id });
    setAdding(false);
  };

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={4} status="Em curso" statusTone="accent"
        title={<>Onde é que <span style={{ color:'var(--pa-accent)' }}>dormimos?</span></>}
        sub="Cada um pode lançar quantos alojamentos quiser. Aprende a vender — o teu favorito merece argumentos." />

      <DLocationWinnerStrip />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--pa-mono)', fontSize:11, letterSpacing:1, color:'var(--pa-muted)', textTransform:'uppercase' }}>
          {suggestions.length} alojamento{suggestions.length !== 1 ? 's' : ''} no chapéu
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Pill>Os teus: {mineCount}</Pill>
          {!adding && (
            <Btn variant="accent" size="sm" onClick={() => setAdding(true)} icon={<span style={{ fontSize:14 }}>+</span>}>
              Lançar alojamento
            </Btn>
          )}
        </div>
      </div>

      {adding && <AccommodationForm onCancel={() => setAdding(false)} onSubmit={handleAdd} />}

      {suggestions.length === 0 && !adding && (
        <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
          Ainda sem alojamentos. Sê o primeiro! 🏡
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {suggestions.map((s) => <AccommodationCard key={s.id} acc={s} me={me} />)}
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${suggestions.length} alojamentos. Quando estiverem prontos, abre votação.`}>
          <Btn variant="ghost" size="sm" onClick={() => { if (window.confirm('Limpar todos os alojamentos?')) { const d = AppStore.load(); d.accSuggs = []; AppStore._save(d); } }}>
            Limpar tudo
          </Btn>
        </DAdminBar>
      )}
    </div>
  );
}

function AccommodationCard({ acc, me }) {
  const by = memberById(acc.by) || { name: acc.by, color:'var(--pa-muted)', initials:'?' };
  const mine = acc.by === me.id;
  const host = (() => { try { return new URL(acc.link).host.replace('www.',''); } catch { return acc.link || ''; } })();

  return (
    <div style={{ background:'#fff', borderRadius:14, overflow:'hidden',
      border: mine?'1.5px solid var(--pa-accent)':'1px solid var(--pa-line)', display:'flex' }}>
      <div style={{ width:8, flexShrink:0,
        background:`repeating-linear-gradient(180deg,var(--pa-accent) 0 8px,transparent 8px 16px)`,
        opacity: mine?1:0 }} />
      <div style={{ padding:'16px 20px', flex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <Pill tone="dark" size="sm">{acc.type}</Pill>
              <span style={{ fontFamily:'var(--pa-body)', fontSize:12.5, color:'var(--pa-muted)' }}>{acc.area}</span>
            </div>
            {acc.note && (
              <div style={{ fontFamily:'var(--pa-body)', fontSize:14, color:'var(--pa-ink)', lineHeight:1.45, marginBottom:8 }}>
                {acc.note}
              </div>
            )}
            {host && (
              <a href={acc.link} target="_blank" rel="noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:6,
                fontFamily:'var(--pa-mono)', fontSize:11.5, color:'var(--pa-accent)', fontWeight:600, textDecoration:'none' }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M3 8l5-5M5 2.5h2.5V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {host}
              </a>
            )}
          </div>
          <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            <div>
              <div style={{ fontFamily:'var(--pa-display)', fontSize:22, fontWeight:600, letterSpacing:-0.4 }}>{acc.price}€</div>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:9.5, color:'var(--pa-muted)', letterSpacing:0.5 }}>/NOITE</div>
            </div>
            {(me.isAdmin || mine) && (
              <button onClick={() => AppStore.removeAccSuggestion(acc.id)}
                style={{ border:'1px solid var(--pa-line)', background:'transparent', borderRadius:8,
                  padding:'4px 10px', cursor:'pointer', fontSize:11.5, color:'var(--pa-muted)', fontFamily:'var(--pa-body)' }}>
                Remover
              </button>
            )}
          </div>
        </div>
        <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid var(--pa-line)', display:'flex', alignItems:'center', gap:8 }}>
          <Avatar member={by} size={20} />
          <span style={{ fontFamily:'var(--pa-body)', fontSize:12, color:'var(--pa-muted)' }}>
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
    <div style={{ background:'#fff', borderRadius:16, padding:22, marginBottom:14, border:'2px solid var(--pa-accent)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontFamily:'var(--pa-display)', fontSize:18, fontWeight:600, letterSpacing:-0.3 }}>Lançar alojamento</div>
        <button onClick={onCancel} style={{ border:'none', background:'transparent', cursor:'pointer', color:'var(--pa-muted)', fontSize:18, padding:4 }}>×</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 140px', gap:10, marginBottom:10 }}>
        <div>
          <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:6 }}>Tipo</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {D.phase4.types.map((t) => (
              <button key={t} onClick={() => setType(t)} style={{
                padding:'7px 12px', borderRadius:999, cursor:'pointer',
                background: type===t?'var(--pa-ink)':'#fff', color: type===t?'#fff':'var(--pa-ink)',
                border: type===t?'none':'1px solid var(--pa-line)', fontFamily:'var(--pa-body)', fontSize:12, fontWeight:500 }}>{t}</button>
            ))}
          </div>
        </div>
        <Field label="€ por noite" placeholder="65" prefix="€" value={price} onChange={setPrice} />
      </div>
      <div style={{ marginBottom:10 }}><Field label="Zona / bairro" placeholder="Centro histórico, praia..." value={area} onChange={setArea} /></div>
      <div style={{ marginBottom:10 }}><Field label="Link" placeholder="https://airbnb.com/..." value={link} onChange={setLink} prefix="🔗" /></div>
      <div style={{ marginBottom:14 }}><Field label="Comentário" textarea placeholder="O que tem de especial? Já lá foste?" value={note} onChange={setNote} /></div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="accent" size="sm" onClick={() => onSubmit({ type, price: parseInt(price)||0, area, link, note })} disabled={!ok}>Lançar</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 5 — Votar alojamento (VoteStore + AppStore suggestions)
// ─────────────────────────────────────────────────────────────
function DPhase5({ me }) {
  const appData = useAppStore();
  const suggestions = appData.accSuggs || [];
  const [vote, setVote] = dUseState2(() => VoteStore.getVote(me.id, 'acc'));
  const [saved, setSaved] = dUseState2(false);
  const [resolved, setResolved] = dUseState2(null);

  const handleVote = (id) => {
    if (closed) return;
    setVote(id);
    VoteStore.setVote(me.id, 'acc', id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (suggestions.length === 0) {
    return (
      <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
        <DPhaseHeader phase={5} status="Sem alojamentos" statusTone="muted"
          title={<>Ainda não há<br/><span style={{ color:'var(--pa-accent)' }}>alojamentos para votar.</span></>}
          sub="Volta à fase 4 e adiciona alojamentos primeiro." />
        {me.isAdmin && <DAdminBar hint="Sem alojamentos ainda." />}
      </div>
    );
  }

  const closed = false; // Admin fecha manualmente — por enquanto sempre aberto
  const winner = resolved ? suggestions.find((s) => s.id === resolved.id) : null;

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={5}
        status={winner ? 'Decidido' : 'A decorrer'}
        statusTone={winner ? 'success' : 'accent'}
        title={winner
          ? <>{winner.type} em <span style={{ color:'var(--pa-accent)' }}>{winner.area}.</span></>
          : <>Onde é que <span style={{ color:'var(--pa-accent)' }}>dormimos mesmo?</span></>}
        sub={winner ? `${winner.price}€/noite · sugerido por ${memberById(winner.by)?.name || winner.by}`
          : 'Voto secreto. Cada um vota num alojamento.'} />

      {winner && (
        <div style={{ background:'var(--pa-ink)', color:'#fff', borderRadius:16, padding:20, marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:56, height:56, borderRadius:12, flexShrink:0,
            background:'repeating-linear-gradient(135deg,var(--pa-accent) 0 8px,rgba(217,119,87,0.4) 8px 16px)' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'rgba(255,255,255,0.6)', textTransform:'uppercase' }}>Vencedor</div>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:22, fontWeight:600, letterSpacing:-0.4, marginTop:2 }}>
              {winner.type} · {winner.area}
            </div>
            <div style={{ fontFamily:'var(--pa-body)', fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4 }}>
              {winner.price}€/noite
            </div>
          </div>
          {winner.link && (
            <a href={winner.link} target="_blank" rel="noreferrer" style={{
              padding:'10px 16px', borderRadius:999, background:'rgba(255,255,255,0.12)',
              color:'#fff', textDecoration:'none', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600 }}>Ver anúncio →</a>
          )}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
        {suggestions.map((s) => {
          const sel = vote === s.id;
          const isWinner = winner && winner.id === s.id;
          return (
            <button key={s.id} onClick={() => handleVote(s.id)} style={{
              background:'#fff', borderRadius:14, padding:16, textAlign:'left',
              border: isWinner||sel ? '2px solid var(--pa-accent)' : '1px solid var(--pa-line)',
              cursor: closed?'default':'pointer', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <Pill tone="dark" size="sm">{s.type}</Pill>
                <span style={{ fontSize:11, color:'var(--pa-muted)' }}>{s.area}</span>
              </div>
              {s.note && (
                <div style={{ fontFamily:'var(--pa-body)', fontSize:12.5, color:'var(--pa-ink)', lineHeight:1.4, minHeight:36 }}>
                  {s.note.length > 90 ? s.note.slice(0,90)+'…' : s.note}
                </div>
              )}
              <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontFamily:'var(--pa-mono)', fontSize:12, fontWeight:600 }}>{s.price}€/n</span>
                {sel && <Pill tone={saved?'success':'accent'} size="sm">{saved?'✓ Guardado':'✓ Voto teu'}</Pill>}
              </div>
            </button>
          );
        })}
      </div>

      {me.isAdmin && !winner && (
        <DAdminBar hint="Votação em curso. Declara o vencedor quando estiver pronto.">
          {suggestions.map((s) => (
            <Btn key={s.id} variant="soft" size="sm"
              onClick={() => { if (window.confirm(`Declarar "${s.type} em ${s.area}" como vencedor?`)) setResolved({ id:s.id }); }}>
              {s.type} · {s.area}
            </Btn>
          ))}
        </DAdminBar>
      )}
      {me.isAdmin && winner && (
        <DAdminBar hint="Alojamento decidido.">
          <Btn variant="ghost" size="sm" onClick={() => setResolved(null)}>Anular</Btn>
        </DAdminBar>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 6 — Disponibilidade (AppStore)
// ─────────────────────────────────────────────────────────────
function DPhase6({ me }) {
  const appData = useAppStore();
  const allMembers = getAllMembers();
  const locSuggs = appData.locSuggs || [];
  const locWinnerId = appData.locWinner;
  const winnerLoc = locWinnerId ? locSuggs.find((s) => s.id === locWinnerId) : locSuggs[0];
  const accSuggs = appData.accSuggs || [];
  const accWinnerId = appData.accWinner;
  const winnerAcc = accWinnerId ? accSuggs.find((s) => s.id === accWinnerId) : accSuggs[0];

  const [days, setDays] = dUseState2(() => AppStore.getAvailability(me.id));
  const toggle = (d) => setDays((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]);

  const allAvail = appData.avail || {};
  const submittedIds = Object.keys(allAvail);

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={6} status="A recolher disponibilidades" statusTone="accent"
        title={<>Toca nos dias<br/>em que <span style={{ color:'var(--pa-accent)' }}>podes ir.</span></>}
        sub="Marca generoso. Quanto mais opções, melhor o consenso." />

      {winnerLoc && (
        <div style={{ background:'var(--pa-ink)', color:'#fff', borderRadius:16, padding:'14px 18px',
          display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
            background:`repeating-linear-gradient(135deg,${winnerLoc.accent||'var(--pa-accent)'}88 0 6px,${winnerLoc.accent||'var(--pa-accent)'}44 6px 12px)` }} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'rgba(255,255,255,0.6)', textTransform:'uppercase' }}>Destino · alojamento</div>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:16, fontWeight:600, letterSpacing:-0.3, marginTop:1 }}>
              {winnerLoc.name}{winnerAcc ? ` · ${winnerAcc.area}` : ''}
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:22, alignItems:'flex-start' }}>
        <div style={{ background:'#fff', borderRadius:18, padding:20, border:'1px solid var(--pa-line)' }}>
          <Calendar onCellClick={toggle} renderCell={(d) => {
            const sel = days.includes(d);
            return (
              <div style={{ width:'100%', height:'100%', borderRadius:8,
                background: sel?'var(--pa-accent)':'#fff', color: sel?'#fff':'var(--pa-ink)',
                border: sel?'2px solid var(--pa-accent)':'1px solid var(--pa-line)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--pa-body)', fontSize:14, fontWeight: sel?700:500,
                cursor:'pointer', boxShadow: sel?'0 2px 8px rgba(217,119,87,0.3)':'none' }}>{d}</div>
            );
          }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1px solid var(--pa-line)' }}>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase' }}>A tua disponibilidade</div>
            <div style={{ marginTop:4, fontFamily:'var(--pa-display)', fontSize:28, fontWeight:600, letterSpacing:-0.5 }}>
              {days.length} <span style={{ fontSize:14, color:'var(--pa-muted)', fontWeight:400 }}>dias marcados</span>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1px solid var(--pa-line)' }}>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:10 }}>Estado do grupo</div>
            {allMembers.map((m) => {
              const submitted = submittedIds.includes(m.id);
              return (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
                  <Avatar member={m} size={22} />
                  <span style={{ flex:1, fontSize:13, color:'var(--pa-ink)' }}>{m.name}</span>
                  {submitted ? <Pill tone="success" size="sm">✓ pronto</Pill> : <Pill tone="muted" size="sm">a marcar…</Pill>}
                </div>
              );
            })}
          </div>

          <Btn variant="accent" size="lg" style={{ width:'100%' }} onClick={() => {
            AppStore.setAvailability(me.id, days);
            alert('Disponibilidade guardada!');
          }}>Guardar disponibilidade</Btn>
        </div>
      </div>

      {me.isAdmin && (
        <DAdminBar hint={`${submittedIds.length} de ${allMembers.length} submeteram.`} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 7 — Trancar datas (AppStore)
// ─────────────────────────────────────────────────────────────
function DPhase7({ me }) {
  const appData = useAppStore();
  const allAvail = appData.avail || {};
  const allMembers = getAllMembers();
  const totalIn = allMembers.length;

  const heat = dUseMemo2(() => {
    const h = {};
    Object.values(allAvail).forEach((arr) => { arr.forEach((d) => { h[d] = (h[d]||0) + 1; }); });
    return h;
  }, [allAvail]);

  const locked = appData.locked || null;
  const [range, setRange] = dUseState2({ from: null, to: null });

  const ranked = dUseMemo2(() => {
    return Object.entries(heat).sort((a,b) => b[1]-a[1]).slice(0,5).map(([d,n]) => ({ day:+d, count:n }));
  }, [heat]);

  if (Object.keys(heat).length === 0) {
    return (
      <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
        <DPhaseHeader phase={7} status="Sem disponibilidade" statusTone="muted"
          title={<>Ainda ninguém<br/><span style={{ color:'var(--pa-accent)' }}>marcou dias.</span></>}
          sub="Volta à fase 6 e pede ao grupo para marcar disponibilidade." />
        {me.isAdmin && <DAdminBar hint="Sem dados de disponibilidade." />}
      </div>
    );
  }

  return (
    <div style={{ flex:1, padding:'32px 36px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <DPhaseHeader phase={7} status={me.isAdmin ? 'Tu decides' : 'A aguardar'} statusTone={me.isAdmin?'accent':'muted'}
        title={<>O calendário falou.<br/><span style={{ color:'var(--pa-accent)' }}>{me.isAdmin ? 'Tranca os dias.' : 'Admin está a escolher.'}</span></>}
        sub="Quanto mais escura a célula, mais gente está disponível." />

      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:22, alignItems:'flex-start', flex:1 }}>
        <div style={{ background:'#fff', borderRadius:18, padding:22, border:'1px solid var(--pa-line)' }}>
          <Calendar renderCell={(d) => {
            const n = heat[d] || 0;
            const inRange = range.from && range.to && d >= range.from && d <= range.to;
            const isLocked = locked && d >= locked.from && d <= locked.to;
            const intensity = totalIn > 0 ? n/totalIn : 0;
            return (
              <div style={{ width:'100%', height:'100%', borderRadius:8,
                background: isLocked ? 'var(--pa-accent)' : inRange ? 'var(--pa-ink)' : intensity > 0 ? `rgba(217,119,87,${0.10+intensity*0.6})` : '#fff',
                color: isLocked||inRange ? '#fff' : 'var(--pa-ink)',
                border: intensity===0&&!inRange&&!isLocked ? '1px solid var(--pa-line)' : 'none',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                cursor: me.isAdmin?'pointer':'default' }}
                onClick={() => { if (me.isAdmin) setRange({ from:d, to:Math.min(d+2,31) }); }}>
                <div style={{ fontFamily:'var(--pa-body)', fontSize:14, fontWeight:600 }}>{d}</div>
                {n > 0 && <div style={{ fontFamily:'var(--pa-mono)', fontSize:9, marginTop:1, color: isLocked||inRange?'rgba(255,255,255,0.7)':'var(--pa-muted)', fontWeight:600 }}>{n}/{totalIn}</div>}
              </div>
            );
          }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {locked && (
            <div style={{ background:'var(--pa-ink)', color:'#fff', borderRadius:16, padding:18 }}>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'rgba(255,255,255,0.6)', textTransform:'uppercase' }}>Trancado 🔒</div>
              <div style={{ marginTop:6, fontFamily:'var(--pa-display)', fontSize:28, fontWeight:600, letterSpacing:-0.7 }}>
                {locked.from}–{locked.to} Jun
              </div>
            </div>
          )}
          {!locked && range.from && (
            <div style={{ background:'#fff', borderRadius:16, padding:18, border:'1px solid var(--pa-line)' }}>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase' }}>Seleção</div>
              <div style={{ marginTop:6, fontFamily:'var(--pa-display)', fontSize:28, fontWeight:600, letterSpacing:-0.7 }}>
                {range.from}–{range.to}
              </div>
              {me.isAdmin && (
                <Btn variant="accent" size="lg" style={{ width:'100%', marginTop:14 }}
                  onClick={() => { AppStore.setLockedDates(range.from, range.to, D.phase6.monthLabel); }}>
                  Trancar estes dias 🔒
                </Btn>
              )}
            </div>
          )}

          {ranked.length > 0 && (
            <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1px solid var(--pa-line)' }}>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:10 }}>Top dias</div>
              {ranked.map((r) => (
                <div key={r.day} style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0' }}>
                  <div style={{ width:32, height:28, borderRadius:6,
                    background:`rgba(217,119,87,${0.15+(r.count/totalIn)*0.6})`,
                    fontFamily:'var(--pa-body)', fontSize:12, fontWeight:600, color:'var(--pa-ink)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{r.day}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:4, borderRadius:4, background:'rgba(31,26,20,0.06)' }}>
                      <div style={{ width:`${(r.count/totalIn)*100}%`, height:'100%', background:'var(--pa-accent)', borderRadius:4 }} />
                    </div>
                  </div>
                  <span style={{ fontFamily:'var(--pa-mono)', fontSize:11, color:'var(--pa-ink)', fontWeight:600 }}>{r.count}/{totalIn}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 8 — Planeamento
// ─────────────────────────────────────────────────────────────
function DPhase8({ me }) {
  const appData = useAppStore();
  const locked = appData.locked;
  const [tab, setTab] = dUseState2('estadia');
  const tabs = [
    { id:'estadia', label:'Estadia', icon:'🏡' },
    { id:'custos',  label:'Contas',  icon:'€' },
    { id:'itin',    label:'Itinerário', icon:'📍' },
    { id:'ativ',    label:'Atividades', icon:'🎯' },
    { id:'compras', label:'Compras', icon:'🛒' },
  ];

  return (
    <div style={{ flex:1, padding:'32px 36px 28px', display:'flex', flexDirection:'column', overflow:'auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:22 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <Pill tone="dark" size="sm"><span style={{ fontFamily:'var(--pa-mono)', letterSpacing:0.8 }}>FASE 08 / 08</span></Pill>
            {locked && <Pill tone="success" size="sm"><span style={{ width:5, height:5, borderRadius:5, background:'currentColor' }} />Trancado</Pill>}
          </div>
          <div style={{ fontFamily:'var(--pa-display)', fontSize:44, fontWeight:600, letterSpacing:-1.5, lineHeight:0.98 }}>
            {locked ? <>Faltam calcular.<br/><span style={{ color:'var(--pa-accent)' }}>Vamos organizar.</span></> : <>Planeamento<br/><span style={{ color:'var(--pa-accent)' }}>em construção.</span></>}
          </div>
          {locked && (
            <div style={{ marginTop:10, fontFamily:'var(--pa-body)', fontSize:14, color:'var(--pa-muted)' }}>
              {locked.from}–{locked.to} · {locked.monthLabel || D.phase6.monthLabel}
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'flex', gap:4, padding:4, background:'#fff', borderRadius:999, border:'1px solid var(--pa-line)', marginBottom:20, width:'fit-content' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 16px', borderRadius:999, border:'none', cursor:'pointer',
            background: tab===t.id?'var(--pa-ink)':'transparent',
            color: tab===t.id?'#fff':'var(--pa-ink)',
            fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600,
            display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ opacity:0.7 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'estadia'  && <PlanEstadia appData={appData} />}
      {tab === 'custos'   && <PlanCustos me={me} />}
      {tab === 'itin'     && <PlanItinerario me={me} />}
      {tab === 'ativ'     && <PlanAtividades me={me} />}
      {tab === 'compras'  && <PlanCompras me={me} />}
    </div>
  );
}

function PlanEstadia({ appData }) {
  const accSuggs = appData.accSuggs || [];
  const winnerId = appData.accWinner;
  const acc = winnerId ? accSuggs.find((s) => s.id === winnerId) : accSuggs[0];

  if (!acc) {
    return (
      <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
        Sem alojamento decidido ainda. Avança as fases anteriores primeiro.
      </div>
    );
  }

  const by = memberById(acc.by) || { name: acc.by, color:'var(--pa-muted)', initials:'?' };
  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--pa-line)', overflow:'hidden' }}>
      <PhotoSlot accent="var(--pa-accent)" label={`alojamento decidido · ${acc.area}`} height={180} radius={0} />
      <div style={{ padding:22 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Pill tone="dark" size="sm">{acc.type}</Pill>
              <Pill tone="accent" size="sm">★ Escolhido</Pill>
            </div>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:26, fontWeight:600, letterSpacing:-0.5 }}>{acc.area}</div>
            {acc.note && <div style={{ marginTop:8, fontFamily:'var(--pa-body)', fontSize:14, color:'var(--pa-ink)', lineHeight:1.5, maxWidth:540 }}>{acc.note}</div>}
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:32, fontWeight:600 }}>{acc.price}€</div>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, color:'var(--pa-muted)' }}>/NOITE</div>
          </div>
        </div>
        <div style={{ marginTop:18, paddingTop:14, borderTop:'1px solid var(--pa-line)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Avatar member={by} size={22} />
            <span style={{ fontSize:12, color:'var(--pa-muted)' }}>{by.name} sugeriu</span>
          </div>
          {acc.link && (
            <a href={acc.link} target="_blank" rel="noreferrer" style={{
              padding:'8px 14px', borderRadius:999, background:'var(--pa-ink)', color:'#fff',
              textDecoration:'none', fontFamily:'var(--pa-body)', fontSize:12.5, fontWeight:600 }}>Ver anúncio →</a>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCustos({ me }) {
  return (
    <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
      <div style={{ fontSize:32, marginBottom:16 }}>€</div>
      Em breve — as contas ficam aqui quando as datas estiverem trancadas.
    </div>
  );
}

function PlanItinerario({ me }) {
  return (
    <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
      <div style={{ fontSize:32, marginBottom:16 }}>📍</div>
      Em breve — o itinerário fica aqui quando a viagem estiver confirmada.
    </div>
  );
}

function PlanAtividades({ me }) {
  return (
    <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
      <div style={{ fontSize:32, marginBottom:16 }}>🎯</div>
      Em breve — as atividades ficam aqui.
    </div>
  );
}

function PlanCompras({ me }) {
  return (
    <div style={{ padding:'48px 0', textAlign:'center', color:'var(--pa-muted)', fontSize:14 }}>
      <div style={{ fontSize:32, marginBottom:16 }}>🛒</div>
      Em breve — a lista de compras fica aqui.
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DesktopShell
// ─────────────────────────────────────────────────────────────
const PHASE_STORAGE_KEY = 'pa-current-phase';

function DesktopShell({ viewAs = 'admin', phase: initialPhase, liveUser, onLogout }) {
  const appData = useAppStore();
  const me = liveUser || (viewAs === 'admin' ? memberById(D.adminId) : memberById('rita') || getAllMembers()[0]);

  const edition = {
    number: appData.editionNumber || D.edition.number,
    title: appData.editionTitle || D.edition.title,
    subtitle: appData.editionSubtitle || D.edition.subtitle,
  };

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
    if (initialPhase !== undefined) return;
    const clamped = Math.max(1, Math.min(D.phases.length, n));
    setLivePhase(clamped);
    safeStore.set(PHASE_STORAGE_KEY, String(clamped));
  };
  const reset = () => setPhase(1);

  const ctx = { phase, setPhase, reset, canEdit: me.isAdmin };

  const phases = { 1:DPhase1, 2:DPhase2, 3:DPhase3, 4:DPhase4, 5:DPhase5, 6:DPhase6, 7:DPhase7, 8:DPhase8 };
  const PhaseView = phases[phase] || DPhase1;

  return (
    <PhaseCtx.Provider value={ctx}>
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
        background:'var(--pa-bg)', overflow:'hidden',
        fontFamily:'var(--pa-body)', color:'var(--pa-ink)', WebkitFontSmoothing:'antialiased' }}>
        <DTopBar me={me} edition={edition} onLogout={onLogout} />
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <DLeftRail phase={phase} me={me} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#fcf9f3' }}>
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
