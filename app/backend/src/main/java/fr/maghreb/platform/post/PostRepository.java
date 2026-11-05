package fr.maghreb.platform.post;

import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    /** Le fil : la boutique de chaque publication est chargée dans la même requête (pas de N+1). */
    @Override
    @EntityGraph(attributePaths = "shop")
    Page<Post> findAll(Specification<Post> spec, Pageable pageable);

    @EntityGraph(attributePaths = "shop")
    List<Post> findByIdIn(Collection<Long> ids);

    @EntityGraph(attributePaths = "shop")
    List<Post> findByShopIdOrderByCreatedAtDesc(Long shopId);

    @EntityGraph(attributePaths = "shop")
    List<Post> findTop300ByOrderByCreatedAtDesc();

    long countByShopId(Long shopId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + :delta WHERE p.id = :id")
    void addLikes(@Param("id") Long id, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.id = :id")
    void incrementComments(@Param("id") Long id);
}
