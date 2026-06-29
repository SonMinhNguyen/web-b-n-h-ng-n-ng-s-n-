package com.freshmart.controller;

import com.freshmart.model.dto.request.ReviewRequest;
import com.freshmart.model.dto.response.ApiResponse;
import com.freshmart.model.dto.response.ReviewResponse;
import com.freshmart.model.dto.response.ProductReviewStatsResponse;
import com.freshmart.model.entity.User;
import com.freshmart.repository.UserRepository;
import com.freshmart.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all reviews for a specific product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId) {
        try {
            List<ReviewResponse> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(ApiResponse.success(reviews, "Danh sách đánh giá sản phẩm"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get review statistics for a product (average rating, total reviews, and all reviews)
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<ApiResponse<ProductReviewStatsResponse>> getProductReviewStats(
            @PathVariable Long productId) {
        try {
            ProductReviewStatsResponse stats = reviewService.getProductReviewStats(productId);
            return ResponseEntity.ok(ApiResponse.success(stats, "Thống kê đánh giá sản phẩm"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all reviews by a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(
            @PathVariable Long userId) {
        try {
            List<ReviewResponse> reviews = reviewService.getUserReviews(userId);
            return ResponseEntity.ok(ApiResponse.success(reviews, "Danh sách đánh giá của người dùng"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get a specific review by ID
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long reviewId) {
        try {
            ReviewResponse review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(ApiResponse.success(review, "Chi tiết đánh giá"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create a new review for a product
     */
    @PreAuthorize("hasRole('CUSTOMER')") 
    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            Long userId = getCurrentUserId();
            ReviewResponse response = reviewService.createReview(productId, userId, reviewRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Tạo đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi tạo đánh giá: " + e.getMessage()));
        }
    }

    /**
     * Update an existing review
     */
    @PreAuthorize("hasRole('CUSTOMER')") 
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            Long userId = getCurrentUserId();
            ReviewResponse response = reviewService.updateReview(reviewId, userId, reviewRequest);
            return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật đánh giá thành công"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("không tồn tại")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi khi cập nhật đánh giá: " + e.getMessage()));
        }
    }

    /**
     * Delete a review by the user who created it
     */
    @PreAuthorize("hasRole('CUSTOMER')") 
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        try {
            Long userId = getCurrentUserId();
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete a review by admin (with ADMIN role)
     */
    @PreAuthorize("hasRole('ADMIN')") 
    @DeleteMapping("/{reviewId}/admin")
    public ResponseEntity<ApiResponse<Void>> deleteReviewByAdmin(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReviewByAdmin(reviewId);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Helper method to get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
            return user.getId();
        }
        throw new RuntimeException("Không thể xác định người dùng hiện tại");
    }
}
