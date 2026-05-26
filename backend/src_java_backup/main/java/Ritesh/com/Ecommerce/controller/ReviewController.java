package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.ReviewService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDto> addReview(
            Principal principal,
            @Valid @RequestBody ReviewRequestDto request) {
        return new ResponseEntity<>(reviewService.addReview(principal.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }
}
