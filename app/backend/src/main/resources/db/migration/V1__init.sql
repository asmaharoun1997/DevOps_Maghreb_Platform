-- ============================================================
--  Maghreb Platform — réseau social de boutiques (DZ / MA / TN)
--  Schéma MySQL 8 (créé automatiquement par Flyway au démarrage)
-- ============================================================

CREATE TABLE app_user (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    email         VARCHAR(200) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(80)  NOT NULL,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_email (email)
);

-- Une boutique appartient à un utilisateur (au plus une par compte)
CREATE TABLE shop (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    slug           VARCHAR(80)  NOT NULL,
    owner_id       BIGINT       NOT NULL,
    name           VARCHAR(80)  NOT NULL,
    country        VARCHAR(2)   NOT NULL,          -- DZ, MA, TN
    city           VARCHAR(80)  NOT NULL,
    ships_from     VARCHAR(120),
    bio            VARCHAR(600),
    color          VARCHAR(7)   NOT NULL,
    delivery_fee   DECIMAL(8,2),                   -- NULL = pas de livraison, retrait uniquement
    follower_count INT          NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_shop_slug (slug),
    UNIQUE KEY uk_shop_owner (owner_id),
    KEY idx_shop_country (country),
    CONSTRAINT fk_shop_owner FOREIGN KEY (owner_id) REFERENCES app_user (id)
);

-- Publication = un produit mis en avant dans le fil
CREATE TABLE post (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    shop_id       BIGINT        NOT NULL,
    product_name  VARCHAR(120)  NOT NULL,
    price         DECIMAL(10,2) NOT NULL,
    description   VARCHAR(1500),
    tags          VARCHAR(600)  NOT NULL DEFAULT ' ',   -- hashtags normalisés : " caftan mariage "
    image_key     VARCHAR(80),                          -- photo stockée (dossier ou stockage objet)
    visual_kind   VARCHAR(20),                          -- illustration de démonstration si pas de photo
    like_count    INT           NOT NULL DEFAULT 0,
    comment_count INT           NOT NULL DEFAULT 0,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_post_created (created_at),
    KEY idx_post_shop (shop_id, created_at),
    CONSTRAINT fk_post_shop FOREIGN KEY (shop_id) REFERENCES shop (id)
);

CREATE TABLE follow (
    user_id    BIGINT      NOT NULL,
    shop_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, shop_id),
    CONSTRAINT fk_follow_user FOREIGN KEY (user_id) REFERENCES app_user (id),
    CONSTRAINT fk_follow_shop FOREIGN KEY (shop_id) REFERENCES shop (id)
);

CREATE TABLE post_like (
    user_id    BIGINT      NOT NULL,
    post_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES app_user (id),
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES post (id)
);

CREATE TABLE saved_post (
    user_id    BIGINT      NOT NULL,
    post_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES app_user (id),
    CONSTRAINT fk_saved_post FOREIGN KEY (post_id) REFERENCES post (id)
);

CREATE TABLE post_comment (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    post_id    BIGINT       NOT NULL,
    author_id  BIGINT       NOT NULL,
    body       VARCHAR(300) NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_comment_post (post_id, created_at),
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES post (id),
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES app_user (id)
);

-- Demande de commande : la boutique confirme puis gère le paiement elle-même
CREATE TABLE order_request (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    post_id      BIGINT        NOT NULL,
    shop_id      BIGINT        NOT NULL,
    customer_id  BIGINT        NOT NULL,
    product_name VARCHAR(120)  NOT NULL,   -- copie au moment de la demande
    unit_price   DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    delivery     VARCHAR(10)   NOT NULL,   -- DELIVERY, PICKUP
    delivery_fee DECIMAL(8,2)  NOT NULL DEFAULT 0,
    message      VARCHAR(500),
    shop_reply   VARCHAR(500),
    status       VARCHAR(10)   NOT NULL DEFAULT 'PENDING',  -- PENDING, ACCEPTED, DECLINED
    created_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_order_shop (shop_id, created_at),
    KEY idx_order_customer (customer_id, created_at),
    CONSTRAINT fk_order_post FOREIGN KEY (post_id) REFERENCES post (id),
    CONSTRAINT fk_order_shop FOREIGN KEY (shop_id) REFERENCES shop (id),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES app_user (id)
);
