package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.BlogPostDTO;
import com.amartya.portfolio.dto.BlogSummaryDTO;
import com.amartya.portfolio.dto.PageResponse;
import com.amartya.portfolio.entity.BlogPost;
import com.amartya.portfolio.exception.ResourceNotFoundException;
import com.amartya.portfolio.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogService {

    private static final String PUBLISHED = "PUBLISHED";

    private final BlogPostRepository blogPostRepository;

    /** Drafts and future-dated posts are invisible here, matching the RLS policy in V2. */
    @Transactional(readOnly = true)
    public PageResponse<BlogSummaryDTO> findPublished(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        var result = blogPostRepository.findByStatusAndPublishedAtBefore(PUBLISHED, Instant.now(), pageable);
        return PageResponse.from(result, this::mapToSummary);
    }

    @Transactional(readOnly = true)
    public BlogPostDTO findBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlugAndStatus(slug, PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("No published post with slug '" + slug + "'"));
        return BlogPostDTO.builder()
                .slug(post.getSlug())
                .title(post.getTitle())
                .excerpt(post.getExcerpt())
                .contentMd(post.getContentMd())
                .coverUrl(post.getCoverUrl())
                .tags(post.getTags())
                .readingMinutes(post.getReadingMinutes())
                .publishedAt(post.getPublishedAt())
                .build();
    }

    private BlogSummaryDTO mapToSummary(BlogPost p) {
        return BlogSummaryDTO.builder()
                .slug(p.getSlug())
                .title(p.getTitle())
                .excerpt(p.getExcerpt())
                .coverUrl(p.getCoverUrl())
                .tags(p.getTags())
                .readingMinutes(p.getReadingMinutes())
                .publishedAt(p.getPublishedAt())
                .build();
    }
}
