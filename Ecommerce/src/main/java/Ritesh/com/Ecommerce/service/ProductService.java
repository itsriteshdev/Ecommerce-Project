package Ritesh.com.Ecommerce.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import Ritesh.com.Ecommerce.dto.*;

import java.math.BigDecimal;

public interface ProductService {
    ProductResponseDto addProduct(String sellerEmail, ProductRequestDto request);
    ProductResponseDto updateProduct(String sellerEmail, Long productId, ProductRequestDto request);
    void deleteProduct(String sellerEmail, Long productId);
    ProductResponseDto getProductById(Long productId);
    Page<ProductResponseDto> getAllProducts(Pageable pageable);
    Page<ProductResponseDto> searchProducts(String query, Pageable pageable);
    Page<ProductResponseDto> filterProducts(
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            Pageable pageable
    );
}
