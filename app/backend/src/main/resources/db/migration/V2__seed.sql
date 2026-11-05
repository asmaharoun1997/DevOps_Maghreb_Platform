-- Jeu de démonstration (boutiques et personnes FICTIVES), généré par scripts/generate-seed.js
-- Mot de passe de tous les comptes de démo : demo1234

INSERT INTO app_user (email, password_hash, display_name) VALUES
('dar-caftan@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Dar Caftan'),
('atlas-argan@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Atlas Argan'),
('karakou-co@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Karakou & Co'),
('douceurs-oran@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Les Douceurs d''Oran'),
('cap-bon@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Harissa du Cap Bon'),
('ceramiques-nabeul@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Céramiques de Nabeul'),
('chechia-medina@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Chéchia Médina'),
('beni-ouarain@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Tapis Beni Ouarain'),
('bijoux-kabylie@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Bijoux de Kabylie'),
('dattes-biskra@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Dattes de Biskra'),
('samira@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Samira'),
('yacine@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Yacine'),
('nadia@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Nadia'),
('mehdi@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Mehdi'),
('lina@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Lina'),
('claire@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Claire'),
('karim@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Karim'),
('client@demo.example', '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G', 'Client démo');

INSERT INTO shop (slug, owner_id, name, country, city, ships_from, bio, color, delivery_fee, follower_count) VALUES
('dar-caftan', (SELECT id FROM app_user WHERE email = 'dar-caftan@demo.example'), 'Dar Caftan', 'MA', 'Fès', 'Expédie depuis Paris', 'Caftans et takchitas brodés main par des maâlems de Fès. Retouches sur mesure à Paris.', '#8a2c45', 9.9, 12400),
('atlas-argan', (SELECT id FROM app_user WHERE email = 'atlas-argan@demo.example'), 'Atlas Argan', 'MA', 'Agadir', 'Livraison France 5 jours', 'Coopérative de femmes du Souss : huile d''argan alimentaire et cosmétique, amlou, savon noir.', '#3a6b4f', 6.9, 8350),
('karakou-co', (SELECT id FROM app_user WHERE email = 'karakou-co@demo.example'), 'Karakou & Co', 'DZ', 'Alger', 'Atelier à Lyon', 'Karakous en velours et fetla dorée, chedda de Tlemcen en location pour les mariages.', '#2f2a6b', 9.9, 6120),
('douceurs-oran', (SELECT id FROM app_user WHERE email = 'douceurs-oran@demo.example'), 'Les Douceurs d''Oran', 'DZ', 'Oran', 'Atelier à Marseille', 'Makrout, griwech, dziriettes et mchewek, cuits chaque jeudi. Plateaux pour fêtes et Aïd.', '#7b3b2a', 7.5, 15900),
('cap-bon', (SELECT id FROM app_user WHERE email = 'cap-bon@demo.example'), 'Harissa du Cap Bon', 'TN', 'Nabeul', 'Livraison France 4 jours', 'Harissa traditionnelle séchée au soleil, tabel, bsissa et huile d’olive de Sfax.', '#9c2a24', 6.9, 4980),
('ceramiques-nabeul', (SELECT id FROM app_user WHERE email = 'ceramiques-nabeul@demo.example'), 'Céramiques de Nabeul', 'TN', 'Nabeul', 'Emballage renforcé', 'Plats, tajines et assiettes peints à la main dans notre atelier familial depuis 1974.', '#1d3f8a', 12, 7210),
('chechia-medina', (SELECT id FROM app_user WHERE email = 'chechia-medina@demo.example'), 'Chéchia Médina', 'TN', 'Tunis', 'Souk El Chaouachia', 'Chéchias en laine foulée et teinte au kermès, faites dans le souk des chaouachis.', '#2c5560', 6.9, 2310),
('beni-ouarain', (SELECT id FROM app_user WHERE email = 'beni-ouarain@demo.example'), 'Tapis Beni Ouarain', 'MA', 'Midelt', 'Livraison offerte dès 300 €', 'Tapis en laine tissés par les femmes du Moyen Atlas, pièces uniques numérotées.', '#5c4636', 0, 9870),
('bijoux-kabylie', (SELECT id FROM app_user WHERE email = 'bijoux-kabylie@demo.example'), 'Bijoux de Kabylie', 'DZ', 'Beni Yenni', 'Expédie depuis Montreuil', 'Argent émaillé et corail des Aït Yenni : fibules, bracelets et colliers d''artisans.', '#1f5f57', 5.9, 5440),
('dattes-biskra', (SELECT id FROM app_user WHERE email = 'dattes-biskra@demo.example'), 'Dattes de Biskra', 'DZ', 'Biskra', 'Arrivage chaque semaine', 'Deglet Nour en branche, récolte directe des palmeraies de Tolga.', '#a5642b', 6.9, 3760);

INSERT INTO post (shop_id, product_name, price, description, tags, visual_kind, like_count, comment_count, created_at) VALUES
((SELECT id FROM shop WHERE slug = 'douceurs-oran'), 'Plateau de makrout au miel (1 kg)', 24, 'Fournée de jeudi sortie du four ✨ Makrout à la semoule fine, pâte de dattes maison et miel de fleurs. Commandes pour le week-end jusqu’à vendredi midi.
#makrout #gâteauxalgériens #aïd', ' makrout gateauxalgeriens aid ', 'pastry', 318, 2, TIMESTAMPADD(MINUTE, -42, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'dar-caftan'), 'Caftan en velours, broderie sfifa', 289, 'Nouvelle pièce de la collection hiver : velours bordeaux, sfifa et akaad dorés faits main. Du 36 au 46, retouches offertes.
#caftan #takchita #mariage', ' caftan takchita mariage ', 'caftan', 1240, 2, TIMESTAMPADD(MINUTE, -95, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'cap-bon'), 'Harissa traditionnelle, pot 350 g', 7.5, 'Récolte de piments baklouti de cette saison, séchés au soleil puis moulus à l’ancienne avec ail et carvi.
#harissa #cuisinetunisienne', ' harissa cuisinetunisienne ', 'jar', 206, 1, TIMESTAMPADD(MINUTE, -180, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'atlas-argan'), 'Huile d''argan alimentaire, 250 ml', 19, 'Pressée à froid à la coopérative, graines torréfiées légèrement : goût de noisette. Idéale avec l’amlou du petit-déjeuner.
#huiledargan #amlou #maroc', ' huiledargan amlou maroc ', 'bottle', 512, 0, TIMESTAMPADD(MINUTE, -300, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'karakou-co'), 'Karakou velours noir et fetla', 420, 'Karakou algérois en velours noir, fetla dorée sur la veste et seroual chelka assorti. Location possible pour un mariage.
#karakou #algéroise #mariage', ' karakou algeroise mariage ', 'caftan', 874, 1, TIMESTAMPADD(MINUTE, -520, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'ceramiques-nabeul'), 'Grand plat à couscous peint main', 38, 'Ø 34 cm, émail alimentaire, motif fleur de jasmin bleu et jaune. Chaque plat est unique.
#céramique #nabeul #couscous', ' ceramique nabeul couscous ', 'plate', 389, 0, TIMESTAMPADD(MINUTE, -760, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'beni-ouarain'), 'Tapis Beni Ouarain 160 × 230', 690, 'Laine écrue non teinte, losanges noirs tracés à main levée. Pièce n° 214, tissée en 7 semaines.
#tapisberbère #beniouarain #déco', ' tapisberbere beniouarain deco ', 'rug', 1018, 2, TIMESTAMPADD(MINUTE, -1440, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'bijoux-kabylie'), 'Fibule kabyle en argent émaillé', 145, 'Tabzimt en argent, émail vert, jaune et bleu, cabochons de corail. Poinçonnée, livrée avec certificat.
#bijouxkabyles #tabzimt #artisanat', ' bijouxkabyles tabzimt artisanat ', 'jewel', 655, 0, TIMESTAMPADD(MINUTE, -2100, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'chechia-medina'), 'Chéchia tunisoise rouge', 45, 'Laine mérinos tricotée, foulée puis teinte au kermès. Pompon de soie noire. Tailles 55 à 60.
#chéchia #tunis #artisanat', ' chechia tunis artisanat ', 'chechia', 233, 0, TIMESTAMPADD(MINUTE, -2880, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'dattes-biskra'), 'Deglet Nour en branche, 2 kg', 22, 'Arrivage de Tolga cette semaine : dattes translucides et mielleuses, parfaites pour le Ramadan et les fêtes.
#dattes #degletnour #biskra', ' dattes degletnour biskra ', 'dates', 471, 1, TIMESTAMPADD(MINUTE, -3600, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'atlas-argan'), 'Tajine en terre cuite émaillée', 34, 'Tajine de cuisson Ø 30 cm, compatible gaz et four. Livré avec notre fiche de culottage.
#tajine #cuisinemarocaine', ' tajine cuisinemarocaine ', 'tagine', 198, 0, TIMESTAMPADD(MINUTE, -4320, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'dar-caftan'), 'Takchita deux pièces en satin', 345, 'Takchita satin vert émeraude, dfina en mousseline brodée, mdamma dorée offerte.
#takchita #caftan', ' takchita caftan ', 'caftan', 980, 0, TIMESTAMPADD(MINUTE, -6200, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'douceurs-oran'), 'Griwech et dziriettes, boîte mixte', 29, 'Boîte de 30 pièces : griwech au miel, dziriettes aux amandes et mchewek. Idéal pour offrir.
#gâteauxalgériens #aïd', ' gateauxalgeriens aid ', 'pastry', 402, 0, TIMESTAMPADD(MINUTE, -6900, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'bijoux-kabylie'), 'Bracelet kabyle émaillé', 98, 'Bracelet manchette en argent, émail vert et jaune, motifs triangulaires de Beni Yenni.
#bijouxkabyles #artisanat', ' bijouxkabyles artisanat ', 'jewel', 288, 0, TIMESTAMPADD(MINUTE, -7600, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'cap-bon'), 'Huile d''olive de Sfax, 1 L', 16, 'Première pression à froid, variété chemlali, récolte de novembre.
#huiledolive #cuisinetunisienne', ' huiledolive cuisinetunisienne ', 'bottle', 175, 0, TIMESTAMPADD(MINUTE, -8100, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'chechia-medina'), 'Chéchia enfant bordeaux', 29, 'Version enfant (tailles 50 à 54), pompon court, parfaite pour les fêtes.
#chéchia #tunis', ' chechia tunis ', 'chechia', 96, 0, TIMESTAMPADD(MINUTE, -9300, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'karakou-co'), 'Parure chedda de Tlemcen (location)', 180, 'Location de la parure complète pour un week-end : chachia, khit errouh, colliers. Caution demandée.
#chedda #tlemcen #mariage', ' chedda tlemcen mariage ', 'jewel', 512, 0, TIMESTAMPADD(MINUTE, -10200, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'beni-ouarain'), 'Coussin Beni Ouarain 45 × 45', 59, 'Chutes de laine des grands tapis, cousues en housses de coussin. Garnissage inclus.
#tapisberbère #déco', ' tapisberbere deco ', 'rug', 214, 0, TIMESTAMPADD(MINUTE, -11000, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'dattes-biskra'), 'Dattes Mech Degla, 1 kg', 9, 'Dattes sèches et moins sucrées, parfaites pour la pâtisserie et le makrout.
#dattes #biskra', ' dattes biskra ', 'dates', 133, 0, TIMESTAMPADD(MINUTE, -12500, CURRENT_TIMESTAMP(6))),
((SELECT id FROM shop WHERE slug = 'ceramiques-nabeul'), 'Lanterne en laiton ciselé', 56, 'Lanterne ajourée à la main, 32 cm, verre ambré. Belle lumière pour les soirées de Ramadan.
#déco #lanterne #ramadan', ' deco lanterne ramadan ', 'lantern', 342, 0, TIMESTAMPADD(MINUTE, -5040, CURRENT_TIMESTAMP(6)));

INSERT INTO post_comment (post_id, author_id, body, created_at) VALUES
((SELECT id FROM post WHERE product_name = 'Plateau de makrout au miel (1 kg)'), (SELECT id FROM app_user WHERE email = 'samira@demo.example'), 'Les meilleurs de Marseille, je confirme !', TIMESTAMPADD(MINUTE, -37, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Plateau de makrout au miel (1 kg)'), (SELECT id FROM app_user WHERE email = 'yacine@demo.example'), 'Vous livrez à Aix ?', TIMESTAMPADD(MINUTE, -32, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Caftan en velours, broderie sfifa'), (SELECT id FROM app_user WHERE email = 'nadia@demo.example'), 'Magnifique 😍 il existe en vert émeraude ?', TIMESTAMPADD(MINUTE, -90, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Caftan en velours, broderie sfifa'), (SELECT id FROM app_user WHERE email = 'dar-caftan@demo.example'), 'Oui Nadia, sur commande en 3 semaines !', TIMESTAMPADD(MINUTE, -85, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Harissa traditionnelle, pot 350 g'), (SELECT id FROM app_user WHERE email = 'mehdi@demo.example'), 'Ma mère dit que c’est comme celle de Nabeul 👌', TIMESTAMPADD(MINUTE, -175, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Karakou velours noir et fetla'), (SELECT id FROM app_user WHERE email = 'lina@demo.example'), 'La finition est incroyable', TIMESTAMPADD(MINUTE, -515, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Tapis Beni Ouarain 160 × 230'), (SELECT id FROM app_user WHERE email = 'claire@demo.example'), 'Il est encore disponible ?', TIMESTAMPADD(MINUTE, -1435, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Tapis Beni Ouarain 160 × 230'), (SELECT id FROM app_user WHERE email = 'beni-ouarain@demo.example'), 'Oui ! Envoyez-nous une demande 🙂', TIMESTAMPADD(MINUTE, -1430, CURRENT_TIMESTAMP(6))),
((SELECT id FROM post WHERE product_name = 'Deglet Nour en branche, 2 kg'), (SELECT id FROM app_user WHERE email = 'karim@demo.example'), 'Commandé la semaine dernière, top qualité', TIMESTAMPADD(MINUTE, -3595, CURRENT_TIMESTAMP(6)));

-- Le compte client@demo.example suit trois boutiques
INSERT INTO follow (user_id, shop_id) VALUES
((SELECT id FROM app_user WHERE email = 'client@demo.example'), (SELECT id FROM shop WHERE slug = 'douceurs-oran')),
((SELECT id FROM app_user WHERE email = 'client@demo.example'), (SELECT id FROM shop WHERE slug = 'dar-caftan')),
((SELECT id FROM app_user WHERE email = 'client@demo.example'), (SELECT id FROM shop WHERE slug = 'cap-bon'));
