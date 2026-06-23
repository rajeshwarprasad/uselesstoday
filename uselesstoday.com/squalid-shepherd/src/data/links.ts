// Single source of truth for every useless link on the site.
// Used by Directory (search/filter grid), Surprise-me, and the daily pick.

export type Category = "silly" | "relaxing" | "weird" | "games" | "art";

export interface UselessLink {
  title: string;
  url: string;
  category: Category;
  emoji: string;
  blurb: string;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "silly", label: "Silly" },
  { id: "relaxing", label: "Relaxing" },
  { id: "weird", label: "Weird" },
  { id: "games", label: "Games" },
  { id: "art", label: "Art" },
];

export const LINKS: UselessLink[] = [
  // ── Silly ──────────────────────────────────────────────
  { title: "Cat Bounce", url: "https://cat-bounce.com", category: "silly", emoji: "🐱", blurb: "Drag and fling a screen full of bouncing cats." },
  { title: "Hooooooooo", url: "https://hooooooooo.com", category: "silly", emoji: "🦉", blurb: "Scroll forever down an absurdly long owl." },
  { title: "Eel Slap", url: "https://eelslap.com", category: "silly", emoji: "🐟", blurb: "Slap a calm man with an eel. Repeatedly." },
  { title: "Is It Christmas?", url: "https://isitchristmas.com", category: "silly", emoji: "🎄", blurb: "A single, honest yes-or-no answer." },
  { title: "The Nicest Place", url: "https://thenicestplaceontheinter.net", category: "silly", emoji: "🤗", blurb: "An endless stream of internet hugs." },
  { title: "Long Doge Challenge", url: "https://longdogechallenge.com", category: "silly", emoji: "🐕", blurb: "How far can you scroll the doge?" },
  { title: "Pointer Pointer", url: "https://pointerpointer.com", category: "silly", emoji: "👉", blurb: "It finds a photo of someone pointing at your cursor." },
  { title: "Crouton Explorer", url: "https://crouton.net", category: "silly", emoji: "🍞", blurb: "A single crouton. That's the site." },

  // ── Relaxing ───────────────────────────────────────────
  { title: "Rainy Mood", url: "https://rainymood.com", category: "relaxing", emoji: "🌧️", blurb: "Rain sounds to melt the afternoon away." },
  { title: "A Soft Murmur", url: "https://asoftmurmur.com", category: "relaxing", emoji: "🎧", blurb: "Mix your own ambient soundscape." },
  { title: "Window Swap", url: "https://window-swap.com", category: "relaxing", emoji: "🪟", blurb: "Look out of a stranger's window somewhere on Earth." },
  { title: "The Quiet Place", url: "https://thequietplaceproject.com/thequietplace", category: "relaxing", emoji: "🧘", blurb: "A guided minute to just breathe." },
  { title: "Stars", url: "https://stars.chromeexperiments.com", category: "relaxing", emoji: "✨", blurb: "Drift through a 3D map of the galaxy." },
  { title: "Silk", url: "https://weavesilk.com", category: "relaxing", emoji: "🕸️", blurb: "Paint glowing symmetrical silk with your mouse." },
  { title: "Patatap", url: "https://patatap.com", category: "relaxing", emoji: "🔊", blurb: "Keys become color and sound. Oddly soothing." },

  // ── Weird ──────────────────────────────────────────────
  { title: "Zoomquilt", url: "https://zoomquilt.org", category: "weird", emoji: "🌀", blurb: "An infinitely zooming painting." },
  { title: "Staggering Beauty", url: "https://staggeringbeauty.com", category: "weird", emoji: "🪱", blurb: "Wiggle your mouse. Don't say we didn't warn you." },
  { title: "Koalas to the Max", url: "https://koalastothemax.com", category: "weird", emoji: "🐨", blurb: "Split dots until a koala appears." },
  { title: "This Is Sand", url: "https://thisissand.com", category: "weird", emoji: "🏖️", blurb: "Pour colored sand into hypnotic dunes." },
  { title: "Endless Horse", url: "https://endless.horse", category: "weird", emoji: "🐴", blurb: "A horse with an impossibly long body." },
  { title: "Hacker Typer", url: "https://hackertyper.net", category: "weird", emoji: "💻", blurb: "Mash keys, look like a movie hacker." },
  { title: "Trypophobia", url: "https://trypophobia.com", category: "weird", emoji: "🕳️", blurb: "Holes. Just lots of holes." },
  { title: "Corndog", url: "https://corndog.io", category: "weird", emoji: "🌭", blurb: "Fling a spinning corndog across space." },

  // ── Games ──────────────────────────────────────────────
  { title: "Neal.fun", url: "https://neal.fun", category: "games", emoji: "🧩", blurb: "A whole vault of clever little time-killers." },
  { title: "The Password Game", url: "https://neal.fun/password-game", category: "games", emoji: "🔐", blurb: "Make a password. Suffer the increasingly absurd rules." },
  { title: "Little Alchemy 2", url: "https://littlealchemy2.com", category: "games", emoji: "⚗️", blurb: "Combine elements to discover the whole world." },
  { title: "GeoGuessr Free", url: "https://openguessr.com", category: "games", emoji: "🗺️", blurb: "Dropped on a random street — guess where you are." },
  { title: "2048", url: "https://play2048.co", category: "games", emoji: "🔢", blurb: "Slide tiles, chase that 2048. Again. And again." },
  { title: "Gridland", url: "https://doublespeakgames.com/gridland", category: "games", emoji: "⚔️", blurb: "Match-3 by day, fend off monsters by night." },
  { title: "A Dark Room", url: "https://adarkroom.doublespeakgames.com", category: "games", emoji: "🔥", blurb: "A tiny text game that slowly becomes an epic." },
  { title: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker", category: "games", emoji: "🍪", blurb: "Click cookie. Buy grandma. Repeat for eternity." },

  // ── Art ────────────────────────────────────────────────
  { title: "Bomomo", url: "https://bomomo.com", category: "art", emoji: "🎨", blurb: "Paint with chaotic, generative brushes." },
  { title: "Sketch Machine", url: "https://lab.smashingmagazine.com/sketch-machine", category: "art", emoji: "✏️", blurb: "Doodle and watch it redraw itself." },
  { title: "Drawing Garden", url: "https://drawing.garden", category: "art", emoji: "🌷", blurb: "Drag to grow a garden of plants and sound." },
  { title: "Line Rider", url: "https://www.linerider.com", category: "art", emoji: "🛷", blurb: "Draw a track and let the sledder ride it." },
  { title: "Floating", url: "https://floating.io", category: "art", emoji: "🫧", blurb: "Calm generative shapes adrift on the screen." },
  { title: "Make 8-Bit Art", url: "https://make8bitart.com", category: "art", emoji: "👾", blurb: "Pixel-paint your own little 8-bit scene." },
  { title: "Radio Garden", url: "https://radio.garden", category: "art", emoji: "📻", blurb: "Spin the globe, tune into any live radio station." },
];
