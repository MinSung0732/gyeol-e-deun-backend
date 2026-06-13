package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.Product;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByDeletedAtIsNull();
    Page<Product> findByDeletedAtIsNull(Pageable pageable);
    Optional<Product> findByProductIdAndDeletedAtIsNull(Long productId);
    List<Product> findByDeletedAtIsNotNullOrderByDeletedAtDesc();
    List<Product> findByDeletedAtBefore(LocalDateTime expiredAt);
    List<Product> findByProductIdInAndDeletedAtIsNotNull(List<Long> productIds);
}
