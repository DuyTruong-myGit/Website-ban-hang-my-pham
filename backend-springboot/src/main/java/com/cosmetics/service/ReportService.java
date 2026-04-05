package com.cosmetics.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Tổng quan: doanh thu, đơn mới, KH mới, SP hết hàng
     */
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();

        // Tổng doanh thu (từ orders đã delivered)
        try {
            Aggregation revenueAgg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("status").is("delivered")),
                    Aggregation.group().sum("total").as("totalRevenue")
            );
            AggregationResults<Map> revenueResult = mongoTemplate.aggregate(revenueAgg, "orders", Map.class);
            Map revenueMap = revenueResult.getUniqueMappedResult();
            overview.put("totalRevenue", revenueMap != null ? revenueMap.get("totalRevenue") : 0);
        } catch (Exception e) {
            overview.put("totalRevenue", 0);
        }

        // Đơn hàng mới (pending) trong 7 ngày gần đây
        try {
            Aggregation newOrdersAgg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("status").is("pending")
                            .and("created_at").gte(LocalDateTime.now().minusDays(7))),
                    Aggregation.count().as("count")
            );
            AggregationResults<Map> newOrdersResult = mongoTemplate.aggregate(newOrdersAgg, "orders", Map.class);
            Map ordersMap = newOrdersResult.getUniqueMappedResult();
            overview.put("newOrders", ordersMap != null ? ordersMap.get("count") : 0);
        } catch (Exception e) {
            overview.put("newOrders", 0);
        }

        // KH mới trong 7 ngày
        try {
            Aggregation newCustomersAgg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("role").is("customer")
                            .and("created_at").gte(LocalDateTime.now().minusDays(7))),
                    Aggregation.count().as("count")
            );
            AggregationResults<Map> customersResult = mongoTemplate.aggregate(newCustomersAgg, "users", Map.class);
            Map customersMap = customersResult.getUniqueMappedResult();
            overview.put("newCustomers", customersMap != null ? customersMap.get("count") : 0);
        } catch (Exception e) {
            overview.put("newCustomers", 0);
        }

        // SP hết hàng
        try {
            Aggregation lowStockAgg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("stock").lte(5).and("is_active").is(true)),
                    Aggregation.count().as("count")
            );
            AggregationResults<Map> lowStockResult = mongoTemplate.aggregate(lowStockAgg, "products", Map.class);
            Map lowStockMap = lowStockResult.getUniqueMappedResult();
            overview.put("lowStockProducts", lowStockMap != null ? lowStockMap.get("count") : 0);
        } catch (Exception e) {
            overview.put("lowStockProducts", 0);
        }

        return overview;
    }

    /**
     * Báo cáo doanh thu theo khoảng thời gian
     */
    public List<Map> getRevenue(LocalDateTime from, LocalDateTime to) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is("delivered")
                        .and("created_at").gte(from).lte(to)),
                Aggregation.project()
                        .andExpression("year(created_at)").as("year")
                        .andExpression("month(created_at)").as("month")
                        .andExpression("dayOfMonth(created_at)").as("day")
                        .and("total").as("total"),
                Aggregation.group("year", "month", "day")
                        .sum("total").as("revenue")
                        .count().as("orderCount"),
                Aggregation.project("revenue", "orderCount")
                        .and("_id.year").as("year")
                        .and("_id.month").as("month")
                        .and("_id.day").as("day"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "year", "month", "day")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "orders", Map.class);
        return results.getMappedResults();
    }

    /**
     * Top sản phẩm bán chạy
     */
    public List<Map> getTopProducts() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("is_active").is(true)),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "sold_count"),
                Aggregation.limit(10),
                Aggregation.project("name", "slug", "sold_count", "base_price", "sale_price", "images", "avg_rating")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "products", Map.class);
        return results.getMappedResults();
    }

    /**
     * Đơn hàng gần đây (10 đơn mới nhất)
     */
    public List<Map> getRecentOrders() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "created_at"),
                Aggregation.limit(10),
                Aggregation.project("order_code", "total", "status", "payment_method", "payment_status", "created_at")
                        .and("items").size().as("item_count")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "orders", Map.class);
        return results.getMappedResults();
    }

    /**
     * Danh sách SP sắp hết hàng (stock <= 5)
     */
    public List<Map> getLowStockList() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("stock").lte(5).and("is_active").is(true)),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "stock"),
                Aggregation.limit(20),
                Aggregation.project("name")
                        .and("_id").as("product_id")
                        .and("sku").as("variant_sku")
                        .and("stock").as("quantity")
                        .andExpression("5").as("low_stock_threshold")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "products", Map.class);
        return results.getMappedResults();
    }
}
