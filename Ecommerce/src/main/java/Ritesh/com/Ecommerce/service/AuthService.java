package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    CustomerResponseDto registerCustomer(RegisterRequest request);
    SellerResponseDto registerSeller(RegisterSellerRequest request);
    void forgotPassword(String email, String newPassword);
}
