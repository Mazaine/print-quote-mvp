import { useEffect, useMemo, useState } from "react";

import { fetchCatalog, fetchHealth, requestQuote } from "../../services/api.js";
import { CalculatorForm } from "./components/CalculatorForm";
import { QuoteResult } from "./components/QuoteResult";
import type { CalculatorCatalogResponse, CatalogCombination, CatalogProduct, QuoteResponse } from "../../types";

interface CalculatorFeatureProps {
  initialProductSlug?: string;
  embedded?: boolean;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values));
}

function filterCombinations(
  combos: CatalogCombination[],
  selected: { size: string; paper: string; color: string; qty: number }
): CatalogCombination[] {
  return combos.filter((combo) => {
    if (selected.size && combo.size !== selected.size) return false;
    if (selected.paper && combo.paper !== selected.paper) return false;
    if (selected.color && combo.color !== selected.color) return false;
    if (selected.qty > 0 && combo.quantity !== selected.qty) return false;
    return true;
  });
}

function allowedSizes(product: CatalogProduct | null): string[] {
  if (!product) return [];
  if (product.product_code === "business_card") {
    return ["90x50"];
  }
  return product.options.sizes;
}

export function CalculatorFeature({ initialProductSlug, embedded = false }: CalculatorFeatureProps) {
  const [catalog, setCatalog] = useState<CalculatorCatalogResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [productSlug, setProductSlug] = useState(initialProductSlug ?? "");
  const [size, setSize] = useState("");
  const [paper, setPaper] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(0);
  const [lamination, setLamination] = useState(false);

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("ellenőrzés...");

  const formatHuf = useMemo(
    () =>
      new Intl.NumberFormat("hu-HU", {
        maximumFractionDigits: 0
      }),
    []
  );

  useEffect(() => {
    if (initialProductSlug) {
      setProductSlug(initialProductSlug);
    }
  }, [initialProductSlug]);

  useEffect(() => {
    let isMounted = true;

    fetchHealth()
      .then((result: { status?: string }) => {
        if (isMounted) {
          setHealthStatus(result.status ?? "rendben");
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus("nem elérhető");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setCatalogLoading(true);
    setCatalogError(null);

    fetchCatalog()
      .then((result: CalculatorCatalogResponse) => {
        if (!isMounted) return;
        setCatalog(result);

        const firstProduct = result.products[0];
        if (!firstProduct) {
          setCatalogError("Nincs elérhető termék a kalkulátorhoz.");
          return;
        }

        setProductSlug((current) => current || firstProduct.slug);
      })
      .catch(() => {
        if (isMounted) {
          setCatalogError("Nem sikerült betölteni a kalkulátor opciókat.");
          setCatalog(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setCatalogLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const products = catalog?.products ?? [];

  const selectedProduct = useMemo<CatalogProduct | null>(() => {
    if (!products.length) return null;
    return products.find((product) => product.slug === productSlug) ?? products[0];
  }, [products, productSlug]);

  const productOptions = useMemo(
    () => products.map((product) => ({ slug: product.slug, name: product.name })),
    [products]
  );

  const combinations = useMemo<CatalogCombination[]>(() => {
    return selectedProduct?.validCombinations ?? [];
  }, [selectedProduct]);

  const sizeBase = useMemo(() => allowedSizes(selectedProduct), [selectedProduct]);

  const sizeOptions = useMemo(() => {
    if (!selectedProduct) return [];
    if (!combinations.length) return sizeBase;

    const filtered = filterCombinations(combinations, { size: "", paper, color, qty });
    const dynamic = uniqueStrings(filtered.map((combo) => combo.size));

    if (selectedProduct.product_code === "business_card") return ["90x50"];
    return dynamic.length ? dynamic : sizeBase;
  }, [selectedProduct, combinations, sizeBase, paper, color, qty]);

  const paperOptions = useMemo(() => {
    if (!selectedProduct) return [];
    if (!combinations.length) return selectedProduct.options.papers;

    const filtered = filterCombinations(combinations, { size, paper: "", color, qty });
    const dynamic = uniqueStrings(filtered.map((combo) => combo.paper));
    return dynamic.length ? dynamic : selectedProduct.options.papers;
  }, [selectedProduct, combinations, size, color, qty]);

  const colorOptions = useMemo(() => {
    if (!selectedProduct) return [];
    if (!combinations.length) return selectedProduct.options.colors;

    const filtered = filterCombinations(combinations, { size, paper, color: "", qty });
    const dynamic = uniqueStrings(filtered.map((combo) => combo.color));
    return dynamic.length ? dynamic : selectedProduct.options.colors;
  }, [selectedProduct, combinations, size, paper, qty]);

  const qtyOptions = useMemo(() => {
    if (!selectedProduct) return [];
    if (!combinations.length) return selectedProduct.options.quantities;

    const filtered = filterCombinations(combinations, { size, paper, color, qty: 0 });
    const dynamic = uniqueNumbers(filtered.map((combo) => combo.quantity));
    return dynamic.length ? dynamic : selectedProduct.options.quantities;
  }, [selectedProduct, combinations, size, paper, color]);

  useEffect(() => {
    if (!selectedProduct) return;
    setQuote(null);

    const initialSizes = allowedSizes(selectedProduct);
    const nextSize = initialSizes[0] ?? "";
    const nextPaper = selectedProduct.options.papers[0] ?? "";
    const nextColor = selectedProduct.options.colors[0] ?? "";
    const nextQty = selectedProduct.options.quantities[0] ?? 0;

    setSize(nextSize);
    setPaper(nextPaper);
    setColor(nextColor);
    setQty(nextQty);
  }, [selectedProduct?.slug]);

  useEffect(() => {
    if (sizeOptions.length && !sizeOptions.includes(size)) {
      setSize(sizeOptions[0]);
    }
  }, [sizeOptions, size]);

  useEffect(() => {
    if (paperOptions.length && !paperOptions.includes(paper)) {
      setPaper(paperOptions[0]);
    }
  }, [paperOptions, paper]);

  useEffect(() => {
    if (colorOptions.length && !colorOptions.includes(color)) {
      setColor(colorOptions[0]);
    }
  }, [colorOptions, color]);

  useEffect(() => {
    if (qtyOptions.length && !qtyOptions.includes(qty)) {
      setQty(qtyOptions[0]);
    }
  }, [qtyOptions, qty]);

  const hasPriceForSelection = useMemo(() => {
    return combinations.some(
      (combo) =>
        combo.size === size && combo.paper === paper && combo.color === color && combo.quantity === qty
    );
  }, [combinations, size, paper, color, qty]);

  const canCalculate = !!selectedProduct && hasPriceForSelection;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canCalculate || catalogLoading || catalogError) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        product_code: selectedProduct?.product_code,
        size,
        paper,
        color,
        qty,
        lamination,
      };

      const response = await requestQuote(payload);
      setQuote(response as QuoteResponse);
    } catch {
      setError("Váratlan hiba történt.");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled = catalogLoading || !!catalogError || !canCalculate;

  const content = (
    <>
      {catalogLoading && <p>Betöltés...</p>}
      {catalogError && <p className="error">{catalogError}</p>}

      {!catalogLoading && !catalogError && selectedProduct && (
        <CalculatorForm
          productSlug={productSlug}
          productOptions={productOptions}
          size={size}
          paper={paper}
          color={color}
          qty={qty}
          sizeOptions={sizeOptions}
          paperOptions={paperOptions}
          colorOptions={colorOptions}
          qtyOptions={qtyOptions}
          lamination={lamination}
          loading={loading}
          submitDisabled={submitDisabled}
          onProductChange={setProductSlug}
          onSizeChange={setSize}
          onPaperChange={setPaper}
          onColorChange={setColor}
          onQtyChange={setQty}
          onLaminationChange={setLamination}
          onSubmit={onSubmit}
        />
      )}

      {!catalogLoading && !catalogError && !canCalculate && (
        <p className="error">Nincs beállított ár ehhez a kombinációhoz.</p>
      )}

      {error && <p className="error">{error}</p>}

      {quote && <QuoteResult quote={quote} formatHuf={formatHuf} />}
    </>
  );

  if (embedded) {
    return (
      <section className="calculator-embed">
        <h2 className="calculator-embed-title">Árkalkulátor</h2>
        {content}
      </section>
    );
  }

  return (
    <main className="page">
      <section className="container">
        <header className="header">
          <h1>Árkalkulátor</h1>
          <p className="health">
            API állapot: <strong>{healthStatus}</strong>
          </p>
        </header>
        {content}
      </section>
    </main>
  );
}
