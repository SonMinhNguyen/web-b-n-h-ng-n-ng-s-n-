package com.freshmart.controller;

import com.freshmart.model.dto.request.LoginRequest;
import com.freshmart.model.dto.request.RegisterRequest;
import com.freshmart.model.dto.response.ApiResponse;
import com.freshmart.model.dto.response.AuthResponse;
import com.freshmart.model.dto.response.UserInfoResponse;
import com.freshmart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse authResponse = userService.registerUser(registerRequest);
            return ResponseEntity.ok(ApiResponse.success(authResponse, "Đăng ký thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = userService.authenticateUser(loginRequest.getUsernameOrEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(ApiResponse.success(authResponse, "Đăng nhập thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tên người dùng hoặc mật khẩu không đúng"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserInfoResponse userInfo = userService.getCurrentUserInfo(username);
            return ResponseEntity.ok(ApiResponse.success(userInfo, "Lấy thông tin thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
