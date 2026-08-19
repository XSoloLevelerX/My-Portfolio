package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    private String name;
    private String headline;
    private String bio;
    private String email;
    private String location;
    private String resumeUrl;
    private Map<String, String> socials;
}
