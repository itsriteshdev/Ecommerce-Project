package Ritesh.com.Ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import Ritesh.com.Ecommerce.enums.DeliveryStatus;
import Ritesh.com.Ecommerce.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private Long sellerId;
    private String sellerBusinessName;
    private List<OrderItemDto> items;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private String shippingAddress;
    private DeliveryStatus deliveryStatus;
    private String trackingId;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
}
