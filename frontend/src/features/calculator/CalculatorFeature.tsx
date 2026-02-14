import { useEffect, useMemo, useState } from "react";

import { calculateQuote, getCalculatorOptions, getHealth } from "./api/calculatorApi";
import { CalculatorForm } from "./components/CalculatorForm";
import { QuoteResult } from "./components/QuoteResult";
import type {
  CalculatorCombination,
  CalculatorProductOptions,
  Color,
  Paper,
  Qty,
  QuoteResponse,
  Size,
} from "../../types";

function uniqueValues<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function CalculatorFeature() {
  const [size, setSize] = useState<Size>("A6");
  const [paper, setPaper] = useState<Paper>("130g");
  const [color, setColor] = useState<Color>("1+0");
  const [qty, setQty] = useState<Qty>(100);
  const [lamination, setLamination] = useState(false);

  const [catalog, setCatalog] = useState<CalculatorProductOptions | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

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
    let isMounted = true;

    getHealth()
      .then((result) => {
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

    getCalculatorOptions()
      .then((result) => {
        if (!isMounted) return;

        const flyer = result.products.find((product) => product.product_code === "flyer") ?? null;
        setCatalog(flyer);

        if (!flyer) {
          setCatalogError("Nem érhetőek el a kalkulátor opciók.");
          return;
        }

        if (flyer.options.size.length > 0) setSize(flyer.options.size[0]);
        if (flyer.options.paper.length > 0) setPaper(flyer.options.paper[0]);
        if (flyer.options.color.length > 0) setColor(flyer.options.color[0]);
        if (flyer.options.qty.length > 0) setQty(flyer.options.qty[0]);
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

  const validCombinations = useMemo<CalculatorCombination[]>(() => {
    return catalog?.valid_combinations ?? [];
  }, [catalog]);

  const availableSizes = useMemo<Size[]>(() => {
    return uniqueValues(
      validCombinations
        .filter((combo) => combo.paper === paper && combo.color === color && combo.qty === qty)
        .map((combo) => combo.size)
    );
  }, [validCombinations, paper, color, qty]);

  const availablePapers = useMemo<Paper[]>(() => {
    return uniqueValues(
      validCombinations
        .filter((combo) => combo.size === size && combo.color === color && combo.qty === qty)
        .map((combo) => combo.paper)
    );
  }, [validCombinations, size, color, qty]);

  const availableColors = useMemo<Color[]>(() => {
    return uniqueValues(
      validCombinations
        .filter((combo) => combo.size === size && combo.paper === paper && combo.qty === qty)
        .map((combo) => combo.color)
    );
  }, [validCombinations, size, paper, qty]);

  const availableQtys = useMemo<Qty[]>(() => {
    return uniqueValues(
      validCombinations
        .filter((combo) => combo.size === size && combo.paper === paper && combo.color === color)
        .map((combo) => combo.qty)
    );
  }, [validCombinations, size, paper, color]);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(size)) {
      setSize(availableSizes[0]);
    }
  }, [availableSizes, size]);

  useEffect(() => {
    if (availablePapers.length > 0 && !availablePapers.includes(paper)) {
      setPaper(availablePapers[0]);
    }
  }, [availablePapers, paper]);

  useEffect(() => {
    if (availableColors.length > 0 && !availableColors.includes(color)) {
      setColor(availableColors[0]);
    }
  }, [availableColors, color]);

  useEffect(() => {
    if (availableQtys.length > 0 && !availableQtys.includes(qty)) {
      setQty(availableQtys[0]);
    }
  }, [availableQtys, qty]);

  const hasPriceForSelection = useMemo(() => {
    return validCombinations.some(
      (combo) =>
        combo.size === size && combo.paper === paper && combo.color === color && combo.qty === qty
    );
  }, [validCombinations, size, paper, color, qty]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPriceForSelection || catalogLoading || catalogError) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await calculateQuote({ size, paper, color, qty, lamination });
      setQuote(response);
    } catch {
      setError("Váratlan hiba történt.");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled = catalogLoading || !!catalogError || !hasPriceForSelection;

  return (
    <main className="page">
      <section className="container">
        <header className="header">
          <h1>Árkalkulátor</h1>
          <p className="health">
            API állapot: <strong>{healthStatus}</strong>
          </p>
        </header>

        {catalogLoading && <p>Betöltés...</p>}
        {catalogError && <p className="error">{catalogError}</p>}

        {!catalogLoading && !catalogError && (
          <CalculatorForm
            size={size}
            paper={paper}
            color={color}
            qty={qty}
            sizeOptions={availableSizes}
            paperOptions={availablePapers}
            colorOptions={availableColors}
            qtyOptions={availableQtys}
            lamination={lamination}
            loading={loading}
            submitDisabled={submitDisabled}
            onSizeChange={setSize}
            onPaperChange={setPaper}
            onColorChange={setColor}
            onQtyChange={setQty}
            onLaminationChange={setLamination}
            onSubmit={onSubmit}
          />
        )}

        {!catalogLoading && !catalogError && !hasPriceForSelection && (
          <p className="error">Nincs ár a kiválasztott kombinációra.</p>
        )}

        {error && <p className="error">{error}</p>}

        {quote && <QuoteResult quote={quote} formatHuf={formatHuf} />}
      </section>
    </main>
  );
}
