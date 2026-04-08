import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import ImageUpload from "../../components/admin/ImageUpload";
import { adminBannerApi, uploadApi } from "../../services/adminProductService";
import usePageTitle from "../../hooks/usePageTitle";

const AdminBanners = () => {
  usePageTitle("Quản lý Banner");

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
        const sortedBanners = res.data.sort((a, b) => {
          if (a.position === b.position) return a.sortOrder - b.sortOrder;
          return a.position.localeCompare(b.position);
        });
        setBanners(sortedBanners);
      }
    } catch (error) {
      alert("Lỗi tải danh sách Banner: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Xử lý Upload Ảnh lên Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setFormData({ ...formData, imageUrl: res.data.url });
      }
    } catch (error) {
      alert("Lỗi upload ảnh: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddNew = () => {
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
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (banner) => {
    setCurrentId(banner.id || banner._id);
    setFormData({
      title: banner.title || "",
      imageUrl: banner.imageUrl || banner.image_url || "",
      linkUrl: banner.linkUrl || banner.link_url || "",
      position: banner.position || "hero",
      sortOrder: banner.sortOrder || banner.sort_order || 0,
      startDate: banner.startDate ? banner.startDate.substring(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.substring(0, 10) : "",
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = (banner) => {
    setCurrentId(banner.id || banner._id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert("Vui lòng nhập tiêu đề và upload hình ảnh!");
      return;
    }

    try {
      // 🌟 MẤU CHỐT: Map dữ liệu từ camelCase sang snake_case để khớp với Backend Node.js
      const payload = {
        title: formData.title,
        image_url: formData.imageUrl,
        link_url: formData.linkUrl,
        position: formData.position,
        sort_order: Number(formData.sortOrder),
        is_active: formData.isActive,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
      };

      let res;
      if (isEditing) {
        res = await adminBannerApi.update(currentId, payload);
      } else {
        res = await adminBannerApi.create(payload);
      }

      if (res.success) {
        setShowModal(false);
        fetchBanners();
      }
    } catch (error) {
      alert("Lỗi lưu banner: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminBannerApi.delete(currentId);
      if (res.success) {
        setShowDeleteModal(false);
        fetchBanners();
      }
    } catch (error) {
      alert("Lỗi xóa banner: " + error.message);
    }
  };

  const columns = [
    {
      header: "Hình ảnh",
      render: (row) => (
        <img
          src={row.imageUrl || row.image_url}
          alt={row.title}
          style={{
            width: "120px",
            height: "auto",
            borderRadius: "6px",
            objectFit: "cover",
          }}
        />
      ),
    },
    { field: "title", header: "Tiêu đề" },
    {
      header: "Vị trí",
      render: (row) => (
        <span className="badge bg-info text-dark">{row.position}</span>
      ),
    },
    { field: "sortOrder", header: "Thứ tự hiển thị" },
    {
      header: "Trạng thái",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "bg-success" : "bg-secondary"}`}
        >
          {row.isActive ? "Hiển thị" : "Đang ẩn"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
            title="Sửa"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDeleteClick(row)}
            title="Xóa"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Đang tải danh sách banner..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Banner</h4>
          <p className="text-muted mb-0">
            Quản lý các hình ảnh quảng cáo trên trang chủ
          </p>
        </div>
        <button className="btn btn-success" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-2"></i>Thêm Banner Mới
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        emptyMessage="Chưa có banner nào trong hệ thống."
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        show={showModal}
        title={isEditing ? "Cập nhật Banner" : "Thêm Banner Mới"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText={isEditing ? "Lưu thay đổi" : "Tạo Banner"}
        confirmVariant="success"
      >
        {/* --- KHU VỰC UPLOAD ẢNH --- */}
        <div className="mb-3">
          <ImageUpload
            images={formData.imageUrl ? [formData.imageUrl] : []}
            onUpload={handleImageUpload}
            onRemove={() => setFormData({ ...formData, imageUrl: "" })}
            uploading={uploading}
            multiple={false}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">
            Tiêu đề <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="VD: Sale Mỹ Phẩm Mùa Hè"
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Vị trí hiển thị
            </label>
            <select
              className="form-select"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            >
              <option value="hero">Hero Slider (Đỉnh trang)</option>
              <option value="middle">Banner Giữa trang</option>
              <option value="bottom">Banner Cuối trang</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              className="form-control"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-medium">
            Đường dẫn liên kết (Link)
          </label>
          <input
            type="text"
            className="form-control"
            value={formData.linkUrl}
            onChange={(e) =>
              setFormData({ ...formData, linkUrl: e.target.value })
            }
            placeholder="VD: /category/cham-soc-da"
          />
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Ngày bắt đầu (Tùy chọn)
            </label>
            <input
              type="date"
              className="form-control"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">
              Ngày kết thúc (Tùy chọn)
            </label>
            <input
              type="date"
              className="form-control"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-check form-switch mt-4">
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
          Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể
          hoàn tác.
        </p>
      </Modal>
    </AdminLayout>
  );
};

export default AdminBanners;
