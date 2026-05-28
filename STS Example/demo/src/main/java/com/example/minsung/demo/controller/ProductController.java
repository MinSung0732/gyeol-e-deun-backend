package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import com.example.minsung.demo.service.productService.ProductService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // 순수 데이터를 주고받는 API용 컨트롤러
@RequestMapping("/api/admin/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 상품 등록 기능
    @PostMapping // 데이터를 저장(POST)할 때 씁니다
    public String addProduct(@RequestBody ProductRequestDto dto) {
        // 서비스에게 넘겨서 저장하라고 명령
        productService.registerProduct(dto);
        
        return "결이든 상품이 성공적으로 등록되었습니다!";
    }

    // 상품 목록 조회 기능
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        List<ProductResponseDto> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
}