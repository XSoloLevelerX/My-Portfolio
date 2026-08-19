package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDTO {
    private String name;
    private String issuer;
    private LocalDate issuedOn;
    private LocalDate expiresOn;
    private String credentialId;
    private String credentialUrl;
    private String badgeUrl;
    /** True when expires_on is in the past — shown rather than hidden. */
    private boolean expired;
}
