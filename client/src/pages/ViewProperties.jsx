import AppLayout from "../components/AppLayout";
import API_BASE from '../config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { getThumbImage } from "../utils/typeImages";

function ViewProperties() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Abort controller to clean up fetch on unmount
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_BASE}/api/properties`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const diff = new Date(b.createdAt) - new Date(a.createdAt);
          if (diff !== 0) return diff;
          return b._id > a._id ? -1 : 1;
        });
        setProperties(sorted);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, typeFilter, minPrice, maxPrice, bedroomsFilter]);

  // DELETE PROPERTY
  const handleDelete = async (id) => {
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    setActionLoading(true);
    try {
      await fetch(`${API_BASE}/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProperties(properties.filter((p) => p._id !== id));
      toast("Property deleted", "success");
    } catch {
      toast("Failed to delete property", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // EDIT PROPERTY — navigate to full edit page
  const handleEdit = (property) => {
    navigate(`/edit-property/${property._id}`);
  };

  // SEARCH + FILTER
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "All" || p.status === filter;
    const matchesType = typeFilter === "All" || p.type === typeFilter;
    const matchesMin = !minPrice || p.price >= Number(minPrice);
    const matchesMax = !maxPrice || p.price <= Number(maxPrice);
    const matchesBedrooms = !bedroomsFilter || p.bedrooms >= Number(bedroomsFilter);
    return matchesSearch && matchesStatus && matchesType && matchesMin && matchesMax && matchesBedrooms;
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <AppLayout>
      {confirmId && (
        <ConfirmDialog
          message="This will permanently delete the property. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

        <h2>My Properties</h2>

        {/* SEARCH + FILTER */}
        <div className="filter-bar" style={{ flexWrap: "wrap", gap: "8px" }}>
          <input
            className="search-input"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
          </select>

          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option>Apartment</option>
            <option>House</option>
            <option>Villa</option>
            <option>Flat</option>
          </select>

          <input
            className="search-input"
            style={{ width: "110px" }}
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            className="search-input"
            style={{ width: "110px" }}
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <input
            className="search-input"
            style={{ width: "110px" }}
            type="number"
            placeholder="Min Beds"
            value={bedroomsFilter}
            onChange={(e) => setBedroomsFilter(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <table className="property-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Property Info</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Loading properties...
                </td>
              </tr>
            ) : paginatedProperties.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No properties found
                </td>
              </tr>
            ) : (
              paginatedProperties.map((p) => (
                <tr key={p._id} style={{cursor:"pointer"}} onClick={() => navigate(`/properties/${p._id}`)}>
                  <td onClick={e => e.stopPropagation()}>
                    <img
                      src={getThumbImage(p)}
                      className="table-img"
                      alt="property"
                    />
                  </td>

                  <td>
                    <strong>{p.title}</strong>
                    <p className="muted">{p.location}</p>

                    <div className="meta">
                      <span>🛏 {p.bedrooms || 0}</span>
                      <span>🛁 {p.bathrooms || 0}</span>
                      <span>📐 {p.area || 0} sqft</span>
                    </div>

                    <small className="date">
                      Added on{" "}
                      {p.createdAt
                        ? new Date(p.createdAt).toDateString()
                        : "—"}
                    </small>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        p.published === false ? "pending" : "published"
                      }`}
                    >
                      {p.published === false ? "Pending" : "Published"}
                    </span>

                    {p.featured && (
                      <span className="badge featured">Featured</span>
                    )}
                  </td>

                  <td className="price-cell">
                  ₹ {Number(p.price || 0).toLocaleString("en-IN")}
                    <br />
                    <small>{p.status || "—"}</small>
                  </td>

                  <td>
                    <button
                      className="action view"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/properties/${p._id}`);
                      }}
                    >
                      View
                    </button>

                    <button
                      className="action edit"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                    >
                      {actionLoading ? "Saving..." : "Edit"}
                    </button>

                    <button
                      className="action delete"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p._id);
                      }}
                    >
                      {actionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </AppLayout>
  );
}

export default ViewProperties;

