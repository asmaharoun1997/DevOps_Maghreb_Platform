package fr.maghreb.platform.shop;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findBySlug(String slug);

    Optional<Shop> findByOwnerId(Long ownerId);

    boolean existsBySlug(String slug);

    List<Shop> findAllByOrderByFollowerCountDesc();

    List<Shop> findByCountryOrderByFollowerCountDesc(Country country);
}
