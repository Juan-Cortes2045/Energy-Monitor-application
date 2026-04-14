package com.energyMotor.controller;

import com.energyMotor.dto.RegisterRequest;
import com.energyMotor.dto.VerifyRequest;
import com.energyMotor.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/verify")
    public String verify(@RequestBody VerifyRequest request){
        return authService.verify(request);
    }

    
}
