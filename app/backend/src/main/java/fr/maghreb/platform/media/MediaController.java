package fr.maghreb.platform.media;

import fr.maghreb.platform.common.ApiException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Envoi et affichage des photos produits. */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final Pattern KEY = Pattern.compile("^[0-9a-f-]{36}\\.(jpg|png|webp)$");

    private final StorageService storage;
    private final Counter uploads;

    public MediaController(StorageService storage, MeterRegistry registry) {
        this.storage = storage;
        this.uploads = Counter.builder("maghreb.media.uploaded").description("Photos envoyées").register(registry);
    }

    /** POST /api/media (multipart, champ "file") -> { "key": "...", "url": "/api/media/..." } */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] data = file.getBytes();
        String ext = MediaTypes.detectExtension(data)
                .orElseThrow(() -> ApiException.badRequest("Format non accepté : envoyez une photo JPEG, PNG ou WebP"));
        String key = UUID.randomUUID() + "." + ext;
        storage.put(key, data, MediaTypes.fromKey(key));
        uploads.increment();
        return Map.of("key", key, "url", "/api/media/" + key);
    }

    @GetMapping("/{key}")
    public ResponseEntity<byte[]> get(@PathVariable String key) {
        if (!KEY.matcher(key).matches()) {
            throw ApiException.notFound("Photo");
        }
        return storage.get(key)
                .map(o -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(o.contentType()))
                        // Le nom est unique et le contenu ne change jamais : cache navigateur 1 an
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                        .body(o.data()))
                .orElseThrow(() -> ApiException.notFound("Photo"));
    }
}
