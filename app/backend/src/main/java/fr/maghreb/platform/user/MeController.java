package fr.maghreb.platform.user;

import fr.maghreb.platform.api.ViewMapper;
import fr.maghreb.platform.api.Views.MeView;
import fr.maghreb.platform.api.Views.OrderView;
import fr.maghreb.platform.api.Views.PostView;
import fr.maghreb.platform.api.Views.ShopView;
import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.order.OrderService;
import fr.maghreb.platform.post.FeedService;
import fr.maghreb.platform.security.TokenService;
import fr.maghreb.platform.shop.ShopRepository;
import fr.maghreb.platform.shop.ShopService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Tout ce qui concerne l'utilisateur connecté : profil, enregistrés, commandes, sa boutique. */
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final AppUserRepository users;
    private final ShopRepository shopRepo;
    private final ShopService shops;
    private final FeedService feed;
    private final OrderService orders;
    private final ViewMapper views;

    public MeController(AppUserRepository users, ShopRepository shopRepo, ShopService shops, FeedService feed,
                        OrderService orders, ViewMapper views) {
        this.users = users;
        this.shopRepo = shopRepo;
        this.shops = shops;
        this.feed = feed;
        this.orders = orders;
        this.views = views;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public MeView me(@AuthenticationPrincipal Jwt jwt) {
        Long id = TokenService.userId(jwt);
        AppUser user = users.findById(id).orElseThrow(() -> ApiException.notFound("Compte"));
        ShopView shop = shopRepo.findByOwnerId(id).map(s -> views.shop(s, id)).orElse(null);
        return new MeView(user.getId(), user.getEmail(), user.getDisplayName(), shop, orders.pendingCount(id));
    }

    @GetMapping("/saved")
    public List<PostView> saved(@AuthenticationPrincipal Jwt jwt) {
        return feed.saved(TokenService.userId(jwt));
    }

    @GetMapping("/orders")
    public List<OrderView> myOrders(@AuthenticationPrincipal Jwt jwt) {
        return orders.mine(TokenService.userId(jwt));
    }

    @PostMapping("/shop")
    @ResponseStatus(HttpStatus.CREATED)
    public ShopView createShop(@Valid @RequestBody ShopService.ShopRequest req, @AuthenticationPrincipal Jwt jwt) {
        return shops.create(TokenService.userId(jwt), req);
    }

    @PutMapping("/shop")
    public ShopView updateShop(@Valid @RequestBody ShopService.ShopRequest req, @AuthenticationPrincipal Jwt jwt) {
        return shops.update(TokenService.userId(jwt), req);
    }

    @GetMapping("/shop/orders")
    public List<OrderView> shopOrders(@AuthenticationPrincipal Jwt jwt) {
        return orders.forMyShop(TokenService.userId(jwt));
    }

    @PatchMapping("/shop/orders/{id}")
    public OrderView answer(@PathVariable Long id, @Valid @RequestBody OrderService.AnswerBody body,
                            @AuthenticationPrincipal Jwt jwt) {
        return orders.answer(TokenService.userId(jwt), id, body);
    }
}
