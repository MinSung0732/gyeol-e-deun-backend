package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.service.productService.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.minsung.demo.dto.productDto.BulkProductUpdateRequestDto;
import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAdminProducts(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "40") int size
    ) {
        return ResponseEntity.ok(productService.getProducts(page, size));
    }

    @PatchMapping("/bulk")
    public ResponseEntity<String> bulkUpdateProducts(@RequestBody BulkProductUpdateRequestDto request) {
        productService.bulkUpdateProducts(request);
        return ResponseEntity.ok("선택한 상품이 정상적으로 업데이트되었습니다.");
    }
}
