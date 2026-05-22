package Ritesh.com.Ecommerce.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.enums.AccountStatus;
import Ritesh.com.Ecommerce.enums.Role;
import Ritesh.com.Ecommerce.enums.VerificationStatus;
import Ritesh.com.Ecommerce.exception.BadRequestException;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.security.JwtTokenProvider;
import Ritesh.com.Ecommerce.service.AuthService;

import java.math.BigDecimal;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserRepository userRepository,
                           CustomerRepository customerRepository,
                           SellerRepository sellerRepository,
                           CartRepository cartRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .id(user.getId())
                .build();
    }

    @Override
    @Transactional
    public CustomerResponseDto registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_CUSTOMER)
                .build();

        user = userRepository.save(user);

        Customer customer = Customer.builder()
                .id(user.getId())
                .user(user)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        customer = customerRepository.save(customer);

        // Auto-create cart for customer
        Cart cart = Cart.builder()
                .customer(customer)
                .totalAmount(BigDecimal.ZERO)
                .build();
        cartRepository.save(cart);

        customer.setCart(cart);

        return DtoMapper.toCustomerResponseDto(customer);
    }

    @Override
    @Transactional
    public SellerResponseDto registerSeller(RegisterSellerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_SELLER)
                .build();

        user = userRepository.save(user);

        Seller seller = Seller.builder()
                .sellerId(user.getId())
                .user(user)
                .sellerName(request.getSellerName())
                .businessName(request.getBusinessName())
                .gstNumber(request.getGstNumber())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .warehouseAddress(request.getWarehouseAddress())
                .bankDetails(request.getBankDetails())
                .verificationStatus(VerificationStatus.PENDING)
                .revenue(BigDecimal.ZERO)
                .ratings(0.0)
                .build();

        seller = sellerRepository.save(seller);

        return DtoMapper.toSellerResponseDto(seller);
    }

    @Override
    @Transactional
    public void forgotPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
