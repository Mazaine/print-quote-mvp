const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80";

export default function ProductCard({ product, onOpen }) {
  function handleError(event) {
    if (event.currentTarget.dataset.fallback === "1") return;
    event.currentTarget.src = FALLBACK_IMAGE;
    event.currentTarget.dataset.fallback = "1";
  }

  return (
    <article className="product-card product-card-clickable" onClick={() => onOpen(product.slug)}>
      <img
        className="product-image"
        src={product.imageUrl || FALLBACK_IMAGE}
        alt={product.name}
        onError={handleError}
      />
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">{product.basePrice.toLocaleString("hu-HU")} Ft-tól</p>
    </article>
  );
}
