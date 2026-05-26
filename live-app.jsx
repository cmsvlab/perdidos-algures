// Perdidos Algures — Live app entry. Boots the auth gate and routes the
// authenticated user into the desktop or mobile shell based on viewport.
// This is the default landing UI when there is no ?canvas=1 query param.

const { useState: lUseState, useEffect: lUseEffect } = React;

function useViewport() {
  const [w, setW] = lUseState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  lUseEffect(() => {
    const r = () => setW(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  return w;
}

// Convert an auth session into a member-shaped object the rest of the app
// expects. Admin login maps onto the "miguel" mock member so all the
// hard-coded references (D.adminId, D.phase1.state.miguel, etc) keep working.
function sessionToMember(session) {
  if (!session) return null;
  if (session.isAdmin) {
    return { id: 'miguel', name: session.name, initials: 'M', color: '#1f1a14', isAdmin: true, photoDataUrl: session.photoDataUrl };
  }
  return {
    id: session.id,
    name: session.name,
    initials: session.initials,
    color: session.color,
    photoDataUrl: session.photoDataUrl,
    isAdmin: false,
  };
}

function LiveApp() {
  const auth = useAuth();
  const w = useViewport();
  const isDesktop = w >= 1100;

  if (!auth.user) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <AuthGate auth={auth} narrow={!isDesktop} />
      </div>
    );
  }

  const me = sessionToMember(auth.user);
  const viewAs = auth.user.isAdmin ? 'admin' : 'member';
  // Do NOT pass phase — let DesktopShell/MobileApp manage phase via localStorage
  // so admin navigation persists and isn't frozen.

  if (isDesktop) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <DesktopShell viewAs={viewAs} liveUser={me} onLogout={auth.logout} />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'var(--pa-bg)', display: 'flex', flexDirection: 'column' }}>
        <MobileApp viewAs={viewAs} liveUser={me} onLogout={auth.logout} />
      </div>
    </div>
  );
}

Object.assign(window, { LiveApp, useViewport, sessionToMember });
