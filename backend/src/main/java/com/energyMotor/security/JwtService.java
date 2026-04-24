package com.energyMotor.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET= "superSecretKeysuperSecretKeysuperSecretKey";
    private final long EXṔIRATION= 1000 * 60 * 60;

    private Key getSignKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String email){
        return Jwts.builder()
        .setSubject(email)
        .setIssueAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis()+EXṔIRATION))
        .signWith(getSignKey(), SignatureAlgorithm.HS256)
        .compact();
    }

    public String extractEmail(String token){
        return Jwts.parseBuilder()
        .setSigningKey(getSignKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject()
    }
}