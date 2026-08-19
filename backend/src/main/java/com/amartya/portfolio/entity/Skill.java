package com.amartya.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private Short proficiency = 3;

    /** "The skills I'm really fond of" — these lead the section. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean favorite = false;

    @Column(name = "icon_slug")
    private String iconSlug;

    @Column(name = "years_used")
    private BigDecimal yearsUsed;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
