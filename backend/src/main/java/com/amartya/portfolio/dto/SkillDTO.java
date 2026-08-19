package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDTO {
    private String name;
    private String category;
    private short proficiency;
    private boolean favorite;
    private String iconSlug;
    private BigDecimal yearsUsed;
}
