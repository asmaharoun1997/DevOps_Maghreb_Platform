package fr.maghreb.platform.post;

import fr.maghreb.platform.shop.Shop;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

/** Publication d'une boutique : un produit avec prix, description, hashtags et photo. */
@Entity
@Table(name = "post")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private BigDecimal price;

    private String description;

    /** Hashtags normalisés entourés d'espaces (" caftan mariage ") pour une recherche LIKE simple. */
    @Column(nullable = false)
    private String tags = " ";

    @Column(name = "image_key")
    private String imageKey;

    @Column(name = "visual_kind")
    private String visualKind;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "comment_count", nullable = false)
    private int commentCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Post() {
    }

    public Post(Shop shop, String productName, BigDecimal price, String description, String imageKey, String visualKind) {
        this.shop = shop;
        this.productName = productName;
        this.price = price;
        this.description = description;
        this.imageKey = imageKey;
        this.visualKind = visualKind;
        this.tags = Hashtags.toColumn(description);
    }

    public Long getId() { return id; }
    public Shop getShop() { return shop; }
    public String getProductName() { return productName; }
    public BigDecimal getPrice() { return price; }
    public String getDescription() { return description; }
    public String getTags() { return tags; }
    public String getImageKey() { return imageKey; }
    public String getVisualKind() { return visualKind; }
    public int getLikeCount() { return likeCount; }
    public int getCommentCount() { return commentCount; }
    public Instant getCreatedAt() { return createdAt; }
}
