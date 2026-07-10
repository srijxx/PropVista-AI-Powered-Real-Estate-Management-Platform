// AppLayout — thin wrapper only.
// Each page manages its own sidebar + topbar via the ndb-root / ndb-sidebar layout.
// Do NOT add a global navbar here — pages already have their own navigation.

function AppLayout({ children }) {
  return <>{children}</>;
}

export default AppLayout;
