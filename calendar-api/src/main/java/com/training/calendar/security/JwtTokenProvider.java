package com.training.calendar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts; // Ensure this is the one being used
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${security.jwt.secret:DefaultSecretKeyMustBeAtLeast32BytesLongForHS256}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        if (keyBytes.length < 32 && SignatureAlgorithm.HS256.getJcaName().toUpperCase().contains("HS256")) {
            logger.warn("JWT Secret for HS256 is shorter than 32 bytes! This is insecure. Length: {}", keyBytes.length);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder() // builder() is fine
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsername(String token) {
        Claims claims = Jwts.parser() // <--- CHANGED FROM parserBuilder()
                .setSigningKey(getSigningKey())
                .build() // .build() is part of JwtParserBuilder, so this should still work
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser() // <--- CHANGED FROM parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build() // .build() is part of JwtParserBuilder
                    .parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | io.jsonwebtoken.MalformedJwtException e) {
            logger.error("Invalid JWT signature or malformed JWT: {}", e.getMessage());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.error("Expired JWT token: {}", e.getMessage());
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty or null: {}", e.getMessage());
        }
        return false;
    }
}