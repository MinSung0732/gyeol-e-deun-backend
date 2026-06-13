package com.example.minsung.demo.repository;

import com.example.minsung.demo.dto.productDto.TopProductStatDto;
import com.example.minsung.demo.entity.ProductViewStat;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductViewStatRepository extends JpaRepository<ProductViewStat, Long> {
    Optional<ProductViewStat> findByProduct_ProductIdAndViewDate(Long productId, LocalDate viewDate);

    @Query("""
        select new com.example.minsung.demo.dto.productDto.TopProductStatDto(
            p.productId, p.name, coalesce(sum(s.viewCount), 0)
        )
        from ProductViewStat s
        join s.product p
        where p.deletedAt is null
        group by p.productId, p.name
        order by coalesce(sum(s.viewCount), 0) desc
    """)
    List<TopProductStatDto> findTopViewedProducts(Pageable pageable);
}
