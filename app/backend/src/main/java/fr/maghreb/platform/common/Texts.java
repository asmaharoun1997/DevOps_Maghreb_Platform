package fr.maghreb.platform.common;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class Texts {

    private static final Set<String> SMALL_WORDS = Set.of("de", "du", "des", "la", "le", "les", "et", "d", "l", "&");

    private Texts() {
    }

    /** "Les Douceurs d'Oran" -> "les-douceurs-d-oran" */
    public static String slugify(String text) {
        String s = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        s = s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (s.length() > 60) {
            s = s.substring(0, 60).replaceAll("-$", "");
        }
        return s.isEmpty() ? "boutique" : s;
    }

    /** "Les Douceurs d'Oran" -> "DO" (initiales affichées dans l'avatar) */
    public static String initials(String name) {
        String[] words = name.split("[\\s'’-]+");
        String letters = Arrays.stream(words)
                .filter(w -> !w.isBlank() && !SMALL_WORDS.contains(w.toLowerCase(Locale.ROOT)))
                .limit(2)
                .map(w -> w.substring(0, 1).toUpperCase(Locale.ROOT))
                .collect(Collectors.joining());
        return letters.isEmpty() ? name.substring(0, 1).toUpperCase(Locale.ROOT) : letters;
    }

    public static String trimToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
