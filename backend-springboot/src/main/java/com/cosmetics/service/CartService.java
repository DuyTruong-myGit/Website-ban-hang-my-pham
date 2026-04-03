package com.cosmetics.service;

import com.cosmetics.dto.request.CartRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Cart;
import com.cosmetics.model.Cart.CartItem;
import com.cosmetics.model.Product;
import com.cosmetics.repository.CartRepository;
import com.cosmetics.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service xử lý logic giỏ hàng — TV3
 *
 * Chiến lược:
 *  - Mỗi user có tối đa 1 document Cart trong MongoDB.
 *  - Khi thêm item đã tồn tại (productId + variantSku trùng) → cộng dồn số lượng.
 *  - Giá được snapshot tại thời điểm thêm vào giỏ (sale_price nếu đang sale).
 */
@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // GET CART
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lấy giỏ hàng hiện tại của user.
     * Nếu user chưa có giỏ → trả về giỏ rỗng (không tạo trong DB).
     */
    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElse(Cart.builder().userId(userId).items(new ArrayList<>()).build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADD ITEM
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * Nếu item đã tồn tại (cùng productId + variantSku) → cộng dồn quantity.
     */
    public Cart addItem(String userId, CartRequest request) {
        // 1. Tìm sản phẩm để lấy thông tin snapshot
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new AppException(ErrorCode.PRODUCT_INACTIVE);
        }

        // 2. Xác định giá (sale_price nếu > 0, không thì base_price)
        double price = (product.getSalePrice() != null && product.getSalePrice() > 0)
                ? product.getSalePrice()
                : product.getBasePrice();

        // 3. Xây dựng thông tin variant (nếu có)
        String variantSku = request.getVariantSku() != null ? request.getVariantSku().trim() : "";
        String variantName = resolveVariantName(product, variantSku);

        // Nếu sản phẩm HAS variants nhưng request không truyền variantSku → lấy variant đầu tiên
        if (variantSku.isEmpty() && product.getVariants() != null && !product.getVariants().isEmpty()) {
            Product.Variant firstVariant = product.getVariants().get(0);
            variantSku = firstVariant.getSku() != null ? firstVariant.getSku() : "";
            variantName = firstVariant.getName();
            if (firstVariant.getSalePrice() != null && firstVariant.getSalePrice() > 0) {
                price = firstVariant.getSalePrice();
            } else if (firstVariant.getPrice() != null) {
                price = firstVariant.getPrice();
            }
        }

        // 4. Lấy hoặc tạo mới Cart document
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.builder().userId(userId).items(new ArrayList<>()).build());

        List<CartItem> items = new ArrayList<>(cart.getItems());

        // 5. Kiểm tra xem item đã có trong giỏ chưa (cùng productId + variantSku)
        final String finalVariantSku = variantSku;
        Optional<CartItem> existing = items.stream()
                .filter(i -> i.getProductId().equals(request.getProductId())
                        && i.getVariantSku().equals(finalVariantSku))
                .findFirst();

        if (existing.isPresent()) {
            // Nếu đã có → cộng dồn số lượng
            existing.get().setQuantity(existing.get().getQuantity() + request.getQuantity());
        } else {
            // Nếu chưa có → tạo CartItem mới
            String imageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0) : "";

            CartItem newItem = CartItem.builder()
                    .productId(product.getId())
                    .variantSku(finalVariantSku)
                    .name(product.getName())
                    .imageUrl(imageUrl)
                    .variantName(variantName)
                    .price(price)
                    .quantity(request.getQuantity())
                    .build();

            items.add(newItem);
        }

        cart.setItems(items);
        return cartRepository.save(cart);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE ITEM QUANTITY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Cập nhật số lượng của 1 item theo productId (và variantSku nếu có).
     * Nếu quantity = 0 → tự động xóa item đó khỏi giỏ.
     */
    public Cart updateItem(String userId, String productId, CartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        String variantSku = request.getVariantSku() != null ? request.getVariantSku().trim() : "";

        List<CartItem> items = new ArrayList<>(cart.getItems());
        boolean found = false;

        for (CartItem item : items) {
            if (item.getProductId().equals(productId) && item.getVariantSku().equals(variantSku)) {
                if (request.getQuantity() <= 0) {
                    items.remove(item);
                } else {
                    item.setQuantity(request.getQuantity());
                }
                found = true;
                break;
            }
        }

        if (!found) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        cart.setItems(items);
        return cartRepository.save(cart);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REMOVE ITEM
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Xóa 1 item khỏi giỏ hàng.
     * variantSku truyền qua query param (optional).
     */
    public Cart removeItem(String userId, String productId, String variantSku) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        String sku = variantSku != null ? variantSku.trim() : "";

        List<CartItem> items = new ArrayList<>(cart.getItems());
        boolean removed = items.removeIf(
                i -> i.getProductId().equals(productId) && i.getVariantSku().equals(sku)
        );

        if (!removed) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        cart.setItems(items);
        return cartRepository.save(cart);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLEAR CART
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Xóa toàn bộ giỏ hàng của user.
     * Dùng sau khi đặt hàng thành công hoặc khi user muốn xóa sạch.
     */
    public void clearCart(String userId) {
        cartRepository.deleteByUserId(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────────

    /** Tìm tên variant theo SKU từ danh sách variants của product */
    private String resolveVariantName(Product product, String variantSku) {
        if (variantSku.isEmpty() || product.getVariants() == null) return "";
        return product.getVariants().stream()
                .filter(v -> variantSku.equals(v.getSku()))
                .map(Product.Variant::getName)
                .findFirst()
                .orElse("");
    }
}
