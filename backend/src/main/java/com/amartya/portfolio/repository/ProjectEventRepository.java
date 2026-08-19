package com.amartya.portfolio.repository;

import com.amartya.portfolio.entity.ProjectEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface ProjectEventRepository extends JpaRepository<ProjectEvent, Long> {

    /** Cheap rate-limit check: how many events this session already logged recently. */
    long countBySessionHashAndOccurredAtAfter(String sessionHash, Instant since);
}
