package fr.maghreb.platform.social;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "post_like")
public class PostLike {

    @EmbeddedId
    @AttributeOverride(name = "itemId", column = @Column(name = "post_id"))
    private UserItemId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected PostLike() {
    }

    public PostLike(Long userId, Long postId) {
        this.id = new UserItemId(userId, postId);
    }

    public UserItemId getId() { return id; }
}
