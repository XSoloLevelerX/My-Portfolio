package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.SkillDTO;
import com.amartya.portfolio.dto.SkillGroupDTO;
import com.amartya.portfolio.service.SkillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
@Slf4j
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillGroupDTO>> grouped() {
        log.info("GET /api/v1/skills - list skills grouped by category");
        return ResponseEntity.ok(skillService.findGrouped());
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<SkillDTO>> favorites() {
        log.info("GET /api/v1/skills/favorites - list favourite skills");
        return ResponseEntity.ok(skillService.findFavorites());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "resource", "skills"));
    }
}
