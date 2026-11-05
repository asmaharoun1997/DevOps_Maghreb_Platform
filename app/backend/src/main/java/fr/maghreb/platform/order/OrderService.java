package fr.maghreb.platform.order;

import fr.maghreb.platform.api.ViewMapper;
import fr.maghreb.platform.api.Views.OrderView;
import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.common.Texts;
import fr.maghreb.platform.post.Post;
import fr.maghreb.platform.post.PostRepository;
import fr.maghreb.platform.shop.Shop;
import fr.maghreb.platform.shop.ShopRepository;
import fr.maghreb.platform.user.AppUser;
import fr.maghreb.platform.user.AppUserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Demandes de commande : le client demande, la boutique accepte ou refuse. Aucun paiement ici. */
@Service
public class OrderService {

    public record OrderRequestBody(
            @Min(1) @Max(20) int quantity,
            @NotNull OrderRequest.Delivery delivery,
            @Size(max = 500) String message) {
    }

    public record AnswerBody(
            @NotNull OrderRequest.Status status,
            @Size(max = 500) String reply) {
    }

    private final OrderRequestRepository orders;
    private final PostRepository posts;
    private final ShopRepository shops;
    private final AppUserRepository users;
    private final ViewMapper views;
    private final MeterRegistry registry;
    private final Counter requested;

    public OrderService(OrderRequestRepository orders, PostRepository posts, ShopRepository shops,
                        AppUserRepository users, ViewMapper views, MeterRegistry registry) {
        this.orders = orders;
        this.posts = posts;
        this.shops = shops;
        this.users = users;
        this.views = views;
        this.registry = registry;
        this.requested = Counter.builder("maghreb.orders.requested").description("Demandes de commande envoyées").register(registry);
    }

    @Transactional
    public OrderView request(Long userId, Long postId, OrderRequestBody body) {
        Post post = posts.findById(postId).orElseThrow(() -> ApiException.notFound("Publication"));
        Shop shop = post.getShop();
        if (shop.isOwnedBy(userId)) {
            throw ApiException.badRequest("Vous ne pouvez pas commander dans votre propre boutique");
        }
        BigDecimal fee = BigDecimal.ZERO;
        if (body.delivery() == OrderRequest.Delivery.DELIVERY) {
            if (shop.getDeliveryFee() == null) {
                throw ApiException.badRequest("Cette boutique ne livre pas : choisissez le retrait");
            }
            fee = shop.getDeliveryFee();
        }
        AppUser customer = users.findById(userId).orElseThrow(() -> ApiException.notFound("Compte"));
        OrderRequest order = orders.save(new OrderRequest(post, customer, body.quantity(), body.delivery(), fee,
                Texts.trimToNull(body.message())));
        requested.increment();
        return views.order(order, userId);
    }

    @Transactional(readOnly = true)
    public List<OrderView> mine(Long userId) {
        return orders.findByCustomerIdOrderByCreatedAtDesc(userId).stream().map(o -> views.order(o, userId)).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderView> forMyShop(Long userId) {
        Shop shop = myShop(userId);
        return orders.findByShopIdOrderByCreatedAtDesc(shop.getId()).stream().map(o -> views.order(o, userId)).toList();
    }

    @Transactional
    public OrderView answer(Long userId, Long orderId, AnswerBody body) {
        Shop shop = myShop(userId);
        OrderRequest order = orders.findById(orderId)
                .filter(o -> o.getShop().getId().equals(shop.getId()))
                .orElseThrow(() -> ApiException.notFound("Demande"));
        if (body.status() == OrderRequest.Status.PENDING) {
            throw ApiException.badRequest("Choisissez ACCEPTED ou DECLINED");
        }
        if (order.getStatus() != OrderRequest.Status.PENDING) {
            throw ApiException.conflict("Cette demande a déjà reçu une réponse");
        }
        order.answer(body.status(), Texts.trimToNull(body.reply()));
        registry.counter("maghreb.orders.answered", "status", body.status().name()).increment();
        return views.order(order, userId);
    }

    @Transactional(readOnly = true)
    public long pendingCount(Long userId) {
        return shops.findByOwnerId(userId)
                .map(s -> orders.countByShopIdAndStatus(s.getId(), OrderRequest.Status.PENDING))
                .orElse(0L);
    }

    private Shop myShop(Long userId) {
        return shops.findByOwnerId(userId).orElseThrow(() -> ApiException.notFound("Boutique"));
    }
}
