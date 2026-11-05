package fr.maghreb.platform.order;

import fr.maghreb.platform.post.Post;
import fr.maghreb.platform.shop.Shop;
import fr.maghreb.platform.user.AppUser;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Demande de commande d'un client à une boutique.
 * Pas de paiement sur la plateforme : la boutique accepte ou refuse, puis gère le paiement elle-même.
 */
@Entity
@Table(name = "order_request")
public class OrderRequest {

    public enum Status { PENDING, ACCEPTED, DECLINED }

    public enum Delivery { DELIVERY, PICKUP }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private AppUser customer;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Delivery delivery;

    @Column(name = "delivery_fee", nullable = false)
    private BigDecimal deliveryFee;

    private String message;

    @Column(name = "shop_reply")
    private String shopReply;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected OrderRequest() {
    }

    public OrderRequest(Post post, AppUser customer, int quantity, Delivery delivery, BigDecimal deliveryFee, String message) {
        this.post = post;
        this.shop = post.getShop();
        this.customer = customer;
        this.productName = post.getProductName();
        this.unitPrice = post.getPrice();
        this.quantity = quantity;
        this.delivery = delivery;
        this.deliveryFee = deliveryFee;
        this.message = message;
    }

    public void answer(Status newStatus, String reply) {
        this.status = newStatus;
        this.shopReply = reply;
        this.updatedAt = Instant.now();
    }

    public BigDecimal getTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).add(deliveryFee);
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public Shop getShop() { return shop; }
    public AppUser getCustomer() { return customer; }
    public String getProductName() { return productName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public Delivery getDelivery() { return delivery; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public String getMessage() { return message; }
    public String getShopReply() { return shopReply; }
    public Status getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
