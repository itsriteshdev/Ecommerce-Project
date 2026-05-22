package Ritesh.com.Ecommerce.mapper;

import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.entity.OrderItem;
import Ritesh.com.Ecommerce.dto.OrderItemDto;

import java.util.Collections;
import java.util.stream.Collectors;

public class DtoMapper {

    public static CustomerResponseDto toCustomerResponseDto(Customer customer) {
        if (customer == null) return null;
        return CustomerResponseDto.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .profileImage(customer.getProfileImage())
                .gender(customer.getGender())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .pincode(customer.getPincode())
                .accountStatus(customer.getAccountStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public static SellerResponseDto toSellerResponseDto(Seller seller) {
        if (seller == null) return null;
        return SellerResponseDto.builder()
                .sellerId(seller.getSellerId())
                .sellerName(seller.getSellerName())
                .businessName(seller.getBusinessName())
                .gstNumber(seller.getGstNumber())
                .email(seller.getEmail())
                .phoneNumber(seller.getPhoneNumber())
                .warehouseAddress(seller.getWarehouseAddress())
                .bankDetails(seller.getBankDetails())
                .sellerLogo(seller.getSellerLogo())
                .verificationStatus(seller.getVerificationStatus())
                .revenue(seller.getRevenue())
                .ratings(seller.getRatings())
                .createdAt(seller.getCreatedAt())
                .updatedAt(seller.getUpdatedAt())
                .build();
    }

    public static ProductResponseDto toProductResponseDto(Product product) {
        if (product == null) return null;
        return ProductResponseDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .brand(product.getBrand())
                .sku(product.getSku())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .productImages(product.getProductImages())
                .specifications(product.getSpecifications())
                .ratings(product.getRatings())
                .deliveryInfo(product.getDeliveryInfo())
                .sellerId(product.getSeller() != null ? product.getSeller().getSellerId() : null)
                .sellerBusinessName(product.getSeller() != null ? product.getSeller().getBusinessName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static CartItemDto toCartItemDto(CartItem item) {
        if (item == null) return null;
        return CartItemDto.builder()
                .cartItemId(item.getCartItemId())
                .productId(item.getProduct().getProductId())
                .productName(item.getProduct().getProductName())
                .productSku(item.getProduct().getSku())
                .productImage(item.getProduct().getProductImages().isEmpty() ? null : item.getProduct().getProductImages().get(0))
                .price(item.getProduct().getDiscountPrice() != null ? item.getProduct().getDiscountPrice() : item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    public static CartDto toCartDto(Cart cart) {
        if (cart == null) return null;
        return CartDto.builder()
                .cartId(cart.getCartId())
                .customerId(cart.getCustomer().getId())
                .items(cart.getItems() != null ? 
                        cart.getItems().stream().map(DtoMapper::toCartItemDto).collect(Collectors.toList()) : 
                        Collections.emptyList())
                .totalAmount(cart.getTotalAmount())
                .build();
    }

    public static OrderItemDto toOrderItemDto(OrderItem item) {
        if (item == null) return null;
        return OrderItemDto.builder()
                .orderItemId(item.getOrderItemId())
                .productId(item.getProduct().getProductId())
                .productName(item.getProduct().getProductName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    public static OrderResponseDto toOrderResponseDto(Order order) {
        if (order == null) return null;
        return OrderResponseDto.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName())
                .sellerId(order.getSeller().getSellerId())
                .sellerBusinessName(order.getSeller().getBusinessName())
                .items(order.getOrderedProducts() != null ?
                        order.getOrderedProducts().stream().map(DtoMapper::toOrderItemDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .deliveryStatus(order.getDeliveryStatus())
                .trackingId(order.getTrackingId())
                .orderDate(order.getOrderDate())
                .deliveryDate(order.getDeliveryDate())
                .build();
    }

    public static ReviewResponseDto toReviewResponseDto(Review review) {
        if (review == null) return null;
        return ReviewResponseDto.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getFullName())
                .productId(review.getProduct().getProductId())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public static CouponDto toCouponDto(Coupon coupon) {
        if (coupon == null) return null;
        CouponDto dto = new CouponDto();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDiscountPercentage(coupon.getDiscountPercentage());
        dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        dto.setExpiryDate(coupon.getExpiryDate());
        dto.setActive(coupon.isActive());
        return dto;
    }

    public static Coupon toCoupon(CouponDto dto) {
        if (dto == null) return null;
        return Coupon.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .discountPercentage(dto.getDiscountPercentage())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .expiryDate(dto.getExpiryDate())
                .active(dto.isActive())
                .build();
    }

    public static NotificationDto toNotificationDto(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
