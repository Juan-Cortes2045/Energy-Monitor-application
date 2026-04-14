package com.energyMotor.service;

import com.energyMotor.dto.RegisterRequest;
import com.energyMotor.dto.VerifyRequest;
import com.energyMotor.entity.User;
import com.energyMotor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder= new BCryptPasswordEncoder();

    public String register(RegisterRequest request){
        String code= generatedVerficationCode();

        User user= User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .enabled(false)
            .verificationCode(code)
            .build();

        userRepository.save(user);

        return "Usuario registrado. Verifica tu correo"; 
        
    }

    public String verify(VerifyRequest request){
        User user= userRepository.findByEmail(request.getEmail())
            .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));

        if(user.isEnabled()){
            return "La cuenta ya está verificada";
        }

        if(!user.getVerificationCode().equals(request.getCode())){
            throw new RuntimeException("Codigo incorrecto");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);

        userRepository.save(user);

        return "Cuenta verificada correctamente";
    }

    private String generatedVerficationCode(){
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}


