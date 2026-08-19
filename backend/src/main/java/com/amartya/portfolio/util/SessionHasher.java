package com.amartya.portfolio.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Derives a stable, non-reversible identifier for a caller.
 *
 * Raw IP addresses are never stored: they are salted and hashed, so the events table
 * supports rate limiting and rough uniqueness without holding personal data.
 */
@Component
@Slf4j
public class SessionHasher {

    private final String salt;

    public SessionHasher(@Value("${app.events.session-salt:change-me}") String salt) {
        this.salt = salt;
        if ("change-me".equals(salt)) {
            log.warn("app.events.session-salt is still the default. Set EVENT_SESSION_SALT before production.");
        }
    }

    public String hash(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");
        return sha256(salt + "|" + ip + "|" + (agent == null ? "" : agent));
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
