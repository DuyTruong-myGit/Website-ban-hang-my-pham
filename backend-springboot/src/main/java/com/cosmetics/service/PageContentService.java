package com.cosmetics.service;

import com.cosmetics.dto.request.PageContentRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.PageContent;
import com.cosmetics.repository.PageContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PageContentService {

    @Autowired
    private PageContentRepository pageContentRepository;

    public PageContent getBySlug(String slug) {
        return pageContentRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy trang nội dung."));
    }

    public Page<PageContent> getAll(Pageable pageable) {
        return pageContentRepository.findAll(pageable);
    }

    public PageContent create(PageContentRequest request) {
        if (pageContentRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Slug đã tồn tại.");
        }

        PageContent pageContent = PageContent.builder()
                .slug(request.getSlug())
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return pageContentRepository.save(pageContent);
    }

    public PageContent update(String id, PageContentRequest request) {
        PageContent pageContent = pageContentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy trang nội dung."));

        if (request.getSlug() != null) {
            pageContent.setSlug(request.getSlug());
        }
        if (request.getTitle() != null) {
            pageContent.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            pageContent.setContent(request.getContent());
        }
        if (request.getIsActive() != null) {
            pageContent.setIsActive(request.getIsActive());
        }

        return pageContentRepository.save(pageContent);
    }

    public void delete(String id) {
        if (!pageContentRepository.existsById(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy trang nội dung.");
        }
        pageContentRepository.deleteById(id);
    }
}
