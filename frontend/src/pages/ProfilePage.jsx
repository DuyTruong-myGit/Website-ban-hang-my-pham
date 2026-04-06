// AI hỗ trợ: Tạo trang Hồ sơ cá nhân với chức năng xem/sửa thông tin và đổi mật khẩu.
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const ProfilePage = () => {
    usePageTitle('Hồ Sơ Cá Nhân');
    const { user, logout, authAxios } = useAuth();
    const [activeTab, setActiveTab] = useState('info');

    // State cho form chỉnh sửa thông tin
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // State cho form đổi mật khẩu
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');

        if (!editName.trim()) {
            setEditError('Họ tên không được để trống.');
            return;
        }

        setEditLoading(true);
        try {
            const res = await authAxios.put('/auth/update-profile', {
                name: editName.trim(),
                phone: editPhone.trim(),
            });
            if (res.data.success) {
                setEditSuccess('Cập nhật thông tin thành công!');
                setEditMode(false);
                // Reload lại trang để AuthContext cập nhật user mới
                window.location.reload();
            } else {
                setEditError(res.data.message || 'Cập nhật thất bại.');
            }
        } catch (err) {
            setEditError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (newPassword.length < 6) {
            setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('Mật khẩu mới và xác nhận không khớp.');
            return;
        }
        if (oldPassword === newPassword) {
            setPwError('Mật khẩu mới không được trùng mật khẩu cũ.');
            return;
        }

        setPwLoading(true);
        try {
            const res = await authAxios.post('/auth/change-password', {
                oldPassword,
                newPassword,
            });
            if (res.data.success) {
                setPwSuccess(res.data.message || 'Mật khẩu đã được thay đổi thành công!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPwError(res.data.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (err) {
            setPwError(err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row>
                {/* Sidebar */}
                <Col md={3}>
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Body className="text-center py-4">
                            <div
                                className="rounded-circle bg-hasaki d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{ width: 70, height: 70 }}
                            >
                                <i className="bi bi-person-fill text-white" style={{ fontSize: 32 }}></i>
                            </div>
                            <h6 className="fw-bold mb-0">{user?.name}</h6>
                            <small className="text-muted">{user?.email}</small>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <Nav className="flex-column">
                            <Nav.Link
                                className={`px-3 py-2 ${activeTab === 'info' ? 'text-hasaki fw-bold' : 'text-dark'}`}
                                onClick={() => setActiveTab('info')}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="bi bi-person me-2"></i> Thông tin cá nhân
                            </Nav.Link>
                            <Nav.Link
                                className={`px-3 py-2 ${activeTab === 'password' ? 'text-hasaki fw-bold' : 'text-dark'}`}
                                onClick={() => setActiveTab('password')}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="bi bi-shield-lock me-2"></i> Đổi mật khẩu
                            </Nav.Link>
                            <hr className="my-1" />
                            <Nav.Link as={Link} to="/account/orders" className="px-3 py-2 text-dark">
                                <i className="bi bi-bag me-2"></i> Đơn hàng của tôi
                            </Nav.Link>
                            <Nav.Link as={Link} to="/account/wishlist" className="px-3 py-2 text-dark">
                                <i className="bi bi-heart me-2"></i> Sản phẩm yêu thích
                            </Nav.Link>
                            <Nav.Link as={Link} to="/account/notifications" className="px-3 py-2 text-dark">
                                <i className="bi bi-bell me-2"></i> Thông báo
                            </Nav.Link>
                            <hr className="my-1" />
                            <Nav.Link onClick={logout} className="px-3 py-2 text-danger" style={{ cursor: 'pointer' }}>
                                <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                            </Nav.Link>
                        </Nav>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col md={9}>
                    {activeTab === 'info' && (
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">
                                        <i className="bi bi-person-circle me-2 text-hasaki"></i>
                                        Thông tin cá nhân
                                    </h5>
                                    {!editMode && (
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => {
                                                setEditMode(true);
                                                setEditName(user?.name || '');
                                                setEditPhone(user?.phone || '');
                                                setEditError('');
                                                setEditSuccess('');
                                            }}
                                        >
                                            <i className="bi bi-pencil me-1"></i> Chỉnh sửa
                                        </Button>
                                    )}
                                </div>

                                {editError && <Alert variant="danger" onClose={() => setEditError('')} dismissible>{editError}</Alert>}
                                {editSuccess && <Alert variant="success" onClose={() => setEditSuccess('')} dismissible>{editSuccess}</Alert>}

                                {editMode ? (
                                    <Form onSubmit={handleUpdateProfile}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-medium">Email</Form.Label>
                                            <Form.Control type="email" value={user?.email} disabled className="py-2 bg-light" />
                                            <Form.Text className="text-muted">Email không thể thay đổi.</Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-medium">Họ tên</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                required
                                                className="py-2"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-medium">Số điện thoại</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                placeholder="Nhập số điện thoại"
                                                className="py-2"
                                            />
                                        </Form.Group>
                                        <div className="d-flex gap-2">
                                            <Button type="submit" className="bg-hasaki border-0 px-4 py-2" disabled={editLoading}>
                                                {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </Button>
                                            <Button variant="outline-secondary" className="px-4 py-2" onClick={() => setEditMode(false)}>
                                                Hủy
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <>
                                        <Row className="mb-3">
                                            <Col sm={4} className="text-muted">Họ tên:</Col>
                                            <Col sm={8} className="fw-medium">{user?.name}</Col>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">
                                            <Col sm={4} className="text-muted">Email:</Col>
                                            <Col sm={8} className="fw-medium">{user?.email}</Col>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">
                                            <Col sm={4} className="text-muted">Số điện thoại:</Col>
                                            <Col sm={8} className="fw-medium">{user?.phone || 'Chưa cung cấp'}</Col>
                                        </Row>
                                        <hr />
                                        <Row className="mb-3">
                                            <Col sm={4} className="text-muted">Vai trò:</Col>
                                            <Col sm={8}>
                                                <span className="badge bg-hasaki">{user?.role}</span>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                    {activeTab === 'password' && (
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">
                                    <i className="bi bi-shield-lock me-2 text-hasaki"></i>
                                    Đổi mật khẩu
                                </h5>
                                {pwError && <Alert variant="danger" onClose={() => setPwError('')} dismissible>{pwError}</Alert>}
                                {pwSuccess && <Alert variant="success" onClose={() => setPwSuccess('')} dismissible>{pwSuccess}</Alert>}
                                <Form onSubmit={handleChangePassword}>
                                    <Form.Group className="mb-3" controlId="oldPassword">
                                        <Form.Label className="small fw-medium">Mật khẩu hiện tại</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu hiện tại"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            className="py-2"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="newPassword">
                                        <Form.Label className="small fw-medium">Mật khẩu mới</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="py-2"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4" controlId="confirmPassword">
                                        <Form.Label className="small fw-medium">Xác nhận mật khẩu mới</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="py-2"
                                        />
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="bg-hasaki border-0 px-4 py-2"
                                        disabled={pwLoading}
                                    >
                                        {pwLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
