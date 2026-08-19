package com.amartya.portfolio.repository;

import com.amartya.portfolio.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Page<BlogPost> findByStatusAndPublishedAtBefore(String status, Instant now, Pageable pageable);

    Optional<BlogPost> findBySlugAndStatus(String slug, String status);
}
