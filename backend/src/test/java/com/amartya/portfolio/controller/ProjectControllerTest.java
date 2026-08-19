package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.ProjectSummaryDTO;
import com.amartya.portfolio.dto.RowDTO;
import com.amartya.portfolio.exception.ResourceNotFoundException;
import com.amartya.portfolio.service.EventService;
import com.amartya.portfolio.service.ProjectService;
import com.amartya.portfolio.util.SessionHasher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private SessionHasher sessionHasher;

    @Test
    void rowsReturnsShelves() throws Exception {
        var item = ProjectSummaryDTO.builder()
                .slug("glyphguard").title("GlyphGuard").domain("SECURITY")
                .badge("SDE-3").status("LIVE").build();
        when(projectService.buildRows()).thenReturn(
                List.of(RowDTO.builder().key("trending").title("Trending Now").items(List.of(item)).build()));

        mockMvc.perform(get("/api/v1/projects/rows"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("trending"))
                .andExpect(jsonPath("$[0].title").value("Trending Now"))
                .andExpect(jsonPath("$[0].items[0].slug").value("glyphguard"))
                .andExpect(jsonPath("$[0].items[0].badge").value("SDE-3"));
    }

    @Test
    void unknownSlugReturnsStructuredNotFound() throws Exception {
        when(projectService.findBySlug("nope"))
                .thenThrow(new ResourceNotFoundException("No project with slug 'nope'"));

        mockMvc.perform(get("/api/v1/projects/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.statusCode").value(404));
    }

    @Test
    void validEventIsAccepted() throws Exception {
        when(sessionHasher.hash(any())).thenReturn("hash");

        mockMvc.perform(post("/api/v1/projects/glyphguard/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"eventType\":\"CLICK_LIVE\"}"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("recorded"));

        verify(eventService).record(eq("glyphguard"), any(), eq("hash"));
    }

    @Test
    void bogusEventTypeIsRejectedWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/v1/projects/glyphguard/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"eventType\":\"DROP TABLE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.eventType").exists());

        verify(eventService, never()).record(anyString(), any(), anyString());
    }
}
