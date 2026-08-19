package com.amartya.portfolio;

import org.junit.jupiter.api.Test;

/**
 * Deliberately not @SpringBootTest: a full context needs a live Postgres, and this
 * suite must run in CI without one. Web-layer behaviour is covered by the @WebMvcTest
 * slices instead.
 */
class PortfolioApplicationTests {

    @Test
    void applicationClassIsPresent() {
        org.junit.jupiter.api.Assertions.assertNotNull(PortfolioApplication.class);
    }
}
