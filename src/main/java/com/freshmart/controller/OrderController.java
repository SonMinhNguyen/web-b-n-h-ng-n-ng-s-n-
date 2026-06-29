package com.freshmart.controller;

import com.freshmart.model.dto.request.OrderRequest;
import com.freshmart.model.dto.response.ApiResponse;
import com.freshmart.model.dto.response.OrderResponse;
import com.freshmart.model.enums.OrderStatus;
import com.freshmart.service.OrderService;
import com.freshmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    /**
     * Tạo đơn hàng mới cho người dùng hiện tại
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest orderRequest,
            Principal principal) {
        try {
            Long userId = userService.findByUsername(principal.getName()).getId();
            OrderResponse response = orderService.createOrder(orderRequest, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Tạo đơn hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.getOrderById(id);
            return ResponseEntity.ok(ApiResponse.success(order, "Chi tiết đơn hàng"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @RequestParam(required = false) OrderStatus status,
            Principal principal) {
        try {
            Long userId = userService.findByUsername(principal.getName()).getId();
            List<OrderResponse> orders;
            if (status != null) {
                orders = orderService.getOrdersByUserIdAndStatus(userId, status);
            } else {
                orders = orderService.getOrdersByUserId(userId);
            }
            return ResponseEntity.ok(ApiResponse.success(orders, "Danh sách đơn hàng của bạn"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy tất cả đơn hàng (chỉ admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status) {
        try {
            List<OrderResponse> orders;
            if (status != null) {
                orders = orderService.getOrdersByStatus(status);
            } else {
                orders = orderService.getAllOrders();
            }
            return ResponseEntity.ok(ApiResponse.success(orders, "Danh sách tất cả đơn hàng"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (chỉ admin)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        try {
            OrderResponse order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật trạng thái đơn hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Hủy đơn hàng
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.cancelOrder(id);
            return ResponseEntity.ok(ApiResponse.success(order, "Hủy đơn hàng thành công"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa đơn hàng (chỉ admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa đơn hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy số lượng đơn hàng theo trạng thái (chỉ admin)
     */
    @GetMapping("/statistics/count-by-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getOrderCountByStatus(
            @RequestParam OrderStatus status) {
        try {
            Long count = orderService.getOrderCountByStatus(status);
            return ResponseEntity.ok(ApiResponse.success(count, "Số lượng đơn hàng: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy số lượng đơn hàng của người dùng
     */
    @GetMapping("/statistics/user-count")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getUserOrderCount(
            @RequestParam Long userId) {
        try {
            Long count = orderService.getOrderCountByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success(count, "Số lượng đơn hàng của người dùng"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
