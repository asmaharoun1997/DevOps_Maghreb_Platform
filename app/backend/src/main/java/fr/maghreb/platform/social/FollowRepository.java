package fr.maghreb.platform.social;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FollowRepository extends JpaRepository<Follow, UserItemId> {

    @Query("SELECT f.id.itemId FROM Follow f WHERE f.id.userId = :userId")
    List<Long> findShopIdsByUser(@Param("userId") Long userId);
}
