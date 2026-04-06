import React from "react";
import { Button } from "react-bootstrap";

const VariantSelector = ({ variants, selectedVariant, onSelectVariant }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-2">Phân loại:</h6>
      <div className="d-flex flex-wrap gap-2">
        {variants.map((v, idx) => (
          <Button
            key={idx}
            variant={
              selectedVariant?.sku === v.sku ? "success" : "outline-secondary"
            }
            onClick={() => onSelectVariant(v)}
            className="fw-medium"
          >
            {v.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;
