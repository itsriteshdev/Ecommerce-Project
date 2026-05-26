package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.*;
import java.util.List;

public interface CustomerService {
    CustomerResponseDto getProfile(String email);
    CustomerResponseDto updateProfile(String email, UpdateCustomerRequest request);
    void addToWishlist(String email, Long productId);
    void removeFromWishlist(String email, Long productId);
    List<ProductResponseDto> getWishlist(String email);
}
