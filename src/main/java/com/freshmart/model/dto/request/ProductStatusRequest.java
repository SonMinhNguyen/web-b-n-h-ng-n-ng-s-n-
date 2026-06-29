package com.freshmart.model.dto.request;

import com.freshmart.model.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatusRequest {

    @NotNull(message = "Trạng thái sản phẩm là bắt buộc")
    private ProductStatus status;
}
