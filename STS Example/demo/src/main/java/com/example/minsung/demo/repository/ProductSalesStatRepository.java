package com.example.minsung.demo.repository;

import com.example.minsung.demo.dto.productDto.TopProductStatDto;
import com.example.minsung.demo.entity.ProductSalesStat;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductSalesStatRepository extends JpaRepository<ProductSalesStat, Long> {
    @Query("""
        select new com.example.minsung.demo.dto.productDto.TopProductStatDto(
            p.productId, p.name, coalesce(sum(s.quantity), 0)
        )
        from ProductSalesStat s
        join s.product p
        where p.deletedAt is null
        group by p.productId, p.name
        order by coalesce(sum(s.quantity), 0) desc
    """)
    List<TopProductStatDto> findTopSellingProducts(Pageable pageable);

    List<ProductSalesStat> findBySaleDateBetween(LocalDate startDate, LocalDate endDate);
}
