package Ritesh.com.Ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import Ritesh.com.Ecommerce.dto.ProductResponseDto;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardDto {
    private Long sellerId;
    private String businessName;
    private BigDecimal totalRevenue;
    private Long totalProducts;
    private Long totalOrdersPlaced;
    private Double sellerRating;
    private List<ProductResponseDto> topProducts;
}
