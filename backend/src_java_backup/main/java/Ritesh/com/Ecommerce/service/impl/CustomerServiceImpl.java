package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.Customer;
import Ritesh.com.Ecommerce.entity.Product;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.CustomerRepository;
import Ritesh.com.Ecommerce.repository.ProductRepository;
import Ritesh.com.Ecommerce.service.CustomerService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository, ProductRepository productRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    public CustomerResponseDto getProfile(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));
        return DtoMapper.toCustomerResponseDto(customer);
    }

    @Override
    @Transactional
    public CustomerResponseDto updateProfile(String email, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));

        if (request.getFullName() != null) customer.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) customer.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfileImage() != null) customer.setProfileImage(request.getProfileImage());
        if (request.getGender() != null) customer.setGender(request.getGender());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getCity() != null) customer.setCity(request.getCity());
        if (request.getState() != null) customer.setState(request.getState());
        if (request.getPincode() != null) customer.setPincode(request.getPincode());

        customer = customerRepository.save(customer);
        return DtoMapper.toCustomerResponseDto(customer);
    }

    @Override
    @Transactional
    public void addToWishlist(String email, Long productId) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!customer.getWishlist().contains(product)) {
            customer.getWishlist().add(product);
            customerRepository.save(customer);
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (customer.getWishlist().contains(product)) {
            customer.getWishlist().remove(product);
            customerRepository.save(customer);
        }
    }

    @Override
    public List<ProductResponseDto> getWishlist(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));

        return customer.getWishlist().stream()
                .map(DtoMapper::toProductResponseDto)
                .collect(Collectors.toList());
    }
}
