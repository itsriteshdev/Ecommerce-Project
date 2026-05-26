package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/customer")
    public ResponseEntity<CustomerResponseDto> registerCustomer(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.registerCustomer(request), HttpStatus.CREATED);
    }

    @PostMapping("/register/seller")
    public ResponseEntity<SellerResponseDto> registerSeller(@Valid @RequestBody RegisterSellerRequest request) {
        return new ResponseEntity<>(authService.registerSeller(request), HttpStatus.CREATED);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email, @RequestParam String newPassword) {
        authService.forgotPassword(email, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }
}
