package Ritesh.com.Ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import Ritesh.com.Ecommerce.enums.AccountStatus;
import Ritesh.com.Ecommerce.enums.Gender;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profileImage;
    private Gender gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private AccountStatus accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
