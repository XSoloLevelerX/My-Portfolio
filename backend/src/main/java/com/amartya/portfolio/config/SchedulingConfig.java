package com.amartya.portfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables the nightly trending refresh in TrendingService. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
