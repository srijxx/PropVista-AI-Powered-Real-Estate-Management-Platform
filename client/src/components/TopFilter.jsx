function TopFilter({ setFilter }) {
  return (
    <div style={styles.container}>
      <button onClick={() => setFilter("buy")}>Buy</button>
      <button onClick={() => setFilter("rent")}>Rent</button>

      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="2">2 Beds</option>
        <option value="3">3 Beds</option>
        <option value="4">4 Beds</option>
      </select>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
};

export default TopFilter;
