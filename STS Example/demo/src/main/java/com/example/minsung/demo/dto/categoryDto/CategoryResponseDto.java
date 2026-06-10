package com.example.minsung.demo.dto.categoryDto;

import com.example.minsung.demo.entity.Category;

import java.util.ArrayList;
import java.util.List;

public class CategoryResponseDto {
    private Long id;
    private String name;
    private Long parentId;
    private String parentName;
    private List<CategoryResponseDto> children = new ArrayList<>();

    public CategoryResponseDto(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        if (category.getParent() != null) {
            this.parentId = category.getParent().getId();
            this.parentName = category.getParent().getName();
        }
    }

    public void addChild(CategoryResponseDto child) {
        this.children.add(child);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getParentName() {
        return parentName;
    }

    public List<CategoryResponseDto> getChildren() {
        return children;
    }
}
