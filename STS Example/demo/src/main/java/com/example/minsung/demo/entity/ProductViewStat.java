package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Entity
@Table(
    name = "product_view_stat",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "view_date"})
)
@Data
public class ProductViewStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate viewDate;

    @Column(nullable = false)
    private Long viewCount = 0L;
}
