package fr.maghreb.platform;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Parcours complets de l'API sur une base H2 initialisée par les mêmes migrations Flyway que la production
* (schéma MySQL + jeu de démonstration : 10 boutiques, 20 publications, mot de passe démo "demo1234").
 */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ApiIntegrationTest {

    @Autowired
    MockMvc mvc;

    // ---------- outils ----------

    private String register(String email, String name) throws Exception {
        String body = """
                {"email":"%s","password":"motdepasse1","displayName":"%s"}""".formatted(email, name);
        String json = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    private String login(String email, String password) throws Exception {
        String json = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req, String token) {
        return req.header("Authorization", "Bearer " + token);
    }

    private Integer firstPostId() throws Exception {
        String json = mvc.perform(get("/api/feed")).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.items[0].id");
    }

    // ---------- tests ----------

    @Test
    void leFilEstPublicEtPagine() throws Exception {
        mvc.perform(get("/api/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(10)))
                .andExpect(jsonPath("$.hasMore", is(true)))
                .andExpect(jsonPath("$.items[0].shop.name", notNullValue()))
                .andExpect(jsonPath("$.items[0].liked", is(false)));

        mvc.perform(get("/api/feed").param("page", "1"))
                .andExpect(jsonPath("$.items", hasSize(10)))
                .andExpect(jsonPath("$.hasMore", is(false)));
    }

    @Test
    void filtresParPaysHashtagEtRecherche() throws Exception {
        mvc.perform(get("/api/feed").param("country", "TN"))
                .andExpect(jsonPath("$.items[*].shop.country", everyItem(is("TN"))));

        // Le hashtag est insensible aux accents : #gâteauxalgériens == gateauxalgeriens
        mvc.perform(get("/api/feed").param("tag", "gateauxalgeriens"))
                .andExpect(jsonPath("$.items", hasSize(2)));

        mvc.perform(get("/api/feed").param("q", "harissa"))
                .andExpect(jsonPath("$.items[0].productName", containsString("Harissa")));
    }

    @Test
    void lesActionsSocialesDemandentUnCompte() throws Exception {
        Integer id = firstPostId();
        mvc.perform(put("/api/posts/{id}/like", id)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void aimerEnregistrerCommenterEtSuivre() throws Exception {
        String token = register("amina@test.fr", "Amina");
        Integer id = firstPostId();

        String before = mvc.perform(get("/api/posts/{id}", id)).andReturn().getResponse().getContentAsString();
        int likes = JsonPath.read(before, "$.likeCount");

        mvc.perform(auth(put("/api/posts/{id}/like", id), token))
                .andExpect(jsonPath("$.liked", is(true)))
                .andExpect(jsonPath("$.likeCount", is(likes + 1)));
        // idempotent : un deuxième "j'aime" ne compte pas double
        mvc.perform(auth(put("/api/posts/{id}/like", id), token))
                .andExpect(jsonPath("$.likeCount", is(likes + 1)));
        mvc.perform(auth(delete("/api/posts/{id}/like", id), token))
                .andExpect(jsonPath("$.liked", is(false)))
                .andExpect(jsonPath("$.likeCount", is(likes)));

        mvc.perform(auth(put("/api/posts/{id}/save", id), token)).andExpect(jsonPath("$.saved", is(true)));
        mvc.perform(auth(get("/api/me/saved"), token)).andExpect(jsonPath("$[0].id", is(id)));

        mvc.perform(auth(post("/api/posts/{id}/comments", id), token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"Superbe !\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.author", is("Amina")));

        mvc.perform(auth(put("/api/shops/{slug}/follow", "dar-caftan"), token))
                .andExpect(jsonPath("$.following", is(true)));
        mvc.perform(auth(get("/api/feed").param("tab", "following"), token))
                .andExpect(jsonPath("$.items[*].shop.slug", everyItem(is("dar-caftan"))));
    }

    @Test
    void creerSaBoutiqueEtPublierUnProduitAvecPhoto() throws Exception {
        String token = register("yasmine@test.fr", "Yasmine");

        mvc.perform(auth(post("/api/posts"), token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productName\":\"Test\",\"price\":10,\"visualKind\":\"plate\"}"))
                .andExpect(status().isForbidden());

        mvc.perform(auth(post("/api/me/shop"), token).contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Les Délices de Yasmine","country":"DZ","city":"Constantine","deliveryFee":5}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug", is("les-delices-de-yasmine")))
                .andExpect(jsonPath("$.initials", is("DY")))
                .andExpect(jsonPath("$.mine", is(true)));

        // Photo : seul le contenu réel compte (ici un faux PNG : signature PNG + octets)
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        String upload = mvc.perform(auth(multipart("/api/media").file(new MockMultipartFile("file", "x.png", "image/png", png)), token))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String key = JsonPath.read(upload, "$.key");

        mvc.perform(auth(multipart("/api/media").file(new MockMultipartFile("file", "x.png", "image/png", "pas une image".getBytes())), token))
                .andExpect(status().isBadRequest());

        mvc.perform(auth(post("/api/posts"), token).contentType(MediaType.APPLICATION_JSON).content("""
                        {"productName":"Tcharek el ariane","price":18.5,"description":"Fournée du jour #gâteauxalgériens","imageKey":"%s"}""".formatted(key)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl", is("/api/media/" + key)));

        mvc.perform(get("/api/media/{key}", key))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));

        mvc.perform(get("/api/feed").param("tag", "gateauxalgeriens"))
                .andExpect(jsonPath("$.items[0].productName", is("Tcharek el ariane")));
    }

    @Test
    void demandeDeCommandeAccepteeParLaBoutique() throws Exception {
        String client = register("karim@test.fr", "Karim");
        String json = mvc.perform(get("/api/shops/{slug}/posts", "dar-caftan")).andReturn().getResponse().getContentAsString();
        Integer postId = JsonPath.read(json, "$[0].id");

        String order = mvc.perform(auth(post("/api/posts/{id}/orders", postId), client).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2,\"delivery\":\"DELIVERY\",\"message\":\"Taille 40\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.deliveryFee", is(9.9)))
                .andReturn().getResponse().getContentAsString();
        Integer orderId = JsonPath.read(order, "$.id");

        // La boutique (compte de démo) voit la demande et l'accepte
        String shop = login("dar-caftan@demo.example", "demo1234");
        mvc.perform(auth(get("/api/me"), shop)).andExpect(jsonPath("$.pendingOrders", is(1)));
        mvc.perform(auth(get("/api/me/shop/orders"), shop)).andExpect(jsonPath("$[0].customerName", is("Karim")));
        mvc.perform(auth(patch("/api/me/shop/orders/{id}", orderId), shop).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\",\"reply\":\"Merci ! Paiement par virement.\"}"))
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
        // Une demande déjà traitée ne peut pas changer
        mvc.perform(auth(patch("/api/me/shop/orders/{id}", orderId), shop).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DECLINED\"}"))
                .andExpect(status().isConflict());

        mvc.perform(auth(get("/api/me/orders"), client))
                .andExpect(jsonPath("$[0].status", is("ACCEPTED")))
                .andExpect(jsonPath("$[0].shopReply", containsString("virement")));

        // Une autre boutique ne peut pas répondre à cette demande
        String other = login("cap-bon@demo.example", "demo1234");
        mvc.perform(auth(patch("/api/me/shop/orders/{id}", orderId), other).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DECLINED\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void inscriptionEtConnexion() throws Exception {
        register("nadia@test.fr", "Nadia");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"NADIA@test.fr\",\"password\":\"motdepasse1\",\"displayName\":\"Autre\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nadia@test.fr\",\"password\":\"mauvais\"}"))
                .andExpect(status().isUnauthorized());
        String token = login("nadia@test.fr", "motdepasse1");
        mvc.perform(auth(get("/api/me"), token))
                .andExpect(jsonPath("$.displayName", is("Nadia")))
                .andExpect(jsonPath("$.shop", nullValue()));
    }

    @Test
    void metriquesExposeesPourPrometheus() throws Exception {
        register("metrics@test.fr", "M");
        mvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("maghreb_signups_total")));
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
    }
}
