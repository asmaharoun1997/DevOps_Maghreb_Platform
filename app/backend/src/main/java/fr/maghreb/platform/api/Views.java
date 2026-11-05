package fr.maghreb.platform.api;

import fr.maghreb.platform.order.OrderRequest;
import fr.maghreb.platform.shop.Country;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Objets renvoyés par l'API (jamais les entités JPA directement). */
public final class Views {

    private Views() {
    }

    /** Boutique résumée, affichée en tête de chaque publication. */
    public record ShopSummary(String slug, String name, Country country, String city, String color, String initials,
                              BigDecimal deliveryFee, boolean following, boolean mine) {
    }

    /** Fiche complète d'une boutique. */
    public record ShopView(String slug, String name, Country country, String city, String shipsFrom, String bio,
                           String color, String initials, BigDecimal deliveryFee, int followerCount, long postCount,
                           boolean following, boolean mine) {
    }

    public record CommentView(Long id, String author, String body, Instant createdAt, boolean fromShop) {
    }

    public record PostView(Long id, ShopSummary shop, String productName, BigDecimal price, String description,
                           String imageUrl, String visualKind, int likeCount, int commentCount, Instant createdAt,
                           boolean liked, boolean saved, List<CommentView> latestComments) {
    }

    public record FeedPage(List<PostView> items, int page, boolean hasMore) {
    }

    public record TrendView(String tag, String label, int score) {
    }

    public record OrderView(Long id, Long postId, String productName, String imageUrl, String visualKind,
                            BigDecimal unitPrice, int quantity, OrderRequest.Delivery delivery, BigDecimal deliveryFee,
                            BigDecimal total, String message, String shopReply, OrderRequest.Status status,
                            ShopSummary shop, String customerName, Instant createdAt, Instant updatedAt) {
    }

    public record MeView(Long id, String email, String displayName, ShopView shop, long pendingOrders) {
    }
}
