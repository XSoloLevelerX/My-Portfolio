package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.ContactRequest;
import com.amartya.portfolio.service.ContactService;
import com.amartya.portfolio.util.SessionHasher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactService contactService;
    private final SessionHasher sessionHasher;

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /api/v1/contact - message from {}", request.getEmail());
        contactService.submit(request, sessionHasher.hash(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("status", "received", "message", "Thanks — I'll get back to you."));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "resource", "contact"));
    }
}
