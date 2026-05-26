package Ritesh.com.Ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private Long productId;
    private String productName;
    private String description;
    private String category;
    private String brand;
    private String sku;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private List<String> productImages;
    private Map<String, String> specifications;
    private Double ratings;
    private String deliveryInfo;
    private Long sellerId;
    private String sellerBusinessName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
