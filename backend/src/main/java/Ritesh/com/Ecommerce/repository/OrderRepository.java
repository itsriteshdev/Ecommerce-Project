package Ritesh.com.Ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import Ritesh.com.Ecommerce.entity.Order;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomer_Id(Long customerId, Pageable pageable);
    Page<Order> findBySeller_SellerId(Long sellerId, Pageable pageable);
    List<Order> findBySeller_SellerId(Long sellerId);
}
