package com.amartya.portfolio.repository;

import com.amartya.portfolio.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    /** Rate limit: refuse a flood from one session. */
    long countBySessionHashAndCreatedAtAfter(String sessionHash, Instant since);
}
