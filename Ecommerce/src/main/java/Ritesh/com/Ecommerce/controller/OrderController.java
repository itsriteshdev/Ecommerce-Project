package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.OrderService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponseDto>> placeOrders(
            Principal principal,
            @Valid @RequestBody PlaceOrderRequest request) {
        return new ResponseEntity<>(orderService.placeOrders(principal.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderResponseDto>> getCustomerOrders(
            Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(orderService.getCustomerOrders(principal.getName(), pageable));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Page<OrderResponseDto>> getSellerOrders(
            Principal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(orderService.getSellerOrders(principal.getName(), pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrderById(Principal principal, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, principal.getName()));
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(Principal principal, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, principal.getName()));
    }
}
