import Notifications from "./Notifications";

function Topbar() {
  return (
    <div className="pv-topbar">
      <div className="pv-topbar-left">
        <h2>PropVista</h2>
      </div>
      <div className="pv-topbar-right">
        <Notifications />
      </div>
    </div>
  );
}

export default Topbar;
