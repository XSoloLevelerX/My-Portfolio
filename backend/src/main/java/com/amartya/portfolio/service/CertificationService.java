package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.CertificationDTO;
import com.amartya.portfolio.entity.Certification;
import com.amartya.portfolio.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificationService {

    private final CertificationRepository certificationRepository;

    @Transactional(readOnly = true)
    public List<CertificationDTO> findAll() {
        return certificationRepository.findAllByOrderBySortOrderAscIssuedOnDesc()
                .stream().map(this::mapToDTO).toList();
    }

    private CertificationDTO mapToDTO(Certification c) {
        return CertificationDTO.builder()
                .name(c.getName())
                .issuer(c.getIssuer())
                .issuedOn(c.getIssuedOn())
                .expiresOn(c.getExpiresOn())
                .credentialId(c.getCredentialId())
                .credentialUrl(c.getCredentialUrl())
                .badgeUrl(c.getBadgeUrl())
                // Shown as expired rather than hidden — the same honesty as unavailable links.
                .expired(c.getExpiresOn() != null && c.getExpiresOn().isBefore(LocalDate.now()))
                .build();
    }
}
