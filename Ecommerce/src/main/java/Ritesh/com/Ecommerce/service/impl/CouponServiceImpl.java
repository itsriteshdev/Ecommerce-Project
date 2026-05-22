package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.CouponDto;
import Ritesh.com.Ecommerce.entity.Coupon;
import Ritesh.com.Ecommerce.exception.BadRequestException;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.CouponRepository;
import Ritesh.com.Ecommerce.service.CouponService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    public CouponServiceImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    @Transactional
    public CouponDto createCoupon(CouponDto couponDto) {
        if (couponRepository.existsByCodeIgnoreCase(couponDto.getCode())) {
            throw new BadRequestException("Coupon code " + couponDto.getCode() + " already exists");
        }

        Coupon coupon = DtoMapper.toCoupon(couponDto);
        coupon.setActive(true);
        coupon = couponRepository.save(coupon);
        return DtoMapper.toCouponDto(coupon);
    }

    @Override
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(DtoMapper::toCouponDto)
                .collect(Collectors.toList());
    }

    @Override
    public CouponDto getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));
        return DtoMapper.toCouponDto(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long couponId) {
        if (!couponRepository.existsById(couponId)) {
            throw new ResourceNotFoundException("Coupon not found with id: " + couponId);
        }
        couponRepository.deleteById(couponId);
    }
}
