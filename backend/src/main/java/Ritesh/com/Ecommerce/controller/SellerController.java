package Ritesh.com.Ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.service.SellerService;

import java.security.Principal;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<SellerResponseDto> getProfile(Principal principal) {
        return ResponseEntity.ok(sellerService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerResponseDto> updateProfile(
            Principal principal,
            @Valid @RequestBody RegisterSellerRequest request) {
        return ResponseEntity.ok(sellerService.updateProfile(principal.getName(), request));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SellerDashboardDto> getDashboard(Principal principal) {
        return ResponseEntity.ok(sellerService.getDashboard(principal.getName()));
    }
}
