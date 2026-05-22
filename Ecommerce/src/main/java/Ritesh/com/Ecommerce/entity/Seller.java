package Ritesh.com.Ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import Ritesh.com.Ecommerce.enums.VerificationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sellers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {
    @Id
    private Long sellerId;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "seller_id")
    private User user;

    @Column(nullable = false)
    private String sellerName;

    @Column(nullable = false)
    private String businessName;

    private String gstNumber;

    @Column(nullable = false)
    private String email;

    private String phoneNumber;
    private String warehouseAddress;
    private String bankDetails;
    private String sellerLogo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus;

    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Builder.Default
    private Double ratings = 0.0;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
