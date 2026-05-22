package Ritesh.com.Ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterSellerRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Seller name is required")
    private String sellerName;

    @NotBlank(message = "Business name is required")
    private String businessName;

    private String gstNumber;
    private String phoneNumber;
    private String warehouseAddress;
    private String bankDetails;
}
