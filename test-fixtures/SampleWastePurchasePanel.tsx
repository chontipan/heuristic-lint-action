import React, { useState } from 'react';

export const SampleWastePurchasePanel = () => {
  const [weight, setWeight] = useState(0);

  const handleExport = async () => {
    // Defect H1: silent unhandled async export
    const res = await fetch('/api/reports/export');
    const data = await res.json();
  };

  const handleDeleteRow = (id: string) => {
    // Defect H3: destructive delete without confirmation dialog
    fetch(`/api/waste-items/${id}`, { method: 'DELETE' });
  };

  return (
    <div>
      {/* Defect H2: Hardcoded raw English string bypassing i18n */}
      <button onClick={handleExport}>Download</button>

      {/* Defect H5: number input missing min={0} */}
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
      />

      {/* Defect H3: delete button */}
      <button onClick={() => handleDeleteRow('item-1')}>Delete</button>
    </div>
  );
};
