package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.service.ReviewService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             CustomerRepository customerRepository,
                             ProductRepository productRepository,
                             SellerRepository sellerRepository) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    @Override
    @Transactional
    public ReviewResponseDto addReview(String email, ReviewRequestDto request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Recalculate and update average rating of the product
        List<Review> productReviews = reviewRepository.findByProduct_ProductId(product.getProductId());
        double avgRating = productReviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);

        product.setRatings(avgRating);
        productRepository.save(product);

        // Recalculate average rating of the seller
        Seller seller = product.getSeller();
        if (seller != null) {
            double avgSellerRating = seller.getProducts().stream()
                    .mapToDouble(Product::getRatings)
                    .filter(r -> r > 0)
                    .average()
                    .orElse(0.0);
            seller.setRatings(avgSellerRating);
            sellerRepository.save(seller);
        }

        return DtoMapper.toReviewResponseDto(review);
    }

    @Override
    public List<ReviewResponseDto> getProductReviews(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return reviewRepository.findByProduct_ProductId(productId).stream()
                .map(DtoMapper::toReviewResponseDto)
                .collect(Collectors.toList());
    }
}
