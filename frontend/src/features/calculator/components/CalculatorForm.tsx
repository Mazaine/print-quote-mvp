interface CalculatorFormProps {
  productSlug: string;
  productOptions: Array<{ slug: string; name: string }>;
  size: string;
  paper: string;
  color: string;
  qty: number;
  sizeOptions: string[];
  paperOptions: string[];
  colorOptions: string[];
  qtyOptions: number[];
  lamination: boolean;
  loading: boolean;
  submitDisabled: boolean;
  showProductSelect?: boolean;
  onProductChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onPaperChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onQtyChange: (value: number) => void;
  onLaminationChange: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function CalculatorForm({
  productSlug,
  productOptions,
  size,
  paper,
  color,
  qty,
  sizeOptions,
  paperOptions,
  colorOptions,
  qtyOptions,
  lamination,
  loading,
  submitDisabled,
  showProductSelect = true,
  onProductChange,
  onSizeChange,
  onPaperChange,
  onColorChange,
  onQtyChange,
  onLaminationChange,
  onSubmit
}: CalculatorFormProps) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {showProductSelect && (
        <label>
          <span>Termék</span>
          <select value={productSlug} onChange={(event) => onProductChange(event.target.value)}>
            {productOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        <span>Méret</span>
        <select value={size} onChange={(event) => onSizeChange(event.target.value)}>
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Papír</span>
        <select value={paper} onChange={(event) => onPaperChange(event.target.value)}>
          {paperOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Szín</span>
        <select value={color} onChange={(event) => onColorChange(event.target.value)}>
          {colorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Mennyiség</span>
        <select value={qty} onChange={(event) => onQtyChange(Number(event.target.value))}>
          {qtyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="checkbox-row">
        <input type="checkbox" checked={lamination} onChange={(event) => onLaminationChange(event.target.checked)} />
        <span>Fóliázás</span>
      </label>

      <button type="submit" disabled={loading || submitDisabled}>
        {loading ? "Betöltés..." : "Ár kiszámítása"}
      </button>
    </form>
  );
}
