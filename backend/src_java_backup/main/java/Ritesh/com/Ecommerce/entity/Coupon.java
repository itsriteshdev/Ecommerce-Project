package Ritesh.com.Ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private BigDecimal discountPercentage;

    private BigDecimal maxDiscountAmount;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Builder.Default
    private boolean active = true;
}
