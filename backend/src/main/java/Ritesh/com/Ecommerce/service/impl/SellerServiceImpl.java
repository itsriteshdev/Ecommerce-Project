package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.*;
import Ritesh.com.Ecommerce.entity.*;
import Ritesh.com.Ecommerce.enums.VerificationStatus;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.*;
import Ritesh.com.Ecommerce.service.SellerService;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final OrderRepository orderRepository;

    public SellerServiceImpl(SellerRepository sellerRepository,
                             OrderRepository orderRepository) {
        this.sellerRepository = sellerRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public SellerResponseDto getProfile(String email) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found for email: " + email));
        return DtoMapper.toSellerResponseDto(seller);
    }

    @Override
    @Transactional
    public SellerResponseDto updateProfile(String email, RegisterSellerRequest request) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found for email: " + email));

        if (request.getSellerName() != null) seller.setSellerName(request.getSellerName());
        if (request.getBusinessName() != null) seller.setBusinessName(request.getBusinessName());
        if (request.getGstNumber() != null) seller.setGstNumber(request.getGstNumber());
        if (request.getPhoneNumber() != null) seller.setPhoneNumber(request.getPhoneNumber());
        if (request.getWarehouseAddress() != null) seller.setWarehouseAddress(request.getWarehouseAddress());
        if (request.getBankDetails() != null) seller.setBankDetails(request.getBankDetails());

        seller = sellerRepository.save(seller);
        return DtoMapper.toSellerResponseDto(seller);
    }

    @Override
    public SellerDashboardDto getDashboard(String email) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found for email: " + email));

        List<Order> sellerOrders = orderRepository.findBySeller_SellerId(seller.getSellerId());
        
        // Sum total revenue from orders
        BigDecimal totalRevenue = sellerOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Product count
        long totalProducts = seller.getProducts().size();

        // Top 5 products
        List<ProductResponseDto> topProducts = seller.getProducts().stream()
                .sorted((p1, p2) -> Double.compare(p2.getRatings(), p1.getRatings()))
                .limit(5)
                .map(DtoMapper::toProductResponseDto)
                .collect(Collectors.toList());

        return SellerDashboardDto.builder()
                .sellerId(seller.getSellerId())
                .businessName(seller.getBusinessName())
                .totalRevenue(totalRevenue)
                .totalProducts(totalProducts)
                .totalOrdersPlaced((long) sellerOrders.size())
                .sellerRating(seller.getRatings())
                .topProducts(topProducts)
                .build();
    }

    @Override
    @Transactional
    public void updateVerificationStatus(Long sellerId, VerificationStatus status) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        seller.setVerificationStatus(status);
        sellerRepository.save(seller);
    }

    @Override
    public List<SellerResponseDto> getAllSellers() {
        return sellerRepository.findAll().stream()
                .map(DtoMapper::toSellerResponseDto)
                .collect(Collectors.toList());
    }
}
