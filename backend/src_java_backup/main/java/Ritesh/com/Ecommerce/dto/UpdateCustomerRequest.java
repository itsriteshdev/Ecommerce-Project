package Ritesh.com.Ecommerce.dto;

import lombok.Data;
import Ritesh.com.Ecommerce.enums.Gender;

@Data
public class UpdateCustomerRequest {
    private String fullName;
    private String phoneNumber;
    private String profileImage;
    private Gender gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
}
