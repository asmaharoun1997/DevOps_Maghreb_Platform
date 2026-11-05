package fr.maghreb.platform.shop;

import fr.maghreb.platform.api.Views.PostView;
import fr.maghreb.platform.api.Views.ShopView;
import fr.maghreb.platform.post.FeedService;
import fr.maghreb.platform.security.TokenService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shops;
    private final FeedService feed;

    public ShopController(ShopService shops, FeedService feed) {
        this.shops = shops;
        this.feed = feed;
    }

    @GetMapping
    public List<ShopView> list(@RequestParam(required = false) Country country, @AuthenticationPrincipal Jwt jwt) {
        return shops.list(country, TokenService.userId(jwt));
    }

    @GetMapping("/{slug}")
    public ShopView get(@PathVariable String slug, @AuthenticationPrincipal Jwt jwt) {
        return shops.get(slug, TokenService.userId(jwt));
    }

    @GetMapping("/{slug}/posts")
    public List<PostView> posts(@PathVariable String slug, @AuthenticationPrincipal Jwt jwt) {
        return feed.byShop(slug, TokenService.userId(jwt));
    }

    @PutMapping("/{slug}/follow")
    public ShopView follow(@PathVariable String slug, @AuthenticationPrincipal Jwt jwt) {
        return shops.follow(TokenService.userId(jwt), slug, true);
    }

    @DeleteMapping("/{slug}/follow")
    public ShopView unfollow(@PathVariable String slug, @AuthenticationPrincipal Jwt jwt) {
        return shops.follow(TokenService.userId(jwt), slug, false);
    }
}
