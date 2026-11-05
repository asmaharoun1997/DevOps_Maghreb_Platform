package fr.maghreb.platform.order;

import fr.maghreb.platform.api.Views.OrderView;
import fr.maghreb.platform.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/orders")
public class OrderController {

    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderView request(@PathVariable Long postId, @Valid @RequestBody OrderService.OrderRequestBody body,
                             @AuthenticationPrincipal Jwt jwt) {
        return orders.request(TokenService.userId(jwt), postId, body);
    }
}
