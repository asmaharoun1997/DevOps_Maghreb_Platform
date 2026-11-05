package fr.maghreb.platform.post;

import fr.maghreb.platform.api.ViewMapper;
import fr.maghreb.platform.api.Views.FeedPage;
import fr.maghreb.platform.api.Views.PostView;
import fr.maghreb.platform.api.Views.TrendView;
import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.shop.Country;
import fr.maghreb.platform.shop.Shop;
import fr.maghreb.platform.shop.ShopRepository;
import fr.maghreb.platform.social.SavedPostRepository;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lecture : fil d'actualité, profils, enregistrés, tendances. */
@Service
@Transactional(readOnly = true)
public class FeedService {

    public static final int PAGE_SIZE = 10;

    private final PostRepository posts;
    private final ShopRepository shops;
    private final SavedPostRepository saves;
    private final ViewMapper views;

    public FeedService(PostRepository posts, ShopRepository shops, SavedPostRepository saves, ViewMapper views) {
        this.posts = posts;
        this.shops = shops;
        this.saves = saves;
        this.views = views;
    }

    /**
     * @param followingOnly onglet « Abonnements » : uniquement les boutiques suivies (et la sienne)
     */
    public FeedPage feed(Long userId, boolean followingOnly, Country country, String tag, String query, int page) {
        Specification<Post> spec = (root, q, cb) -> cb.conjunction();

        if (country != null) {
            spec = spec.and((root, q, cb) -> cb.equal(shopOf(root).get("country"), country));
        }
        String t = Hashtags.normalize(tag);
        if (t != null && !t.isEmpty()) {
            spec = spec.and((root, q, cb) -> cb.like(root.get("tags"), "% " + t + " %"));
        }
        if (query != null && !query.isBlank()) {
            String like = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("productName")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(shopOf(root).get("name")), like),
                    cb.like(cb.lower(shopOf(root).get("city")), like)));
        }
        if (followingOnly) {
            Set<Long> shopIds = new HashSet<>(views.followedShopIds(userId));
            if (userId != null) {
                shops.findByOwnerId(userId).ifPresent(s -> shopIds.add(s.getId()));
            }
            if (shopIds.isEmpty()) {
                return new FeedPage(List.of(), page, false);
            }
            spec = spec.and((root, q, cb) -> shopOf(root).get("id").in(shopIds));
        }

        Page<Post> result = posts.findAll(spec, PageRequest.of(Math.max(0, page), PAGE_SIZE, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new FeedPage(views.posts(result.getContent(), userId), page, result.hasNext());
    }

    public PostView one(Long postId, Long userId) {
        Post post = posts.findById(postId).orElseThrow(() -> ApiException.notFound("Publication"));
        return views.posts(List.of(post), userId).get(0);
    }

    public List<PostView> byShop(String slug, Long userId) {
        Shop shop = shops.findBySlug(slug).orElseThrow(() -> ApiException.notFound("Boutique"));
        return views.posts(posts.findByShopIdOrderByCreatedAtDesc(shop.getId()), userId);
    }

    public List<PostView> saved(Long userId) {
        List<Long> ids = saves.findAllSavedPostIds(userId);
        Map<Long, Post> byId = new HashMap<>();
        posts.findByIdIn(ids).forEach(p -> byId.put(p.getId(), p));
        List<Post> ordered = ids.stream().map(byId::get).filter(Objects::nonNull).toList();
        return views.posts(ordered, userId);
    }

    /** Hashtags les plus populaires sur les publications récentes (pondérés par les j'aime). */
    public List<TrendView> trends() {
        Map<String, Integer> score = new HashMap<>();
        Map<String, String> label = new HashMap<>();
        for (Post p : posts.findTop300ByOrderByCreatedAtDesc()) {
            Hashtags.extract(p.getDescription()).forEach((tag, original) -> {
                score.merge(tag, 1 + p.getLikeCount(), Integer::sum);
                label.putIfAbsent(tag, original);
            });
        }
        return score.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(12)
                .map(e -> new TrendView(e.getKey(), label.get(e.getKey()), e.getValue()))
                .toList();
    }

    private static Path<Shop> shopOf(Root<Post> root) {
        return root.get("shop");
    }
}
