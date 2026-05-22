package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.CustomerService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerResponseDto> getProfile(Principal principal) {
        return ResponseEntity.ok(customerService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<CustomerResponseDto> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<String> addToWishlist(Principal principal, @PathVariable Long productId) {
        customerService.addToWishlist(principal.getName(), productId);
        return ResponseEntity.ok("Product added to wishlist successfully");
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<String> removeFromWishlist(Principal principal, @PathVariable Long productId) {
        customerService.removeFromWishlist(principal.getName(), productId);
        return ResponseEntity.ok("Product removed from wishlist successfully");
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<ProductResponseDto>> getWishlist(Principal principal) {
        return ResponseEntity.ok(customerService.getWishlist(principal.getName()));
    }
}
