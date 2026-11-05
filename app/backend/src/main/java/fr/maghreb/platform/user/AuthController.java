package fr.maghreb.platform.user;

import fr.maghreb.platform.common.ApiException;
import fr.maghreb.platform.security.TokenService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 200) String email,
            @NotBlank @Size(min = 8, max = 100, message = "8 caractères minimum") String password,
            @NotBlank @Size(max = 80) String displayName) {
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }

    public record AuthResponse(String token, Long userId, String displayName) {
    }

    private final AppUserRepository users;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final Counter signups;

    public AuthController(AppUserRepository users, PasswordEncoder passwords, TokenService tokens, MeterRegistry registry) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.signups = Counter.builder("maghreb.signups").description("Comptes créés").register(registry);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Un compte existe déjà avec cet e-mail");
        }
        AppUser user = users.save(new AppUser(email, passwords.encode(req.password()), req.displayName().trim()));
        signups.increment();
        return new AuthResponse(tokens.issue(user), user.getId(), user.getDisplayName());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        AppUser user = users.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> passwords.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou mot de passe incorrect"));
        return new AuthResponse(tokens.issue(user), user.getId(), user.getDisplayName());
    }
}
