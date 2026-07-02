import CountUp from "react-countup";

const DashboardCard = ({ title, value, icon, color, subtitle }) => {
  const isNumber = typeof value === "number";

  return (
    <div className={`dashboard-card ${color}`}>
      <div className="card-icon">{icon}</div>

      <div className="card-content">
        <h2>
          {isNumber ? (
            <CountUp start={0} end={value} duration={1.2} />
          ) : (
            value
          )}
        </h2>

        <p>{title}</p>
        <span>{subtitle}</span>
      </div>
    </div>
  );
};

export default DashboardCard;
