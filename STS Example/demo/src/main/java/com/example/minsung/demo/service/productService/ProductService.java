package com.example.minsung.demo.service.productService;

import com.example.minsung.demo.dto.productDto.BulkProductUpdateRequestDto;
import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // 상품 등록 기능
    public void registerProduct(ProductRequestDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getPrice());
        product.setDiscountPercent(0);
        product.setStock(dto.getStock());
        product.setDescription(dto.getDescription());
        product.setStatus(dto.getStatus());
        product.setDetailImageUrl(dto.getDetailImageUrl());
        product.setCategory(dto.getCategory());

        List<String> urls = dto.getThumbnailUrls();
        if (urls != null && !urls.isEmpty()) {
            product.setThumbnailUrls(new ArrayList<>(urls));
            product.setThumbnailUrl(urls.get(0));
        } else if (dto.getThumbnailUrl() != null && !dto.getThumbnailUrl().isBlank()) {
            product.setThumbnailUrl(dto.getThumbnailUrl());
            product.setThumbnailUrls(new ArrayList<>(List.of(dto.getThumbnailUrl())));
        }

        productRepository.save(product);
    }

    // 상품 목록 조회 기능
    public List<ProductResponseDto> getAllProducts() {
        List<Product> productList = productRepository.findAll();
        List<ProductResponseDto> dtoList = new ArrayList<>();
        for (Product product : productList) {
            ProductResponseDto dto = new ProductResponseDto(product);
            dtoList.add(dto);
        }
        return dtoList;
    }

    public List<ProductResponseDto> getProducts(int page, int size) {
        Page<Product> productPage = productRepository.findAll(PageRequest.of(page, size));
        List<ProductResponseDto> dtoList = new ArrayList<>();
        for (Product product : productPage.getContent()) {
            dtoList.add(new ProductResponseDto(product));
        }
        return dtoList;
    }

    @Transactional
    public void bulkUpdateProducts(BulkProductUpdateRequestDto request) {
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new IllegalArgumentException("하나 이상의 상품을 선택해야 합니다.");
        }

        boolean resetDiscount = Boolean.TRUE.equals(request.getResetDiscount());
        boolean restoreSoldOut = Boolean.TRUE.equals(request.getRestoreSoldOut());
        boolean restoreHidden = Boolean.TRUE.equals(request.getRestoreHidden());

        if (
            request.getStatus() == null
            && request.getDiscountPercent() == null
            && !resetDiscount
            && request.getOriginalPrice() == null
            && request.getStock() == null
            && !restoreSoldOut
            && !restoreHidden
        ) {
            throw new IllegalArgumentException("변경할 상태 또는 할인 정보를 입력해야 합니다.");
        }

        if (request.getDiscountPercent() != null) {
            int percent = request.getDiscountPercent();
            if (percent <= 0 || percent > 100) {
                throw new IllegalArgumentException("할인율은 1~100 사이여야 합니다.");
            }
        }

        List<Product> products = productRepository.findAllById(request.getProductIds());
        for (Product product : products) {
            if (product.getOriginalPrice() == null) {
                product.setOriginalPrice(product.getPrice());
            }
            if (product.getDiscountPercent() == null) {
                product.setDiscountPercent(0);
            }

            if (request.getOriginalPrice() != null) {
                if (request.getOriginalPrice() < 0) {
                    throw new IllegalArgumentException("원가는 0 이상이어야 합니다.");
                }
                product.setOriginalPrice(request.getOriginalPrice());
                int discount = product.getDiscountPercent() != null ? product.getDiscountPercent() : 0;
                product.setPrice(Math.max(0, request.getOriginalPrice() * (100 - discount) / 100));
            }

            if (request.getStock() != null) {
                if (request.getStock() < 0) {
                    throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
                }
                product.setStock(request.getStock());
                if (request.getStock() == 0) {
                    product.setStatus("SOLD_OUT");
                }
            }

            if (request.getStatus() != null) {
                product.setStatus(request.getStatus());
            }

            if (restoreSoldOut) {
                if (product.getStock() > 0) {
                    product.setStatus("ON_SALE");
                } else {
                    product.setStatus("SOLD_OUT");
                }
            }

            if (restoreHidden) {
                if (product.getStock() > 0) {
                    product.setStatus("ON_SALE");
                } else {
                    product.setStatus("SOLD_OUT");
                }
            }

            if (resetDiscount) {
                int basePrice = product.getOriginalPrice() != null ? product.getOriginalPrice() : product.getPrice();
                product.setPrice(basePrice);
                product.setDiscountPercent(0);
                continue;
            }

            if (request.getDiscountPercent() != null) {
                int basePrice = product.getOriginalPrice() != null ? product.getOriginalPrice() : product.getPrice();
                if (product.getOriginalPrice() == null) {
                    product.setOriginalPrice(basePrice);
                }
                int newPrice = Math.max(0, basePrice * (100 - request.getDiscountPercent()) / 100);
                product.setPrice(newPrice);
                product.setDiscountPercent(request.getDiscountPercent());
            }

            if (product.getStock() == 0) {
                product.setStatus("SOLD_OUT");
            }
        }

        productRepository.saveAll(products);
    }

    // 상품 상세 조회
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 상품을 찾을 수 없습니다."));

        return new ProductResponseDto(product);
    }
}
