package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.CertificationDTO;
import com.amartya.portfolio.service.CertificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/certifications")
@RequiredArgsConstructor
@Slf4j
public class CertificationController {

    private final CertificationService certificationService;

    @GetMapping
    public ResponseEntity<List<CertificationDTO>> list() {
        log.info("GET /api/v1/certifications - list certifications");
        return ResponseEntity.ok(certificationService.findAll());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "resource", "certifications"));
    }
}
