package com.freshmart.exception;

/**
 * Ngoại lệ khi không tìm thấy tài nguyên trong cơ sở dữ liệu.
 * Sẽ được bắt bởi GlobalExceptionHandler và trả về mã lỗi HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Khởi tạo lỗi với thông báo tuỳ chỉnh
     *
     * @param message Nội dung thông báo lỗi
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Khởi tạo lỗi với tên tài nguyên và id cụ thể
     *
     * @param resource Tên tài nguyên (ví dụ: "Sản phẩm", "Đơn hàng")
     * @param id       ID không tồn tại
     */
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " không tồn tại với id: " + id);
    }
}
