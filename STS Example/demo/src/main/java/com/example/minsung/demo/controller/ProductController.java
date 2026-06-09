package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.service.productService.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public String addProduct(@RequestBody ProductRequestDto dto) {
        productService.registerProduct(dto);
        return "결이든 상품이 성공적으로 등록되었습니다!";
    }
}
