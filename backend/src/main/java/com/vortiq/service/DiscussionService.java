package com.vortiq.service;

import com.vortiq.model.Discussion;
import com.vortiq.model.DiscussionReply;
import com.vortiq.model.User;
import com.vortiq.repository.DiscussionReplyRepository;
import com.vortiq.repository.DiscussionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionReplyRepository discussionReplyRepository;

    public DiscussionService(DiscussionRepository discussionRepository, DiscussionReplyRepository discussionReplyRepository) {
        this.discussionRepository = discussionRepository;
        this.discussionReplyRepository = discussionReplyRepository;
    }

    public List<Discussion> getWorkspaceDiscussions(Long workspaceId, String category) {
        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            return discussionRepository.findByWorkspaceIdAndCategoryOrderByCreatedAtDesc(workspaceId, category.toUpperCase());
        }
        return discussionRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    @Transactional
    public Discussion createDiscussion(Discussion discussion, User author) {
        if (author != null) {
            discussion.setAuthorId(author.getId());
            if (discussion.getAuthorName() == null || discussion.getAuthorName().trim().isEmpty()) {
                discussion.setAuthorName(author.getName() != null ? author.getName() : author.getUsername());
            }
            if (discussion.getAuthorEmail() == null) {
                discussion.setAuthorEmail(author.getEmail());
            }
            if (discussion.getAuthorAvatar() == null) {
                discussion.setAuthorAvatar(author.getAvatarUrl());
            }
            if (discussion.getAuthorDepartment() == null) {
                discussion.setAuthorDepartment(author.getDepartment());
            }
        }
        if (discussion.getCreatedAt() == null) {
            discussion.setCreatedAt(LocalDateTime.now());
        }
        if (discussion.getLikesCount() == null) {
            discussion.setLikesCount(0);
        }
        return discussionRepository.save(discussion);
    }

    @Transactional
    public Discussion upvoteDiscussion(Long id) {
        Discussion discussion = discussionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discussion not found"));
        discussion.setLikesCount((discussion.getLikesCount() != null ? discussion.getLikesCount() : 0) + 1);
        return discussionRepository.save(discussion);
    }

    @Transactional
    public DiscussionReply addReply(Long discussionId, DiscussionReply reply, User author) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new IllegalArgumentException("Discussion not found"));

        if (author != null) {
            reply.setAuthorId(author.getId());
            if (reply.getAuthorName() == null || reply.getAuthorName().trim().isEmpty()) {
                reply.setAuthorName(author.getName() != null ? author.getName() : author.getUsername());
            }
            if (reply.getAuthorEmail() == null) {
                reply.setAuthorEmail(author.getEmail());
            }
            if (reply.getAuthorAvatar() == null) {
                reply.setAuthorAvatar(author.getAvatarUrl());
            }
            if (reply.getAuthorDepartment() == null) {
                reply.setAuthorDepartment(author.getDepartment());
            }
        }

        reply.setDiscussion(discussion);
        reply.setCreatedAt(LocalDateTime.now());
        return discussionReplyRepository.save(reply);
    }

    @Transactional
    public void deleteDiscussion(Long id) {
        discussionRepository.deleteById(id);
    }
}
