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

    @PostMapping("/predict-priority")
    public ResponseEntity<Map<String, Object>> predictPriority(@RequestBody Map<String, Object> req) {
        Double daysLeft = req.get("daysLeft") != null ? Double.parseDouble(req.get("daysLeft").toString()) : 5.0;
        Integer complexity = req.get("complexity") != null ? Integer.parseInt(req.get("complexity").toString()) : 3;
        Integer dependencyCount = req.get("dependencyCount") != null ? Integer.parseInt(req.get("dependencyCount").toString()) : 0;
        Integer assigneeLoad = req.get("assigneeLoad") != null ? Integer.parseInt(req.get("assigneeLoad").toString()) : 3;
        return ResponseEntity.ok(aiService.predictTaskPriority(daysLeft, complexity, dependencyCount, assigneeLoad));
    }

    @PostMapping("/predict-risk")
    public ResponseEntity<Map<String, Object>> predictRisk(@RequestBody Map<String, Object> req) {
        Integer totalTasks = req.get("totalTasks") != null ? Integer.parseInt(req.get("totalTasks").toString()) : 1;
        Integer completedTasks = req.get("completedTasks") != null ? Integer.parseInt(req.get("completedTasks").toString()) : 0;
        Integer blockedTasks = req.get("blockedTasks") != null ? Integer.parseInt(req.get("blockedTasks").toString()) : 0;
        Integer overdueTasks = req.get("overdueTasks") != null ? Integer.parseInt(req.get("overdueTasks").toString()) : 0;
        Integer daysToDeadline = req.get("daysToDeadline") != null ? Integer.parseInt(req.get("daysToDeadline").toString()) : 14;
        return ResponseEntity.ok(aiService.predictProjectRisk(totalTasks, completedTasks, blockedTasks, overdueTasks, daysToDeadline));
    }
}

