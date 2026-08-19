package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPostDTO {
    private String slug;
    private String title;
    private String excerpt;
    private String contentMd;
    private String coverUrl;
    private List<String> tags;
    private Short readingMinutes;
    private Instant publishedAt;
}
