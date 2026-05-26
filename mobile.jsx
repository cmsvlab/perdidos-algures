// Perdidos Algures — Mobile companion (dinâmico via AppStore).

const { useState: mUseState, useEffect: mUseEffect } = React;

function MShell({ children }) {
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
      background:'var(--pa-bg)', fontFamily:'var(--pa-body)', color:'var(--pa-ink)',
      WebkitFontSmoothing:'antialiased', paddingTop:50, paddingBottom:28,
      boxSizing:'border-box', overflow:'hidden' }}>
      {children}
    </div>
  );
}

function MHeader({ phase, onLogout, onOpenChat }) {
  return (
    <div style={{ padding:'4px 22px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <Logo size={13} />
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <Pill tone="dark" size="sm"><span style={{ fontFamily:'var(--pa-mono)' }}>FASE {String(phase).padStart(2,'0')}/{String(D.phases.length).padStart(2,'0')}</span></Pill>
        {onOpenChat && (
          <button onClick={onOpenChat} title="Chat" style={{
            width:28, height:28, borderRadius:999, background:'#fff',
            border:'1px solid var(--pa-line)', cursor:'pointer', padding:0,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H6l-3 2.5V10H4a2 2 0 01-2-2V4z" stroke="var(--pa-ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {onLogout && (
          <button onClick={onLogout} title="Sair" style={{
            width:28, height:28, borderRadius:999, background:'#fff',
            border:'1px solid var(--pa-line)', cursor:'pointer', padding:0,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
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
    <div style={{ padding:'12px 22px 14px' }}>
      {kicker && <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.5, color:'var(--pa-muted)', textTransform:'uppercase' }}>{kicker}</div>}
      <div style={{ marginTop: kicker?6:0, fontFamily:'var(--pa-display)', fontSize:30, fontWeight:600, letterSpacing:-1, lineHeight:1.02 }}>{title}</div>
      {sub && <div style={{ marginTop:8, fontSize:13.5, color:'var(--pa-muted)', lineHeight:1.4 }}>{sub}</div>}
    </div>
  );
}

function MEmpty({ icon, text }) {
  return (
    <div style={{ padding:'48px 22px', textAlign:'center', color:'var(--pa-muted)', fontSize:13 }}>
      <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
      {text}
    </div>
  );
}

// PHASE 1 — RSVP
function MPhase1({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const rsvp = appData.rsvp || {};
  const myChoice = rsvp[me.id] || null;

  const handleRsvp = (status) => AppStore.setRsvp(me.id, status);

  return (
    <MShell>
      <MHeader phase={1} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle
        kicker={`${memberById(D.adminId)?.name || 'Admin'} chamou-te`}
        title={<>Estás dentro<br/>da {appData.editionNumber || 1}ª?</>}
        sub={`"${appData.editionTitle || 'Nova Aventura'}"`} />
      <div style={{ padding:'6px 22px', flex:1, overflow:'auto' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { id:'in',    label:'Dentro',   emoji:'🙋', sub:'Conta comigo',    tone:'#3d5e44',       bg:'rgba(107,142,111,0.16)' },
            { id:'maybe', label:'A pensar', emoji:'🤔', sub:'Digo até quinta', tone:'var(--pa-ink)', bg:'rgba(31,26,20,0.05)' },
            { id:'out',   label:'Fora',     emoji:'😩', sub:'Desta vez não',   tone:'#8a4220',       bg:'rgba(217,119,87,0.18)' },
          ].map((o) => {
            const sel = myChoice === o.id;
            return (
              <button key={o.id} onClick={() => handleRsvp(o.id)} style={{
                display:'flex', alignItems:'center', gap:14,
                background: sel?o.bg:'#fff',
                border: sel?`2px solid ${o.tone}`:'1px solid var(--pa-line)',
                borderRadius:16, padding:'14px 18px', cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontSize:30 }}>{o.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--pa-display)', fontSize:18, fontWeight:600, color:o.tone, letterSpacing:-0.3 }}>{o.label}</div>
                  <div style={{ fontSize:12, color:'var(--pa-muted)', marginTop:2 }}>{o.sub}</div>
                </div>
                {sel && <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#3d5e44"/><path d="M5 9l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            );
          })}
        </div>
        {myChoice && (
          <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(107,142,111,0.12)', fontSize:12, color:'#3d5e44', textAlign:'center' }}>
            Resposta guardada ✓ — podes mudar até o admin fechar.
          </div>
        )}
      </div>
    </MShell>
  );
}

// PHASE 2 — Sugerir localizações
function MPhase2({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const suggestions = appData.locSuggs || [];
  const mine = suggestions.filter((s) => s.by === me.id);
  const limit = D.phase2.perPersonLimit;
  const [adding, setAdding] = mUseState(false);
  const [name, setName] = mUseState('');
  const [city, setCity] = mUseState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    AppStore.addLocSuggestion({ id:'loc_'+Date.now().toString(36), name:name.trim(), city:city.trim(), tags:[], accent:'var(--pa-accent)', by:me.id });
    setName(''); setCity(''); setAdding(false);
  };

  return (
    <MShell>
      <MHeader phase={2} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker={`${mine.length} de ${limit} usados`}
        title={<>Sugere até<br/><span style={{ color:'var(--pa-accent)' }}>{limit} sítios.</span></>} />
      <div style={{ padding:'6px 16px', flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:10 }}>
        {mine.map((s) => (
          <div key={s.id} style={{ background:'#fff', borderRadius:14, padding:12, border:'1.5px solid var(--pa-accent)' }}>
            <div style={{ fontFamily:'var(--pa-display)', fontSize:16, fontWeight:600 }}>{s.name}</div>
            {s.city && <div style={{ fontSize:11.5, color:'var(--pa-muted)', marginTop:2 }}>{s.city}</div>}
          </div>
        ))}

        {mine.length < limit && !adding && (
          <button onClick={() => setAdding(true)} style={{
            background:'transparent', border:'1.5px dashed var(--pa-line)', borderRadius:14,
            padding:'20px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:32, background:'var(--pa-ink)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:'var(--pa-body)', fontSize:13.5, fontWeight:600 }}>Slot {mine.length+1}</div>
              <div style={{ fontSize:11.5, color:'var(--pa-muted)' }}>Lança um destino</div>
            </div>
          </button>
        )}

        {adding && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'2px solid var(--pa-accent)' }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do sítio"
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--pa-line)',
                fontFamily:'var(--pa-body)', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8 }} />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade, País"
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--pa-line)',
                fontFamily:'var(--pa-body)', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAdding(false)} style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--pa-line)', background:'transparent', cursor:'pointer', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!name.trim()} style={{ flex:1, padding:'10px', borderRadius:999, border:'none', background:'var(--pa-accent)', color:'#fff', cursor: name.trim()?'pointer':'default', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600, opacity: name.trim()?1:0.5 }}>Lançar</button>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{ marginTop:8, borderTop:'1px solid var(--pa-line)', paddingTop:12 }}>
            <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'var(--pa-muted)', textTransform:'uppercase', marginBottom:8 }}>
              Todos os destinos ({suggestions.length})
            </div>
            {suggestions.filter((s) => s.by !== me.id).map((s) => {
              const by = memberById(s.by) || { name:s.by, initials:'?' };
              return (
                <div key={s.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--pa-line)', display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar member={by} size={22} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                    {s.city && <div style={{ fontSize:11, color:'var(--pa-muted)' }}>{s.city}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MShell>
  );
}

// PHASE 3 — Vote local
function MPhase3({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const suggestions = appData.locSuggs || [];
  const [vote, setVote] = mUseState(() => VoteStore.getVote(me.id, 'loc'));
  const [saved, setSaved] = mUseState(false);

  const handleVote = (id) => {
    setVote(id);
    VoteStore.setVote(me.id, 'loc', id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (suggestions.length === 0) {
    return (
      <MShell>
        <MHeader phase={3} onLogout={onLogout} onOpenChat={onOpenChat} />
        <MEmpty icon="🗺️" text="Ainda não há destinos para votar. Volta à fase anterior." />
      </MShell>
    );
  }

  return (
    <MShell>
      <MHeader phase={3} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker="Voto secreto" title={<>Onde queres<br/><span style={{ color:'var(--pa-accent)' }}>passar este?</span></>} />
      <div style={{ padding:'6px 16px 14px', flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:10 }}>
        {suggestions.map((s) => {
          const sel = vote === s.id;
          const by = memberById(s.by) || { name:s.by, initials:'?' };
          return (
            <button key={s.id} onClick={() => handleVote(s.id)} style={{
              background:'#fff', borderRadius:14, textAlign:'left', padding:'14px 16px',
              border: sel?'2px solid var(--pa-accent)':'1px solid var(--pa-line)',
              cursor:'pointer', position:'relative' }}>
              <div style={{ fontFamily:'var(--pa-display)', fontSize:17, fontWeight:600, letterSpacing:-0.3 }}>{s.name}</div>
              {s.city && <div style={{ fontSize:11.5, color:'var(--pa-muted)', marginTop:2 }}>{s.city}</div>}
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
                <Avatar member={by} size={18} />
                <span style={{ fontSize:10.5, color:'var(--pa-muted)' }}>{by.name}</span>
              </div>
              {sel && (
                <div style={{ position:'absolute', top:12, right:12, width:24, height:24, borderRadius:24,
                  background: saved?'#3d5e44':'var(--pa-accent)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 6.5l2 2 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          );
        })}
        {vote && (
          <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(107,142,111,0.12)', fontSize:12, color:'#3d5e44', textAlign:'center' }}>
            {saved ? 'Voto guardado ✓' : `Voto em ${suggestions.find((s) => s.id === vote)?.name}`}
          </div>
        )}
      </div>
    </MShell>
  );
}

// PHASE 4 — Sugerir alojamento
function MPhase4({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const suggestions = appData.accSuggs || [];
  const locSuggs = appData.locSuggs || [];
  const winnerLoc = locSuggs[0];
  const [adding, setAdding] = mUseState(false);
  const [area, setArea] = mUseState('');
  const [price, setPrice] = mUseState('');
  const [link, setLink] = mUseState('');

  const handleAdd = () => {
    if (!area.trim()) return;
    AppStore.addAccSuggestion({ id:'acc_'+Date.now().toString(36), type:'Casa', price:parseInt(price)||0, area:area.trim(), link, note:'', by:me.id });
    setArea(''); setPrice(''); setLink(''); setAdding(false);
  };

  return (
    <MShell>
      <MHeader phase={4} onLogout={onLogout} onOpenChat={onOpenChat} />
      {winnerLoc && (
        <div style={{ padding:'0 22px 4px' }}>
          <Pill tone="success" size="sm">
            <span style={{ width:5, height:5, borderRadius:5, background:'#3d5e44' }} />
            Local · {winnerLoc.name}
          </Pill>
        </div>
      )}
      <MPhaseTitle kicker={`${suggestions.length} alojamentos`}
        title={<>Onde é que<br/><span style={{ color:'var(--pa-accent)' }}>dormimos?</span></>}
        sub="Sem limite — lança o que vires." />
      <div style={{ padding:'6px 16px 14px', flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {suggestions.map((s) => {
          const by = memberById(s.by) || { name:s.by, initials:'?' };
          const mine = s.by === me.id;
          return (
            <div key={s.id} style={{ background:'#fff', borderRadius:12, padding:'12px 14px',
              border: mine?'1.5px solid var(--pa-accent)':'1px solid var(--pa-line)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <Pill tone="dark" size="sm">{s.type}</Pill>
                    <span style={{ fontSize:11, color:'var(--pa-muted)' }}>{s.area}</span>
                  </div>
                  {s.note && <div style={{ fontSize:12.5, color:'var(--pa-ink)', lineHeight:1.4 }}>{s.note.length>60?s.note.slice(0,60)+'…':s.note}</div>}
                </div>
                <div style={{ fontFamily:'var(--pa-mono)', fontSize:14, fontWeight:700, flexShrink:0 }}>{s.price}€</div>
              </div>
              <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--pa-line)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Avatar member={by} size={16} />
                  <span style={{ fontSize:10.5, color:'var(--pa-muted)' }}>{mine?'tu':by.name}</span>
                </div>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noreferrer" style={{ fontFamily:'var(--pa-mono)', fontSize:10.5, color:'var(--pa-accent)', fontWeight:600, textDecoration:'none' }}>ver →</a>
                )}
              </div>
            </div>
          );
        })}

        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            marginTop:4, background:'var(--pa-accent)', color:'#fff', border:'none',
            borderRadius:999, padding:'14px', cursor:'pointer',
            fontFamily:'var(--pa-body)', fontSize:14, fontWeight:600 }}>+ Lançar alojamento</button>
        )}

        {adding && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'2px solid var(--pa-accent)' }}>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Zona / bairro"
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--pa-line)', fontFamily:'var(--pa-body)', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8 }} />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="€ por noite" type="number"
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--pa-line)', fontFamily:'var(--pa-body)', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8 }} />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (airbnb, booking...)"
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--pa-line)', fontFamily:'var(--pa-body)', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAdding(false)} style={{ flex:1, padding:'10px', borderRadius:999, border:'1px solid var(--pa-line)', background:'transparent', cursor:'pointer', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!area.trim()} style={{ flex:1, padding:'10px', borderRadius:999, border:'none', background:'var(--pa-accent)', color:'#fff', cursor: area.trim()?'pointer':'default', fontFamily:'var(--pa-body)', fontSize:13, fontWeight:600, opacity: area.trim()?1:0.5 }}>Lançar</button>
            </div>
          </div>
        )}
      </div>
    </MShell>
  );
}

// PHASE 5 — Votar alojamento
function MPhase5({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const suggestions = appData.accSuggs || [];
  const [vote, setVote] = mUseState(() => VoteStore.getVote(me.id, 'acc'));
  const [saved, setSaved] = mUseState(false);

  const votingClosed = false; // Admin fecha manualmente
  const isTie = false; // Simplificado para mobile

  const handleVote = (id) => {
    if (votingClosed) return;
    setVote(id);
    VoteStore.setVote(me.id, 'acc', id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (suggestions.length === 0) {
    return (
      <MShell>
        <MHeader phase={5} onLogout={onLogout} onOpenChat={onOpenChat} />
        <MEmpty icon="🏡" text="Ainda não há alojamentos para votar. Volta à fase anterior." />
      </MShell>
    );
  }

  return (
    <MShell>
      <MHeader phase={5} onLogout={onLogout} onOpenChat={onOpenChat} />
      <div style={{ padding:'0 22px 4px' }}>
        <Pill tone="accent" size="sm">Voto secreto</Pill>
      </div>
      <MPhaseTitle title={<>Vota no <span style={{ color:'var(--pa-accent)' }}>alojamento.</span></>}
        sub="Um por pessoa, secreto até fechar." />

      <div style={{ padding:'6px 16px 14px', flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:10 }}>
        {suggestions.map((s) => {
          const sel = vote === s.id;
          return (
            <button key={s.id} onClick={() => handleVote(s.id)} style={{
              background:'#fff', borderRadius:12, padding:'12px 14px',
              border: sel?'2px solid var(--pa-accent)':'1px solid var(--pa-line)',
              cursor:votingClosed?'default':'pointer', textAlign:'left', position:'relative', width:'100%' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Pill tone="dark" size="sm">{s.type}</Pill>
                  <span style={{ fontSize:11.5 }}>{s.area}</span>
                </div>
                <span style={{ fontFamily:'var(--pa-mono)', fontSize:13, fontWeight:700 }}>{s.price}€</span>
              </div>
              {sel && (
                <div style={{ position:'absolute', top:10, right:10, width:22, height:22, borderRadius:22,
                  background: saved?'#3d5e44':'var(--pa-accent)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2.5 5.5l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          );
        })}
        {vote && (
          <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(107,142,111,0.12)', fontSize:12, color:'#3d5e44', textAlign:'center' }}>
            {saved ? 'Voto guardado ✓' : `Voto em ${suggestions.find((s) => s.id === vote)?.area || vote}`}
          </div>
        )}
      </div>
    </MShell>
  );
}

// PHASE 6 — Disponibilidade
function MPhase6({ me, onLogout, onOpenChat }) {
  const [days, setDays] = mUseState(() => AppStore.getAvailability(me.id));
  const toggle = (d) => setDays((arr) => arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]);

  return (
    <MShell>
      <MHeader phase={6} onLogout={onLogout} onOpenChat={onOpenChat} />
      <MPhaseTitle kicker={`${days.length} dias marcados`}
        title={<>Em que dias<br/><span style={{ color:'var(--pa-accent)' }}>podes ir?</span></>} />
      <div style={{ padding:'6px 16px 14px', flex:1, overflow:'auto' }}>
        <div style={{ background:'#fff', borderRadius:16, padding:14, border:'1px solid var(--pa-line)' }}>
          <Calendar dense onCellClick={toggle} renderCell={(d) => {
            const sel = days.includes(d);
            return (
              <div style={{ width:'100%', height:'100%', borderRadius:6,
                background: sel?'var(--pa-accent)':'#fff', color: sel?'#fff':'var(--pa-ink)',
                border: sel?'none':'1px solid var(--pa-line)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--pa-body)', fontSize:12, fontWeight: sel?700:500 }}>{d}</div>
            );
          }} />
        </div>
        <button onClick={() => { AppStore.setAvailability(me.id, days); alert('Guardado!'); }}
          style={{ marginTop:16, width:'100%', padding:'14px', borderRadius:999, border:'none',
            background:'var(--pa-accent)', color:'#fff', cursor:'pointer',
            fontFamily:'var(--pa-body)', fontSize:14, fontWeight:600 }}>
          Guardar disponibilidade
        </button>
      </div>
    </MShell>
  );
}

// PHASE 7 — Trancar datas
function MPhase7({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const locked = appData.locked;

  return (
    <MShell>
      <MHeader phase={7} onLogout={onLogout} onOpenChat={onOpenChat} />
      {locked ? (
        <>
          <MPhaseTitle kicker="Datas trancadas 🔒"
            title={<>Temos datas!<br/><span style={{ color:'var(--pa-accent)' }}>{locked.from}–{locked.to}.</span></>}
            sub={locked.monthLabel || D.phase6.monthLabel} />
          <div style={{ padding:'6px 16px 14px', flex:1, overflow:'auto' }}>
            <div style={{ background:'var(--pa-ink)', color:'#fff', borderRadius:16, padding:20, textAlign:'center' }}>
              <div style={{ fontFamily:'var(--pa-mono)', fontSize:10, letterSpacing:1.2, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', marginBottom:8 }}>Confirmado</div>
              <div style={{ fontFamily:'var(--pa-display)', fontSize:40, fontWeight:600, letterSpacing:-1 }}>{locked.from}–{locked.to}</div>
              <div style={{ marginTop:4, opacity:0.7 }}>{locked.monthLabel || D.phase6.monthLabel}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <MPhaseTitle kicker="A aguardar"
            title={<>Admin está<br/><span style={{ color:'var(--pa-accent)' }}>a escolher os dias.</span></>}
            sub="Já submeteste disponibilidade. Brevemente sabes." />
          <div style={{ padding:'6px 16px', flex:1 }}>
            <div style={{ padding:16, background:'rgba(31,26,20,0.04)', borderRadius:14, fontSize:13, color:'var(--pa-muted)', textAlign:'center' }}>
              Aguarda que o {memberById(D.adminId)?.name || 'admin'} tranche as datas.
            </div>
          </div>
        </>
      )}
    </MShell>
  );
}

// PHASE 8 — Planeamento
function MPhase8({ me, onLogout, onOpenChat }) {
  const appData = useAppStore();
  const locked = appData.locked;

  return (
    <MShell>
      <MHeader phase={8} onLogout={onLogout} onOpenChat={onOpenChat} />
      {locked && (
        <div style={{ padding:'0 22px 4px' }}>
          <Pill tone="success" size="sm">
            <span style={{ width:5, height:5, borderRadius:5, background:'#3d5e44' }} />
            {locked.from}–{locked.to} · trancado
          </Pill>
        </div>
      )}
      <MPhaseTitle
        title={<>Vamos planear.</>}
        sub="O planeamento detalhado está disponível no desktop." />
      <div style={{ padding:'6px 16px', flex:1 }}>
        <div style={{ padding:24, background:'#fff', borderRadius:16, border:'1px solid var(--pa-line)', textAlign:'center', color:'var(--pa-muted)', fontSize:13 }}>
          Para o planeamento completo (itinerário, contas, compras) usa o computador.
        </div>
      </div>
    </MShell>
  );
}

// Top-level mobile router
function MobileApp({ viewAs = 'member', liveUser, onLogout }) {
  const me = liveUser || (viewAs === 'admin' ? memberById(D.adminId) : getAllMembers()[0] || memberById(D.adminId));
  const [chatOpen, setChatOpen] = mUseState(false);
  const phase = (() => {
    try {
      const saved = parseInt(safeStore.get('pa-current-phase') || '', 10);
      if (saved >= 1 && saved <= D.phases.length) return saved;
    } catch {}
    return D.edition.currentPhase;
  })();
  const phases = { 1:MPhase1, 2:MPhase2, 3:MPhase3, 4:MPhase4, 5:MPhase5, 6:MPhase6, 7:MPhase7, 8:MPhase8 };
  const View = phases[phase] || MPhase1;
  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <View me={me} onLogout={onLogout} onOpenChat={() => setChatOpen(true)} />
      <MobileChatSheet me={me} open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

Object.assign(window, {
  MPhase1, MPhase2, MPhase3, MPhase4, MPhase5, MPhase6, MPhase7, MPhase8,
  MobileApp,
});
