import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import { adminBannerApi } from "../../services/adminProductService";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "hero",
    sortOrder: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminBannerApi.getAll();
      if (res.success) {
        // Sắp xếp theo position và sortOrder để dễ nhìn
        const sortedBanners = res.data.sort((a, b) => {
          if (a.position === b.position) return a.sortOrder - b.sortOrder;
          return a.position.localeCompare(b.position);
        });
        setBanners(sortedBanners);
      }
    } catch (error) {
      alert("Lỗi tải banner: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await adminBannerApi.update(currentId, formData);
      } else {
        await adminBannerApi.create(formData);
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      alert("Lỗi lưu banner: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await adminBannerApi.delete(currentId);
      setShowDeleteModal(false);
      fetchBanners();
    } catch (error) {
      alert("Lỗi xóa banner: " + error.message);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "hero",
      sortOrder: 0,
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setIsEditing(true);
    setCurrentId(banner.id || banner._id);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      position: banner.position,
      sortOrder: banner.sortOrder,
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
      isActive: banner.isActive,
    });
    setShowModal(true);
  };

  const columns = [
    {
      header: "Hình ảnh",
      render: (row) => (
        <img
          src={row.imageUrl || "https://via.placeholder.com/150x50"}
          alt={row.title}
          style={{
            width: "120px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
      ),
    },
    { field: "title", header: "Tiêu đề" },
    {
      header: "Vị trí hiển thị",
      render: (row) => (
        <span
          className={`admin-badge admin-badge-${row.position === "hero" ? "primary" : "info"}`}
        >
          {row.position.toUpperCase()}
        </span>
      ),
    },
    { field: "sortOrder", header: "Thứ tự" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`admin-badge admin-badge-${row.isActive ? "success" : "secondary"}`}
        >
          {row.isActive ? "Đang hiện" : "Đã ẩn"}
        </span>
      ),
    },
    {
      header: "Hành động",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
          >
            <i className="bi bi-pencil text-primary"></i>
          </button>
          <button
            className="btn btn-sm btn-light border"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentId(row.id || row._id);
              setShowDeleteModal(true);
            }}
          >
            <i className="bi bi-trash text-danger"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <AdminLayout>
        <Loading message="Đang tải danh sách banner..." />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Banner</h4>
          <p className="text-muted mb-0">
            Quản lý hình ảnh quảng cáo trên website
          </p>
        </div>
        <button
          className="btn text-white fw-medium px-4 py-2"
          style={{
            background: "var(--admin-gradient-primary)",
            borderRadius: "8px",
          }}
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg me-2"></i>Thêm Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        emptyMessage="Chưa có banner nào."
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        show={showModal}
        title={isEditing ? "Sửa Banner" : "Thêm Banner Mới"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label fw-medium small">
            Tiêu đề (Chỉ dùng để quản lý) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="VD: Khuyến mãi mùng 8/3"
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium small">
            Đường dẫn ảnh (Image URL) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://..."
          />
          {formData.imageUrl && (
            <div className="mt-2 text-center border rounded p-1 bg-light">
              <img
                src={formData.imageUrl}
                alt="preview"
                style={{
                  maxHeight: "100px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium small">
            Link khi click vào ảnh (Tùy chọn)
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.linkUrl}
            onChange={(e) =>
              setFormData({ ...formData, linkUrl: e.target.value })
            }
            placeholder="/category/sua-rua-mat"
          />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-medium small">
              Vị trí hiển thị
            </label>
            <select
              className="form-select"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            >
              <option value="hero">Hero Banner (To nhất trang chủ)</option>
              <option value="sidebar">Sidebar (Bên hông danh mục)</option>
              <option value="popup">Popup (Nổi lên khi vào trang)</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-medium small">Thứ tự ưu tiên</label>
            <input
              type="number"
              className="form-control"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
            />
            <div className="form-text" style={{ fontSize: "11px" }}>
              Số nhỏ hiện trước
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-medium small text-primary">
              Thời gian bắt đầu (Tùy chọn)
            </label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-medium small text-danger">
              Thời gian kết thúc (Tùy chọn)
            </label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.endDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>
        <div
          className="form-text mb-3"
          style={{ fontSize: "11px", marginTop: "-10px" }}
        >
          Nếu để trống, Banner sẽ hiển thị vĩnh viễn (nếu trạng thái bên dưới
          đang Bật).
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            id="isActiveBanner"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
          <label
            className="form-check-label cursor-pointer"
            htmlFor="isActiveBanner"
          >
            Hiển thị trên website
          </label>
        </div>
      </Modal>

      {/* Modal Xóa */}
      <Modal
        show={showDeleteModal}
        title="Xác nhận xóa"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Xóa banner"
        confirmVariant="danger"
      >
        <p className="mb-0 text-danger">
          Bạn có chắc chắn muốn xóa banner này không?
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminBanners;
