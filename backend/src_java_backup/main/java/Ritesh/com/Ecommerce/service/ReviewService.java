package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.*;
import java.util.List;

public interface ReviewService {
    ReviewResponseDto addReview(String email, ReviewRequestDto request);
    List<ReviewResponseDto> getProductReviews(Long productId);
}
