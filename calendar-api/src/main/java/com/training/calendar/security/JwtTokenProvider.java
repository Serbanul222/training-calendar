package com.training.calendar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        // Ensure the secret key is strong enough for HS256.
        // The default value is 32 bytes which is good.
        // If your actual jwtSecret is shorter, this might throw an error
        // or result in a weaker key depending on the jjwt version.
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // HS256 is fine, but consider stronger if needed
                .compact();
    }

    public String getUsername(String token) {
        // Using the modern parserBuilder() API from unstable-code
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            // Using the modern parserBuilder() API from unstable-code
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) { // Catch more specific exceptions
            // It's good practice to log this error for debugging purposes
            // logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}