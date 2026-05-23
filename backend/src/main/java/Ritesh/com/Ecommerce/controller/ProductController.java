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
import Ritesh.com.Ecommerce.service.ProductService;
import Ritesh.com.Ecommerce.config.DataSeeder;

import java.math.BigDecimal;
import java.security.Principal;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final DataSeeder dataSeeder;

    public ProductController(ProductService productService, DataSeeder dataSeeder) {
        this.productService = productService;
        this.dataSeeder = dataSeeder;
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponseDto> addProduct(
            Principal principal,
            @Valid @RequestBody ProductRequestDto request) {
        return new ResponseEntity<>(productService.addProduct(principal.getName(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponseDto> updateProduct(
            Principal principal,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequestDto request) {
        return ResponseEntity.ok(productService.updateProduct(principal.getName(), productId, request));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(Principal principal, @PathVariable Long productId) {
        productService.deleteProduct(principal.getName(), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDto>> getAllProducts(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponseDto>> searchProducts(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(productService.searchProducts(query, pageable));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponseDto>> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(productService.filterProducts(category, brand, minPrice, maxPrice, inStock, pageable));
    }

    @GetMapping("/seed")
    public ResponseEntity<String> seedDatabase() {
        try {
            dataSeeder.run();
            return ResponseEntity.ok("Database seeded successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to seed database: " + e.getMessage());
        }
    }
}
