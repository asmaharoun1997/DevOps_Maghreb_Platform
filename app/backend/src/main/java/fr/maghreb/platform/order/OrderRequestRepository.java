package fr.maghreb.platform.order;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRequestRepository extends JpaRepository<OrderRequest, Long> {

    @EntityGraph(attributePaths = {"post", "shop", "customer"})
    List<OrderRequest> findByShopIdOrderByCreatedAtDesc(Long shopId);

    @EntityGraph(attributePaths = {"post", "shop", "customer"})
    List<OrderRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    long countByShopIdAndStatus(Long shopId, OrderRequest.Status status);
}
