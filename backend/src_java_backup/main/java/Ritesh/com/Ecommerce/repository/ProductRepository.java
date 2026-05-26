package Ritesh.com.Ecommerce.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Ritesh.com.Ecommerce.entity.Product;

import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);
    
    Page<Product> findBySeller_SellerId(Long sellerId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = :category) AND " +
           "(:brand IS NULL OR LOWER(p.brand) = :brand) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:inStock IS NULL OR (:inStock = true AND p.stockQuantity > 0) OR (:inStock = false AND p.stockQuantity = 0))")
    Page<Product> filterProducts(
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") Boolean inStock,
            Pageable pageable
    );

    boolean existsBySku(String sku);
}
