package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.ProfileDTO;
import com.amartya.portfolio.entity.Profile;
import com.amartya.portfolio.exception.ResourceNotFoundException;
import com.amartya.portfolio.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final ProfileRepository profileRepository;

    /** One row by construction; a partial unique index in V1 enforces it. */
    @Transactional(readOnly = true)
    public ProfileDTO find() {
        Profile profile = profileRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Profile has not been set up yet"));
        return ProfileDTO.builder()
                .name(profile.getName())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .email(profile.getEmail())
                .location(profile.getLocation())
                .resumeUrl(profile.getResumeUrl())
                .socials(profile.getSocials())
                .build();
    }
}
