package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.enums.VerificationStatus;
import Ritesh.com.Ecommerce.service.CouponService;
import Ritesh.com.Ecommerce.service.SellerService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final SellerService sellerService;
    private final CouponService couponService;

    public AdminController(SellerService sellerService, CouponService couponService) {
        this.sellerService = sellerService;
        this.couponService = couponService;
    }

    // Seller administration
    @GetMapping("/sellers")
    public ResponseEntity<List<SellerResponseDto>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    @PutMapping("/sellers/{sellerId}/verify")
    public ResponseEntity<String> verifySeller(
            @PathVariable Long sellerId,
            @RequestParam VerificationStatus status) {
        sellerService.updateVerificationStatus(sellerId, status);
        return ResponseEntity.ok("Seller verification status updated to: " + status);
    }

    // Coupon administration
    @PostMapping("/coupons")
    public ResponseEntity<CouponDto> createCoupon(@Valid @RequestBody CouponDto couponDto) {
        return new ResponseEntity<>(couponService.createCoupon(couponDto), HttpStatus.CREATED);
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponDto>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @DeleteMapping("/coupons/{couponId}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long couponId) {
        couponService.deleteCoupon(couponId);
        return ResponseEntity.noContent().build();
    }
}
