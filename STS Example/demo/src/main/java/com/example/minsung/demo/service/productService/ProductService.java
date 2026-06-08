package com.example.minsung.demo.service.productService;

import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;


    // 상품 등록 기능
    public void registerProduct(ProductRequestDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setDescription(dto.getDescription());
        product.setStatus(dto.getStatus());
        product.setThumbnailUrl(dto.getThumbnailUrl());
        product.setDetailImageUrl(dto.getDetailImageUrl());
        product.setCategory(dto.getCategory());

        // 데이터베이스에 저장!
        productRepository.save(product);
    }

    // 상품 목록 조회 기능
    public List<ProductResponseDto> getAllProducts() {
        // 1. 창고(DB)에서 모든 상품(Entity)을 싹 다 꺼내옵니다. (JPA가 findAll() 기능 자동 제공)
        List<Product> productList = productRepository.findAll(); 
        
        // 2. 프론트엔드로 내보낼 택배 상자(DTO)들을 담을 '큰 박스(List)'를 하나 준비합니다.
        List<ProductResponseDto> dtoList = new ArrayList<>();
        
        // 3. 창고에서 꺼낸 상품들을 하나씩(for문) 택배 상자(DTO)에 예쁘게 옮겨 담습니다.
        for (Product product : productList) {
            ProductResponseDto dto = new ProductResponseDto(product); // 알맹이를 상자에 넣음
            dtoList.add(dto); // 상자를 큰 박스에 차곡차곡 쌓음
        }
        
        // 4. 포장이 끝난 큰 박스를 반환(리턴)합니다!
        return dtoList;
    }

   // 💡 번호(id)표를 보고 특정 나눔 물품 하나만 정성껏 꺼내옵니다.
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 물품을 찾을 수 없습니다."));

        // 💡 붉은 줄이 뜨던 6줄의 코드를 다 지우고, 이 딱 한 줄로 끝냅니다!
        return new ProductResponseDto(product);
    }
}