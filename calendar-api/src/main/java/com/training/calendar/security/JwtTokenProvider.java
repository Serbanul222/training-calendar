package com.training.calendar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts; // Using your provided Jwts class
// No longer need: import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
// import javax.crypto.SecretKey; // Could be used if getSigningKey explicitly returned SecretKey
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        // This returns a SecretKey that is also a MacKey,
        // which embeds the algorithm information.
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Alternative if you wanted the two-argument signWith to work,
    // but the single argument is preferred.
    /*
    private SecretKey getSigningKeyTyped() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    */

    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                // For HMAC keys from Keys.hmacShaKeyFor, use the single-argument signWith.
                // The algorithm is inferred from the key itself.
                .signWith(getSigningKey())
                // If you explicitly wanted to use Jwts.SIG.HS256, getSigningKey() would
                // need to return SecretKey type for generics to match:
                // .signWith(getSigningKeyTyped(), Jwts.SIG.HS256)
                .compact();
    }

    public String getUsername(String token) {
        Claims claims = Jwts.parser() // Returns JwtParserBuilder (as per your Jwts.java)
                .setSigningKey(getSigningKey()) // Configure the JwtParserBuilder
                .build() // Call build() on JwtParserBuilder to get JwtParser
                .parseClaimsJws(token) // Call parseClaimsJws on the built JwtParser
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) { // For JJWT 0.11+
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty or argument is invalid: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT token validation error: {}", e.getMessage());
        }
        return false;
    }
}