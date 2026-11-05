package fr.maghreb.platform.post;

import fr.maghreb.platform.api.Views.CommentView;
import fr.maghreb.platform.api.Views.FeedPage;
import fr.maghreb.platform.api.Views.PostView;
import fr.maghreb.platform.api.Views.TrendView;
import fr.maghreb.platform.security.TokenService;
import fr.maghreb.platform.shop.Country;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PostController {

    private final FeedService feed;
    private final PostService posts;

    public PostController(FeedService feed, PostService posts) {
        this.feed = feed;
        this.posts = posts;
    }

    /**
     * Fil d'actualité.
     * GET /api/feed?tab=following&country=MA&tag=caftan&q=velours&page=0
     */
    @GetMapping("/feed")
    public FeedPage feed(@RequestParam(defaultValue = "all") String tab,
                         @RequestParam(required = false) Country country,
                         @RequestParam(required = false) String tag,
                         @RequestParam(required = false) String q,
                         @RequestParam(defaultValue = "0") int page,
                         @AuthenticationPrincipal Jwt jwt) {
        return feed.feed(TokenService.userId(jwt), "following".equals(tab), country, tag, q, page);
    }

    @GetMapping("/trends")
    public List<TrendView> trends() {
        return feed.trends();
    }

    @GetMapping("/posts/{id}")
    public PostView get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return feed.one(id, TokenService.userId(jwt));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public PostView publish(@Valid @RequestBody PostService.PostRequest req, @AuthenticationPrincipal Jwt jwt) {
        return posts.publish(TokenService.userId(jwt), req);
    }

    @PutMapping("/posts/{id}/like")
    public PostView like(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return posts.like(TokenService.userId(jwt), id, true);
    }

    @DeleteMapping("/posts/{id}/like")
    public PostView unlike(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return posts.like(TokenService.userId(jwt), id, false);
    }

    @PutMapping("/posts/{id}/save")
    public PostView save(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return posts.save(TokenService.userId(jwt), id, true);
    }

    @DeleteMapping("/posts/{id}/save")
    public PostView unsave(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return posts.save(TokenService.userId(jwt), id, false);
    }

    @GetMapping("/posts/{id}/comments")
    public List<CommentView> comments(@PathVariable Long id) {
        return posts.comments(id);
    }

    @PostMapping("/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView comment(@PathVariable Long id, @Valid @RequestBody PostService.CommentRequest req,
                               @AuthenticationPrincipal Jwt jwt) {
        return posts.comment(TokenService.userId(jwt), id, req);
    }
}
