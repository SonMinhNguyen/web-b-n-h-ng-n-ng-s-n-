package com.freshmart.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Cấu trúc phản hồi chuẩn cho toàn bộ API.
 * Mọi endpoint đều trả về định dạng này để thống nhất.
 *
 * @param <T> Kiểu dữ liệu trả về trong trường data
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    /** Trạng thái xử lý: true = thành công, false = thất bại */
    private boolean success;

    /** Thông báo kết quả gửi về cho client */
    private String message;

    /** Dữ liệu trả về (có thể là object, list, hoặc null nếu lỗi) */
    private T data;

    /**
     * Tạo phản hồi thành công kèm dữ liệu
     *
     * @param data    Dữ liệu cần trả về
     * @param message Thông báo thành công
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Tạo phản hồi lỗi (không kèm dữ liệu)
     *
     * @param message Thông báo lỗi
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
