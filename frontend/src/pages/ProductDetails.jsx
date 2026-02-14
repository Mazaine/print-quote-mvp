import { useEffect, useMemo, useState } from "react";

import { REQUIRE_FILE_UPLOAD } from "../config";
import { CalculatorFeature } from "../features/calculator";
import { fetchProductBySlug, uploadFile } from "../services/api";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function createCartId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export default function ProductDetails({ slug, onBack, onGoCart }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteSnapshot, setQuoteSnapshot] = useState(null);
  const [added, setAdded] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const canAddToCart = useMemo(() => {
    if (!quoteSnapshot) return false;
    if (REQUIRE_FILE_UPLOAD && !uploadedFile) return false;
    return true;
  }, [quoteSnapshot, uploadedFile]);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProductBySlug(slug);
        if (mounted) {
          setProduct(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Nem sikerült betölteni a terméket.");
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadedFile(null);
    setUploadError("");
  }

  async function handleUpload() {
    if (!selectedFile) return;

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setUploadError("Csak PDF/JPG/PNG engedélyezett");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("Túl nagy fájl");
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      const result = await uploadFile(selectedFile);
      setUploadedFile(result);
    } catch (err) {
      setUploadedFile(null);
      setUploadError(err instanceof Error ? err.message : "Nem sikerült feltölteni a fájlt.");
    } finally {
      setUploadLoading(false);
    }
  }

  function handleAddToCart() {
    if (!quoteSnapshot) return;
    if (REQUIRE_FILE_UPLOAD && !uploadedFile) return;

    addItem({
      id: createCartId(),
      productSlug: quoteSnapshot.productSlug,
      productName: quoteSnapshot.productName,
      productImageUrl: quoteSnapshot.productImageUrl,
      selections: quoteSnapshot.selections,
      upload: uploadedFile
        ? {
            fileId: uploadedFile.fileId,
            originalName: uploadedFile.originalName,
            url: uploadedFile.url,
            size: uploadedFile.size,
            contentType: uploadedFile.contentType,
          }
        : undefined,
      unitPriceFt: quoteSnapshot.priceFt,
      lineTotalFt: quoteSnapshot.priceFt,
      createdAt: new Date().toISOString(),
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="page">
      <section className="container product-details-container">
        <button className="back-button" onClick={onBack}>
          Vissza a termékekhez
        </button>

        {loading && <p>Betöltés...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && product && (
          <>
            <img
              className="product-details-image"
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.name}
              onError={(event) => {
                if (event.currentTarget.dataset.fallback === "1") return;
                event.currentTarget.src = FALLBACK_IMAGE;
                event.currentTarget.dataset.fallback = "1";
              }}
            />
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            <p className="product-price">{product.basePrice.toLocaleString("hu-HU")} Ft-tól</p>

            <CalculatorFeature
              embedded
              initialProductSlug={product.slug}
              locked={true}
              onQuoteChange={setQuoteSnapshot}
            />

            <section className="upload-section">
              <h3>Nyomdai fájl feltöltése (PDF/JPG/PNG, max 20MB)</h3>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

              {selectedFile && (
                <p className="health">
                  Kiválasztva: <strong>{selectedFile.name}</strong> ({formatBytes(selectedFile.size)})
                </p>
              )}

              <div className="cart-inline-actions">
                <button type="button" disabled={!selectedFile || uploadLoading} onClick={handleUpload}>
                  {uploadLoading ? "Feltöltés..." : "Feltöltés"}
                </button>
              </div>

              {uploadError && <p className="error">{uploadError}</p>}

              {uploadedFile && (
                <p className="success">
                  Feltöltve: {uploadedFile.originalName} -{" "}
                  <a href={uploadedFile.url} target="_blank" rel="noreferrer">
                    Megnyitás
                  </a>
                </p>
              )}
            </section>

            {REQUIRE_FILE_UPLOAD && !uploadedFile && (
              <p className="error">A kosárba helyezéshez fájlfeltöltés szükséges.</p>
            )}

            <div className="cart-inline-actions">
              <button type="button" disabled={!canAddToCart} onClick={handleAddToCart}>
                Kosárba
              </button>
              <button type="button" onClick={onGoCart}>
                Ugrás a kosárhoz
              </button>
              {added && <span className="health">Hozzáadva a kosárhoz.</span>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
