package com.vortiq.service;

import com.vortiq.model.Message;
import com.vortiq.model.User;
import com.vortiq.repository.MessageRepository;
import com.vortiq.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<Message> getWorkspaceMessages(Long workspaceId, User user) {
        if (user != null && user.getId() != null) {
            return messageRepository.findVisibleMessages(workspaceId, user.getId());
        }
        return messageRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId);
    }

    @Transactional
    public Message sendMessage(Message message, User sender) {
        if (sender != null) {
            message.setSenderId(sender.getId());
            if (message.getSenderName() == null || message.getSenderName().trim().isEmpty()) {
                message.setSenderName(sender.getName() != null ? sender.getName() : sender.getUsername());
            }
            if (message.getSenderEmail() == null) {
                message.setSenderEmail(sender.getEmail());
            }
            if (message.getSenderAvatar() == null) {
                message.setSenderAvatar(sender.getAvatarUrl());
            }
        }

        if (message.getRecipientId() != null) {
            userRepository.findById(message.getRecipientId()).ifPresent(r -> {
                message.setRecipientName(r.getName() != null ? r.getName() : r.getUsername());
            });
        }

        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }

        return messageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
