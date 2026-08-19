package com.amartya.portfolio.controller;

import com.amartya.portfolio.exception.RateLimitedException;
import com.amartya.portfolio.service.ContactService;
import com.amartya.portfolio.util.SessionHasher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContactController.class)
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactService contactService;

    @MockitoBean
    private SessionHasher sessionHasher;

    @Test
    void validMessageIsStored() throws Exception {
        when(sessionHasher.hash(any())).thenReturn("hash");

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ada\",\"email\":\"ada@example.com\",\"message\":\"Hello\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("received"));
    }

    @Test
    void malformedEmailIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ada\",\"email\":\"not-an-email\",\"message\":\"Hello\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());

        verify(contactService, never()).submit(any(), any());
    }

    @Test
    void rateLimitSurfacesAs429() throws Exception {
        when(sessionHasher.hash(any())).thenReturn("hash");
        doThrow(new RateLimitedException("Too many messages from this session. Try again later."))
                .when(contactService).submit(any(), any());

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ada\",\"email\":\"ada@example.com\",\"message\":\"Hello\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("RATE_LIMITED"));
    }
}
