package fr.maghreb.platform.social;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SavedPostRepository extends JpaRepository<SavedPost, UserItemId> {

    @Query("SELECT s.id.itemId FROM SavedPost s WHERE s.id.userId = :userId AND s.id.itemId IN :postIds")
    List<Long> findSavedPostIds(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);

    @Query("SELECT s.id.itemId FROM SavedPost s WHERE s.id.userId = :userId ORDER BY s.createdAt DESC")
    List<Long> findAllSavedPostIds(@Param("userId") Long userId);
}
