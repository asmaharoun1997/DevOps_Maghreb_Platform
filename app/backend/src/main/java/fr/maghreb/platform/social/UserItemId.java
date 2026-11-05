package fr.maghreb.platform.social;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/** Clé composite (utilisateur, élément) des tables d'association : abonnement, j'aime, enregistrement. */
@Embeddable
public class UserItemId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    // Le nom de colonne réel (shop_id / post_id) est fixé par @AttributeOverride dans chaque entité
    @Column(name = "item_id")
    private Long itemId;

    protected UserItemId() {
    }

    public UserItemId(Long userId, Long itemId) {
        this.userId = userId;
        this.itemId = itemId;
    }

    public Long getUserId() { return userId; }
    public Long getItemId() { return itemId; }

    @Override
    public boolean equals(Object o) {
        return o instanceof UserItemId other && Objects.equals(userId, other.userId) && Objects.equals(itemId, other.itemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, itemId);
    }
}
