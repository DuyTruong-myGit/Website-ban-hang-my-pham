import React from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, emptyMessage = "Chưa có sản phẩm nào." }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <i
          className="bi bi-box-seam text-muted"
          style={{ fontSize: "3rem" }}
        ></i>
        <p className="mt-3 text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {products.map((prod) => (
        <Col xs={6} md={4} lg={2} key={prod.id || prod._id}>
          <ProductCard product={prod} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
