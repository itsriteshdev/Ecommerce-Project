package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.*;

public interface CartService {
    CartDto getCart(String email);
    CartDto addItemToCart(String email, CartItemRequest request);
    CartDto updateItemQuantity(String email, Long cartItemId, Integer quantity);
    CartDto removeItemFromCart(String email, Long cartItemId);
    void clearCart(String email);
}
