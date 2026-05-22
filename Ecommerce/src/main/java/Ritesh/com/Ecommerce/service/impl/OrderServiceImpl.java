package Ritesh.com.Ecommerce.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.enums.DeliveryStatus;
import Ritesh.com.Ecommerce.enums.PaymentStatus;
import Ritesh.com.Ecommerce.enums.Role;
import Ritesh.com.Ecommerce.exception.BadRequestException;
import Ritesh.com.Ecommerce.exception.InsufficientStockException;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.exception.UnauthorizedException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.service.OrderService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            SellerRepository sellerRepository,
                            ProductRepository productRepository,
                            CouponRepository couponRepository,
                            CartRepository cartRepository,
                            CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    @Transactional
    public List<OrderResponseDto> placeOrders(String email, PlaceOrderRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));

        Cart cart = customer.getCart();
        if (cart == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        // Validate and apply coupon if provided
        BigDecimal discountFactor = BigDecimal.ONE;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon code not found"));

            if (!coupon.isActive() || coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Coupon is expired or inactive");
            }

            BigDecimal discountPct = coupon.getDiscountPercentage();
            // e.g. 15% discount -> multiply prices by (1 - 0.15) = 0.85
            BigDecimal divisor = BigDecimal.valueOf(100);
            BigDecimal discountFraction = discountPct.divide(divisor, 4, RoundingMode.HALF_UP);
            discountFactor = BigDecimal.ONE.subtract(discountFraction);
        }

        // Group cart items by product seller
        Map<Seller, List<CartItem>> itemsBySeller = cart.getItems().stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getSeller()));

        List<Order> createdOrders = new ArrayList<>();

        for (Map.Entry<Seller, List<CartItem>> entry : itemsBySeller.entrySet()) {
            Seller seller = entry.getKey();
            List<CartItem> sellerCartItems = entry.getValue();

            // Create Order
            Order order = Order.builder()
                    .customer(customer)
                    .seller(seller)
                    .shippingAddress(request.getShippingAddress())
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus(PaymentStatus.PENDING)
                    .deliveryStatus(DeliveryStatus.PENDING)
                    .trackingId("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .totalAmount(BigDecimal.ZERO)
                    .build();

            // Save order first to get ID
            order = orderRepository.save(order);

            BigDecimal orderTotal = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : sellerCartItems) {
                Product product = cartItem.getProduct();
                int qty = cartItem.getQuantity();

                // Stock check and deduction
                if (product.getStockQuantity() < qty) {
                    throw new InsufficientStockException("Insufficient stock for product: " + product.getProductName() + 
                            ". Available: " + product.getStockQuantity() + ", Requested: " + qty);
                }
                product.setStockQuantity(product.getStockQuantity() - qty);
                productRepository.save(product);

                // Calculate subtotal with coupon discount factored in
                BigDecimal basePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
                BigDecimal discountedPrice = basePrice.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
                BigDecimal subtotal = discountedPrice.multiply(BigDecimal.valueOf(qty));

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(qty)
                        .price(discountedPrice)
                        .subtotal(subtotal)
                        .build();

                orderTotal = orderTotal.add(subtotal);
                orderItems.add(orderItem);
            }

            order.setOrderedProducts(orderItems);
            order.setTotalAmount(orderTotal);
            
            // Save complete order details
            order = orderRepository.save(order);
            createdOrders.add(order);

            // Accumulate revenue to seller's account (normally when PAID, but let's record it here, or when PAID)
            // Let's add it when payment is completed.
        }

        // Clear cart
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return createdOrders.stream()
                .map(DtoMapper::toOrderResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<OrderResponseDto> getCustomerOrders(String email, Pageable pageable) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));
        return orderRepository.findByCustomer_Id(customer.getId(), pageable).map(DtoMapper::toOrderResponseDto);
    }

    @Override
    public Page<OrderResponseDto> getSellerOrders(String email, Pageable pageable) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found for email: " + email));
        return orderRepository.findBySeller_SellerId(seller.getSellerId(), pageable).map(DtoMapper::toOrderResponseDto);
    }

    @Override
    public OrderResponseDto getOrderById(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check if user has permission to view this order
        boolean isCustomer = order.getCustomer().getEmail().equals(email);
        boolean isSeller = order.getSeller().getEmail().equals(email);

        if (!isCustomer && !isSeller) {
            // Also check if admin
            customerRepository.findByEmail(email).ifPresent(c -> {
                if (c.getUser().getRole() != Role.ROLE_ADMIN) {
                    throw new UnauthorizedException("You are not authorized to view this order");
                }
            });
        }

        return DtoMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (request.getDeliveryStatus() != null) {
            order.setDeliveryStatus(request.getDeliveryStatus());
            if (request.getDeliveryStatus() == DeliveryStatus.DELIVERED) {
                order.setDeliveryDate(LocalDateTime.now());
                
                // On delivery completion, credit seller revenue
                if (order.getPaymentStatus() == PaymentStatus.PAID) {
                    Seller seller = order.getSeller();
                    seller.setRevenue(seller.getRevenue().add(order.getTotalAmount()));
                    sellerRepository.save(seller);
                }
            }
        }

        if (request.getPaymentStatus() != null) {
            PaymentStatus oldStatus = order.getPaymentStatus();
            order.setPaymentStatus(request.getPaymentStatus());
            
            // If transition to PAID and order already DELIVERED, credit revenue
            if (oldStatus != PaymentStatus.PAID && request.getPaymentStatus() == PaymentStatus.PAID && order.getDeliveryStatus() == DeliveryStatus.DELIVERED) {
                Seller seller = order.getSeller();
                seller.setRevenue(seller.getRevenue().add(order.getTotalAmount()));
                sellerRepository.save(seller);
            }
        }

        if (request.getTrackingId() != null) {
            order.setTrackingId(request.getTrackingId());
        }

        order = orderRepository.save(order);
        return DtoMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomer().getEmail().equals(email) && !order.getSeller().getEmail().equals(email)) {
            throw new UnauthorizedException("You are not authorized to cancel this order");
        }

        if (order.getDeliveryStatus() == DeliveryStatus.DELIVERED || order.getDeliveryStatus() == DeliveryStatus.CANCELLED) {
            throw new BadRequestException("Order cannot be cancelled as it is already " + order.getDeliveryStatus());
        }

        order.setDeliveryStatus(DeliveryStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Restore stock levels
        for (OrderItem item : order.getOrderedProducts()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order = orderRepository.save(order);
        return DtoMapper.toOrderResponseDto(order);
    }
}
