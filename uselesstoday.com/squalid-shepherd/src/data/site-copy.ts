// Unique, per-site editorial copy for the /sites/[slug]/ pages.
// Keyed by the canonical slug from links.ts so templates stay generic.
// Written by hand: no two entries share sentences, so the pages are not
// near-duplicates of each other.

export interface SiteCopy {
  /** 2-3 sentences about what the site actually is and does. */
  detail: string;
  /** Concrete, accurate ways to use it. */
  tips: string[];
  /** One line on why it earned a place on the wall. */
  note: string;
}

export const SITE_COPY: Record<string, SiteCopy> = {
  "cat-bounce": {
    detail:
      "A physics playground with a screen full of cats and no objective whatsoever. You grab a cat, drag it back, and let go; it tumbles, bounces off the walls, and knocks its friends around. Every fling behaves a little differently, which is the entire point.",
    tips: [
      "Drag a cat backwards like a slingshot, then release to fling it.",
      "Fling one cat into a crowd to start a chain reaction.",
      "Works with a finger on phones and tablets too.",
    ],
    note: "No score, no timer, no ending — just cats and gravity.",
  },
  hooooooooo: {
    detail:
      "One owl, stretched far beyond any reasonable length. Scrolling takes you further along it, and further, and further, long after the joke should have stopped being funny. The commitment to the bit is the joke.",
    tips: [
      "Scroll slowly and watch how far the owl actually goes.",
      "Use the scrollbar to jump ahead if you get impatient.",
      "Open it fullscreen for the full effect.",
    ],
    note: "A single-image gag that has outlived most startups.",
  },
  "eel-slap": {
    detail:
      "A calm, unsuspecting man sits on a beach while an eel dangles nearby. You drag the eel, swing it, and slap him with it. The wet thwack and his reaction do the rest.",
    tips: [
      "Grab the eel and drag it in a wide arc for more force.",
      "Turn your sound on; the slap is most of the joke.",
      "Try a slow approach for maximum anticipation.",
    ],
    note: "One man, one eel, one sound effect. Perfectly complete.",
  },
  "is-it-christmas": {
    detail:
      "The whole site is a single word: yes or no. There is no countdown, no tinsel, and no explanation. It answers the only question it was built to answer, in the plainest way possible.",
    tips: [
      "Bookmark it and check once a year.",
      "Try it on December 24 if you enjoy tension.",
      "No JavaScript trickery; the answer is just text.",
    ],
    note: "The purest possible answer to the purest possible question.",
  },
  "the-nicest-place": {
    detail:
      "A slow, warm stream of kind messages and small comforts from strangers. Nothing asks anything of you, there is nothing to click through, and the page just keeps being gentle.",
    tips: [
      "Leave it open in a background tab for a while.",
      "Adjust your volume before you start.",
      "Share it with someone having a rough week.",
    ],
    note: "The internet occasionally remembers to be nice.",
  },
  "long-doge-challenge": {
    detail:
      "A doge of impossible proportions. The challenge is implied rather than stated: keep scrolling and see how long the joke can possibly last. Your wrist will give up before the doge does.",
    tips: [
      "Scroll with the wheel rather than dragging the scrollbar.",
      "Watch the scrollbar thumb to gauge how long it is.",
      "Give up early; there is no prize.",
    ],
    note: "Proof that one stretched image can be a whole website.",
  },
  "pointer-pointer": {
    detail:
      "Move your cursor anywhere on the page and the site finds a photograph of a real person pointing directly at it. Move again, and a different stranger points there instead. It is oddly unsettling and oddly charming.",
    tips: [
      "Move the cursor slowly along the edges of the screen.",
      "Try each corner; the photos get more dramatic.",
      "Resize the window and the pointing adjusts.",
    ],
    note: "A database of pointing humans, put to the least useful use possible.",
  },
  "crouton-explorer": {
    detail:
      "One crouton. That is the site. There is no navigation, no menu, and no deeper meaning; a single piece of toasted bread floating in the void, presented without comment.",
    tips: [
      "Open it on a big screen to appreciate the detail.",
      "Refresh for no reason at all.",
      "Do not look for a hidden game; there isn't one.",
    ],
    note: "Minimalism taken to its logical, ridiculous end.",
  },
  "rainy-mood": {
    detail:
      "Rain, thunder, and nothing else. The site loops weather sounds over a dark scene, with a volume slider and a thunder toggle if you want the storm turned up. Countless people work, read, or fall asleep to it.",
    tips: [
      "Use headphones; the loop is mixed for them.",
      "Enable thunder for a fuller storm.",
      "Drop the volume low and leave it running while you work.",
    ],
    note: "The rare useless site that accidentally became genuinely useful.",
  },
  "a-soft-murmur": {
    detail:
      "A mixing desk for ambience. Sliders control rain, thunder, waves, wind, birds, a crackling fire, a coffee shop, and more, so you can build the background noise you actually want.",
    tips: [
      "Start with two or three sounds, then layer slowly.",
      "Save a mix as a preset for later.",
      "Coffee shop plus rain is the classic combination.",
    ],
    note: "Useless in theory, indispensable in practice.",
  },
  "window-swap": {
    detail:
      "Look out of someone else's window, somewhere else on Earth. People upload short clips of their view; you get a window, a location, and a few quiet seconds of a life you will never live.",
    tips: [
      "Click through a few windows to find a good view.",
      "Upload your own window if you want to return the favour.",
      "Use fullscreen for the best effect.",
    ],
    note: "The closest thing the web has to people-watching from a train.",
  },
  "the-quiet-place": {
    detail:
      "A guided breathing pause. The screen dims, a circle expands and contracts, and a calm voice walks you through one minute of doing nothing at all.",
    tips: [
      "Wear headphones and follow the pacing.",
      "Dim your screen before you start.",
      "Run it twice if one minute is not enough.",
    ],
    note: "Sixty seconds of deliberate uselessness, which is the point.",
  },
  stars: {
    detail:
      "A 3D map of the galaxy built as a browser experiment. Drag to orbit, zoom in, and drift through a cloud of stars that represents real astronomical data rather than decoration.",
    tips: [
      "Drag slowly to orbit the camera.",
      "Scroll to zoom into the star field.",
      "Try it on a desktop with a decent graphics card.",
    ],
    note: "Beautiful, scientific, and completely unnecessary.",
  },
  silk: {
    detail:
      "Drag your mouse and glowing lines bloom across the screen in mirror symmetry. There is no brush and no colour picker; just light that follows your hand and reflects itself across the middle.",
    tips: [
      "Move slowly for smooth curves, quickly for sharp spikes.",
      "Try dragging in circles for flower shapes.",
      "Use the on-screen controls to clear and start again.",
    ],
    note: "Generative art that makes anyone look talented.",
  },
  patatap: {
    detail:
      "Every key on your keyboard triggers a shape and a sound. Letters make colourful geometry, arrows add bass, and mashing both hands turns your keyboard into a tiny audiovisual instrument.",
    tips: [
      "Use headphones; the sounds are half the point.",
      "Play with two hands for rhythm and colour.",
      "Try the arrow keys as well as letters.",
    ],
    note: "A musical instrument with no wrong notes.",
  },
  zoomquilt: {
    detail:
      "A painting that zooms into itself, forever. Each frame reveals another layer of the same surreal scene, and the loop is seamless enough that you lose track of where it began.",
    tips: [
      "Give it a few seconds to settle into the rhythm.",
      "Go fullscreen and turn off the lights.",
      "Watch for the moments where one scene becomes another.",
    ],
    note: "An infinite painting, rendered in a browser tab.",
  },
  "staggering-beauty": {
    detail:
      "A small, fuzzy creature sits on a black background. Wiggle your mouse and it starts to move. Then the screen begins flashing, hard. It is a jump-scare disguised as a pet.",
    tips: [
      "Move the mouse gently first; the reaction scales up.",
      "Skip this one entirely if you are photosensitive.",
      "Keep the volume at a sensible level.",
    ],
    note: "Famous precisely because nobody expects it.",
  },
  "koalas-to-the-max": {
    detail:
      "Start with one small dot. Hover over it and it splits into four more; keep going and the dots multiply until a koala photograph assembles itself out of the fragments.",
    tips: [
      "Hover slowly so the splits register.",
      "Work from the centre outwards.",
      "Reset the page if you want to start again.",
    ],
    note: "A mosaic you build by accident.",
  },
  "this-is-sand": {
    detail:
      "Pour coloured sand onto a dark canvas and watch it pile into dunes. Gravity does most of the work; you choose the colour and where it falls. The result is closer to a zen garden than a game.",
    tips: [
      "Change colour often for layered dunes.",
      "Hold the mouse still to build a tall column.",
      "Use fullscreen for a bigger canvas.",
    ],
    note: "Digital sand, real patience.",
  },
  "endless-horse": {
    detail:
      "A horse whose body keeps going. Scroll down and the legs keep coming, far past the point where a horse should have ended. The joke is structural rather than verbal.",
    tips: [
      "Scroll with the wheel for the full effect.",
      "Check the scrollbar to see how far it goes.",
      "Stop whenever you like; the horse will wait.",
    ],
    note: "One absurd idea, executed with total commitment.",
  },
  "hacker-typer": {
    detail:
      "Type anything and green code streams across the screen as if you are breaking into something important. The code is fake, the urgency is fake, and the feeling of competence is entirely fake too.",
    tips: [
      "Type fast and randomly for the best effect.",
      "Press Alt three times for the classic 'access granted' moment.",
      "Use fullscreen and a dark room for the full hacker look.",
    ],
    note: "Movie hacking, without the movie.",
  },
  trypophobia: {
    detail:
      "Holes. Just lots of holes, arranged in patterns that get progressively more uncomfortable. The site is a straightforward trigger, presented with no explanation and no mercy.",
    tips: [
      "Skip it if clustered holes bother you.",
      "Start with the sound off and see how you feel.",
      "Close the tab the moment it stops being fun.",
    ],
    note: "The least relaxing site on a wall built for wasting time.",
  },
  corndog: {
    detail:
      "A corndog, a physics engine, and open space. Fling it around, bounce it off the walls, and watch it tumble. There is no target and no score; the corndog simply refuses to stay still.",
    tips: [
      "Drag and release to launch it.",
      "Aim for the corners for chaotic bounces.",
      "Try it on a touchscreen for a different feel.",
    ],
    note: "The entire joke is that it exists.",
  },
  "neal-fun": {
    detail:
      "Neal Agarwal's collection of small, clever interactive toys: a size comparison of everything, a deep-sea scroll, drawing tools, and dozens more. Each one is a complete idea rather than a demo.",
    tips: [
      "Start with The Size of Space, then work through the list.",
      "Set aside twenty minutes; the rabbit hole is deep.",
      "Bookmark your favourites; they are worth returning to.",
    ],
    note: "The gold standard for pointless things done extremely well.",
  },
  "the-password-game": {
    detail:
      "You are asked to choose a password. Then a rule appears. Then another, and another, each more absurd than the last, until your password must contain a chess move, a moon phase, and a live captcha.",
    tips: [
      "Keep your password somewhere you can copy from.",
      "Read each new rule carefully; they stack.",
      "Expect to restart at least twice.",
    ],
    note: "A puzzle that turns a boring form into a comedy.",
  },
  "little-alchemy-2": {
    detail:
      "Start with four basic elements and combine them to discover everything else. Water plus earth makes mud; mud plus fire makes brick; and hundreds of combinations later you are building cities and life itself.",
    tips: [
      "Combine everything with everything; duplicates are fine.",
      "Water, fire, wind, and earth are your starting set.",
      "Use the search box to find what you have already made.",
    ],
    note: "The most productive way to waste an afternoon here.",
  },
  "geoguessr-free": {
    detail:
      "You are dropped into a random street view somewhere on Earth and have to work out where you are. Look for road signs, number plates, vegetation, and architecture, then place your guess on the map.",
    tips: [
      "Check the sun direction to work out the hemisphere.",
      "Read any road signs before you move.",
      "Start with the continent; precision comes later.",
    ],
    note: "Geography revision disguised as a game.",
  },
  "2048": {
    detail:
      "Slide numbered tiles around a grid; matching numbers merge and double. The goal is a single 2048 tile, which sounds simple until the board fills up and every move becomes a compromise.",
    tips: [
      "Keep your biggest tile in one corner and leave it there.",
      "Build rows in one direction instead of switching sides.",
      "Plan two moves ahead once the board gets tight.",
    ],
    note: "The most quietly addictive thing on the wall.",
  },
  gridland: {
    detail:
      "A match-three puzzle by day and a base-building survival game by night. Swap tiles to gather wood and stone, then spend the dark hours fortifying against whatever is coming.",
    tips: [
      "Collect as many resources as you can before night falls.",
      "Build walls before you build anything comfortable.",
      "Match near the edges to keep the board flexible.",
    ],
    note: "Two genres stitched together better than they have any right to be.",
  },
  "a-dark-room": {
    detail:
      "It begins with a single button: light a fire. Then a stranger arrives, then a village, then a world. The whole game is text and numbers, and it quietly turns into something much bigger.",
    tips: [
      "Keep the fire going before you explore.",
      "Hire workers as soon as you can afford them.",
      "Save often; the game gets unforgiving later.",
    ],
    note: "Proof that a text screen can be more immersive than graphics.",
  },
  "cookie-clicker": {
    detail:
      "Click a cookie. Buy a cursor. Buy a grandma. Buy a factory that makes cookies out of other cookies. The numbers grow absurd, then scientific, then cosmic, and you keep clicking anyway.",
    tips: [
      "Buy the cheapest upgrade that increases production per second.",
      "Golden cookies appear at random; click them fast.",
      "Let it run in a background tab while you do something else.",
    ],
    note: "The idle game that defined an entire genre.",
  },
  bomomo: {
    detail:
      "A canvas with a set of strange, orbiting brushes. Each one behaves differently: some draw spirals, some scatter particles, some paint in soft ribbons. You click, drag, and the shapes do the rest.",
    tips: [
      "Try each brush in the left-hand column.",
      "Hold and drag slowly to build layered patterns.",
      "Clear and start again whenever it gets crowded.",
    ],
    note: "Abstract art with no talent required.",
  },
  "sketch-machine": {
    detail:
      "You draw a rough sketch and the site redraws it in a different visual style: lines, dots, gradients, and other treatments. Your wobbly sketch suddenly looks deliberate.",
    tips: [
      "Draw simple, bold shapes rather than fine detail.",
      "Cycle through the styles with the arrow buttons.",
      "Try a face or an animal; the results are funnier.",
    ],
    note: "A drawing tool that flatters every scribble.",
  },
  "drawing-garden": {
    detail:
      "Drag across the screen and plants grow where your cursor goes, each one with its own sound. Keep drawing and the garden fills with stems, leaves, and quiet chimes.",
    tips: [
      "Drag slowly to grow a plant to full height.",
      "Spread out for a varied garden.",
      "Use headphones to hear each plant's note.",
    ],
    note: "A garden that needs no watering.",
  },
  "line-rider": {
    detail:
      "Draw a track, then release a tiny sledder onto it. Physics takes over: loops, jumps, and cliffs all behave exactly as badly as you would expect. Half the fun is watching your creation fail.",
    tips: [
      "Start with gentle slopes before attempting loops.",
      "Press play, then draw more track mid-run.",
      "Save your track to share it with someone.",
    ],
    note: "A physics toy that has been quietly brilliant for years.",
  },
  floating: {
    detail:
      "Soft, generative shapes drift across the screen, reacting to your cursor. There is nothing to win and nothing to complete; the page is a slow-moving composition that never repeats.",
    tips: [
      "Move the cursor slowly and let the shapes respond.",
      "Go fullscreen and leave it running.",
      "Reload for a different composition.",
    ],
    note: "The visual equivalent of leaving the radio on.",
  },
  "make-8-bit-art": {
    detail:
      "A pixel grid, a palette, and a set of drawing tools. Paint a tiny scene one square at a time, zoom in to fix the details, and export it when you are happy with your eight-bit masterpiece.",
    tips: [
      "Work zoomed in, then check it at actual size.",
      "Limit yourself to a handful of colours.",
      "Use the fill tool for large areas.",
    ],
    note: "Nostalgia with a grid attached.",
  },
  "radio-garden": {
    detail:
      "A globe covered in green dots, each one a live radio station. Spin to a country, click a dot, and you are listening to whatever that city is broadcasting right now.",
    tips: [
      "Zoom into a region before clicking a dot.",
      "Try a country you have never visited.",
      "Some stations are music, some are talk; keep clicking.",
    ],
    note: "A world tour with no passport and no schedule.",
  },
};
