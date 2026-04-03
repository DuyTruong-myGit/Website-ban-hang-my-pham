package com.cosmetics.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class UploadService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            // Upload ảnh lên thư mục "hasaki_clone" trên Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                    ObjectUtils.asMap("folder", "hasaki_clone"));
            
            // Trả về đường dẫn ảnh bảo mật (https)
            return uploadResult.get("secure_url").toString();
            
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi hệ thống: Không thể upload ảnh lên Cloudinary.");
        }
    }
}