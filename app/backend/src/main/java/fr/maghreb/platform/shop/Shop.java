package fr.maghreb.platform.shop;

import fr.maghreb.platform.user.AppUser;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "shop")
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private AppUser owner;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private Country country;

    @Column(nullable = false)
    private String city;

    @Column(name = "ships_from")
    private String shipsFrom;

    private String bio;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(name = "delivery_fee")
    private BigDecimal deliveryFee;

    @Column(name = "follower_count", nullable = false)
    private int followerCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Shop() {
    }

    public Shop(String slug, AppUser owner) {
        this.slug = slug;
        this.owner = owner;
    }

    public void update(String name, Country country, String city, String shipsFrom, String bio, String color, BigDecimal deliveryFee) {
        this.name = name;
        this.country = country;
        this.city = city;
        this.shipsFrom = shipsFrom;
        this.bio = bio;
        this.color = color;
        this.deliveryFee = deliveryFee;
    }

    public void addFollower() { followerCount++; }
    public void removeFollower() { followerCount = Math.max(0, followerCount - 1); }

    public boolean isOwnedBy(Long userId) { return owner.getId().equals(userId); }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public AppUser getOwner() { return owner; }
    public String getName() { return name; }
    public Country getCountry() { return country; }
    public String getCity() { return city; }
    public String getShipsFrom() { return shipsFrom; }
    public String getBio() { return bio; }
    public String getColor() { return color; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public int getFollowerCount() { return followerCount; }
    public Instant getCreatedAt() { return createdAt; }
}
