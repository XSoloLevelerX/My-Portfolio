package com.amartya.portfolio.repository;

import com.amartya.portfolio.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findAllByOrderBySortOrderAscIssuedOnDesc();
}
