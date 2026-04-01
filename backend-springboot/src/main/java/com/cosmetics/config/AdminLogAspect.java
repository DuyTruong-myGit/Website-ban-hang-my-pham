package com.cosmetics.config;

import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.AdminLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * AOP Aspect — Tự động ghi AdminLog khi admin/staff thao tác
 * Intercept tất cả controller methods có mapping POST/PUT/DELETE trong package controller
 */
@Aspect
@Component
public class AdminLogAspect {

    @Autowired
    private AdminLogService adminLogService;

    /**
     * Tự động ghi log khi admin/staff gọi POST/PUT/DELETE endpoints
     * Chỉ ghi log nếu user đã authenticated và có role admin hoặc staff
     */
    @AfterReturning(
            pointcut = "execution(* com.cosmetics.controller..*(..)) && " +
                    "(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
                    " @annotation(org.springframework.web.bind.annotation.PutMapping) || " +
                    " @annotation(org.springframework.web.bind.annotation.DeleteMapping))",
            returning = "result"
    )
    public void logAdminAction(JoinPoint joinPoint, Object result) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
                return;
            }

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String role = userDetails.getUser().getRole();

            // Chỉ ghi log cho admin và staff
            if (!"admin".equals(role) && !"staff".equals(role)) {
                return;
            }

            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            // Bỏ qua AdminLogController để tránh đệ quy
            if ("AdminLogController".equals(className)) {
                return;
            }

            // Xác định action từ method name
            String action = resolveAction(methodName, className);
            String target = className.replace("Controller", "").toLowerCase();

            adminLogService.createLog(
                    userDetails.getId(),
                    action,
                    target,
                    Map.of(
                            "method", methodName,
                            "controller", className,
                            "autoLogged", true
                    )
            );
        } catch (Exception e) {
            // Không để lỗi log ảnh hưởng đến business logic
            // Chỉ log lỗi ra console
            System.err.println("[AdminLogAspect] Lỗi ghi log: " + e.getMessage());
        }
    }

    /**
     * Phân loại action dựa trên tên method
     */
    private String resolveAction(String methodName, String controllerName) {
        String prefix = controllerName.replace("Controller", "").toUpperCase();

        if (methodName.startsWith("create") || methodName.startsWith("add") || methodName.startsWith("register")) {
            return "CREATE_" + prefix;
        } else if (methodName.startsWith("update") || methodName.startsWith("edit") || methodName.startsWith("change")) {
            return "UPDATE_" + prefix;
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            return "DELETE_" + prefix;
        } else {
            return "ACTION_" + prefix + "_" + methodName.toUpperCase();
        }
    }
}
