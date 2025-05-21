package com.training.calendar.security;

import io.jsonwebtoken.Claims;
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
// Imports for Logger and LoggerFactory from unstable-code are removed
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
// Comment for javax.crypto.SecretKey from unstable-code is removed
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Logger field from unstable-code is removed

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
        // Comments and alternative method from unstable-code are removed
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                // Alternative signWith and comments from unstable-code are removed
                .compact();
    }

    public String getUsername(String token) {
        // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        // Alternative implementation and comments from unstable-code are removed
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
        // More detailed catch blocks and logging from unstable-code are removed
    }
}