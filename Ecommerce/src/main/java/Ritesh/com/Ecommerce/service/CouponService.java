package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.CouponDto;
import java.util.List;

public interface CouponService {
    CouponDto createCoupon(CouponDto couponDto);
    List<CouponDto> getAllCoupons();
    CouponDto getCouponByCode(String code);
    void deleteCoupon(Long couponId);
}
