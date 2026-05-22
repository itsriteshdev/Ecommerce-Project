package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.CartService;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItemToCart(
            Principal principal,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(principal.getName(), request));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> updateItemQuantity(
            Principal principal,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(principal.getName(), cartItemId, quantity));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> removeItemFromCart(Principal principal, @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(principal.getName(), cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<String> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.ok("Cart cleared successfully");
    }
}
