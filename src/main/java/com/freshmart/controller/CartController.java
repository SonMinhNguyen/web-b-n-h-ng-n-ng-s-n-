package com.freshmart.controller;

import com.freshmart.model.dto.request.CartItemRequest;
import com.freshmart.model.dto.response.ApiResponse;
import com.freshmart.model.dto.response.CartResponse;
import com.freshmart.model.entity.User;
import com.freshmart.service.CartService;
import com.freshmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            CartResponse cartResponse = cartService.getCart(userId);
            return ResponseEntity.ok(ApiResponse.success(cartResponse, "Giỏ hàng của bạn"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> addCartItem(
            @Valid @RequestBody CartItemRequest cartItemRequest,
            Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            CartResponse cartResponse = cartService.addItem(userId, cartItemRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(cartResponse, "Thêm sản phẩm vào giỏ hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam Integer quantity,
            Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            CartResponse cartResponse = cartService.updateItem(userId, itemId, quantity);
            return ResponseEntity.ok(ApiResponse.success(cartResponse, "Cập nhật số lượng giỏ hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @PathVariable Long itemId,
            Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            CartResponse cartResponse = cartService.removeItem(userId, itemId);
            return ResponseEntity.ok(ApiResponse.success(cartResponse, "Xóa sản phẩm khỏi giỏ hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            CartResponse cartResponse = cartService.clearCart(userId);
            return ResponseEntity.ok(ApiResponse.success(cartResponse, "Giỏ hàng đã được làm mới"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    private Long getCurrentUserId(Principal principal) {
        return userService.findByUsername(principal.getName()).getId();
    }
}
