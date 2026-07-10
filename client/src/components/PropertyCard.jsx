import { getTypeImage } from "../utils/typeImages";

function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <img
        src={getTypeImage(property)}
        alt={property.title || "property"}
        style={{ width: "80px", height: "60px", objectFit: "cover" }}
        onError={e => { e.target.onerror = null; e.target.src = getTypeImage({ type: property.type }); }}
      />

      <div className="property-info">
        <h3>{property.title}</h3>
        <p>{property.location}</p>

        <div className="details">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.area} sqft</span>
        </div>

        <div className="price">₹ {Number(property.price || 0).toLocaleString("en-IN")}</div>
      </div>
    </div>
  );
}

export default PropertyCard;
