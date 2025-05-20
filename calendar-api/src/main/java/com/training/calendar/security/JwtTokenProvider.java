package com.training.calendar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws; // Import Jws
import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.SignatureAlgorithm; // Keep if you use the explicit version in signWith
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import javax.crypto.SecretKey; // Import SecretKey

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() { // Return SecretKey for better type safety with verifyWith
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey()) // Algorithm is inferred from the SecretKey type (HS256)
                // Or, if you prefer explicit: .signWith(getSigningKey(), Jwts.SIG.HS256)
                // Or, the older way: .signWith(getSigningKey(), SignatureAlgorithm.HS256) if you have jjwt-impl
                .compact();
    }

    public String getUsername(String token) {
        Jws<Claims> claimsJws = Jwts.parser()
                .verifyWith(getSigningKey()) // Use verifyWith
                .build()
                .parseSignedClaims(token); // Use parseSignedClaims or parseClaimsJws
        return claimsJws.getPayload().getSubject(); // getPayload() is the modern way
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey()) // Use verifyWith
                    .build()
                    .parseSignedClaims(token); // Use parseSignedClaims or parseClaimsJws
            return true;
        } catch (Exception e) {
            // It's good practice to log the exception here
            // e.g., log.warn("JWT validation error: {}", e.getMessage());
            return false;
        }
    }
}