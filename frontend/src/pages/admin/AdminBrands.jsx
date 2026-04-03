import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import { adminBrandApi } from "../../services/adminProductService";

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ĐÃ BỔ SUNG: originCountry, website
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    originCountry: "",
    website: "",
    isActive: true,
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await adminBrandApi.getAll();
      if (res.success) setBrands(res.data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async () => {
    try {
      if (isEditing) await adminBrandApi.update(currentId, formData);
      else await adminBrandApi.create(formData);
      setShowModal(false);
      fetchBrands();
    } catch (error) {
      alert(error.message);
    }
  };

  const columns = [
    {
      header: "Logo",
      render: (row) => (
        <img
          src={row.logoUrl || "https://via.placeholder.com/50"}
          alt="logo"
          style={{ width: "40px", height: "40px", objectFit: "contain" }}
        />
      ),
    },
    { field: "name", header: "Tên thương hiệu" },
    { field: "originCountry", header: "Xuất xứ" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`admin-badge admin-badge-${row.isActive ? "success" : "secondary"}`}
        >
          {row.isActive ? "Đang hợp tác" : "Ngưng"}
        </span>
      ),
    },
    {
      header: "Hành động",
      render: (row) => (
        <button
          className="btn btn-sm btn-light border"
          onClick={() => {
            setIsEditing(true);
            setCurrentId(row.id || row._id);
            setFormData({
              name: row.name || "",
              slug: row.slug || "",
              logoUrl: row.logoUrl || "",
              description: row.description || "",
              originCountry: row.originCountry || "",
              website: row.website || "",
              isActive: row.isActive !== false,
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-pencil text-primary"></i> Sửa
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Thương hiệu</h4>
          <p className="text-muted mb-0">Thêm, sửa, quản lý các hãng mỹ phẩm</p>
        </div>
        <button
          className="btn text-white fw-medium px-4 py-2"
          style={{ background: "var(--admin-gradient-success)" }}
          onClick={() => {
            setIsEditing(false);
            setFormData({
              name: "",
              slug: "",
              logoUrl: "",
              description: "",
              originCountry: "",
              website: "",
              isActive: true,
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>Thêm Brand
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={brands}
          emptyMessage="Chưa có thương hiệu nào."
        />
      )}

      <Modal
        show={showModal}
        title={isEditing ? "Sửa Brand" : "Thêm Brand"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-medium">
              Tên thương hiệu <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-medium">
              Slug <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">Logo URL</label>
          <input
            type="text"
            className="form-control"
            value={formData.logoUrl}
            onChange={(e) =>
              setFormData({ ...formData, logoUrl: e.target.value })
            }
          />
        </div>

        {/* CÁC TRƯỜNG ĐÃ BỔ SUNG */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-medium">Xuất xứ</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Hàn Quốc, Pháp"
              value={formData.originCountry}
              onChange={(e) =>
                setFormData({ ...formData, originCountry: e.target.value })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label small fw-medium">Website</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: https://larocheposay.vn"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">
            Mô tả thương hiệu
          </label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            id="isActiveBrand"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <label
            className="form-check-label cursor-pointer"
            htmlFor="isActiveBrand"
          >
            Đang hợp tác (Hiển thị)
          </label>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminBrands;
