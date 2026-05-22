package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.enums.VerificationStatus;
import java.util.List;

public interface SellerService {
    SellerResponseDto getProfile(String email);
    SellerResponseDto updateProfile(String email, RegisterSellerRequest request);
    SellerDashboardDto getDashboard(String email);
    void updateVerificationStatus(Long sellerId, VerificationStatus status);
    List<SellerResponseDto> getAllSellers();
}
