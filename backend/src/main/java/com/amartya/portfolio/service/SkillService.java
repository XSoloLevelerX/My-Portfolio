package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.SkillDTO;
import com.amartya.portfolio.dto.SkillGroupDTO;
import com.amartya.portfolio.entity.Skill;
import com.amartya.portfolio.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillService {

    private final SkillRepository skillRepository;

    /** Grouped by category, favourites leading. Insertion order is preserved. */
    @Transactional(readOnly = true)
    public List<SkillGroupDTO> findGrouped() {
        Map<String, List<SkillDTO>> grouped = new LinkedHashMap<>();
        for (Skill skill : skillRepository.findAllByOrderByFavoriteDescSortOrderAscNameAsc()) {
            grouped.computeIfAbsent(skill.getCategory(), k -> new java.util.ArrayList<>())
                    .add(mapToDTO(skill));
        }
        return grouped.entrySet().stream()
                .map(e -> SkillGroupDTO.builder().category(e.getKey()).skills(e.getValue()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> findFavorites() {
        return skillRepository.findAllByOrderByFavoriteDescSortOrderAscNameAsc().stream()
                .filter(s -> Boolean.TRUE.equals(s.getFavorite()))
                .map(this::mapToDTO)
                .toList();
    }

    private SkillDTO mapToDTO(Skill s) {
        return SkillDTO.builder()
                .name(s.getName())
                .category(s.getCategory())
                .proficiency(s.getProficiency())
                .favorite(Boolean.TRUE.equals(s.getFavorite()))
                .iconSlug(s.getIconSlug())
                .yearsUsed(s.getYearsUsed())
                .build();
    }
}
