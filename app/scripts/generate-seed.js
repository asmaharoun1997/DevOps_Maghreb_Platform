// Génère backend/src/main/resources/db/migration/V2__seed.sql à partir de frontend/public/demo-data.js
// Usage : node scripts/generate-seed.js
// Tous les comptes de démonstration ont le mot de passe : demo1234
const fs = require('fs');
const path = require('path');

global.window = {};
require(path.join(__dirname, '../frontend/public/demo-data.js'));
const { shops, posts } = window.MAGHREB_DEMO;

const DEMO_PASSWORD_HASH = '$2a$10$CkYyu4v2ohZZ/D8Zplb2oeOZS5cW/pGj1uzk.4fDBRJcPlGiKgU4G'; // BCrypt de "demo1234"
const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'");
const tags = (text) => {
  const found = [...new Set((text.match(/#[\p{L}\p{N}_]{2,40}/gu) || []).map((t) => t.slice(1).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase()))];
  return found.length ? ' ' + found.join(' ') + ' ' : ' ';
};

const customers = [...new Set(posts.flatMap((p) => p.comments.map((c) => c.author)).filter((a) => !shops.some((s) => s.name === a)))];
const email = (name) => name.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '').replace(/[^a-z0-9]+/g, '.') + '@demo.example';

const out = [];
out.push('-- Jeu de démonstration (boutiques et personnes FICTIVES), généré par scripts/generate-seed.js');
out.push('-- Mot de passe de tous les comptes de démo : demo1234');
out.push('');
out.push('INSERT INTO app_user (email, password_hash, display_name) VALUES');
const users = [
  ...shops.map((s) => [s.slug + '@demo.example', s.name]),
  ...customers.map((c) => [email(c), c]),
  ['client@demo.example', 'Client démo'],
];
out.push(users.map(([e, n]) => '(' + [q(e), q(DEMO_PASSWORD_HASH), q(n)].join(', ') + ')').join(',\n') + ';');
out.push('');
out.push('INSERT INTO shop (slug, owner_id, name, country, city, ships_from, bio, color, delivery_fee, follower_count) VALUES');
out.push(shops.map((s) => '(' + [q(s.slug), "(SELECT id FROM app_user WHERE email = " + q(s.slug + '@demo.example') + ')', q(s.name), q(s.country), q(s.city), q(s.shipsFrom), q(s.bio), q(s.color), q(s.deliveryFee), q(s.followerCount)].join(', ') + ')').join(',\n') + ';');
out.push('');
out.push('INSERT INTO post (shop_id, product_name, price, description, tags, visual_kind, like_count, comment_count, created_at) VALUES');
out.push(posts.map((p) => '(' + ["(SELECT id FROM shop WHERE slug = " + q(p.shop) + ')', q(p.productName), q(p.price), q(p.description), q(tags(p.description)), q(p.visualKind), q(p.likeCount), q(p.comments.length), "TIMESTAMPADD(MINUTE, -" + p.minutesAgo + ", CURRENT_TIMESTAMP(6))"].join(', ') + ')').join(',\n') + ';');
out.push('');
const comments = posts.flatMap((p) => p.comments.map((c, i) => ({ p, c, i })));
out.push('INSERT INTO post_comment (post_id, author_id, body, created_at) VALUES');
out.push(comments.map(({ p, c, i }) => {
  const shop = shops.find((s) => s.name === c.author);
  const author = shop ? shop.slug + '@demo.example' : email(c.author);
  const postRef = "(SELECT id FROM post WHERE product_name = " + q(p.productName) + ')';
  return '(' + [postRef, "(SELECT id FROM app_user WHERE email = " + q(author) + ')', q(c.body), "TIMESTAMPADD(MINUTE, -" + Math.max(1, p.minutesAgo - 5 * (i + 1)) + ", CURRENT_TIMESTAMP(6))"].join(', ') + ')';
}).join(',\n') + ';');
out.push('');
out.push('-- Le compte client@demo.example suit trois boutiques');
out.push('INSERT INTO follow (user_id, shop_id) VALUES');
out.push(['douceurs-oran', 'dar-caftan', 'cap-bon'].map((slug) => "((SELECT id FROM app_user WHERE email = 'client@demo.example'), (SELECT id FROM shop WHERE slug = " + q(slug) + '))').join(',\n') + ';');
out.push('');

fs.writeFileSync(path.join(__dirname, '../backend/src/main/resources/db/migration/V2__seed.sql'), out.join('\n'));
console.log('V2__seed.sql généré :', users.length, 'comptes,', shops.length, 'boutiques,', posts.length, 'publications,', comments.length, 'commentaires');
