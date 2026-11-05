package fr.maghreb.platform.media;

import java.util.Optional;

/** Détection du type d'image par ses premiers octets (on ne fait pas confiance au nom ni au Content-Type envoyé). */
final class MediaTypes {

    private MediaTypes() {
    }

    /** Renvoie l'extension (jpg, png, webp) si le contenu est une image acceptée. */
    static Optional<String> detectExtension(byte[] b) {
        if (b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return Optional.of("jpg");
        }
        if (b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return Optional.of("png");
        }
        if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return Optional.of("webp");
        }
        return Optional.empty();
    }

    static String fromKey(String key) {
        if (key.endsWith(".png")) {
            return "image/png";
        }
        if (key.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }
}
