package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.exception.BadRequestException;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.service.CartService;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           CustomerRepository customerRepository,
                           ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    private Cart getOrCreateCustomerCart(Customer customer) {
        return cartRepository.findByCustomer_Id(customer.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .totalAmount(BigDecimal.ZERO)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Override
    public CartDto getCart(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
        Cart cart = getOrCreateCustomerCart(customer);
        return DtoMapper.toCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto addItemToCart(String email, CartItemRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
        
        Cart cart = getOrCreateCustomerCart(customer);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(product.getProductId()))
                .findFirst();

        BigDecimal itemPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Total requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setSubtotal(itemPrice.multiply(BigDecimal.valueOf(newQuantity)));
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .subtotal(itemPrice.multiply(BigDecimal.valueOf(request.getQuantity())))
                    .build();
            cart.getItems().add(cartItem);
            cartItemRepository.save(cartItem);
        }

        recalculateCartTotal(cart);
        cart = cartRepository.save(cart);

        return DtoMapper.toCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateItemQuantity(String email, Long cartItemId, Integer quantity) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
        
        Cart cart = getOrCreateCustomerCart(customer);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        BigDecimal itemPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
        cartItem.setQuantity(quantity);
        cartItem.setSubtotal(itemPrice.multiply(BigDecimal.valueOf(quantity)));
        cartItemRepository.save(cartItem);

        recalculateCartTotal(cart);
        cart = cartRepository.save(cart);

        return DtoMapper.toCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeItemFromCart(String email, Long cartItemId) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
        
        Cart cart = getOrCreateCustomerCart(customer);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        recalculateCartTotal(cart);
        cart = cartRepository.save(cart);

        return DtoMapper.toCartDto(cart);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
        
        Cart cart = getOrCreateCustomerCart(customer);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private void recalculateCartTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(total);
    }
}
