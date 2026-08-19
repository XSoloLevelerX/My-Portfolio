package com.amartya.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRequest {

    @NotBlank(message = "Event type is required")
    @Pattern(regexp = "VIEW|OPEN|CLICK_LIVE|CLICK_REPO",
             message = "Event type must be one of VIEW, OPEN, CLICK_LIVE, CLICK_REPO")
    private String eventType;

    @Size(max = 500, message = "Referrer must be at most 500 characters")
    private String referrer;
}
