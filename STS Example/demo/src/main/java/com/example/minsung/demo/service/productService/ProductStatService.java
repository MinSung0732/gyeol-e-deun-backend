package com.example.minsung.demo.service.productService;

import com.example.minsung.demo.dto.productDto.ProductSearchStatRequestDto;
import com.example.minsung.demo.dto.productDto.ProductSummaryResponseDto;
import com.example.minsung.demo.dto.productDto.TopProductStatDto;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.entity.ProductSearchStat;
import com.example.minsung.demo.entity.ProductSalesStat;
import com.example.minsung.demo.entity.ProductViewStat;
import com.example.minsung.demo.repository.ProductRepository;
import com.example.minsung.demo.repository.ProductSearchStatRepository;
import com.example.minsung.demo.repository.ProductSalesStatRepository;
import com.example.minsung.demo.repository.ProductViewStatRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductStatService {
    private static final int SUMMARY_LIMIT = 10;

    private final ProductRepository productRepository;
    private final ProductViewStatRepository productViewStatRepository;
    private final ProductSearchStatRepository productSearchStatRepository;
    private final ProductSalesStatRepository productSalesStatRepository;

    public ProductStatService(
            ProductRepository productRepository,
            ProductViewStatRepository productViewStatRepository,
            ProductSearchStatRepository productSearchStatRepository,
            ProductSalesStatRepository productSalesStatRepository
    ) {
        this.productRepository = productRepository;
        this.productViewStatRepository = productViewStatRepository;
        this.productSearchStatRepository = productSearchStatRepository;
        this.productSalesStatRepository = productSalesStatRepository;
    }

    @Transactional
    public void recordProductView(Long productId) {
        Product product = productRepository.findByProductIdAndDeletedAtIsNull(productId)
                .orElse(null);
        if (product == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        ProductViewStat stat = productViewStatRepository
                .findByProduct_ProductIdAndViewDate(productId, today)
                .orElseGet(() -> {
                    ProductViewStat next = new ProductViewStat();
                    next.setProduct(product);
                    next.setViewDate(today);
                    next.setViewCount(0L);
                    return next;
                });
        stat.setViewCount(stat.getViewCount() + 1);
        productViewStatRepository.save(stat);
    }

    @Transactional
    public void recordProductSearch(ProductSearchStatRequestDto request) {
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            return;
        }

        String keyword = request.getKeyword() == null ? "" : request.getKeyword().trim();
        LocalDate today = LocalDate.now();
        List<Product> products = productRepository.findAllById(request.getProductIds()).stream()
                .filter((product) -> product.getDeletedAt() == null)
                .toList();

        for (Product product : products) {
            ProductSearchStat stat = new ProductSearchStat();
            stat.setProduct(product);
            stat.setKeyword(keyword);
            stat.setSearchDate(today);
            stat.setSearchCount(1L);
            productSearchStatRepository.save(stat);
        }
    }

    public ProductSummaryResponseDto getProductSummary() {
        PageRequest limit = PageRequest.of(0, SUMMARY_LIMIT);
        return new ProductSummaryResponseDto(
                productSalesStatRepository.findTopSellingProducts(limit),
                productSearchStatRepository.findTopSearchedProducts(limit),
                productViewStatRepository.findTopViewedProducts(limit),
                getSalesChangeProducts(true),
                getSalesChangeProducts(false)
        );
    }

    private List<TopProductStatDto> getSalesChangeProducts(boolean increase) {
        YearMonth thisMonth = YearMonth.now();
        YearMonth previousMonth = thisMonth.minusMonths(1);
        Map<Long, Long> current = sumQuantityByProduct(thisMonth);
        Map<Long, Long> previous = sumQuantityByProduct(previousMonth);
        Map<Long, Product> products = new HashMap<>();
        productRepository.findAllById(current.keySet()).forEach((product) -> products.put(product.getProductId(), product));
        productRepository.findAllById(previous.keySet()).forEach((product) -> products.put(product.getProductId(), product));

        List<TopProductStatDto> result = new ArrayList<>();
        for (Map.Entry<Long, Product> entry : products.entrySet()) {
            Long productId = entry.getKey();
            Product product = entry.getValue();
            if (product.getDeletedAt() != null) {
                continue;
            }
            long currentValue = current.getOrDefault(productId, 0L);
            long previousValue = previous.getOrDefault(productId, 0L);
            long diff = currentValue - previousValue;
            if ((increase && diff <= 0) || (!increase && diff >= 0)) {
                continue;
            }
            double changeRate = previousValue == 0 ? 100.0 : (diff * 100.0 / previousValue);
            result.add(new TopProductStatDto(productId, product.getName(), currentValue, previousValue, changeRate));
        }

        Comparator<TopProductStatDto> comparator = Comparator.comparingDouble(
                (TopProductStatDto item) -> Math.abs(item.getChangeRate())
        ).reversed();
        return result.stream()
                .sorted(comparator)
                .limit(SUMMARY_LIMIT)
                .toList();
    }

    private Map<Long, Long> sumQuantityByProduct(YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<ProductSalesStat> stats = productSalesStatRepository.findBySaleDateBetween(start, end);
        Map<Long, Long> result = new HashMap<>();
        for (ProductSalesStat stat : stats) {
            Long productId = stat.getProduct().getProductId();
            result.put(productId, result.getOrDefault(productId, 0L) + stat.getQuantity());
        }
        return result;
    }
}
