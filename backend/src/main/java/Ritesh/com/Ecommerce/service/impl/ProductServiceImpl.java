package Ritesh.com.Ecommerce.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.exception.BadRequestException;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.exception.UnauthorizedException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.service.ProductService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ProductServiceImpl(ProductRepository productRepository, SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    @Override
    @Transactional
    public ProductResponseDto addProduct(String sellerEmail, ProductRequestDto request) {
        Seller seller = sellerRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with email: " + sellerEmail));

        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = Product.builder()
                .productName(request.getProductName())
                .description(request.getDescription())
                .category(request.getCategory())
                .brand(request.getBrand())
                .sku(request.getSku())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .productImages(request.getProductImages() != null ? request.getProductImages() : new ArrayList<>())
                .specifications(request.getSpecifications() != null ? request.getSpecifications() : new HashMap<>())
                .deliveryInfo(request.getDeliveryInfo())
                .seller(seller)
                .ratings(0.0)
                .build();

        product = productRepository.save(product);
        return DtoMapper.toProductResponseDto(product);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(String sellerEmail, Long productId, ProductRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new UnauthorizedException("You are not authorized to update this product");
        }

        // Check if SKU is changed and already exists
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU " + request.getSku() + " already exists");
        }

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getProductImages() != null) product.setProductImages(request.getProductImages());
        if (request.getSpecifications() != null) product.setSpecifications(request.getSpecifications());
        product.setDeliveryInfo(request.getDeliveryInfo());

        product = productRepository.save(product);
        return DtoMapper.toProductResponseDto(product);
    }

    @Override
    @Transactional
    public void deleteProduct(String sellerEmail, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getEmail().equals(sellerEmail)) {
            throw new UnauthorizedException("You are not authorized to delete this product");
        }

        productRepository.delete(product);
    }

    @Override
    public ProductResponseDto getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return DtoMapper.toProductResponseDto(product);
    }

    @Override
    public Page<ProductResponseDto> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(DtoMapper::toProductResponseDto);
    }

    @Override
    public Page<ProductResponseDto> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable).map(DtoMapper::toProductResponseDto);
    }

    @Override
    public Page<ProductResponseDto> filterProducts(
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            Pageable pageable
    ) {
        String categoryLower = (category != null) ? category.trim().toLowerCase() : null;
        String brandLower = (brand != null) ? brand.trim().toLowerCase() : null;
        return productRepository.filterProducts(categoryLower, brandLower, minPrice, maxPrice, inStock, pageable)
                .map(DtoMapper::toProductResponseDto);
    }
}
