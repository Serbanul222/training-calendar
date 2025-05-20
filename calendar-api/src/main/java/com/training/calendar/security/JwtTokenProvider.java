package com.training.calendar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm; // Kept from k7qgdy-codex
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
// Removed: import javax.crypto.SecretKey; (as it's from unstable-code)

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Key getSigningKey() { // Kept from k7qgdy-codex
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Kept from k7qgdy-codex
                .compact();
    }

    public String getUsername(String token) {
        Claims claims = Jwts.parser() // Kept from k7qgdy-codex
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(getSigningKey()).parseClaimsJws(token); // Kept from k7qgdy-codex
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}