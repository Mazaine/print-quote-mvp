import type { Color, Paper, Qty, Size } from "../../../types";

interface CalculatorFormProps {
  size: Size;
  paper: Paper;
  color: Color;
  qty: Qty;
  sizeOptions: Size[];
  paperOptions: Paper[];
  colorOptions: Color[];
  qtyOptions: Qty[];
  lamination: boolean;
  loading: boolean;
  submitDisabled: boolean;
  onSizeChange: (value: Size) => void;
  onPaperChange: (value: Paper) => void;
  onColorChange: (value: Color) => void;
  onQtyChange: (value: Qty) => void;
  onLaminationChange: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function CalculatorForm({
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
  onSizeChange,
  onPaperChange,
  onColorChange,
  onQtyChange,
  onLaminationChange,
  onSubmit
}: CalculatorFormProps) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        <span>Méret</span>
        <select value={size} onChange={(event) => onSizeChange(event.target.value as Size)}>
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Papír</span>
        <select value={paper} onChange={(event) => onPaperChange(event.target.value as Paper)}>
          {paperOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Szín</span>
        <select value={color} onChange={(event) => onColorChange(event.target.value as Color)}>
          {colorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Mennyiség</span>
        <select value={qty} onChange={(event) => onQtyChange(Number(event.target.value) as Qty)}>
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
