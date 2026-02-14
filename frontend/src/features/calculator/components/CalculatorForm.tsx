import type { Color, Paper, Qty, Size } from "../../../types";

const sizeOptions: Size[] = ["A6", "A5", "A4"];
const paperOptions: Paper[] = ["130g", "170g"];
const colorOptions: Color[] = ["1+0", "4+0", "4+4"];
const qtyOptions: Qty[] = [100, 250, 500, 1000];

interface CalculatorFormProps {
  size: Size;
  paper: Paper;
  color: Color;
  qty: Qty;
  lamination: boolean;
  loading: boolean;
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
  lamination,
  loading,
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
        <span>Size</span>
        <select value={size} onChange={(event) => onSizeChange(event.target.value as Size)}>
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Paper</span>
        <select value={paper} onChange={(event) => onPaperChange(event.target.value as Paper)}>
          {paperOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Color</span>
        <select value={color} onChange={(event) => onColorChange(event.target.value as Color)}>
          {colorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Qty</span>
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
        <span>Lamination</span>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Számolás..." : "Ár kiszámítása"}
      </button>
    </form>
  );
}
