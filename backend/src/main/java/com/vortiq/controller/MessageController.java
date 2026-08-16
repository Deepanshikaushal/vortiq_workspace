package com.vortiq.controller;

import com.vortiq.model.Message;
import com.vortiq.model.User;
import com.vortiq.repository.UserRepository;
import com.vortiq.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
            @RequestParam Long workspaceId,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(messageService.getWorkspaceMessages(workspaceId, user));
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestBody Message message,
            Authentication authentication) {
        User sender = getAuthenticatedUser(authentication);
        Message created = messageService.sendMessage(message, sender);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
