// AppLayout — scrollable passthrough wrapper.
// Pages using ndb-root/ndb-sidebar handle their own scroll via ndb-main.
// Pages that use AppLayout directly (PropertyDetails, Settings, etc.) get a
// full-height scrollable container here.

function AppLayout({ children, noScroll }) {
  if (noScroll) return <>{children}</>;
  return (
    <div style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
      {children}
    </div>
  );
}

export default AppLayout;
