package com.training.calendar.security;

import com.training.calendar.model.User;
import com.training.calendar.model.UserRole;
import com.training.calendar.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${security.jwt.secret:SecretKey123456789012345678901234567890}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:3600000}")
    private long jwtExpirationMs;

    private final UserService userService;

    // Using ConcurrentHashMap to store blacklisted tokens with their expiration time
    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    @Autowired
    public JwtTokenProvider(UserService userService) {
        this.userService = userService;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username) {
        try {
            // Get user from the repository
            User user = userService.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

            // Extract user roles
            List<String> roles = user.getRoles().stream()
                    .map(userRole -> userRole.getRole().getName())
                    .collect(Collectors.toList());

            Date now = new Date();
            Date expiry = new Date(now.getTime() + jwtExpirationMs);

            return Jwts.builder()
                    .setSubject(username)
                    .claim("roles", roles) // Add roles as a claim
                    .setIssuedAt(now)
                    .setExpiration(expiry)
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception e) {
            logger.error("Error generating token: {}", e.getMessage());
            throw e;
        }
    }

    public String getUsername(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        try {
            return (List<String>) claims.get("roles", List.class);
        } catch (Exception e) {
            logger.error("Error extracting roles from token: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Add a token to the blacklist until it expires
     * @param token The JWT token to blacklist
     */
    public void blacklistToken(String token) {
        try {
            // Extract the expiration date from the token
            Date expiration = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();

            // Add the token to the blacklist with its expiration date
            blacklistedTokens.put(token, expiration);
            logger.info("Token added to blacklist. Will expire at: {}", expiration);
        } catch (Exception e) {
            logger.error("Error adding token to blacklist: {}", e.getMessage());
        }
    }

    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    public boolean validateToken(String token) {
        try {
            // First check if the token is blacklisted
            if (isTokenBlacklisted(token)) {
                logger.info("Token is blacklisted");
                return false;
            }

            // Then validate the token signature and expiration
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
        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty or argument is invalid: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT token validation error: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Convert token to list of GrantedAuthority objects for Spring Security
     * @param token The JWT token
     * @return List of GrantedAuthority
     */
    public List<GrantedAuthority> getAuthorities(String token) {
        List<String> roles = getRoles(token);

        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    /**
     * Scheduled task to clean up expired tokens from the blacklist
     * Runs every hour by default
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
        logger.info("Cleaned up expired tokens from blacklist. Current size: {}", blacklistedTokens.size());
    }
}