package Ritesh.com.Ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import Ritesh.com.Ecommerce.enums.VerificationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerResponseDto {
    private Long sellerId;
    private String sellerName;
    private String businessName;
    private String gstNumber;
    private String email;
    private String phoneNumber;
    private String warehouseAddress;
    private String bankDetails;
    private String sellerLogo;
    private VerificationStatus verificationStatus;
    private BigDecimal revenue;
    private Double ratings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
