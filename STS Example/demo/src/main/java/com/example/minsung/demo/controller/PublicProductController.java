package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import com.example.minsung.demo.dto.productDto.ProductSearchStatRequestDto;
import com.example.minsung.demo.service.productService.ProductService;
import com.example.minsung.demo.service.productService.ProductStatService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class PublicProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductStatService productStatService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable("id") Long id) {
        productStatService.recordProductView(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/search-stat")
    public ResponseEntity<Void> recordSearch(@RequestBody ProductSearchStatRequestDto request) {
        productStatService.recordProductSearch(request);
        return ResponseEntity.ok().build();
    }
}
