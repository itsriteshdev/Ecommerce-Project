package Ritesh.com.Ecommerce.dto;

import lombok.Data;
import Ritesh.com.Ecommerce.enums.DeliveryStatus;
import Ritesh.com.Ecommerce.enums.PaymentStatus;

@Data
public class UpdateOrderStatusRequest {
    private DeliveryStatus deliveryStatus;
    private PaymentStatus paymentStatus;
    private String trackingId;
}
