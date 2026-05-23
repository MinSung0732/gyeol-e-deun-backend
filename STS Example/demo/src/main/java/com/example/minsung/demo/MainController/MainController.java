package com.example.minsung.demo.MainController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.minsung.demo.MainService.MainService;

@Controller
public class MainController {
    @Autowired
    private MainService mainService;

    @GetMapping("/")
    public String showHome(Model model) {
        
        return "home";
    }
    
}
