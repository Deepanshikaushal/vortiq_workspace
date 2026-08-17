package com.vortiq.controller;

import com.vortiq.dto.AiChatRequest;
import com.vortiq.dto.AiChatResponse;
import com.vortiq.dto.AiTaskEnhanceRequest;
import com.vortiq.dto.AiTaskGenerateRequest;
import com.vortiq.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.processChat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-tasks")
    public ResponseEntity<List<Map<String, Object>>> generateTasks(@RequestBody AiTaskGenerateRequest request) {
        List<Map<String, Object>> tasks = aiService.generateTasksFromPrompt(
                request.getPrompt(),
                request.getProjectId(),
                request.getWorkspaceId()
        );
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/enhance-task")
    public ResponseEntity<Map<String, Object>> enhanceTask(@RequestBody AiTaskEnhanceRequest request) {
        Map<String, Object> enhanced = aiService.enhanceTask(request);
        return ResponseEntity.ok(enhanced);
    }

    @PostMapping("/insights")
    public ResponseEntity<Map<String, Object>> insights(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) body.get("tasks");
        Map<String, Object> result = aiService.generateInsights(tasks);
        return ResponseEntity.ok(result);
    }
}
