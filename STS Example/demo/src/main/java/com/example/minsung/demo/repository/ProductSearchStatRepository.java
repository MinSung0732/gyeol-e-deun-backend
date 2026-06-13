package com.example.minsung.demo.repository;

import com.example.minsung.demo.dto.productDto.TopProductStatDto;
import com.example.minsung.demo.entity.ProductSearchStat;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductSearchStatRepository extends JpaRepository<ProductSearchStat, Long> {
    @Query("""
        select new com.example.minsung.demo.dto.productDto.TopProductStatDto(
            p.productId, p.name, coalesce(sum(s.searchCount), 0)
        )
        from ProductSearchStat s
        join s.product p
        where p.deletedAt is null
        group by p.productId, p.name
        order by coalesce(sum(s.searchCount), 0) desc
    """)
    List<TopProductStatDto> findTopSearchedProducts(Pageable pageable);

    List<ProductSearchStat> findBySearchDate(LocalDate searchDate);
}
