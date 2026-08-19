package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Skills grouped by category, favourites first within each group. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGroupDTO {
    private String category;
    private List<SkillDTO> skills;
}
