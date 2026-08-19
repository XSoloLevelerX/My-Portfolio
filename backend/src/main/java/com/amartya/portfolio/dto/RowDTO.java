package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One horizontal shelf. /projects/rows returns the whole home page in a single
 * call — the shelf must not fan out to six endpoints.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RowDTO {

    /** Stable machine key, e.g. "trending". */
    private String key;
    /** Display title, e.g. "Trending Now". */
    private String title;
    private List<ProjectSummaryDTO> items;
}
