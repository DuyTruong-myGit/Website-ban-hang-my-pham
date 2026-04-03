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

    // API Lọc Sản Phẩm Động (Giống Hasaki)
    public Page<Product> getProducts(String categoryId, String brandId, Double minPrice, Double maxPrice, 
                                     String search, Boolean inStock, String sort, int page, int limit) {
        
        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").is(true)); // Chỉ lấy SP đang hoạt động

        // 1. Lọc theo danh mục
        if (categoryId != null && !categoryId.isEmpty()) {
            List<String> listCategoryIds = new ArrayList<>();
            listCategoryIds.add(categoryId); // Thêm ID của danh mục hiện tại (Cha)

            // Tìm xem danh mục này có các danh mục con nào không
            List<Category> childCategories = categoryRepository.findByParentId(categoryId);
            if (childCategories != null && !childCategories.isEmpty()) {
                for (Category child : childCategories) {
                    listCategoryIds.add(child.getId()); // Góp thêm ID của các danh mục con vào danh sách
                }
            }

            // Dùng toán tử .in() để lấy sản phẩm thuộc BẤT KỲ ID nào trong danh sách trên
            query.addCriteria(Criteria.where("categoryId").in(listCategoryIds));
        }

        // 2. Lọc theo thương hiệu
        if (brandId != null && !brandId.isEmpty()) {
            query.addCriteria(Criteria.where("brandId").is(brandId));
        }

        // 3. Lọc theo khoảng giá (Dựa trên giá khuyến mãi salePrice)
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

        // 5. Tìm kiếm theo từ khóa (Tìm trong tên hoặc mô tả ngắn)
        if (search != null && !search.isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(search, "i"), // 'i' là không phân biệt hoa thường
                    Criteria.where("shortDescription").regex(search, "i")
            );
            query.addCriteria(searchCriteria);
        }

        // 6. Sắp xếp (Sort)
        Sort sorting = Sort.by(Sort.Direction.DESC, "createdAt"); // Mặc định Mới nhất
        if (sort != null) {
            switch (sort) {
                case "price_asc": sorting = Sort.by(Sort.Direction.ASC, "salePrice"); break;
                case "price_desc": sorting = Sort.by(Sort.Direction.DESC, "salePrice"); break;
                case "best_selling": sorting = Sort.by(Sort.Direction.DESC, "soldCount"); break;
                case "rating": sorting = Sort.by(Sort.Direction.DESC, "avgRating"); break;
            }
        }
        
        // 7. Phân trang (Pagination)
        Pageable pageable = PageRequest.of(page - 1, limit, sorting); // Spring Boot page bắt đầu từ 0
        query.with(pageable);

        // Đếm tổng số bản ghi thỏa mãn điều kiện
        long total = mongoTemplate.count(query, Product.class);
        
        // Lấy danh sách dữ liệu
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
        
        // Cập nhật các cờ trạng thái (Flags) quan trọng
        product.setIsActive(productDetails.getIsActive());
        product.setInStock(productDetails.getInStock());
        product.setIsFeatured(productDetails.getIsFeatured());       
        product.setIsBestSeller(productDetails.getIsBestSeller());   
        product.setIsNew(productDetails.getIsNew());
        
        return productRepository.save(product);
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