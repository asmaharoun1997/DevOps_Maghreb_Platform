package fr.maghreb.platform.api;

import fr.maghreb.platform.api.Views.*;
import fr.maghreb.platform.common.Texts;
import fr.maghreb.platform.order.OrderRequest;
import fr.maghreb.platform.post.Comment;
import fr.maghreb.platform.post.CommentRepository;
import fr.maghreb.platform.post.Post;
import fr.maghreb.platform.post.PostRepository;
import fr.maghreb.platform.shop.Shop;
import fr.maghreb.platform.social.FollowRepository;
import fr.maghreb.platform.social.PostLikeRepository;
import fr.maghreb.platform.social.SavedPostRepository;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Transforme les entités en vues JSON, en calculant ce qui dépend de l'utilisateur connecté
 * (déjà aimé ? enregistré ? boutique suivie ?) en quelques requêtes groupées.
 */
@Component
public class ViewMapper {

    private final FollowRepository follows;
    private final PostLikeRepository likes;
    private final SavedPostRepository saves;
    private final CommentRepository comments;
    private final PostRepository posts;

    public ViewMapper(FollowRepository follows, PostLikeRepository likes, SavedPostRepository saves,
                      CommentRepository comments, PostRepository posts) {
        this.follows = follows;
        this.likes = likes;
        this.saves = saves;
        this.comments = comments;
        this.posts = posts;
    }

    public static String imageUrl(String key) {
        return key == null ? null : "/api/media/" + key;
    }

    public Set<Long> followedShopIds(Long userId) {
        return userId == null ? Set.of() : new HashSet<>(follows.findShopIdsByUser(userId));
    }

    public ShopSummary summary(Shop s, Set<Long> followed, Long userId) {
        return new ShopSummary(s.getSlug(), s.getName(), s.getCountry(), s.getCity(), s.getColor(),
                Texts.initials(s.getName()), s.getDeliveryFee(), followed.contains(s.getId()),
                userId != null && s.isOwnedBy(userId));
    }

    public ShopView shop(Shop s, Long userId) {
        return shop(s, followedShopIds(userId), userId);
    }

    public ShopView shop(Shop s, Set<Long> followed, Long userId) {
        return new ShopView(s.getSlug(), s.getName(), s.getCountry(), s.getCity(), s.getShipsFrom(), s.getBio(),
                s.getColor(), Texts.initials(s.getName()), s.getDeliveryFee(), s.getFollowerCount(),
                posts.countByShopId(s.getId()), followed.contains(s.getId()), userId != null && s.isOwnedBy(userId));
    }

    public CommentView comment(Comment c) {
        boolean fromShop = c.getAuthor().getId().equals(c.getPost().getShop().getOwner().getId());
        String author = fromShop ? c.getPost().getShop().getName() : c.getAuthor().getDisplayName();
        return new CommentView(c.getId(), author, c.getBody(), c.getCreatedAt(), fromShop);
    }

    public List<PostView> posts(List<Post> list, Long userId) {
        if (list.isEmpty()) {
            return List.of();
        }
        List<Long> ids = list.stream().map(Post::getId).toList();
        Set<Long> liked = userId == null ? Set.of() : new HashSet<>(likes.findLikedPostIds(userId, ids));
        Set<Long> saved = userId == null ? Set.of() : new HashSet<>(saves.findSavedPostIds(userId, ids));
        Set<Long> followed = followedShopIds(userId);

        // Les 2 derniers commentaires de chaque publication, en une seule requête
        Map<Long, List<Comment>> byPost = comments.findByPostIdInOrderByCreatedAtAsc(ids).stream()
                .collect(Collectors.groupingBy(c -> c.getPost().getId()));

        return list.stream().map(p -> {
            List<Comment> cs = byPost.getOrDefault(p.getId(), List.of());
            List<CommentView> latest = cs.subList(Math.max(0, cs.size() - 2), cs.size()).stream().map(this::comment).toList();
            return new PostView(p.getId(), summary(p.getShop(), followed, userId), p.getProductName(), p.getPrice(),
                    p.getDescription(), imageUrl(p.getImageKey()), p.getVisualKind(), p.getLikeCount(),
                    p.getCommentCount(), p.getCreatedAt(), liked.contains(p.getId()), saved.contains(p.getId()), latest);
        }).toList();
    }

    public OrderView order(OrderRequest o, Long userId) {
        Post p = o.getPost();
        return new OrderView(o.getId(), p.getId(), o.getProductName(), imageUrl(p.getImageKey()), p.getVisualKind(),
                o.getUnitPrice(), o.getQuantity(), o.getDelivery(), o.getDeliveryFee(), o.getTotal(), o.getMessage(),
                o.getShopReply(), o.getStatus(), summary(o.getShop(), Set.of(), userId),
                o.getCustomer().getDisplayName(), o.getCreatedAt(), o.getUpdatedAt());
    }
}
