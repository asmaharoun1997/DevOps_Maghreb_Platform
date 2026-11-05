package fr.maghreb.platform.post;

import fr.maghreb.platform.api.ViewMapper;
import fr.maghreb.platform.api.Views.CommentView;
import fr.maghreb.platform.api.Views.PostView;
import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.common.Texts;
import fr.maghreb.platform.media.StorageService;
import fr.maghreb.platform.shop.Shop;
import fr.maghreb.platform.shop.ShopRepository;
import fr.maghreb.platform.social.PostLike;
import fr.maghreb.platform.social.PostLikeRepository;
import fr.maghreb.platform.social.SavedPost;
import fr.maghreb.platform.social.SavedPostRepository;
import fr.maghreb.platform.social.UserItemId;
import fr.maghreb.platform.user.AppUser;
import fr.maghreb.platform.user.AppUserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Écriture : publier, aimer, enregistrer, commenter. */
@Service
public class PostService {

    public record PostRequest(
            @NotBlank @Size(max = 120) String productName,
            @NotNull @DecimalMin(value = "0.5") @DecimalMax("100000") BigDecimal price,
            @Size(max = 1500) String description,
            @Size(max = 80) String imageKey,
            @Size(max = 20) String visualKind) {
    }

    public record CommentRequest(@NotBlank @Size(max = 300) String body) {
    }

    private static final java.util.regex.Pattern IMAGE_KEY = java.util.regex.Pattern.compile("^[0-9a-f-]{36}\\.(jpg|png|webp)$");

    /** Illustrations proposées quand la boutique n'a pas (encore) de photo. */
    public static final Set<String> VISUALS = Set.of("caftan", "bottle", "pastry", "jar", "plate", "chechia", "rug", "jewel", "dates", "tagine", "lantern");

    private final PostRepository posts;
    private final ShopRepository shops;
    private final AppUserRepository users;
    private final PostLikeRepository likes;
    private final SavedPostRepository saves;
    private final CommentRepository comments;
    private final StorageService storage;
    private final ViewMapper views;
    private final Counter published;
    private final Counter commented;

    public PostService(PostRepository posts, ShopRepository shops, AppUserRepository users, PostLikeRepository likes,
                       SavedPostRepository saves, CommentRepository comments, StorageService storage, ViewMapper views,
                       MeterRegistry registry) {
        this.posts = posts;
        this.shops = shops;
        this.users = users;
        this.likes = likes;
        this.saves = saves;
        this.comments = comments;
        this.storage = storage;
        this.views = views;
        this.published = Counter.builder("maghreb.posts.published").description("Produits publiés").register(registry);
        this.commented = Counter.builder("maghreb.comments.created").description("Commentaires publiés").register(registry);
    }

    @Transactional
    public PostView publish(Long userId, PostRequest req) {
        Shop shop = shops.findByOwnerId(userId)
                .orElseThrow(() -> ApiException.forbidden("Créez d'abord votre boutique pour publier"));
        String imageKey = Texts.trimToNull(req.imageKey());
        String visual = Texts.trimToNull(req.visualKind());
        if (imageKey != null && (!IMAGE_KEY.matcher(imageKey).matches() || !storage.exists(imageKey))) {
            throw ApiException.badRequest("Photo introuvable : renvoyez-la");
        }
        if (imageKey == null && (visual == null || !VISUALS.contains(visual))) {
            throw ApiException.badRequest("Ajoutez une photo ou choisissez une illustration");
        }
        Post post = posts.save(new Post(shop, req.productName().trim(), req.price(), Texts.trimToNull(req.description()),
                imageKey, imageKey == null ? visual : null));
        published.increment();
        return views.posts(List.of(post), userId).get(0);
    }

    /** J'aime idempotent : renvoie la publication à jour (compteur et état). */
    @Transactional
    public PostView like(Long userId, Long postId, boolean like) {
        requirePost(postId);
        UserItemId id = new UserItemId(userId, postId);
        boolean already = likes.existsById(id);
        if (like && !already) {
            likes.save(new PostLike(userId, postId));
            posts.addLikes(postId, 1);
        } else if (!like && already) {
            likes.deleteById(id);
            posts.addLikes(postId, -1);
        }
        return views.posts(List.of(requirePost(postId)), userId).get(0);
    }

    @Transactional
    public PostView save(Long userId, Long postId, boolean save) {
        Post post = requirePost(postId);
        UserItemId id = new UserItemId(userId, postId);
        boolean already = saves.existsById(id);
        if (save && !already) {
            saves.save(new SavedPost(userId, postId));
        } else if (!save && already) {
            saves.deleteById(id);
        }
        return views.posts(List.of(post), userId).get(0);
    }

    @Transactional(readOnly = true)
    public List<CommentView> comments(Long postId) {
        requirePost(postId);
        return comments.findByPostIdOrderByCreatedAtAsc(postId).stream().map(views::comment).toList();
    }

    @Transactional
    public CommentView comment(Long userId, Long postId, CommentRequest req) {
        Post post = requirePost(postId);
        AppUser author = users.findById(userId).orElseThrow(() -> ApiException.notFound("Compte"));
        Comment c = comments.save(new Comment(post, author, req.body().trim()));
        CommentView view = views.comment(c); // avant la mise à jour groupée qui vide le contexte JPA
        posts.incrementComments(postId);
        commented.increment();
        return view;
    }

    private Post requirePost(Long postId) {
        return posts.findById(postId).orElseThrow(() -> ApiException.notFound("Publication"));
    }
}
