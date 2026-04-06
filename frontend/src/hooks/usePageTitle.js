// AI hỗ trợ: Custom hook để cập nhật document.title động theo từng trang
import { useEffect } from 'react';

const SITE_NAME = 'AuraBeauty';

/**
 * Hook thay đổi title trên tab trình duyệt theo từng trang.
 * @param {string} title - Tiêu đề trang (VD: "Trang Chủ")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
};

export default usePageTitle;
