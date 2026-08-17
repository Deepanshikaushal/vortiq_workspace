package com.vortiq.dto;

import java.util.List;
import java.util.Map;

public class AiChatResponse {
    private String response;
    private String modelUsed;
    private List<String> suggestions;
    private List<Map<String, Object>> generatedTasks;
    private Map<String, Object> insights;

    public AiChatResponse() {}

    public AiChatResponse(String response, String modelUsed) {
        this.response = response;
        this.modelUsed = modelUsed;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<Map<String, Object>> getGeneratedTasks() {
        return generatedTasks;
    }

    public void setGeneratedTasks(List<Map<String, Object>> generatedTasks) {
        this.generatedTasks = generatedTasks;
    }

    public Map<String, Object> getInsights() {
        return insights;
    }

    public void setInsights(Map<String, Object> insights) {
        this.insights = insights;
    }
}
