export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">{product.basePrice.toLocaleString("hu-HU")} Ft-tól</p>
    </article>
  );
}
