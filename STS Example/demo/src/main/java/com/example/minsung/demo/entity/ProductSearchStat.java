package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Entity
@Table(name = "product_search_stat")
@Data
public class ProductSearchStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 100)
    private String keyword;

    @Column(nullable = false)
    private LocalDate searchDate;

    @Column(nullable = false)
    private Long searchCount = 0L;
}
