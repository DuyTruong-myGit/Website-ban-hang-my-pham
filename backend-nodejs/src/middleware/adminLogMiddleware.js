import AdminLog from '../models/AdminLog.js';

/**
 * Middleware tự động ghi AdminLog khi admin/staff thao tác.
 * Sử dụng bằng cách gọi logAdminAction(action) trước controller handler.
 *
 * Ví dụ: router.post('/', protect, admin, logAdminAction('CREATE_PAGE'), createPage);
 *
 * Middleware sẽ override res.json để ghi log SAU KHI response thành công.
 */
export const logAdminAction = (action) => {
  return (req, res, next) => {
    // Lưu lại hàm json gốc
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Chỉ ghi log nếu response thành công
      if (body && body.success !== false) {
        // Ghi log async — không block response
        AdminLog.create({
          user_id: req.user._id,
          action: action,
          target: req.params.id || req.params.slug || '',
          metadata: {
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            body: sanitizeBody(req.body),
          },
        }).catch((err) => {
          console.error(`[AdminLog] Lỗi ghi log: ${err.message}`);
        });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper — loại bỏ các field nhạy cảm trước khi lưu vào log
 */
const sanitizeBody = (body) => {
  if (!body) return {};
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret'];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  return sanitized;
};
