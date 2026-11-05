// Données de DÉMONSTRATION (boutiques et produits fictifs).
// Une seule source pour :
//   - le mode démo du frontend (quand l'API est injoignable)
//   - le jeu d'essai de la base (backend/src/main/resources/db/migration/V2__seed.sql, généré par scripts/generate-seed.js)
window.MAGHREB_DEMO = {
  "shops": [
    {
      "slug": "dar-caftan",
      "name": "Dar Caftan",
      "initials": "DC",
      "country": "MA",
      "city": "Fès",
      "shipsFrom": "Expédie depuis Paris",
      "color": "#8a2c45",
      "followerCount": 12400,
      "bio": "Caftans et takchitas brodés main par des maâlems de Fès. Retouches sur mesure à Paris.",
      "deliveryFee": 9.9
    },
    {
      "slug": "atlas-argan",
      "name": "Atlas Argan",
      "initials": "AA",
      "country": "MA",
      "city": "Agadir",
      "shipsFrom": "Livraison France 5 jours",
      "color": "#3a6b4f",
      "followerCount": 8350,
      "bio": "Coopérative de femmes du Souss : huile d'argan alimentaire et cosmétique, amlou, savon noir.",
      "deliveryFee": 6.9
    },
    {
      "slug": "karakou-co",
      "name": "Karakou & Co",
      "initials": "KC",
      "country": "DZ",
      "city": "Alger",
      "shipsFrom": "Atelier à Lyon",
      "color": "#2f2a6b",
      "followerCount": 6120,
      "bio": "Karakous en velours et fetla dorée, chedda de Tlemcen en location pour les mariages.",
      "deliveryFee": 9.9
    },
    {
      "slug": "douceurs-oran",
      "name": "Les Douceurs d'Oran",
      "initials": "DO",
      "country": "DZ",
      "city": "Oran",
      "shipsFrom": "Atelier à Marseille",
      "color": "#7b3b2a",
      "followerCount": 15900,
      "bio": "Makrout, griwech, dziriettes et mchewek, cuits chaque jeudi. Plateaux pour fêtes et Aïd.",
      "deliveryFee": 7.5
    },
    {
      "slug": "cap-bon",
      "name": "Harissa du Cap Bon",
      "initials": "HC",
      "country": "TN",
      "city": "Nabeul",
      "shipsFrom": "Livraison France 4 jours",
      "color": "#9c2a24",
      "followerCount": 4980,
      "bio": "Harissa traditionnelle séchée au soleil, tabel, bsissa et huile d’olive de Sfax.",
      "deliveryFee": 6.9
    },
    {
      "slug": "ceramiques-nabeul",
      "name": "Céramiques de Nabeul",
      "initials": "CN",
      "country": "TN",
      "city": "Nabeul",
      "shipsFrom": "Emballage renforcé",
      "color": "#1d3f8a",
      "followerCount": 7210,
      "bio": "Plats, tajines et assiettes peints à la main dans notre atelier familial depuis 1974.",
      "deliveryFee": 12
    },
    {
      "slug": "chechia-medina",
      "name": "Chéchia Médina",
      "initials": "CM",
      "country": "TN",
      "city": "Tunis",
      "shipsFrom": "Souk El Chaouachia",
      "color": "#2c5560",
      "followerCount": 2310,
      "bio": "Chéchias en laine foulée et teinte au kermès, faites dans le souk des chaouachis.",
      "deliveryFee": 6.9
    },
    {
      "slug": "beni-ouarain",
      "name": "Tapis Beni Ouarain",
      "initials": "BO",
      "country": "MA",
      "city": "Midelt",
      "shipsFrom": "Livraison offerte dès 300 €",
      "color": "#5c4636",
      "followerCount": 9870,
      "bio": "Tapis en laine tissés par les femmes du Moyen Atlas, pièces uniques numérotées.",
      "deliveryFee": 0
    },
    {
      "slug": "bijoux-kabylie",
      "name": "Bijoux de Kabylie",
      "initials": "BK",
      "country": "DZ",
      "city": "Beni Yenni",
      "shipsFrom": "Expédie depuis Montreuil",
      "color": "#1f5f57",
      "followerCount": 5440,
      "bio": "Argent émaillé et corail des Aït Yenni : fibules, bracelets et colliers d'artisans.",
      "deliveryFee": 5.9
    },
    {
      "slug": "dattes-biskra",
      "name": "Dattes de Biskra",
      "initials": "DB",
      "country": "DZ",
      "city": "Biskra",
      "shipsFrom": "Arrivage chaque semaine",
      "color": "#a5642b",
      "followerCount": 3760,
      "bio": "Deglet Nour en branche, récolte directe des palmeraies de Tolga.",
      "deliveryFee": 6.9
    }
  ],
  "posts": [
    {
      "id": "p1",
      "shop": "douceurs-oran",
      "visualKind": "pastry",
      "productName": "Plateau de makrout au miel (1 kg)",
      "price": 24,
      "description": "Fournée de jeudi sortie du four ✨ Makrout à la semoule fine, pâte de dattes maison et miel de fleurs. Commandes pour le week-end jusqu’à vendredi midi.\n#makrout #gâteauxalgériens #aïd",
      "minutesAgo": 42,
      "likeCount": 318,
      "comments": [
        {
          "author": "Samira",
          "body": "Les meilleurs de Marseille, je confirme !"
        },
        {
          "author": "Yacine",
          "body": "Vous livrez à Aix ?"
        }
      ]
    },
    {
      "id": "p2",
      "shop": "dar-caftan",
      "visualKind": "caftan",
      "productName": "Caftan en velours, broderie sfifa",
      "price": 289,
      "description": "Nouvelle pièce de la collection hiver : velours bordeaux, sfifa et akaad dorés faits main. Du 36 au 46, retouches offertes.\n#caftan #takchita #mariage",
      "minutesAgo": 95,
      "likeCount": 1240,
      "comments": [
        {
          "author": "Nadia",
          "body": "Magnifique 😍 il existe en vert émeraude ?"
        },
        {
          "author": "Dar Caftan",
          "body": "Oui Nadia, sur commande en 3 semaines !"
        }
      ]
    },
    {
      "id": "p3",
      "shop": "cap-bon",
      "visualKind": "jar",
      "productName": "Harissa traditionnelle, pot 350 g",
      "price": 7.5,
      "description": "Récolte de piments baklouti de cette saison, séchés au soleil puis moulus à l’ancienne avec ail et carvi.\n#harissa #cuisinetunisienne",
      "minutesAgo": 180,
      "likeCount": 206,
      "comments": [
        {
          "author": "Mehdi",
          "body": "Ma mère dit que c’est comme celle de Nabeul 👌"
        }
      ]
    },
    {
      "id": "p4",
      "shop": "atlas-argan",
      "visualKind": "bottle",
      "productName": "Huile d'argan alimentaire, 250 ml",
      "price": 19,
      "description": "Pressée à froid à la coopérative, graines torréfiées légèrement : goût de noisette. Idéale avec l’amlou du petit-déjeuner.\n#huiledargan #amlou #maroc",
      "minutesAgo": 300,
      "likeCount": 512,
      "comments": []
    },
    {
      "id": "p5",
      "shop": "karakou-co",
      "visualKind": "caftan",
      "productName": "Karakou velours noir et fetla",
      "price": 420,
      "description": "Karakou algérois en velours noir, fetla dorée sur la veste et seroual chelka assorti. Location possible pour un mariage.\n#karakou #algéroise #mariage",
      "minutesAgo": 520,
      "likeCount": 874,
      "comments": [
        {
          "author": "Lina",
          "body": "La finition est incroyable"
        }
      ]
    },
    {
      "id": "p6",
      "shop": "ceramiques-nabeul",
      "visualKind": "plate",
      "productName": "Grand plat à couscous peint main",
      "price": 38,
      "description": "Ø 34 cm, émail alimentaire, motif fleur de jasmin bleu et jaune. Chaque plat est unique.\n#céramique #nabeul #couscous",
      "minutesAgo": 760,
      "likeCount": 389,
      "comments": []
    },
    {
      "id": "p7",
      "shop": "beni-ouarain",
      "visualKind": "rug",
      "productName": "Tapis Beni Ouarain 160 × 230",
      "price": 690,
      "description": "Laine écrue non teinte, losanges noirs tracés à main levée. Pièce n° 214, tissée en 7 semaines.\n#tapisberbère #beniouarain #déco",
      "minutesAgo": 1440,
      "likeCount": 1018,
      "comments": [
        {
          "author": "Claire",
          "body": "Il est encore disponible ?"
        },
        {
          "author": "Tapis Beni Ouarain",
          "body": "Oui ! Envoyez-nous une demande 🙂"
        }
      ]
    },
    {
      "id": "p8",
      "shop": "bijoux-kabylie",
      "visualKind": "jewel",
      "productName": "Fibule kabyle en argent émaillé",
      "price": 145,
      "description": "Tabzimt en argent, émail vert, jaune et bleu, cabochons de corail. Poinçonnée, livrée avec certificat.\n#bijouxkabyles #tabzimt #artisanat",
      "minutesAgo": 2100,
      "likeCount": 655,
      "comments": []
    },
    {
      "id": "p9",
      "shop": "chechia-medina",
      "visualKind": "chechia",
      "productName": "Chéchia tunisoise rouge",
      "price": 45,
      "description": "Laine mérinos tricotée, foulée puis teinte au kermès. Pompon de soie noire. Tailles 55 à 60.\n#chéchia #tunis #artisanat",
      "minutesAgo": 2880,
      "likeCount": 233,
      "comments": []
    },
    {
      "id": "p10",
      "shop": "dattes-biskra",
      "visualKind": "dates",
      "productName": "Deglet Nour en branche, 2 kg",
      "price": 22,
      "description": "Arrivage de Tolga cette semaine : dattes translucides et mielleuses, parfaites pour le Ramadan et les fêtes.\n#dattes #degletnour #biskra",
      "minutesAgo": 3600,
      "likeCount": 471,
      "comments": [
        {
          "author": "Karim",
          "body": "Commandé la semaine dernière, top qualité"
        }
      ]
    },
    {
      "id": "p11",
      "shop": "atlas-argan",
      "visualKind": "tagine",
      "productName": "Tajine en terre cuite émaillée",
      "price": 34,
      "description": "Tajine de cuisson Ø 30 cm, compatible gaz et four. Livré avec notre fiche de culottage.\n#tajine #cuisinemarocaine",
      "minutesAgo": 4320,
      "likeCount": 198,
      "comments": []
    },
    {
      "id": "p13",
      "shop": "dar-caftan",
      "visualKind": "caftan",
      "productName": "Takchita deux pièces en satin",
      "price": 345,
      "description": "Takchita satin vert émeraude, dfina en mousseline brodée, mdamma dorée offerte.\n#takchita #caftan",
      "minutesAgo": 6200,
      "likeCount": 980,
      "comments": []
    },
    {
      "id": "p14",
      "shop": "douceurs-oran",
      "visualKind": "pastry",
      "productName": "Griwech et dziriettes, boîte mixte",
      "price": 29,
      "description": "Boîte de 30 pièces : griwech au miel, dziriettes aux amandes et mchewek. Idéal pour offrir.\n#gâteauxalgériens #aïd",
      "minutesAgo": 6900,
      "likeCount": 402,
      "comments": []
    },
    {
      "id": "p15",
      "shop": "bijoux-kabylie",
      "visualKind": "jewel",
      "productName": "Bracelet kabyle émaillé",
      "price": 98,
      "description": "Bracelet manchette en argent, émail vert et jaune, motifs triangulaires de Beni Yenni.\n#bijouxkabyles #artisanat",
      "minutesAgo": 7600,
      "likeCount": 288,
      "comments": []
    },
    {
      "id": "p16",
      "shop": "cap-bon",
      "visualKind": "bottle",
      "productName": "Huile d'olive de Sfax, 1 L",
      "price": 16,
      "description": "Première pression à froid, variété chemlali, récolte de novembre.\n#huiledolive #cuisinetunisienne",
      "minutesAgo": 8100,
      "likeCount": 175,
      "comments": []
    },
    {
      "id": "p17",
      "shop": "chechia-medina",
      "visualKind": "chechia",
      "productName": "Chéchia enfant bordeaux",
      "price": 29,
      "description": "Version enfant (tailles 50 à 54), pompon court, parfaite pour les fêtes.\n#chéchia #tunis",
      "minutesAgo": 9300,
      "likeCount": 96,
      "comments": []
    },
    {
      "id": "p18",
      "shop": "karakou-co",
      "visualKind": "jewel",
      "productName": "Parure chedda de Tlemcen (location)",
      "price": 180,
      "description": "Location de la parure complète pour un week-end : chachia, khit errouh, colliers. Caution demandée.\n#chedda #tlemcen #mariage",
      "minutesAgo": 10200,
      "likeCount": 512,
      "comments": []
    },
    {
      "id": "p19",
      "shop": "beni-ouarain",
      "visualKind": "rug",
      "productName": "Coussin Beni Ouarain 45 × 45",
      "price": 59,
      "description": "Chutes de laine des grands tapis, cousues en housses de coussin. Garnissage inclus.\n#tapisberbère #déco",
      "minutesAgo": 11000,
      "likeCount": 214,
      "comments": []
    },
    {
      "id": "p20",
      "shop": "dattes-biskra",
      "visualKind": "dates",
      "productName": "Dattes Mech Degla, 1 kg",
      "price": 9,
      "description": "Dattes sèches et moins sucrées, parfaites pour la pâtisserie et le makrout.\n#dattes #biskra",
      "minutesAgo": 12500,
      "likeCount": 133,
      "comments": []
    },
    {
      "id": "p12",
      "shop": "ceramiques-nabeul",
      "visualKind": "lantern",
      "productName": "Lanterne en laiton ciselé",
      "price": 56,
      "description": "Lanterne ajourée à la main, 32 cm, verre ambré. Belle lumière pour les soirées de Ramadan.\n#déco #lanterne #ramadan",
      "minutesAgo": 5040,
      "likeCount": 342,
      "comments": []
    }
  ]
};
