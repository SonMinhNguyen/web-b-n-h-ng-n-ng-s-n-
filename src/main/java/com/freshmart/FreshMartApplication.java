package com.freshmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Điểm khởi động chính của ứng dụng Fresh Mart.
 * Chạy lệnh: mvn spring-boot:run để khởi động server.
 */
@SpringBootApplication
public class FreshMartApplication {
    public static void main(String[] args) {
        SpringApplication.run(FreshMartApplication.class, args);
    }
}
