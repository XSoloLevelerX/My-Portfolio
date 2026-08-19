package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.BlogPostDTO;
import com.amartya.portfolio.dto.BlogSummaryDTO;
import com.amartya.portfolio.dto.PageResponse;
import com.amartya.portfolio.service.BlogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/blog")
@RequiredArgsConstructor
@Slf4j
public class BlogController {

    private final BlogService blogService;

    @GetMapping
    public ResponseEntity<PageResponse<BlogSummaryDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/v1/blog - list published posts: page={} size={}", page, size);
        return ResponseEntity.ok(blogService.findPublished(page, Math.min(size, 50)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostDTO> bySlug(@PathVariable String slug) {
        log.info("GET /api/v1/blog/{} - fetch post", slug);
        return ResponseEntity.ok(blogService.findBySlug(slug));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "resource", "blog"));
    }
}
