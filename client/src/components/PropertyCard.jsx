function PropertyCard({ property }) {
  return (
    <div className="property-card">
    <img
  src={
    property.image
      ? property.image
      : process.env.PUBLIC_URL + "/property-default.jpg"
  }
  alt="property"
  style={{ width: "80px", height: "60px", objectFit: "cover" }}
/>




      <div className="property-info">
        <h3>{property.title}</h3>
        <p>{property.location}</p>

        <div className="details">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.area} sqft</span>
        </div>

        <div className="price">₹ {property.price}</div>
      </div>
    </div>
  );
}

export default PropertyCard;
