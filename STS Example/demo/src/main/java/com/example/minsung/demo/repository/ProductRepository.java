package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // JpaRepository를 상속받기만 하면, 스프링이 알아서 저장(save), 조회(find) 기능을 다 만들어줍니다!
}