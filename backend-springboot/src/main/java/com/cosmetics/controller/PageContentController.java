package com.cosmetics.controller;

import com.cosmetics.dto.request.PageContentRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.PageContent;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.AdminLogService;
import com.cosmetics.service.PageContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class PageContentController {

    @Autowired
    private PageContentService pageContentService;

    @Autowired
    private AdminLogService adminLogService;

    // === PUBLIC ===
    @GetMapping("/api/pages/{slug}")
    public ApiResponse<PageContent> getPageBySlug(@PathVariable String slug) {
        PageContent page = pageContentService.getBySlug(slug);
        return ApiResponse.success(page);
    }

    // === ADMIN ===
    @GetMapping("/api/admin/pages")
    public ApiResponse<List<PageContent>> getAllPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Page<PageContent> pageResult = pageContentService.getAll(
                PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ApiResponse.success(
                pageResult.getContent(),
                ApiResponse.Pagination.builder()
                        .page(page)
                        .limit(limit)
                        .total(pageResult.getTotalElements())
                        .totalPages(pageResult.getTotalPages())
                        .build()
        );
    }

    @PostMapping("/api/admin/pages")
    public ApiResponse<PageContent> createPage(
            @Valid @RequestBody PageContentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PageContent created = pageContentService.create(request);

        adminLogService.createLog(
                userDetails.getId(),
                "CREATE_PAGE",
                "page:" + created.getId(),
                Map.of("slug", request.getSlug(), "title", request.getTitle())
        );

        return ApiResponse.success(created, "Tạo trang nội dung thành công.");
    }

    @PutMapping("/api/admin/pages/{id}")
    public ApiResponse<PageContent> updatePage(
            @PathVariable String id,
            @Valid @RequestBody PageContentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PageContent updated = pageContentService.update(id, request);

        adminLogService.createLog(
                userDetails.getId(),
                "UPDATE_PAGE",
                "page:" + id,
                Map.of("title", request.getTitle())
        );

        return ApiResponse.success(updated, "Cập nhật trang nội dung thành công.");
    }

    @DeleteMapping("/api/admin/pages/{id}")
    public ApiResponse<Void> deletePage(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        pageContentService.delete(id);

        adminLogService.createLog(
                userDetails.getId(),
                "DELETE_PAGE",
                "page:" + id,
                Map.of()
        );

        return ApiResponse.success(null, "Xóa trang nội dung thành công.");
    }
}
