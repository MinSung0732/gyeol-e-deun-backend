package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Entity
@Table(name = "product_sales_stat")
@Data
public class ProductSalesStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDate saleDate;

    @Column(nullable = false)
    private Long quantity = 0L;

    @Column(nullable = false)
    private Long salesAmount = 0L;
}
