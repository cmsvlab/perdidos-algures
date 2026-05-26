// Perdidos Algures — Supabase integration layer.
// Corre DEPOIS de auth.jsx e chat.jsx, ANTES de desktop-1.jsx.
// Substitui localStorage por Supabase para partilha entre dispositivos.
// Chat em tempo real via Supabase Realtime.

(function initSupabase() {
  const SUPABASE_URL = 'https://sinhsvdzajgfnyjitqbw.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbmhzdmR6YWpnZm55aml0cWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTEzNTYsImV4cCI6MjA5NTMyNzM1Nn0.BkWf2y1B7gsLwaYESQWFzr3eY8CL4coQ8XmuRpSOg9U';

  if (!window.supabase) {
    console.warn('[PA] Supabase JS não carregou — a app continua em modo offline.');
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window._sb = sb;

  // ── Utilitários ─────────────────────────────────────────────
  function formatWhen(ts) {
    if (!ts) return 'agora';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 2)  return 'agora';
    if (m < 60) return 'há ' + m + 'm';
    const h = Math.floor(m / 60);
    if (h < 24) return 'há ' + h + 'h';
    const d = Math.floor(h / 24);
    return 'há ' + d + ' dia' + (d > 1 ? 's' : '');
  }

  // ── Cache de utilizadores ────────────────────────────────────
  var _sbUsers = [];

  function loadUsers() {
    return sb.from('pa_users').select('id,name,initials,color,photo_url,is_admin')
      .then(function(res) {
        if (res.data) {
          _sbUsers = res.data.map(function(u) {
            return { id:u.id, name:u.name, initials:u.initials, color:u.color,
                     photoDataUrl:u.photo_url, isAdmin:u.is_admin||false };
          });
          // Trigger re-render via AppStore
          var d = AppStore.load();
          AppStore._save(d);
        }
      });
  }

  // Override AuthStore.getUsers para devolver cache Supabase
  AuthStore.getUsers = function() { return _sbUsers; };

  // Override AuthStore.login para usar Supabase
  AuthStore.login = async function(name, password) {
    var n = (name || '').trim();
    if (!n) throw new Error('Falta o nome.');
    if (!password) throw new Error('Falta a password.');

    // Admin: password local (não está na BD)
    if (n.toLowerCase() === ADMIN_NAME.toLowerCase()) {
      if (password !== '7415963a') throw new Error('Password do admin não bate certo.');
      var session = { id:'miguel', name:'Miguel', initials:'M', color:'#1f1a14', isAdmin:true };
      safeStore.set('pa-session', JSON.stringify(session));
      return session;
    }

    // Utilizador normal: vai ao Supabase
    var res = await sb.from('pa_users').select('*').ilike('name', n).maybeSingle();
    if (!res.data) throw new Error('Conta não encontrada. Regista-te primeiro.');
    var hash = await sha256(password);
    if (res.data.pass_hash !== hash) throw new Error('Password errada.');
    var s = { id:res.data.id, name:res.data.name, initials:res.data.initials,
               color:res.data.color, photoDataUrl:res.data.photo_url, isAdmin:false };
    safeStore.set('pa-session', JSON.stringify(s));
    return s;
  };

  // Override AuthStore.register para usar Supabase
  AuthStore.register = async function(opts) {
    var name = (opts.name || '').trim();
    var password = opts.password, passwordRepeat = opts.passwordRepeat, photoDataUrl = opts.photoDataUrl;
    if (!name) throw new Error('Falta o nome.');
    if (name.toLowerCase() === ADMIN_NAME.toLowerCase()) throw new Error('Esse nome é reservado.');
    if (!password || password.length < 4) throw new Error('Password tem de ter 4+ caracteres.');
    if (password !== passwordRepeat) throw new Error('As passwords não batem certo.');

    var existing = await sb.from('pa_users').select('id').ilike('name', name).maybeSingle();
    if (existing.data) throw new Error('Já existe alguém com esse nome.');

    var passHash = await sha256(password);
    var id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    var initials = AuthStore.initialsFromName(name);
    var color = AuthStore.colorFromName(name);

    var ins = await sb.from('pa_users').insert({
      id:id, name:name, initials:initials, color:color,
      photo_url:photoDataUrl||null, pass_hash:passHash, is_admin:false,
    });
    if (ins.error) throw new Error('Erro ao criar conta: ' + ins.error.message);

    // Atualiza cache local
    _sbUsers = [..._sbUsers, { id:id, name:name, initials:initials, color:color, photoDataUrl:photoDataUrl||null, isAdmin:false }];
    var d = AppStore.load(); AppStore._save(d); // trigger re-render

    var session = { id:id, name:name, initials:initials, color:color, photoDataUrl:photoDataUrl||null, isAdmin:false };
    safeStore.set('pa-session', JSON.stringify(session));
    return session;
  };

  // ── AppStore → Supabase ──────────────────────────────────────
  function sbLoadApp() {
    return Promise.all([
      sb.from('pa_rsvp').select('*'),
      sb.from('pa_loc_suggestions').select('*').order('created_at'),
      sb.from('pa_acc_suggestions').select('*').order('created_at'),
      sb.from('pa_availability').select('*'),
      sb.from('pa_loc_winner').select('*').maybeSingle(),
      sb.from('pa_acc_winner').select('*').maybeSingle(),
      sb.from('pa_locked_dates').select('*').maybeSingle(),
      sb.from('pa_edition').select('*').maybeSingle(),
    ]).then(function(results) {
      var rsvp=results[0], locS=results[1], accS=results[2], avail=results[3],
          locW=results[4], accW=results[5], locked=results[6], edition=results[7];

      var data = { rsvp:{}, locSuggs:[], accSuggs:[], avail:{},
                   locWinner:null, accWinner:null, locked:null };

      if (rsvp.data)   rsvp.data.forEach(function(r){ data.rsvp[r.user_id]=r.status; });
      if (locS.data)   data.locSuggs = locS.data.map(function(s){
        return { id:s.id, name:s.name, city:s.city||'', tags:s.tags||[], accent:s.accent||'var(--pa-accent)', by:s.by_user };
      });
      if (accS.data)   data.accSuggs = accS.data.map(function(s){
        return { id:s.id, type:s.type, price:s.price||0, area:s.area||'', link:s.link||'', note:s.note||'', by:s.by_user };
      });
      if (avail.data)  avail.data.forEach(function(a){ data.avail[a.user_id]=a.days||[]; });
      if (locW.data)   data.locWinner = locW.data.suggestion_id;
      if (accW.data)   data.accWinner = accW.data.suggestion_id;
      if (locked.data) data.locked = { from:locked.data.from_day, to:locked.data.to_day, monthLabel:locked.data.month_label };
      if (edition.data){ data.editionTitle=edition.data.title; data.editionSubtitle=edition.data.subtitle; data.editionNumber=edition.data.number; }

      AppStore._save(data);
    });
  }

  // Patch AppStore write methods para também escrever no Supabase
  var _origSetRsvp = AppStore.setRsvp.bind(AppStore);
  AppStore.setRsvp = function(userId, status) {
    _origSetRsvp(userId, status);
    sb.from('pa_rsvp').upsert({ user_id:userId, status:status, updated_at:new Date().toISOString() }).then();
  };

  var _origAddLocS = AppStore.addLocSuggestion.bind(AppStore);
  AppStore.addLocSuggestion = function(s) {
    _origAddLocS(s);
    sb.from('pa_loc_suggestions').insert({ id:s.id, name:s.name, city:s.city||'', tags:s.tags||[], accent:s.accent||'', by_user:s.by }).then();
  };

  var _origRemLocS = AppStore.removeLocSuggestion.bind(AppStore);
  AppStore.removeLocSuggestion = function(id) {
    _origRemLocS(id);
    sb.from('pa_loc_suggestions').delete().eq('id', id).then();
  };

  var _origSetLocW = AppStore.setLocWinner.bind(AppStore);
  AppStore.setLocWinner = function(id) {
    _origSetLocW(id);
    sb.from('pa_loc_winner').upsert({ id:1, suggestion_id:id }).then();
  };

  var _origAddAccS = AppStore.addAccSuggestion.bind(AppStore);
  AppStore.addAccSuggestion = function(s) {
    _origAddAccS(s);
    sb.from('pa_acc_suggestions').insert({ id:s.id, type:s.type, price:s.price||0, area:s.area||'', link:s.link||'', note:s.note||'', by_user:s.by }).then();
  };

  var _origRemAccS = AppStore.removeAccSuggestion.bind(AppStore);
  AppStore.removeAccSuggestion = function(id) {
    _origRemAccS(id);
    sb.from('pa_acc_suggestions').delete().eq('id', id).then();
  };

  var _origSetAccW = AppStore.setAccWinner.bind(AppStore);
  AppStore.setAccWinner = function(id) {
    _origSetAccW(id);
    sb.from('pa_acc_winner').upsert({ id:1, suggestion_id:id }).then();
  };

  var _origSetAvail = AppStore.setAvailability.bind(AppStore);
  AppStore.setAvailability = function(userId, days) {
    _origSetAvail(userId, days);
    sb.from('pa_availability').upsert({ user_id:userId, days:days, updated_at:new Date().toISOString() }).then();
  };

  var _origSetLocked = AppStore.setLockedDates.bind(AppStore);
  AppStore.setLockedDates = function(from, to, monthLabel) {
    _origSetLocked(from, to, monthLabel);
    sb.from('pa_locked_dates').upsert({ id:1, from_day:from, to_day:to, month_label:monthLabel }).then();
  };

  var _origSetEdition = AppStore.setEdition.bind(AppStore);
  AppStore.setEdition = function(title, subtitle, number) {
    _origSetEdition(title, subtitle, number);
    sb.from('pa_edition').upsert({ id:1, title:title, subtitle:subtitle, number:number||1 }).then();
  };

  // ── VoteStore → Supabase ─────────────────────────────────────
  var _sbVotes = {};

  function loadVotes() {
    return sb.from('pa_votes').select('*').then(function(res) {
      if (res.data) {
        _sbVotes = {};
        res.data.forEach(function(v){ _sbVotes[v.user_id+'::'+v.phase_key]=v.suggestion_id; });
      }
    });
  }

  VoteStore.getVote = function(userId, phaseKey) {
    return _sbVotes[userId+'::'+phaseKey] || null;
  };
  VoteStore.setVote = function(userId, phaseKey, voteId) {
    _sbVotes[userId+'::'+phaseKey] = voteId;
    sb.from('pa_votes').upsert({ user_id:userId, phase_key:phaseKey, suggestion_id:voteId, updated_at:new Date().toISOString() }).then();
  };

  // ── Chat → Supabase Realtime ─────────────────────────────────
  function loadChat() {
    return sb.from('pa_chat').select('*').order('created_at', { ascending:true }).limit(200)
      .then(function(res) {
        if (res.data) {
          _chatCache = res.data.map(function(m){
            return { id:m.id, who:m.who, text:m.text, when:formatWhen(m.created_at) };
          });
          _chatListeners.forEach(function(fn){ fn(_chatCache.slice()); });
        }
      });
  }

  // Override pushChatMessage
  window.pushChatMessage = function(msg) {
    // Optimistic update
    var tempId = msg.id || Date.now();
    _chatCache = (_chatCache||[]).concat([{ id:tempId, who:msg.who, text:msg.text, when:'agora' }]);
    _chatListeners.forEach(function(fn){ fn(_chatCache.slice()); });
    // Persist
    sb.from('pa_chat').insert({ who:msg.who, text:msg.text }).then();
  };

  // Override deleteChatMessage
  window.deleteChatMessage = function(id) {
    _chatCache = (_chatCache||[]).filter(function(m){ return m.id !== id; });
    _chatListeners.forEach(function(fn){ fn(_chatCache.slice()); });
    sb.from('pa_chat').delete().eq('id', id).then();
  };

  // ── Realtime subscriptions ───────────────────────────────────

  // Chat: mensagens novas e apagadas em tempo real
  sb.channel('pa-chat')
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'pa_chat' }, function(payload) {
      var m = payload.new;
      // Evita duplicar a mensagem optimista (mesmo who + texto nos últimos 5s)
      var dupe = (_chatCache||[]).find(function(c){
        return c.who === m.who && c.text === m.text && (typeof c.id !== 'number' || c.id > Date.now()-10000);
      });
      if (dupe) {
        // Substitui o id temporário pelo real
        dupe.id = m.id;
      } else {
        _chatCache = (_chatCache||[]).concat([{ id:m.id, who:m.who, text:m.text, when:'agora' }]);
      }
      _chatListeners.forEach(function(fn){ fn((_chatCache||[]).slice()); });
    })
    .on('postgres_changes', { event:'DELETE', schema:'public', table:'pa_chat' }, function(payload) {
      _chatCache = (_chatCache||[]).filter(function(m){ return m.id !== payload.old.id; });
      _chatListeners.forEach(function(fn){ fn((_chatCache||[]).slice()); });
    })
    .subscribe();

  // App data: sync entre dispositivos em tempo real
  sb.channel('pa-app')
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_rsvp' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_loc_suggestions' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_acc_suggestions' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_availability' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_loc_winner' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_acc_winner' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_locked_dates' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_edition' }, function(){ sbLoadApp(); })
    .on('postgres_changes', { event:'*', schema:'public', table:'pa_users' }, function(){ loadUsers(); })
    .subscribe();

  // ── Arranque: carrega tudo do Supabase ───────────────────────
  Promise.all([loadUsers(), sbLoadApp(), loadVotes(), loadChat()])
    .catch(function(e){ console.error('[PA] Erro ao carregar Supabase:', e); });

  console.log('[PA] Supabase conectado ✓');
})();
