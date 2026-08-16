package com.vortiq.controller;

import com.vortiq.model.Discussion;
import com.vortiq.model.DiscussionReply;
import com.vortiq.model.User;
import com.vortiq.repository.UserRepository;
import com.vortiq.service.DiscussionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
@CrossOrigin(origins = "*")
public class DiscussionController {

    private final DiscussionService discussionService;
    private final UserRepository userRepository;

    public DiscussionController(DiscussionService discussionService, UserRepository userRepository) {
        this.discussionService = discussionService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Discussion>> getDiscussions(
            @RequestParam(required = false, defaultValue = "1") Long workspaceId,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(discussionService.getWorkspaceDiscussions(workspaceId, category));
    }

    @PostMapping
    public ResponseEntity<Discussion> createDiscussion(
            @RequestBody Discussion discussion,
            Authentication authentication) {
        User author = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(discussionService.createDiscussion(discussion, author));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Discussion> upvoteDiscussion(@PathVariable Long id) {
        return ResponseEntity.ok(discussionService.upvoteDiscussion(id));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<DiscussionReply> addReply(
            @PathVariable Long id,
            @RequestBody DiscussionReply reply,
            Authentication authentication) {
        User author = getAuthenticatedUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(discussionService.addReply(id, reply, author));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscussion(@PathVariable Long id) {
        discussionService.deleteDiscussion(id);
        return ResponseEntity.noContent().build();
    }
}
