import React from "react";

type PercentageRangeInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const PercentageRangeInput: React.FC<PercentageRangeInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-32"
      />
      <span className="text-sm text-slate-600">{Math.round(value * 100)}%</span>
    </div>
  );
};

export default PercentageRangeInput;
