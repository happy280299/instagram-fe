// Deterministic mock-data generator. Run: pnpm mocks:generate
// Output: src/mocks/*.json. Timestamps are relative to ANCHOR and get shifted
// to "now" at runtime by src/lib/data.ts so the feed always feels fresh.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "mocks");
const ANCHOR = Date.parse("2026-01-01T12:00:00.000Z");

let seed = 20260101;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => rand() - 0.5).slice(0, n);
const minutesAgo = (m) => new Date(ANCHOR - m * 60_000).toISOString();
const pic = (s, w, h) => `https://picsum.photos/seed/${s}/${w}/${h}`;

const FIRST = ["Alex", "Maya", "Liam", "Sofia", "Noah", "Ava", "Ethan", "Zoe", "Lucas", "Mia", "Leo", "Nora", "Kai", "Iris", "Owen", "Luna", "Ezra", "Hana", "Milo", "Aria", "Theo", "Jade", "Felix", "Ruby", "Jonah", "Elle", "Arlo", "Vera", "Remy", "Cleo"];
const LAST = ["Morgan", "Chen", "Patel", "Rossi", "Kim", "Silva", "Nguyen", "Okafor", "Berg", "Lopez", "Haddad", "Novak", "Tanaka", "Dubois", "Walsh", "Moreau", "Ivanova", "Costa", "Reyes", "Sato", "Larsen", "Khan", "Fischer", "Murphy", "Ali", "Rivera", "Jensen", "Park", "Hughes", "Bauer"];
const BIOS = ["Chasing light 📷", "Coffee, code & mountains ⛰️", "Plant parent 🌿 | Brooklyn", "Designer by day, baker by night 🍞", "Travel • Food • Film", "Making things with my hands", "Sunsets collector 🌅", "Runner. Reader. Dreamer.", "Street photography · 35mm", "Here for the dogs 🐶"];
const TAGS = ["travel", "photography", "sunset", "foodie", "nature", "citylife", "weekend", "coffee", "art", "design", "goodvibes", "mountains", "beach", "streetphoto", "minimal"];
const CAPTIONS = ["Golden hour never disappoints", "Weekend mode: on", "Found a little corner of calm today", "Can't stop thinking about this view", "New favorite spot in town", "Some days are just better than others", "Throwback to this perfect afternoon", "Small moments, big feelings", "Exploring the unknown", "This light though…", "Grateful for slow mornings", "Pages from my sketchbook"];
const COMMENTS = ["Wow 😍", "This is stunning!", "Need to go here asap", "🔥🔥🔥", "Love the colors", "Incredible shot", "Where is this?", "Goals!!", "So beautiful 🙌", "Obsessed with this", "The vibes ✨", "Take me with you next time", "Frame-worthy", "Haha love it", "👏👏"];
const MESSAGES = ["Hey! How are you?", "Did you see that post?", "Haha yes 😂", "Let's catch up this weekend", "Sounds good!", "Sending you the pics now", "That place was amazing", "Can't wait 🙌", "On my way", "Thanks so much!", "What time works for you?", "See you there 👋", "Love this 😍", "lol same"];
const LOCATIONS = ["Lisbon, Portugal", "Kyoto, Japan", "Brooklyn, New York", "Reykjavík, Iceland", "Cape Town", "Paris, France", "Banff National Park", "Seoul, South Korea", "Mexico City", "Amalfi Coast"];
const AUDIO = ["Original audio", "Lo-fi Beats · Chill Hop", "Summer Nights · Indie Mix", "Acoustic Morning", "Synthwave Drive"];
// Short, freely hosted sample clips (verified reachable; all H.264 MP4).
const VIDEOS = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://download.samplelib.com/mp4/sample-5s.mp4",
  "https://download.samplelib.com/mp4/sample-10s.mp4",
];
const RATIOS = [[1080, 1080], [1080, 1350], [1080, 566]];

// Users
const users = FIRST.map((first, i) => {
  const n = i + 1;
  const last = LAST[i];
  const username = i === 0 ? "alex.morgan" : `${first.toLowerCase()}${pick([".", "_", ""])}${last.toLowerCase()}${rand() > 0.6 ? int(1, 99) : ""}`;
  return {
    id: `u${n}`,
    username,
    fullName: `${first} ${last}`,
    avatar: `https://i.pravatar.cc/300?img=${n + 3}`,
    bio: pick(BIOS),
    website: rand() > 0.6 ? `${username.replace(/[._]/g, "")}.example.com` : null,
    isVerified: rand() > 0.8,
    followers: int(120, 98000),
    following: int(80, 1500),
    postsCount: 0,
    highlights: Array.from({ length: int(0, 5) }, (_, h) => ({
      id: `h${n}_${h}`,
      title: pick(["Travel", "Food", "Friends", "2025", "Pets", "Work", "Summer"]),
      cover: pic(`hl${n}${h}`, 200, 200),
    })),
  };
});
const ids = users.map((u) => u.id);
const others = ids.slice(1);
const follows = Object.fromEntries(ids.map((id) => [id, sample(ids.filter((x) => x !== id), int(6, 14))]));
follows.u1 = others.slice(0, 16);

// Posts
const caption = () => {
  const mention = rand() > 0.6 ? ` with @${pick(users).username}` : "";
  const tags = sample(TAGS, int(1, 3)).map((t) => `#${t}`).join(" ");
  const long = rand() > 0.7 ? " Honestly one of the best days I've had in a long while — the kind of day where everything lines up, the weather cooperates and the people around you make it unforgettable." : "";
  return `${pick(CAPTIONS)}${mention}.${long} ${tags}`;
};
const posts = Array.from({ length: 80 }, (_, i) => {
  const n = i + 1;
  const authorId = i < 6 ? "u1" : pick(others);
  const [w, h] = pick(RATIOS);
  const count = rand() > 0.7 ? int(2, 4) : 1;
  return {
    id: `p${n}`,
    authorId,
    media: Array.from({ length: count }, (_, m) => ({ id: `p${n}m${m}`, url: pic(`post${n}-${m}`, w, h), width: w, height: h, alt: `Photo ${m + 1} by ${users.find((u) => u.id === authorId).username}` })),
    caption: caption(),
    location: rand() > 0.5 ? pick(LOCATIONS) : null,
    likes: int(3, 25000),
    commentsCount: 0,
    taggedUserIds: rand() > 0.6 ? sample(ids.filter((x) => x !== authorId), int(1, 2)) : [],
    createdAt: minutesAgo(i * int(60, 400) + int(5, 50)),
  };
});
for (const u of users) u.postsCount = posts.filter((p) => p.authorId === u.id).length;

// Comments
const comments = [];
for (const p of posts) {
  const n = int(0, 12);
  for (let c = 0; c < n; c++) {
    const parent = c > 2 && rand() > 0.75 ? comments[comments.length - int(1, Math.min(c, 3))] : null;
    comments.push({ id: `c${comments.length + 1}`, postId: p.id, authorId: pick(ids), parentId: parent && parent.postId === p.id && !parent.parentId ? parent.id : null, text: pick(COMMENTS), likes: int(0, 300), createdAt: minutesAgo(int(1, 3000)) });
  }
  p.commentsCount = comments.filter((c) => c.postId === p.id).length;
}

// Stories, reels, conversations, notifications
const stories = others.slice(0, 15).map((userId, i) => ({ id: `s${i + 1}`, userId, slides: Array.from({ length: int(1, 4) }, (_, s) => ({ id: `s${i + 1}_${s}`, url: pic(`story${i}-${s}`, 720, 1280), createdAt: minutesAgo(int(10, 1300)) })) }));
const reels = Array.from({ length: 20 }, (_, i) => ({ id: `r${i + 1}`, authorId: pick(ids), videoUrl: VIDEOS[i % VIDEOS.length], poster: pic(`reel${i}`, 540, 960), caption: caption(), audio: pick(AUDIO), likes: int(100, 90000), commentsCount: int(0, 900), createdAt: minutesAgo(int(30, 20000)) }));
const conversations = others.slice(0, 10).map((other, i) => {
  const count = int(5, 15);
  let t = int(20, 4000) + count * 7;
  return { id: `t${i + 1}`, participantIds: ["u1", other], messages: Array.from({ length: count }, (_, m) => ({ id: `t${i + 1}_${m}`, conversationId: `t${i + 1}`, senderId: rand() > 0.5 ? "u1" : other, text: pick(MESSAGES), createdAt: minutesAgo((t -= int(1, 7))) })) };
});
const myPosts = posts.filter((p) => p.authorId === "u1");
const notifications = Array.from({ length: 40 }, (_, i) => {
  const type = pick(["like", "like", "comment", "follow", "mention"]);
  const post = type === "follow" ? null : pick(myPosts);
  return { id: `n${i + 1}`, type, actorId: pick(others), postId: post ? post.id : null, text: type === "comment" || type === "mention" ? pick(COMMENTS) : null, read: i > 6, createdAt: minutesAgo(i * int(30, 300) + 3) };
});

mkdirSync(OUT, { recursive: true });
const files = { users, follows, posts, comments, stories, reels, conversations, notifications, meta: { anchor: new Date(ANCHOR).toISOString(), currentUserId: "u1" } };
for (const [name, data] of Object.entries(files)) writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${Object.keys(files).length} files to ${OUT} (${posts.length} posts, ${comments.length} comments)`);
