package fr.maghreb.platform.social;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "follow")
public class Follow {

    @EmbeddedId
    @AttributeOverride(name = "itemId", column = @Column(name = "shop_id"))
    private UserItemId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Follow() {
    }

    public Follow(Long userId, Long shopId) {
        this.id = new UserItemId(userId, shopId);
    }

    public UserItemId getId() { return id; }
}
