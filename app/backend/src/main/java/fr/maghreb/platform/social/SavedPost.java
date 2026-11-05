package fr.maghreb.platform.social;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_post")
public class SavedPost {

    @EmbeddedId
    @AttributeOverride(name = "itemId", column = @Column(name = "post_id"))
    private UserItemId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected SavedPost() {
    }

    public SavedPost(Long userId, Long postId) {
        this.id = new UserItemId(userId, postId);
    }

    public UserItemId getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
}
