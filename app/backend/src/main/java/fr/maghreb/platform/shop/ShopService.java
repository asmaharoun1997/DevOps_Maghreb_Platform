package fr.maghreb.platform.shop;

import fr.maghreb.platform.api.ViewMapper;
import fr.maghreb.platform.api.Views.ShopView;
import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.common.Texts;
import fr.maghreb.platform.social.Follow;
import fr.maghreb.platform.social.FollowRepository;
import fr.maghreb.platform.social.UserItemId;
import fr.maghreb.platform.user.AppUser;
import fr.maghreb.platform.user.AppUserRepository;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShopService {

    /** Formulaire de création / modification de boutique. */
    public record ShopRequest(
            @NotBlank @Size(max = 80) String name,
            @NotNull Country country,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 120) String shipsFrom,
            @Size(max = 600) String bio,
            @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "couleur au format #RRGGBB") String color,
            @DecimalMin("0") @DecimalMax("200") BigDecimal deliveryFee) {
    }

    private static final List<String> PALETTE = List.of("#8a2c45", "#3a6b4f", "#2f2a6b", "#7b3b2a", "#9c2a24", "#1d3f8a", "#2c5560", "#5c4636", "#1f5f57", "#a5642b");

    private final ShopRepository shops;
    private final AppUserRepository users;
    private final FollowRepository follows;
    private final ViewMapper views;

    public ShopService(ShopRepository shops, AppUserRepository users, FollowRepository follows, ViewMapper views) {
        this.shops = shops;
        this.users = users;
        this.follows = follows;
        this.views = views;
    }

    public Shop bySlug(String slug) {
        return shops.findBySlug(slug).orElseThrow(() -> ApiException.notFound("Boutique"));
    }

    @Transactional(readOnly = true)
    public List<ShopView> list(Country country, Long userId) {
        Set<Long> followed = views.followedShopIds(userId);
        List<Shop> list = country == null ? shops.findAllByOrderByFollowerCountDesc() : shops.findByCountryOrderByFollowerCountDesc(country);
        return list.stream().map(s -> views.shop(s, followed, userId)).toList();
    }

    @Transactional(readOnly = true)
    public ShopView get(String slug, Long userId) {
        return views.shop(bySlug(slug), userId);
    }

    @Transactional
    public ShopView create(Long userId, ShopRequest req) {
        if (shops.findByOwnerId(userId).isPresent()) {
            throw ApiException.conflict("Vous avez déjà une boutique");
        }
        AppUser owner = users.findById(userId).orElseThrow(() -> ApiException.notFound("Compte"));
        Shop shop = new Shop(uniqueSlug(req.name()), owner);
        apply(shop, req);
        return views.shop(shops.save(shop), userId);
    }

    @Transactional
    public ShopView update(Long userId, ShopRequest req) {
        Shop shop = shops.findByOwnerId(userId).orElseThrow(() -> ApiException.notFound("Boutique"));
        apply(shop, req);
        return views.shop(shop, userId);
    }

    @Transactional
    public ShopView follow(Long userId, String slug, boolean follow) {
        Shop shop = bySlug(slug);
        if (shop.isOwnedBy(userId)) {
            throw ApiException.badRequest("Vous ne pouvez pas suivre votre propre boutique");
        }
        UserItemId id = new UserItemId(userId, shop.getId());
        boolean already = follows.existsById(id);
        if (follow && !already) {
            follows.save(new Follow(userId, shop.getId()));
            shop.addFollower();
        } else if (!follow && already) {
            follows.deleteById(id);
            shop.removeFollower();
        }
        return views.shop(shop, userId);
    }

    private void apply(Shop shop, ShopRequest req) {
        String color = req.color() != null ? req.color() : PALETTE.get(Math.floorMod(req.name().hashCode(), PALETTE.size()));
        shop.update(req.name().trim(), req.country(), req.city().trim(), Texts.trimToNull(req.shipsFrom()),
                Texts.trimToNull(req.bio()), color, req.deliveryFee());
    }

    private String uniqueSlug(String name) {
        String base = Texts.slugify(name);
        String slug = base;
        for (int i = 2; shops.existsBySlug(slug); i++) {
            slug = base + "-" + i;
        }
        return slug;
    }
}
