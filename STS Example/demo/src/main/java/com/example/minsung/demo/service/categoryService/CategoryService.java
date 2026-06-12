package com.example.minsung.demo.service.categoryService;

import com.example.minsung.demo.dto.categoryDto.CategoryRequestDto;
import com.example.minsung.demo.dto.categoryDto.CategoryResponseDto;
import com.example.minsung.demo.entity.Category;
import com.example.minsung.demo.repository.CategoryRepository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getCategoryTree() {
        List<Category> categories = categoryRepository.findAll(Sort.by(Sort.Order.asc("parent.id"), Sort.Order.asc("name")));
        Map<Long, CategoryResponseDto> dtoMap = new LinkedHashMap<>();
        List<CategoryResponseDto> roots = new ArrayList<>();

        for (Category category : categories) {
            CategoryResponseDto dto = new CategoryResponseDto(category);
            dtoMap.put(dto.getId(), dto);
        }

        for (CategoryResponseDto dto : dtoMap.values()) {
            if (dto.getParentId() == null) {
                roots.add(dto);
            } else {
                CategoryResponseDto parent = dtoMap.get(dto.getParentId());
                if (parent != null) {
                    parent.addChild(dto);
                } else {
                    roots.add(dto);
                }
            }
        }

        return roots;
    }

    public CategoryResponseDto createCategory(CategoryRequestDto request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("카테고리 이름을 입력해주세요.");
        }

        Category category = new Category();
        category.setName(request.getName().trim());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("상위 카테고리를 찾을 수 없습니다."));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return new CategoryResponseDto(saved);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        if (!category.getChildren().isEmpty()) {
            throw new RuntimeException("하위 카테고리가 존재하여 삭제할 수 없습니다.");
        }

        categoryRepository.delete(category);
    }
}
