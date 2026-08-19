package com.amartya.portfolio.repository;

import com.amartya.portfolio.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    List<Project> findByStatusNotOrderByReleasedAtDesc(String status);

    List<Project> findByDomainAndStatusNotOrderByReleasedAtDesc(String domain, String status);

    List<Project> findByStatusOrderByReleasedAtDesc(String status);

    List<Project> findByFeaturedTrueAndStatusNotOrderByReleasedAtDesc(String status);

    List<Project> findByStatusNotOrderByTrendingScoreDesc(String status);

    /**
     * Delegates to the SQL function from V3 rather than reimplementing the formula here.
     * One definition of "trending", callable whether or not this service is awake.
     */
    @Modifying
    @Query(value = "select public.recompute_trending_scores()", nativeQuery = true)
    void recomputeTrendingScores();

    @Modifying
    @Query(value = "select public.rollup_daily_stats(cast(:day as date))", nativeQuery = true)
    void rollupDailyStats(String day);
}
