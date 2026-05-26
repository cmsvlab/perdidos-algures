// Perdidos Algures — shared atoms (reused by desktop + mobile).

const D = window.PA_DATA;
const memberById = (id) => D.members.find((m) => m.id === id);
const ADMIN = memberById(D.adminId);

// ─────────────────────────────────────────────────────────────
// Avatar / Stack
// ─────────────────────────────────────────────────────────────
function Avatar({ member, size = 36, ring = false, ringColor }) {
  if (!member) return null;
  const photo = member.photoDataUrl;
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: photo ? `#000 center/cover no-repeat url(${photo})` : member.color,
      color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--pa-display)', fontWeight: 600,
      fontSize: size * 0.38, letterSpacing: 0.2, flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${ringColor || 'var(--pa-bg)'}, 0 0 0 4px ${member.color}` : 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {!photo && member.initials}
      {member.isAdmin && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: size * 0.36, height: size * 0.36, borderRadius: size,
          background: 'var(--pa-accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: size * 0.2, fontWeight: 700,
          boxShadow: '0 0 0 2px var(--pa-bg)',
        }}>★</span>
      )}
    </div>
  );
}

function Stack({ members, max = 4, size = 28, ringColor }) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {members.slice(0, max).map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.32, zIndex: max - i }}>
          <Avatar member={m} size={size} ring ringColor={ringColor} />
        </div>
      ))}
      {members.length > max && (
        <div style={{
          marginLeft: -size * 0.32, width: size, height: size, borderRadius: size,
          background: '#fff', color: 'var(--pa-ink)',
          fontFamily: 'var(--pa-body)', fontWeight: 600, fontSize: size * 0.36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 2px ${ringColor || 'var(--pa-bg)'}`,
        }}>+{members.length - max}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill / Btn / Field
// ─────────────────────────────────────────────────────────────
function Pill({ children, tone = 'default', size = 'md' }) {
  const tones = {
    default: { bg: 'rgba(31,26,20,0.06)', fg: 'var(--pa-ink)' },
    accent:  { bg: 'rgba(217,119,87,0.14)', fg: 'var(--pa-accent)' },
    muted:   { bg: 'transparent', fg: 'var(--pa-muted)' },
    success: { bg: 'rgba(107,142,111,0.16)', fg: '#3d5e44' },
    warn:    { bg: 'rgba(217,119,87,0.20)', fg: '#8a4220' },
    dark:    { bg: 'var(--pa-ink)', fg: '#fff' },
  };
  const sizes = {
    sm: { pad: '3px 8px', fs: 10.5 },
    md: { pad: '4px 10px', fs: 11.5 },
    lg: { pad: '6px 14px', fs: 13 },
  };
  const t = tones[tone], s = sizes[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: s.pad, borderRadius: 999,
      background: t.bg, color: t.fg,
      fontFamily: 'var(--pa-body)', fontSize: s.fs, fontWeight: 500,
      letterSpacing: 0.1, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', icon, style = {}, disabled = false }) {
  const variants = {
    primary: { bg: 'var(--pa-ink)', fg: '#fff', border: 'none' },
    accent:  { bg: 'var(--pa-accent)', fg: '#fff', border: 'none' },
    ghost:   { bg: 'transparent', fg: 'var(--pa-ink)', border: '1px solid var(--pa-line)' },
    soft:    { bg: '#fff', fg: 'var(--pa-ink)', border: '1px solid var(--pa-line)' },
    danger:  { bg: 'transparent', fg: '#8a4220', border: '1px solid #8a4220' },
  };
  const sizes = {
    sm: { pad: '6px 12px', fs: 12, h: 30 },
    md: { pad: '10px 16px', fs: 13.5, h: 40 },
    lg: { pad: '14px 22px', fs: 15, h: 52 },
  };
  const v = variants[variant], s = sizes[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: s.pad, height: s.h, borderRadius: 999,
      background: v.bg, color: v.fg, border: v.border,
      fontFamily: 'var(--pa-body)', fontSize: s.fs, fontWeight: 600,
      letterSpacing: -0.1, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'transform .12s, opacity .12s, background .12s',
      ...style,
    }}>{icon}{children}</button>
  );
}

function Field({ label, placeholder, value, onChange, textarea, prefix }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label style={{ display: 'block' }}>
      {label && <span style={{
        fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2,
        color: 'var(--pa-muted)', textTransform: 'uppercase',
      }}>{label}</span>}
      <div style={{
        marginTop: label ? 6 : 0, padding: '12px 14px', borderRadius: 12,
        background: '#fff', border: '1px solid var(--pa-line)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {prefix && <span style={{ color: 'var(--pa-muted)', fontSize: 14 }}>{prefix}</span>}
        <Tag value={value || ''} onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder} rows={textarea ? 3 : undefined}
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontFamily: 'var(--pa-body)', fontSize: 15, color: 'var(--pa-ink)',
          }} />
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// PhotoSlot — striped placeholder
// ─────────────────────────────────────────────────────────────
function PhotoSlot({ accent = '#c8956d', label, height = 140, radius = 14, style = {} }) {
  return (
    <div style={{
      width: '100%', height, borderRadius: radius, overflow: 'hidden', position: 'relative',
      background: `repeating-linear-gradient(135deg, ${accent}33 0 12px, ${accent}1a 12px 24px)`,
      display: 'flex', alignItems: 'flex-end', padding: 12, ...style,
    }}>
      {label && <span style={{
        fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 0.5,
        color: accent, opacity: 0.85, textTransform: 'uppercase',
      }}>{label}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Logo — wordmark
// ─────────────────────────────────────────────────────────────
function Logo({ size = 18, color = 'var(--pa-ink)', compact = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 6 : 9 }}>
      <svg width={size * 1.5} height={size * 1.5} viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
        <circle cx="14" cy="14" r="12.5" fill="none" stroke={color} strokeWidth="1.3" strokeDasharray="2 3" />
        <path d="M8 17 L12.5 9.5 L18 14 L20.5 10.5" fill="none" stroke="var(--pa-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20.5" cy="10.5" r="2.2" fill="var(--pa-accent)"/>
      </svg>
      {!compact && (
        <span style={{
          fontFamily: 'var(--pa-display)', fontWeight: 600, fontSize: size,
          color, letterSpacing: -0.4,
        }}>perdidos algures</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Calendar — month grid with custom cell renderer.
//   renderCell(day, key) -> ReactNode for cell content (background / dots / etc).
//   onCellClick(day) optional.
//   highlights: array of day numbers (June) for default coloring.
// ─────────────────────────────────────────────────────────────
function Calendar({ grid = D.phase6.monthGrid, monthLabel = D.phase6.monthLabel,
                    renderCell, onCellClick, dense = false }) {
  const dows = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // Seg Ter Qua Qui Sex Sáb Dom
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--pa-display)', fontSize: dense ? 16 : 19, fontWeight: 600, letterSpacing: -0.3 }}>
          {monthLabel}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2].map((i) => (
            <button key={i} style={{
              width: 28, height: 28, borderRadius: 999, border: '1px solid var(--pa-line)',
              background: '#fff', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d={i === 1 ? 'M6.5 2L3 5l3.5 3' : 'M3.5 2L7 5l-3.5 3'}
                  fill="none" stroke="var(--pa-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: dense ? 3 : 6, marginBottom: dense ? 6 : 8,
      }}>
        {dows.map((d, i) => (
          <div key={i} style={{
            fontFamily: 'var(--pa-mono)', fontSize: 10, letterSpacing: 1.2,
            color: 'var(--pa-muted)', textAlign: 'center', textTransform: 'uppercase',
            fontWeight: 500,
          }}>{d}</div>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: dense ? 3 : 6,
      }}>
        {grid.map((day, i) => {
          const empty = day === null;
          return (
            <button key={i} disabled={empty || !onCellClick}
              onClick={() => day && onCellClick && onCellClick(day)}
              style={{
                aspectRatio: dense ? '1.4 / 1' : '1 / 1',
                border: 'none', padding: 0,
                background: 'transparent',
                cursor: day && onCellClick ? 'pointer' : 'default',
                position: 'relative',
              }}>
              {!empty && (renderCell ? renderCell(day, i) : (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 8,
                  background: '#fff', border: '1px solid var(--pa-line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--pa-body)', fontSize: dense ? 12 : 14, fontWeight: 500,
                  color: 'var(--pa-ink)',
                }}>{day}</div>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Tiny status-bar shim for mobile artboards (iOS frame already has one,
// but our app body draws under it — this just inset).
function MobileTopInset() {
  return <div style={{ height: 36 }} />;
}

Object.assign(window, {
  D, memberById, ADMIN,
  Avatar, Stack, Pill, Btn, Field, PhotoSlot, Logo, Calendar, MobileTopInset,
});
