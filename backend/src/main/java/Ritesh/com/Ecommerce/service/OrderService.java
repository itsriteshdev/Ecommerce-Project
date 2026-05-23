package Ritesh.com.Ecommerce.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import Ritesh.com.Ecommerce.dto.*;

import java.util.List;

public interface OrderService {
    List<OrderResponseDto> placeOrders(String email, PlaceOrderRequest request);
    Page<OrderResponseDto> getCustomerOrders(String email, Pageable pageable);
    Page<OrderResponseDto> getSellerOrders(String email, Pageable pageable);
    OrderResponseDto getOrderById(Long orderId, String email);
    OrderResponseDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
    OrderResponseDto cancelOrder(Long orderId, String email);
}
