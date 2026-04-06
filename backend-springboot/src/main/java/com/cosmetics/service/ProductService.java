package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Product;
import com.cosmetics.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import com.cosmetics.model.Category;
import com.cosmetics.repository.CategoryRepository;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MongoTemplate mongoTemplate; // Dùng để build câu query động cho bộ lọc

    // Lấy chi tiết 1 sản phẩm bằng Slug
    public Product getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy sản phẩm"));
    }

    // API Lọc Sản Phẩm Động 
    public Page<Product> getProducts(String categoryId, String brandId, Double minPrice, Double maxPrice, 
                                     String search, Boolean inStock, Integer minRating, String sort, int page, int limit) {
        
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true)); // Chỉ lấy SP đang hoạt động

        // 1. Lọc theo danh mục 
        if (categoryId != null && !categoryId.isEmpty()) {
            List<String> listCategoryIds = new ArrayList<>();
            listCategoryIds.add(categoryId); 
            List<Category> childCategories = categoryRepository.findByParentId(categoryId);
            if (childCategories != null && !childCategories.isEmpty()) {
                for (Category child : childCategories) {
                    listCategoryIds.add(child.getId());
                }
            }
            query.addCriteria(Criteria.where("categoryId").in(listCategoryIds));
        }

        // 2. Lọc theo thương hiệu 
        if (brandId != null && !brandId.isEmpty()) {
            query.addCriteria(Criteria.where("brandId").is(brandId));
        }

        // 3. Lọc theo khoảng giá 
        if (minPrice != null && maxPrice != null) {
            query.addCriteria(Criteria.where("salePrice").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            query.addCriteria(Criteria.where("salePrice").gte(minPrice));
        } else if (maxPrice != null) {
            query.addCriteria(Criteria.where("salePrice").lte(maxPrice));
        }

        // 4. Lọc theo trạng thái còn hàng 
        if (inStock != null) {
            query.addCriteria(Criteria.where("inStock").is(inStock));
        }

        // 5. ĐÃ BỔ SUNG: Lọc theo Rating
        if (minRating != null && minRating > 0) {
            query.addCriteria(Criteria.where("avgRating").gte(minRating));
        }

        // 6. Tìm kiếm theo từ khóa 
        if (search != null && !search.isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(search, "i"), 
                    Criteria.where("shortDescription").regex(search, "i")
            );
            query.addCriteria(searchCriteria);
        }

        // 7. Sắp xếp (Sort) 
        Sort sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            switch (sort) {
                case "price_asc": sorting = Sort.by(Sort.Direction.ASC, "salePrice"); break;
                case "price_desc": sorting = Sort.by(Sort.Direction.DESC, "salePrice"); break;
                case "best_selling": sorting = Sort.by(Sort.Direction.DESC, "soldCount"); break;
                case "rating": sorting = Sort.by(Sort.Direction.DESC, "avgRating"); break;
            }
        }
        
        // 8. Phân trang (Pagination) 
        Pageable pageable = PageRequest.of(page - 1, limit, sorting); 
        query.with(pageable);

        long total = mongoTemplate.count(query, Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(products, pageable, total);
    }

    // Các danh sách hiển thị Trang chủ
    public List<Product> getFeaturedProducts() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));
        query.addCriteria(Criteria.where("isFeatured").is(true));
        
        // Có thể sort theo thời gian mới nhất
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(12); // Lấy 12 sản phẩm
        
        return mongoTemplate.find(query, Product.class);
    }

    public List<Product> getBestSellers() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));
        query.addCriteria(Criteria.where("isBestSeller").is(true));
        
        // Có thể sort theo thời gian mới nhất
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(12); // Lấy 12 sản phẩm
        
        return mongoTemplate.find(query, Product.class);
    }

    // CRUD cho Admin
    public Product createProduct(Product product) {
        // Tự động tính inStock dựa trên stock
        product.setInStock(computeInStock(product));
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy sản phẩm"));
        
        // Cập nhật các trường cơ bản
        product.setName(productDetails.getName());
        product.setSlug(productDetails.getSlug());
        product.setSku(productDetails.getSku()); // Đã bổ sung
        product.setImages(productDetails.getImages());
        product.setBasePrice(productDetails.getBasePrice());
        product.setSalePrice(productDetails.getSalePrice());
        product.setCategoryId(productDetails.getCategoryId());
        product.setBrandId(productDetails.getBrandId());
        product.setVariants(productDetails.getVariants());
        product.setAttributes(productDetails.getAttributes());
        
        product.setShortDescription(productDetails.getShortDescription());
        product.setDescription(productDetails.getDescription());
        
        // Cập nhật tồn kho
        product.setStock(productDetails.getStock());
        
        // Cập nhật các cờ trạng thái (Flags) quan trọng
        product.setIsActive(productDetails.getIsActive());
        // Tự động tính inStock dựa trên stock
        product.setInStock(computeInStock(productDetails));
        product.setIsFeatured(productDetails.getIsFeatured());       
        product.setIsBestSeller(productDetails.getIsBestSeller());   
        product.setIsNew(productDetails.getIsNew());
        
        return productRepository.save(product);
    }

    /**
     * Tính toán trạng thái inStock dựa trên stock hiện tại.
     * Product còn hàng nếu:
     * - Không có variant: stock > 0
     * - Có variant: ít nhất 1 variant có stock > 0
     */
    private boolean computeInStock(Product product) {
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            return product.getVariants().stream()
                    .anyMatch(v -> v.getStock() != null && v.getStock() > 0);
        }
        return product.getStock() != null && product.getStock() > 0;
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
    // Lấy danh sách Sản phẩm Mới (New Arrivals)
    public List<Product> getNewArrivals() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));
        query.addCriteria(Criteria.where("isNew").is(true)); // Tìm các SP có cờ isNew = true
        
        // Sắp xếp theo ngày tạo mới nhất
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(12); // Lấy tối đa 12 sản phẩm cho đẹp giao diện
        
        return mongoTemplate.find(query, Product.class);
    }

    // Lấy danh sách Sản phẩm Flash Sale (Có giảm giá)
    public List<Product> getFlashSale() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true));
        query.addCriteria(Criteria.where("salePrice").gt(0)); // Tìm các SP có salePrice lớn hơn 0
        
        // Sắp xếp theo ngày cập nhật mới nhất để ưu tiên sale mới
        query.with(Sort.by(Sort.Direction.DESC, "updatedAt"));
        query.limit(12);
        
        return mongoTemplate.find(query, Product.class);
    }
}