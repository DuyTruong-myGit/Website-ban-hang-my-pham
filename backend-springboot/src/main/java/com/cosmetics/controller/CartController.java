package com.cosmetics.controller;

import com.cosmetics.dto.request.CartRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Cart;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller quản lý giỏ hàng — TV3
 *
 * Tất cả endpoints đều yêu cầu JWT token (user đã đăng nhập).
 * userId được lấy từ JWT thông qua @AuthenticationPrincipal — không cần truyền từ client.
 *
 * Endpoints:
 *   GET    /api/cart                        → Lấy giỏ hàng hiện tại
 *   POST   /api/cart/items                  → Thêm sản phẩm vào giỏ
 *   PUT    /api/cart/items/{productId}      → Cập nhật số lượng
 *   DELETE /api/cart/items/{productId}      → Xóa 1 sản phẩm khỏi giỏ
 *   DELETE /api/cart                        → Xóa toàn bộ giỏ hàng
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // ── Lấy giỏ hàng ────────────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<Cart> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Cart cart = cartService.getCart(userDetails.getId());
        return ApiResponse.success(cart);
    }

    // ── Thêm sản phẩm ───────────────────────────────────────────────────────

    @PostMapping("/items")
    public ApiResponse<Cart> addItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CartRequest request
    ) {
        Cart cart = cartService.addItem(userDetails.getId(), request);
        return ApiResponse.success(cart, "Đã thêm sản phẩm vào giỏ hàng.");
    }

    // ── Cập nhật số lượng ───────────────────────────────────────────────────

    /**
     * @param productId  ID sản phẩm cần cập nhật
     * @param request    Chứa quantity mới (và variantSku nếu có)
     */
    @PutMapping("/items/{productId}")
    public ApiResponse<Cart> updateItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId,
            @Valid @RequestBody CartRequest request
    ) {
        Cart cart = cartService.updateItem(userDetails.getId(), productId, request);
        return ApiResponse.success(cart, "Đã cập nhật giỏ hàng.");
    }

    // ── Xóa 1 sản phẩm ──────────────────────────────────────────────────────

    /**
     * @param productId   ID sản phẩm cần xóa
     * @param variantSku  SKU variant (optional, truyền qua query param)
     *                    Ví dụ: DELETE /api/cart/items/abc123?variantSku=50ml
     */
    @DeleteMapping("/items/{productId}")
    public ApiResponse<Cart> removeItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId,
            @RequestParam(required = false, defaultValue = "") String variantSku
    ) {
        Cart cart = cartService.removeItem(userDetails.getId(), productId, variantSku);
        return ApiResponse.success(cart, "Đã xóa sản phẩm khỏi giỏ hàng.");
    }

    // ── Xóa toàn bộ giỏ hàng ────────────────────────────────────────────────

    @DeleteMapping
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        cartService.clearCart(userDetails.getId());
        return ApiResponse.success(null, "Đã xóa toàn bộ giỏ hàng.");
    }
}
