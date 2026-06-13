package com.example.minsung.demo.service.productService;

import com.example.minsung.demo.dto.productDto.BulkProductUpdateRequestDto;
import com.example.minsung.demo.dto.productDto.ProductRequestDto;
import com.example.minsung.demo.dto.productDto.ProductResponseDto;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.repository.CartItemRepository;
import com.example.minsung.demo.repository.ProductRepository;
import com.example.minsung.demo.repository.WishlistItemRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    private static final int TRASH_RETENTION_DAYS = 7;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

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

    @Transactional
    public List<ProductResponseDto> getAllProducts() {
        purgeExpiredDeletedProducts();
        return productRepository.findByDeletedAtIsNull().stream()
                .map(ProductResponseDto::new)
                .toList();
    }

    @Transactional
    public List<ProductResponseDto> getProducts(int page, int size) {
        purgeExpiredDeletedProducts();
        Page<Product> productPage = productRepository.findByDeletedAtIsNull(PageRequest.of(page, size));
        return productPage.getContent().stream()
                .map(ProductResponseDto::new)
                .toList();
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

        List<Product> products = productRepository.findAllById(request.getProductIds()).stream()
                .filter((product) -> product.getDeletedAt() == null)
                .toList();
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

            if (restoreSoldOut || restoreHidden) {
                product.setStatus(product.getStock() > 0 ? "ON_SALE" : "SOLD_OUT");
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

    @Transactional
    public ProductResponseDto getProductById(Long id) {
        purgeExpiredDeletedProducts();
        Product product = productRepository.findByProductIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("해당 상품을 찾을 수 없습니다."));
        return new ProductResponseDto(product);
    }

    @Transactional
    public void deleteProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("삭제할 상품을 선택해야 합니다.");
        }

        purgeExpiredDeletedProducts();
        LocalDateTime now = LocalDateTime.now();
        List<Product> products = productRepository.findAllById(productIds);
        for (Product product : products) {
            product.setDeletedAt(now);
            product.setStatus("HIDDEN");
        }
        productRepository.saveAll(products);
    }

    @Transactional
    public List<ProductResponseDto> getDeletedProducts() {
        purgeExpiredDeletedProducts();
        return productRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc().stream()
                .map(ProductResponseDto::new)
                .toList();
    }

    @Transactional
    public void restoreDeletedProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("복구할 상품을 선택해야 합니다.");
        }

        purgeExpiredDeletedProducts();
        LocalDateTime now = LocalDateTime.now();
        List<Product> products = productRepository.findByProductIdInAndDeletedAtIsNotNull(productIds);
        for (Product product : products) {
            if (product.getDeletedAt().plusDays(TRASH_RETENTION_DAYS).isBefore(now)) {
                throw new IllegalArgumentException("삭제 후 7일이 지난 상품은 복구할 수 없습니다.");
            }
            product.setDeletedAt(null);
            product.setStatus(product.getStock() > 0 ? "ON_SALE" : "SOLD_OUT");
        }
        productRepository.saveAll(products);
    }

    @Transactional
    public void purgeExpiredDeletedProducts() {
        LocalDateTime expiredAt = LocalDateTime.now().minusDays(TRASH_RETENTION_DAYS);
        List<Product> expiredProducts = productRepository.findByDeletedAtBefore(expiredAt);
        if (expiredProducts.isEmpty()) {
            return;
        }

        List<Long> expiredIds = expiredProducts.stream()
                .map(Product::getProductId)
                .toList();
        wishlistItemRepository.deleteByProduct_ProductIdIn(expiredIds);
        cartItemRepository.deleteByProduct_ProductIdIn(expiredIds);
        productRepository.deleteAllInBatch(expiredProducts);
    }
}
