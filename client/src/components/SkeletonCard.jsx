const SkeletonCard = () => {
  return (
    <div className="dashboard-card skeleton">
      <div className="card-icon skeleton-box"></div>

      <div className="card-content">
        <div className="skeleton-line big"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line small"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
