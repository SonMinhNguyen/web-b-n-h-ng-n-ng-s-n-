package com.freshmart.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductReviewStatsResponse {

    private Long productId;

    private String productName;

    private Double averageRating;

    private Long totalReviews;

    private List<ReviewResponse> reviews;
}
