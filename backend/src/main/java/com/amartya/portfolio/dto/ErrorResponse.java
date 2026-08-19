package com.amartya.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/** One error shape for every exception type. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private boolean success;
    private String message;
    /** Stable uppercase code per exception type. */
    private String error;
    private int statusCode;
    /** Field → message, only on validation failures. */
    private Map<String, String> errors;
}
