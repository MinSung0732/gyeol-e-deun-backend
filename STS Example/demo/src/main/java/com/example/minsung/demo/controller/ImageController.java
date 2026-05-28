package com.example.minsung.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
public class ImageController {

    // 💡 사진이 저장될 실제 서버 폴더 경로 (프로젝트 폴더 바로 아래에 uploads 폴더가 생성됩니다)
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        }

        try {
            // 1. uploads 폴더가 없다면 새롭게 만들어줍니다.
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. 사진 이름이 겹치지 않도록 고유한 난수(UUID)를 앞에 붙여줍니다. (예: 1234abcd-결이든패키지.png)
            String originalFileName = file.getOriginalFilename();
            String cleanFileName = originalFileName.replace(" ", "_");
            String uniqueFileName = UUID.randomUUID() + "_" + cleanFileName;

            // 3. 서버의 uploads 폴더에 파일을 안전하게 저장합니다.
            File destFile = new File(UPLOAD_DIR + uniqueFileName);
            file.transferTo(destFile);

            // 4. 리액트가 이 사진을 찾아볼 수 있도록, 영수증(URL 경로)을 만들어 돌려줍니다.
            String imageUrl = "http://localhost:8080/uploads/" + uniqueFileName;
            
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("이미지 업로드 중 문제가 발생했습니다.");
        }
    }
}