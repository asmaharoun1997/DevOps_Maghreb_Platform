package fr.maghreb.platform;

import static org.assertj.core.api.Assertions.assertThat;

import fr.maghreb.platform.common.Texts;
import fr.maghreb.platform.post.Hashtags;
import org.junit.jupiter.api.Test;

class TextsAndHashtagsTest {

    @Test
    void slugs() {
        assertThat(Texts.slugify("Les Douceurs d'Oran")).isEqualTo("les-douceurs-d-oran");
        assertThat(Texts.slugify("Céramiques de Nabeul")).isEqualTo("ceramiques-de-nabeul");
        assertThat(Texts.slugify("!!!")).isEqualTo("boutique");
    }

    @Test
    void initiales() {
        assertThat(Texts.initials("Les Douceurs d'Oran")).isEqualTo("DO");
        assertThat(Texts.initials("Karakou & Co")).isEqualTo("KC");
        assertThat(Texts.initials("Dar Caftan")).isEqualTo("DC");
    }

    @Test
    void hashtagsNormalises() {
        assertThat(Hashtags.toColumn("Fournée #Makrout et #gâteauxAlgériens #makrout")).isEqualTo(" makrout gateauxalgeriens ");
        assertThat(Hashtags.toColumn("aucun tag")).isEqualTo(" ");
        assertThat(Hashtags.extract("#Caftan #caftan")).containsEntry("caftan", "Caftan").hasSize(1);
    }
}
