// Perdidos Algures — group chat: store + panel + mobile bubble.
// Messages live in safeStore (localStorage with in-memory fallback).
// Seeded with a few in-character messages so the panel isn't empty on first run.

const { useState: cUseState, useEffect: cUseEffect, useRef: cUseRef } = React;

const CHAT_KEY = 'pa-chat-14';

const CHAT_SEED = [
  { id: 1, who: 'miguel',  text: 'Bora, malta. 14ª edição arrancou.',                          when: 'há 12 dias' },
  { id: 2, who: 'matilde', text: 'Boa! Já sabia que era para sair daqui ✈️',                  when: 'há 12 dias' },
  { id: 3, who: 'tiago',   text: 'Eu meto Samil. Casa partilhada bonita, a 200m da praia.',    when: 'há 5 dias' },
  { id: 4, who: 'rita',    text: 'Cíes em junho deve ser brutal',                              when: 'há 4 dias' },
  { id: 5, who: 'joao',    text: 'E se misturarmos? Dormir em Bouzas, dia nas ilhas',          when: 'há 3 dias' },
  { id: 6, who: 'matilde', text: 'Sim please',                                                  when: 'há 3 dias' },
  { id: 7, who: 'ines',    text: 'O preço por noite tem de ficar abaixo dos 70€ pls',          when: 'há 2 dias' },
  { id: 8, who: 'tiago',   text: 'A Casa do Faro fica em 65, vejam o link 👀',                 when: 'há 2 dias' },
  { id: 9, who: 'miguel',  text: 'Empate apertado entre Casa do Faro e Glamping. Vou decidir.', when: 'há 4h' },
];

const ChatStore = {
  load() {
    try {
      const raw = safeStore.get(CHAT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return CHAT_SEED.slice();
  },
  save(messages) { safeStore.set(CHAT_KEY, JSON.stringify(messages)); },
};

// Hook: shared chat state. Lives on window so all panels (desktop rail +
// mobile sheet) stay in sync within a single page lifetime.
const _chatListeners = new Set();
let _chatCache = null;

function getChatMessages() {
  if (!_chatCache) _chatCache = ChatStore.load();
  return _chatCache;
}

function pushChatMessage(msg) {
  _chatCache = [...getChatMessages(), msg];
  ChatStore.save(_chatCache);
  _chatListeners.forEach((fn) => fn(_chatCache.slice()));
}

function deleteChatMessage(id) {
  _chatCache = getChatMessages().filter((m) => m.id !== id);
  ChatStore.save(_chatCache);
  _chatListeners.forEach((fn) => fn(_chatCache.slice()));
}

// Cross-tab / cross-window sync via storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CHAT_KEY) {
      try {
        _chatCache = e.newValue ? JSON.parse(e.newValue) : CHAT_SEED.slice();
        _chatListeners.forEach((fn) => fn(_chatCache.slice()));
      } catch {}
    }
  });
}

function useChat() {
  const [msgs, setMsgs] = cUseState(() => getChatMessages().slice());
  cUseEffect(() => {
    // Re-sync on mount in case another tab changed messages while this was unmounted
    const current = getChatMessages();
    setMsgs(current.slice());
    _chatListeners.add(setMsgs);
    return () => _chatListeners.delete(setMsgs);
  }, []);
  return msgs;
}

// ─────────────────────────────────────────────────────────────
// ChatPanel — message list + composer. Fills its container.
// ─────────────────────────────────────────────────────────────
function ChatPanel({ me, compact = false }) {
  const messages = useChat();
  const [text, setText] = cUseState('');
  const [hoveredId, setHoveredId] = cUseState(null);
  const scrollRef = cUseRef(null);

  cUseEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    pushChatMessage({
      id: Date.now(),
      who: me.id,
      text: t,
      when: 'agora',
    });
    setText('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: compact ? '6px 14px' : '8px 4px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((m) => {
          const author = memberById(m.who) || { name: m.who, color: 'var(--pa-muted)', initials: '?' };
          const mine = m.who === me.id;
          const isHovered = hoveredId === m.id;
          return (
            <div key={m.id}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex', gap: 8,
                flexDirection: mine ? 'row-reverse' : 'row',
                position: 'relative',
              }}>
              <Avatar member={author} size={compact ? 22 : 26} />
              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3,
                  flexDirection: mine ? 'row-reverse' : 'row',
                }}>
                  <span style={{ fontFamily: 'var(--pa-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--pa-ink)' }}>
                    {mine ? 'tu' : author.name}
                    {author.isAdmin && <span style={{ color: 'var(--pa-accent)', marginLeft: 4 }}>★</span>}
                  </span>
                  <span style={{ fontFamily: 'var(--pa-mono)', fontSize: 9.5, color: 'var(--pa-muted)' }}>{m.when}</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, flexDirection: mine ? 'row' : 'row-reverse' }}>
                  {/* Admin delete button */}
                  {me.isAdmin && isHovered && (
                    <button
                      onClick={() => deleteChatMessage(m.id)}
                      title="Apagar mensagem"
                      style={{
                        width: 20, height: 20, borderRadius: 999, border: 'none',
                        background: 'rgba(138,66,32,0.15)', color: '#8a4220',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, padding: 0,
                        fontSize: 11, fontWeight: 700, lineHeight: 1,
                      }}>×</button>
                  )}
                  <div style={{
                    padding: '8px 12px',
                    background: mine ? 'var(--pa-ink)' : '#fff',
                    color: mine ? '#fff' : 'var(--pa-ink)',
                    borderRadius: 12,
                    borderTopLeftRadius: mine ? 12 : 4,
                    borderTopRightRadius: mine ? 4 : 12,
                    border: mine ? 'none' : '1px solid var(--pa-line)',
                    fontFamily: 'var(--pa-body)', fontSize: 13, lineHeight: 1.4,
                    wordWrap: 'break-word', whiteSpace: 'pre-wrap',
                  }}>{m.text}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* composer */}
      <div style={{
        padding: compact ? '10px 14px 14px' : '10px 4px 4px',
        borderTop: '1px solid var(--pa-line)',
        display: 'flex', alignItems: 'flex-end', gap: 8, flexShrink: 0,
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Escreve algo..."
            rows={1}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 18,
              background: '#fff', border: '1px solid var(--pa-line)',
              fontFamily: 'var(--pa-body)', fontSize: 13.5, color: 'var(--pa-ink)',
              outline: 'none', resize: 'none', boxSizing: 'border-box',
              maxHeight: 80, lineHeight: 1.4,
            }}
          />
        </div>
        <button onClick={send} disabled={!text.trim()} style={{
          width: 38, height: 38, borderRadius: 999, border: 'none',
          background: text.trim() ? 'var(--pa-accent)' : 'rgba(31,26,20,0.06)',
          color: text.trim() ? '#fff' : 'var(--pa-muted)',
          cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7L13 2.5 9 13l-2-5z" fill="currentColor"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile chat sheet — slides up from bottom on tap
// ─────────────────────────────────────────────────────────────
function MobileChatSheet({ me, open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '85%',
        background: 'var(--pa-bg)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          padding: '14px 22px 12px',
          borderBottom: '1px solid var(--pa-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--pa-display)', fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
              Chat do grupo
            </div>
            <div style={{ fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1, color: 'var(--pa-muted)' }}>
              14ª · Tropa Mediterrânica
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999, border: 'none',
            background: 'rgba(31,26,20,0.06)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="var(--pa-ink)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <ChatPanel me={me} compact />
      </div>
    </div>
  );
}

Object.assign(window, {
  ChatStore, ChatPanel, MobileChatSheet,
  useChat, getChatMessages, pushChatMessage, deleteChatMessage,
});
