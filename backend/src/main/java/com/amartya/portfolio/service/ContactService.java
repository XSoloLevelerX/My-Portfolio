package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.ContactRequest;
import com.amartya.portfolio.entity.ContactMessage;
import com.amartya.portfolio.exception.RateLimitedException;
import com.amartya.portfolio.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Value("${app.contact.max-per-hour:5}")
    private int maxPerHour;

    @Transactional
    public void submit(ContactRequest request, String sessionHash) {
        if (sessionHash != null) {
            long recent = contactMessageRepository.countBySessionHashAndCreatedAtAfter(
                    sessionHash, Instant.now().minus(Duration.ofHours(1)));
            if (recent >= maxPerHour) {
                throw new RateLimitedException("Too many messages from this session. Try again later.");
            }
        }
        contactMessageRepository.save(ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .message(request.getMessage())
                .sessionHash(sessionHash)
                .build());
        log.info("Contact message stored from {}", request.getEmail());
    }
}
