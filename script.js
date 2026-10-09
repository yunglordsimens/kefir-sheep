/* flock — a search engine that slowly sinks. */
(() => {
'use strict';
const root = document.documentElement;
const app = document.getElementById('app');
const overlay = document.getElementById('overlay');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ASSET = { photo:'assets/my-photo.jpeg', shot:'assets/google-screenshot.jpeg' };

/* ======================= icons ======================= */
const I = {
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
  bag:'<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  user:'<svg viewBox="0 0 24 24" style="stroke:currentColor"><circle cx="12" cy="9" r="3.5"/><path d="M5.5 19a7 7 0 0 1 13 0"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 16.8 20H7"/></svg>',
  down:'<svg viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 7.2 4H17"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  spark:'<svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z"/></svg>',
  kebab:'<svg class="kebab" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>'
};
const SHEEP_SVG = `<svg class="sheep" viewBox="0 0 64 54" aria-hidden="true">
  <line class="leg" x1="22" y1="40" x2="22" y2="50"/><line class="leg" x1="44" y1="40" x2="44" y2="50"/>
  <g class="wool"><circle cx="24" cy="24" r="11"/><circle cx="36" cy="18" r="12"/><circle cx="48" cy="25" r="11"/><circle cx="40" cy="33" r="11"/><circle cx="27" cy="34" r="10"/></g>
  <g><ellipse class="face" cx="13" cy="25" rx="9" ry="10"/>
    <circle class="eye" cx="10" cy="23" r="2"/><circle class="eye" cx="16.5" cy="23" r="2"/><circle class="eye eye3" cx="13.2" cy="17.5" r="1.6"/>
    <ellipse class="cheek" cx="8" cy="29" rx="2.4" ry="1.4"/><ellipse class="cheek" cx="18" cy="29" rx="2.4" ry="1.4"/></g></svg>`;

/* ======================= state ======================= */
const S = {
  stage:0, loop:0,
  paaDeepest:-1, paaShown:4, paaOpen:new Set(), paaHTML:{}, paaRendered:0,
  visits:new Set(), seen:new Set(),
  query:'', queryDefault:true, moreShown:0, chip:null,
  cart:0, lastShakeAt:null, subscribed:false,
  cur:{type:'serp', tab:'all'}, stack:[],
  history:[], blog:[], forum:{}, forumLocked:{}, ovMore:false, ovVote:0
};
const PAA_STAGES = [0,6,11,16,22];
const DEPTH_STAGES = [0,8,14,20,27];
const stageOfIndex = i => { let s=0; PAA_STAGES.forEach((t,k)=>{ if(i>=t) s=k; }); return s; };
function computeStage(){
  const d = (S.paaDeepest+1) + S.visits.size;
  let s=0; DEPTH_STAGES.forEach((t,k)=>{ if(d>=t) s=k; });
  return Math.max(s, stageOfIndex(S.paaDeepest));
}
function visit(key){
  S.seen.add(key);
  if(S.visits.has(key)) return;
  S.visits.add(key);
  refreshStage();
}
function refreshStage(){
  const s = computeStage();
  if(s !== S.stage){
    S.stage = s;
    applyStage();
    if(S.cur.type === 'serp') render({keepScroll:true});
  }
  updateStatus();
}

/* ======================= content ======================= */
const DEFAULT_Q = ['how to make kefir at home','how to make kefir at home','how to make kefir at home without a sheep','how to make kefir from','how to go back'];
const LOOP_Q = 'how to make kefir from a sheep';
const defaultQuery = () => (S.loop && S.stage < 2) ? LOOP_Q : DEFAULT_Q[S.stage];

const TAB_IDS = ['all','images','shopping','videos','news','forums'];
const TAB_LABELS = [
  ['All','Images','Shopping','Videos','News','Forums'],
  ['All','Images','Shopping','Videos','News','Forums'],
  ['All','Images','Shopping','Videos','Legends','Forums'],
  ['All','Images','Inside','Videos','Missing','Forums'],
  ['inside','inside','inside','inside','inside','inside']
];
const CHIPS = [
  ['Recipe','Buy','Online','Price','Reviews','Sheep','Dog'],
  ['Recipe','Buy','Legend','Price','Reviews','Sheep','Dog'],
  ['Recipe','Bag','Legend','Smell','Reviews','Sheep','Wall'],
  ['Bag','Opening','Archive','1908','Exit','Sheep','Inside'],
  ['bag','bag','bag','bag','bag','bag','bag']
];
const META = ['About 1,480,000 results (0.38 seconds)','About 1,480,000 results (0.38 seconds)','About 48 results (48 hours)','1 result. It found you.','results: you'];
const RELATED = [
  ['kefir grains where to buy','kefir vs yogurt','how many sheep for kefir','kefir smell normal','kefir grain names','goatskin bag kefir'],
  ['kefir grains legend','goatskin bag kefir','shake the bag every hour','why do sheep face the wall','kefir smells like sheep','first kefir grains origin'],
  ['why does my house smell like sheep','can kefir see','how to open a sheep gently','is the bag supposed to be warm','bathroom tiles cold','who is asking these questions'],
  ['the bag is shaking by itself','how many were there','how do i get out','what is inside the bottle','1908','people also ask'],
  ['how to go back','how to go back','how to go back','how to go back','how to go back','shake the bag']
];
const SUGG = [
  ['how to make kefir at home','how to make kefir grains','how many sheep to make kefir','kefir grains where to buy','kefir vs yogurt','kefir smell','is kefir good for you','kefir grain names','goatskin bag','kefir for dogs'],
  ['kefir grains legend','where did the first kefir grains come from','shake the bag every hour','why do sheep face the wall'],
  ['why does my house smell like sheep','can kefir see','how to open a sheep gently','is the bag supposed to be warm'],
  ['the bag is shaking by itself','how many were there','how do i get out','who is asking these questions'],
  ['shake the bag']
];

/* results: one entry per website */
const RES = {
  wiki:{fav:'🥛',site:'Milk Wiki',url:'https://milkwiki.org › wiki › Kefir',go:'wiki',links:['Production','History','Legend'],
    title:s=>s>=3?'Kefir - what came before':'Kefir - Milk Wiki',
    date:s=>s>=3?'01 Jan 1908':'12 Oct 2015',
    text:s=>[
      'Kefir is a fermented milk drink made with kefir grains. The grains live in milk, grow and divide, so they can be passed from one household to the next.',
      'Kefir is a fermented milk drink made with kefir grains. The grains are passed from one household to the next. Their original source is unclear.',
      'Kefir is made with grains. The grains are passed on. The first grains were made from something else. [citation needed]',
      'Kefir is what remains. This article is being watched by 1 user.',
      'it is watching the article. the article is watching you.'][s]},
  guide:{fav:'🐑',site:'Sheep Corner',url:'https://sheepcorner.com › kefir',go:'guide',
    title:s=>s>=2?"Kefir at home: don't leave it alone":"Kefir at home: a beginner's guide",
    date:()=>'3 Mar 2019',
    text:s=>s>=3?'It knows when you leave. It knows when you come back. It knows what you came back for.':s>=2?'Fresh milk, a clean jar and a healthy grain. Keep it warm. Keep it company. Do not thank the sheep.':'Everything you need to start: fresh milk, a clean jar and a healthy grain. Keep it warm and never leave it alone for too long.'},
  blog:{fav:'🫙',site:'kefir mama',url:'https://kefirmama.blog › bobby',go:'blog',
    title:s=>s>=3?'Bobby: year 118':'My grain Bobby: one year together 💛',
    date:()=>'14 Feb 2024',
    text:s=>s>=2?'He is heavier now. He likes it when I read your comments to him. 1,372 comments.':'A whole year with my little kefir grain! Here is what I learned about feeding, resting and naming your grain. 1,371 comments.'},
  t4471:{fav:'🧀',site:'cheesetalk.org',url:'https://cheesetalk.org › thread › 4471',go:'thread:4471',
    title:()=>'Kefir grains - what they are and where they came from',
    date:()=>'31 Jan 2016',
    text:s=>s>=2?'48 posts · The thread was locked after the last post. The last post has no author.':'48 posts · "There\'s an old story from the mountains. I won\'t repeat all of it here. Short version: a sheep, a goatskin bag and 48 hours of shaking."'},
  t812:{fav:'🧀',site:'Home Cultures',url:'https://homecultures.forum › thread › 812',go:'thread:812',
    title:()=>'Kefir smells like sheep??',
    date:()=>'9 Aug 2021',
    text:s=>s>=1?'"I opened the window. The smell is stronger outside."':'"My kefir smells kind of… woolly? Is that normal?" · 12 replies'},
  farm:{fav:'🌾',site:'Farm Handbook',url:'https://farmhandbook.org › sheep › behavior',go:'farm',
    title:()=>"Sheep behavior: a farmer's handbook",
    date:()=>'2 Jun 2020',
    text:s=>s>=2?'Standing still facing a wall is normal in hot weather. If they turn around, do not make eye contact.':'Grazing, flocking, resting in shade and standing facing a wall are all normal behaviors. Here is what each one means.'},
  archive:{fav:'📄',site:'archive.flock',url:'archive.flock › scan_0012',go:'archive',min:1,
    title:()=>'Recipe book, page 12 (handwritten, 1908)',
    date:()=>'01 Jan 1908',
    text:()=>'Scanned page from a handwritten household recipe book. Partially illegible. A drawing of a bag appears at the bottom of the page.'},
  onion:{fav:'?',site:'index of /bag/',url:'http://xq7mh2kd.onion › bag',go:'onion',min:2,
    title:()=>'index of /bag/',
    date:()=>'—',
    text:()=>'bag_0001.jpg bag_0002.jpg bag_0003.jpg … bag_0048.jpg notes.txt you.jpg'}
};
const TOPIC_RESULTS = {
  kefir:['wiki','guide','blog','t4471','t812','farm','archive','onion'],
  grain:['blog','t4471','wiki','guide','t812','archive','onion'],
  sheep:['farm','guide','t4471','wiki','t812','archive','onion'],
  legend:['t4471','archive','wiki','blog','onion','farm'],
  bag:['t4471','blog','archive','onion','guide','wiki'],
  exit:['blog','onion','t4471','archive','wiki','guide'],
  other:['wiki','guide','blog','t4471','t812','farm','archive','onion']
};
function topicOf(q){
  q = q.toLowerCase();
  if(/(get out|exit|leave|escape|go back|stop|help|close|wake)/.test(q)) return 'exit';
  if(/(bag|goat|skin|shake|shaking)/.test(q)) return 'bag';
  if(/(legend|origin|first|history|come from|1908|archive)/.test(q)) return 'legend';
  if(/(sheep|lamb|flock|wool|intestin|slaughter|open|wall|smell)/.test(q)) return 'sheep';
  if(/(grain|culture|starter|bobby)/.test(q)) return 'grain';
  if(/(kefir|milk|ferment|yog|drink|bottle|dog|recipe|review|price|buy)/.test(q)) return 'kefir';
  return 'other';
}
const OVERVIEW = {
  kefir:[
    ['<b>Kefir</b> is a fermented milk drink made with kefir grains, a living culture of bacteria and yeast. To make it at home, add grains to fresh milk, cover the jar and leave it at room temperature for about 24 hours.','Strain the grains out and put them into fresh milk to start the next batch. With good care, grains keep growing and can be shared with friends.'],
    ['<b>Kefir</b> is a fermented milk drink made with kefir grains, a living culture of bacteria and yeast. Grains are passed down from household to household.','Their original source is unclear. One legend involves a sheep and a goatskin bag. Most sources treat this as folklore.'],
    ['<b>Kefir</b> is made with grains. The grains were made with something else. Sources disagree on what.','Some sources have been removed. The remaining sources agree on one thing: shake the bag every hour.'],
    ['There is no overview for this. Please stop.','Please stop.'],
    ['please stop please stop please stop','please']
  ],
  grain:[
    ['<b>Kefir grains</b> are small, white, cauliflower-like clusters of bacteria and yeast held together by milk proteins and sugars. They are alive and grow as they ferment milk.','Keep them in fresh milk, change the milk daily, and never let them dry out.'],
    ['<b>Kefir grains</b> are alive and grow as they ferment milk. Some owners name them. Grains sold today may descend from the very first ones.','Nobody quite remembers where the first ones came from.'],
    ['<b>Kefir grains</b> grow when they are fed. Grains get heavier when they are named.','Grains do not like being left alone.'],
    ['The grains are fine. The grains are listening.','Do not name them.'],
    ['feed them','feed them']
  ],
  sheep:[
    ['<b>Sheep</b> are not used to make kefir. Kefir is made from milk (usually cow, goat or sheep milk) and kefir grains.','Sheep are gentle, social animals that stay close to their flock.'],
    ['<b>Sheep</b> are not used to make kefir. An old legend says otherwise. Sheep are social animals that stay close to their flock.','In hot weather, sheep often stand facing a wall.'],
    ['<b>Sheep</b> are not used to make kefir anymore.','They stand facing the wall. They do not look at the house.'],
    ['How many were there? Count them.','There should be eight.'],
    ['count them','count them']
  ],
  legend:[
    ['According to <b>folklore</b>, the first kefir grains were a gift to mountain shepherds. There are several versions of the story; none can be verified.','Modern grains are simply passed on from batch to batch.'],
    ['According to <b>an old legend</b>, the first grains were made in a goatskin bag that had to be shaken every hour for 48 hours.','Details differ between versions. Some versions are not told at the dinner table.'],
    ['The legend is not a legend. See: scan_0012.','The page is partially illegible. The drawing is not.'],
    ['Records from 1908 to 1908.','Grains now: more than there were bags.'],
    ['you are in the legend now','you are in the legend now']
  ],
  bag:[
    ['A <b>goatskin bag</b> is a traditional container once used for fermenting milk. It was hung near a doorway and shaken whenever someone walked past.','Today most people use a glass jar.'],
    ['A <b>goatskin bag</b> was traditionally shaken every hour for 48 hours. Missing a shake was said to spoil the batch.','Some say it remembers who forgot.'],
    ['The bag must be shaken every hour. It has been 48 hours.','It is warm. You did not feed it.'],
    ['The bag is shaking by itself. Do not open it. Do not answer it.','If it calls you by name, you took good care of it.'],
    ['shake the bag','shake the bag']
  ],
  exit:[
    ['To leave, close the tab or tap the flock logo to start a new search.','Is there anything else you would like to know about kefir?'],
    ['To leave, close the tab. Most people stop after three questions.','You have asked more than three.'],
    ['Closing the tab will not help. Shake the bag.','Every hour. 48 hours.'],
    ['There is no way out of the bag. There is only shaking.','Every hour.'],
    ['shake it','shake it']
  ]
};
OVERVIEW.other = OVERVIEW.kefir;

/* people also ask */
const Q = [
  {q:"How many sheep does it take to make kefir?", a:"None! 🐑 Kefir is made from <mark>milk and kefir grains</mark>. The sheep just stand nearby for moral support.", loopA:"<mark>One.</mark> It's always one.", fav:"🐑", url:"https://sheepcorner.com › faq", t:"Sheep Corner — Frequently Asked Questions", go:'guide'},
  {q:"Can you pet a kefir grain?", a:"Yes, but gently. Kefir grains are <mark>soft, warm and slightly springy</mark>, like an earlobe. Many people give theirs a name.", fav:"🫙", url:"https://kefirmama.blog › bobby", t:"My grain Bobby: one year together 💛", go:'blog'},
  {q:"Why does my kefir smell like sheep?", a:"This is normal. Kefir absorbs the smells of the kitchen <mark>and of whoever is nearby</mark>. Try opening a window.", fav:"🧀", url:"https://homecultures.forum › thread › 812", t:"Kefir smells like sheep??", go:'thread:812'},
  {q:"How do I know if my kefir grain is happy?", a:"A happy grain <mark>grows, divides and gets heavier</mark>. If it stops growing, it is missing something. Think about what.", fav:"🫙", url:"https://kefirmama.blog › happy-grain", t:"5 signs your kefir grain is happy", go:'blog'},
  {q:"How long does a kefir grain live?", a:"With proper care, forever. Grains sold today may be <mark>direct descendants of the very first ones</mark>. Nobody quite remembers where the first ones came from.", fav:"🥛", url:"https://milkwiki.org › wiki › Kefir#History", t:"Kefir § History - Milk Wiki", go:'wiki'},
  {q:"Where did the first kefir grains come from?", a:"There is an old legend. It is <mark>not told at the dinner table</mark>. Open the next question if you have already eaten.", fav:"🧀", url:"https://cheesetalk.org › thread › 4471", t:"Kefir grains - what they are and where they came from", go:'thread:4471'},
  {q:"What is the legend of the first kefir grains?", a:"In the mountains, they say, a young sheep was led away, <mark>one that did not yet know why</mark>. The records skip ahead after that. On the next page someone has drawn a smiling bag by hand.", fav:"📄", url:"archive.flock › scan_0012.jpg", t:"Scan 0012 (handwritten)", go:'archive'},
  {q:"Why does it have to be a goatskin bag?", a:"Goatskin holds warmth well. <mark>It also remembers.</mark>", fav:"🧀", url:"https://cheesetalk.org › thread › 4471?page=2", t:"Kefir grains - where they came from (page 2)", go:'thread:4471'},
  {q:"Do you really have to shake the bag every hour?", a:"Yes. <mark>Every hour, for 48 hours.</mark> Miss even once and the grain will think it has been abandoned. You don't want it to think that, do you?", fav:"🫙", url:"https://kefirmama.blog › comments", t:"Comments (1,371)", go:'blog'},
  {q:"What happens if you stop shaking it?", a:"Nothing. <mark>At first, nothing.</mark>", fav:"·", url:"[comment deleted]", t:"[comment deleted]", go:'thread:4471'},
  {q:"Why do sheep stand facing the wall?", a:"This is normal behavior in hot weather. <mark>They are not looking at the house.</mark> They see nothing. They saw nothing.", fav:"🌾", url:"https://farmhandbook.org › sheep › behavior", t:"Sheep behavior: a farmer's handbook", go:'farm'},
  {q:"Why does my house smell like sheep?", a:"Have you opened kefir recently? Check the fridge. <mark>Check behind the fridge.</mark> Are the bathroom tiles cold? That is normal. Don't turn on the light.", fav:"🐑", url:"flock › results for you", t:"Personalized answer", go:'img:tiles'},
  {q:"Can kefir see?", a:"No. Kefir has no eyes. The thing it was once made from had eyes, but <mark>they are far away, and they are closed</mark>. Almost all of them.", fav:"?", url:"http://<span class='redact'>xq7mh2kd</span>.onion › kefir", t:"<span class='redact'>████████████</span>", go:'onion'},
  {q:"How much does one sheep cost?", a:"No prices found. Try asking: <mark>“how much is what's inside”</mark>.", fav:"🐑", url:"flock › shopping", t:"flock Shopping", go:'tab:shopping'},
  {q:"Why did my kefir grain get heavier after I named it?", a:"It grows when it is loved. It grows when it is fed. <mark>Sometimes these are the same thing.</mark>", fav:"🫙", url:"https://kefirmama.blog › comments › kefir_mama", t:"kefir_mama · last seen 1971", go:'blog'},
  {q:"How to open a sheep gently?", a:"No results found for “how to open a sheep gently”. Did you mean: <mark>“how to open a package gently”</mark>? That is what you meant, isn't it?", fav:"🐑", url:"flock › did you mean", t:"Did you mean: how to open a package gently", go:'q:how to open a package gently'},
  {q:"who is asking these questions", a:"People are asking these questions. People also ask. People always ask. <mark>People asked before you.</mark>", fav:"·", url:"flock://people/also/ask", t:"people_also_ask.log", go:'drawer'},
  {q:"the bag is shaking by itself", a:"This is normal in the first 48 hours. Do not open it. Do not answer it. If it calls you by name, <mark>it means you took good care of it</mark>.", fav:"?", url:"http://<span class='redact'>4471kefir0x</span>.onion › bag", t:"index of /bag/", go:'onion'},
  {q:"how many were there", a:"Records from 1908 to 1908. Sheep: <span class='redact'>████</span>. Bags: <span class='redact'>███</span>. <mark>Grains now: more than there were bags.</mark>", fav:"·", url:"archive mirror (unavailable)", t:"ERR_MIRROR_GONE", go:'archive'},
  {q:"why does it feel like i'm at the bottom", a:"You are <span class='js-depth'>20</span> questions deep. <mark>Most people stop at the third.</mark>", fav:"·", url:"flock://depth", t:"depth.txt", go:null},
  {q:"how do i get out", a:"Close the tab. No, not like that. <mark>Shake it. Every hour. 48 hours.</mark>", fav:"🫙", url:"https://kefirmama.blog › comments", t:"Comments (1,372)", go:'blog'},
  {q:"what is inside the bottle", a:"Inside the bottle: milk and bacteria. Inside the bacteria: memory. Inside the memory: mountains, a bag, a warm evening and <mark>a sheep that does not yet know why it is being led away</mark>.", fav:"🥛", url:"label › small print", t:"Ingredients", go:'img:photo'},
  {q:"WHY ARE YOU STILL SCROLLING", a:"<span class='loud'>because you want to know</span><p>we wanted to know too.</p>", fav:"·", url:"you", t:"you", go:null},
  {q:"count them", a:"<div class='flock-row js-flock'></div><p>there should be eight.</p>", fav:"🐑", url:"flock://flock", t:"flock.count", go:'tab:images'},
  {q:"people also ask", a:"<p class='js-echo'></p>", fav:"·", url:"—", t:"—", go:null},
  {q:"shake the bag", a:"<p>an hour has passed.</p><button class='shake-btn' type='button' data-act='shake'>shake</button>", fav:"🫙", url:"kefirmama.blog › comments", t:"Comments (1,373)", go:null}
];

/* images */
const IMGS = [
  {id:'field',p:'field',seed:3,t:'Sheep grazing on a sunny hill',site:'Sheep Corner',fav:'🐑',go:'guide',min:0,h:.75},
  {id:'grains',p:'grains',seed:5,t:'Healthy kefir grains up close',site:'kefir mama',fav:'🫙',go:'blog',min:0,h:1},
  {id:'photo',asset:'photo',t:'Kefir in a 0.5 l glass bottle',site:'Home Cultures',fav:'🧀',go:'thread:812',min:0},
  {id:'jar',p:'jar',seed:2,t:'Homemade kefir in a mason jar',site:'Home Cultures',fav:'🧀',go:'thread:812',min:0,h:1.25},
  {id:'shot',asset:'shot',t:'How to make kefir grains?',site:'cheesetalk.org',fav:'🧀',go:'thread:4471',min:0},
  {id:'glass',p:'glass',seed:4,t:'A glass of fresh kefir',site:'Milk Wiki',fav:'🥛',go:'wiki',min:0,h:1.2},
  {id:'lambs',p:'field',seed:11,t:'Lambs in spring',site:'Farm Handbook',fav:'🌾',go:'farm',min:0,h:.66},
  {id:'wall',p:'wall',seed:6,t:'Sheep resting in the shade',site:'Farm Handbook',fav:'🌾',go:'farm',min:1,h:.8},
  {id:'bag',p:'bag',seed:8,t:'Traditional goatskin bag',site:'cheesetalk.org',fav:'🧀',go:'thread:4471',min:1,h:1.3},
  {id:'scan',p:'scan',seed:12,t:'Recipe book, page 12 (1908)',site:'archive.flock',fav:'📄',go:'archive',min:1,h:1.35},
  {id:'tiles',p:'tiles',seed:9,t:'White bathroom floor tiles',site:'Kitchen Basics',fav:'🏠',go:'product:bottle',min:2,h:1},
  {id:'corridor',p:'corridor',seed:13,t:'basement corridor',site:'[unknown]',fav:'?',go:'onion',min:2,h:1.4},
  {id:'flockdark',p:'flockdark',seed:21,t:'night pasture (8)',site:'Farm Handbook',fav:'🌾',go:'farm',min:3,h:.75},
  {id:'eyes',p:'eyes',seed:31,t:'untitled.jpg',site:'index of /bag/',fav:'?',go:'onion',min:3,h:1},
  {id:'bag48',p:'bag',seed:48,dark:.7,t:'bag_0048.jpg',site:'index of /bag/',fav:'?',go:'onion',min:3,h:1.3},
  {id:'youwere',p:'tiles',seed:19,dark:.8,t:'you were here',site:'you',fav:'·',go:'onion',min:4,h:1.6},
  {id:'void',p:'void',seed:1,t:'you.jpg',site:'index of /bag/',fav:'?',go:'onion',min:99,h:1}
];
const imgById = id => IMGS.find(x=>x.id===id);

/* shop */
const PRODUCTS = [
  {id:'grains',p:'grains',seed:15,t:'Live kefir grains, 10 g',price:'€8.90',seller:'kefir mama shop',rating:'4.8',reviews:'1,371',stock:s=>s>=3?'In stock. Growing.':'In stock',
   desc:s=>s>=2?'Fresh, active grains from our own line. Our grains descend from the very first grains. Please name yours before it arrives.':'Fresh, active milk kefir grains shipped in a little milk. Ready to use the day they arrive.',
   revs:s=>[['milk_and_honey','★★★★★','Arrived quickly. Very active!'],['curdnerd','★★★★☆','Good grains, a bit slow in the first week.']].concat(s>=1?[['anon','★★★★★','Arrived warm. Still warm.']]:[])},
  {id:'bag',p:'bag',seed:16,t:'Goatskin fermentation bag, handmade',price:'€48.00',seller:'Old Mountain Goods',rating:'4.6',reviews:'212',stock:()=>'In stock',
   desc:s=>s>=2?'Handmade the traditional way. Comes pre-warmed. Hang near a door. Shake every hour.':'Handmade the traditional way from a single goatskin. For decorative or traditional fermentation use.',
   revs:s=>[['old_shepherd','★★★★★','Just like the one my grandmother had.']].concat(s>=2?[['[deleted]','★☆☆☆☆','it moves at night']]:[])},
  {id:'bottle',p:'glass',seed:17,t:'Glass milk bottle 0.5 l, set of 4',price:'€12.90',seller:'Kitchen Basics',rating:'4.7',reviews:'3,402',stock:()=>'In stock',
   desc:()=>'Classic glass milk bottles with screw caps. Dishwasher safe. Perfect for storing kefir in the fridge.',
   revs:s=>[['homecook','★★★★★','Sturdy and cute.']].concat(s>=3?[['you','★★★★★','i keep one in the bathroom']]:[])},
  {id:'sheep',p:'field',seed:18,t:'Sheep, live (1)',price:'Price on request',seller:'Mountain Farm Co-op',rating:'5.0',reviews:'8',stock:s=>s>=2?'Out of stock since 1908':'Out of stock',out:true,
   desc:s=>s>=2?'Young, healthy, does not know yet.':'Healthy young sheep from a small family farm. Collection only.',
   revs:s=>s>=1?[['[deleted]','★★★★★','it did not know.']]:[]},
  {id:'starter',p:'scan',seed:19,t:'Original starter culture (first generation)',price:'Not for sale',seller:'[unknown]',rating:'—',reviews:'0',stock:()=>'1 left',min:2,
   desc:()=>'The first one. Comes in a bag. Shake every hour.',
   revs:()=>[]}
];

/* videos */
const VIDEOS = [
  {id:'quick',p:'jar',seed:22,t:'How to make kefir at home in 5 minutes',ch:'Sheep Corner',chav:'🐑',subs:'214K',views:'1.2M views',ago:'3 years ago',dur:'5:12',secs:312,min:0,motion:'shake',
   desc:'Everything you need: milk, grains, a jar. Thank you for watching! Remember to thank your sheep.'},
  {id:'asmr',p:'grains',seed:23,t:'Feeding my kefir grains (ASMR, no talking)',ch:'kefir mama',chav:'🫙',subs:'12K',views:'84K views',ago:'1 year ago',dur:'12:40',secs:760,min:0,motion:'pulse',
   desc:'Bobby eating his dinner 💛 headphones recommended.'},
  {id:'ritual',p:'bag',seed:24,t:'Shaking the bag every hour for 48 hours - full ritual',ch:'old_shepherd',chav:'🧔',subs:'1.9K',views:'1,908 views',ago:'1908',dur:'48:00:00',secs:172800,min:1,motion:'sway',
   desc:'Uploaded in full. Do not skip ahead. It knows if you skip ahead.'},
  {id:'wall',p:'wall',seed:25,t:'sheep facing the wall compilation',ch:'Farm Handbook',chav:'🌾',subs:'48K',views:'48K views',ago:'2 weeks ago',dur:'3:33',secs:213,min:2,motion:'still',
   desc:'Nobody knows why they do it. Watch until the end.'},
  {id:'live',p:'bag',seed:26,dark:.6,t:'LIVE: the bag',ch:'[unknown]',chav:'?',subs:'1',views:'1 watching',ago:'now',dur:'LIVE',secs:0,min:3,motion:'sway',live:true,
   desc:'You are the only one watching. It is not.'}
];

/* news */
const NEWS = [
  {id:'trend',p:'glass',seed:31,src:'Food Daily',fav:'🍽️',t:'Home fermentation is booming: kefir sales up 40%',ago:'2 days ago',min:0,
   body:['Kefir has gone from health-store niche to supermarket staple. Retailers report a 40% rise in sales over the past year, with home kits and live grains selling fastest.','“People like that it is alive,” says one shop owner. “You feed it, it grows. It is like a pet.”','Experts recommend buying grains from a trusted source and keeping them in fresh milk.']},
  {id:'farm',p:'wall',seed:32,src:'Rural Times',fav:'📰',t:'Farmers puzzled as sheep stand facing walls',ago:'5 hours ago',min:1,
   body:['Farmers across the region report an unusual sight: whole flocks standing motionless with their faces to barn walls.','“They do it at night now too,” says one farmer, who asked not to be named. “I counted them. There should be eight.”','Vets say the behavior is usually linked to heat and is harmless.']},
  {id:'archive',p:'scan',seed:33,src:'Heritage Weekly',fav:'🏛️',t:'1908 recipe book resurfaces in regional archive',ago:'1 hour ago',min:2,
   body:['A handwritten household recipe book dated 1908 has been found in a regional archive. Most pages describe ordinary dishes.','Page 12 is different. It is a recipe for kefir grains. Archivists declined to publish the full text.','“There is a drawing at the bottom,” an archivist said. “It is smiling.”']},
  {id:'missing',p:'flockdark',seed:34,src:'Local Notices',fav:'📌',t:'Missing: one sheep. Last seen being led away',ago:'just now',min:3,
   body:['A young sheep has gone missing from a local farm. It was last seen being led away by someone it trusted.','It did not know why.','If you have seen it, do not approach. Shake the bag.']},
  {id:'you',p:'tiles',seed:35,dark:.6,src:'flock News',fav:'🐑',t:'Local resident still scrolling',ago:'now',min:4,
   body:['A local resident has opened more than twenty questions about kefir.','Sources close to the resident say they “just want to know”.','We wanted to know too.']}
];

/* forum threads */
const THREADS = {
  '4471':{forum:'cheesetalk.org',title:'Kefir grains - what they are and where they came from',meta:'31 Jan 2016 · 48 replies',min:0,
    posts:[
      {u:'milk_and_honey',d:'31 Jan 2016',b:"Does anyone know where kefir grains actually come from? I've had mine for years and nobody can tell me.",min:0},
      {u:'old_shepherd',d:'31 Jan 2016',b:"There's an old story from the mountains. I won't repeat all of it here. Short version: it involves a sheep, a goatskin bag and 48 hours of shaking. Someone posted this, I'm not saying it's true:",img:'shot',min:0},
      {u:'curdnerd',d:'1 Feb 2016',b:"That's a legend, not a recipe. Modern grains are passed on from batch to batch. Nobody is slaughtering anything. Buy grains from a shop and relax.",min:0},
      {u:'kefir_mama',d:'1 Feb 2016',b:'they are passed on. from batch to batch. from the first one. 💛',min:0},
      {u:'[deleted]',d:'2 Feb 2016',b:'[this post was removed by a moderator]',del:true,min:1},
      {u:'old_shepherd',d:'14 Mar 2016',b:"I checked on mine last night. The bag was warm. I hadn't fed it.",min:2},
      {u:'milk_and_honey',d:'01 Jan 1908',b:"it's been 48 hours. i keep shaking it. it keeps asking for more.",min:3},
      {u:'you',d:'now',b:'shake the bag',min:4,you:true}
    ]},
  '812':{forum:'Home Cultures',title:'Kefir smells like sheep??',meta:'9 Aug 2021 · 12 replies',min:0,
    posts:[
      {u:'newbie_ferment',d:'9 Aug 2021',b:'My kefir smells kind of… woolly? Is that normal?',img:'photo',min:0},
      {u:'homecultures_mod',d:'9 Aug 2021',b:'Totally normal. Kefir picks up smells from the kitchen. Open a window.',min:0},
      {u:'newbie_ferment',d:'10 Aug 2021',b:'I opened the window. The smell is stronger outside.',min:1},
      {u:'homecultures_mod',d:'10 Aug 2021',b:'Close the window.',min:2},
      {u:'newbie_ferment',d:'01 Jan 1908',b:'there are eight of them in the yard. they are facing the house now.',min:3}
    ]},
  '1908':{forum:'cheesetalk.org',title:"does anyone else's bag move at night",meta:'today · 3 replies',min:2,
    posts:[
      {u:'anon',d:'today',b:"mine moves at night. not a lot. like breathing. i didn't feed it.",min:2},
      {u:'old_shepherd',d:'today',b:'Shake it. Every hour. Do not stop.',min:2},
      {u:'anon',d:'today',b:'what happens if i stop',min:2},
      {u:'kefir_mama',d:'today',b:'nothing. at first, nothing. 💛',min:3}
    ]},
  '0':{forum:'[unknown]',title:'[no title]',meta:'now · 1 reply',min:3,
    posts:[{u:'[unknown]',d:'now',b:'we can see you scrolling.',min:3}]}
};

/* ======================= canvas painters ======================= */
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function sheepAt(ctx,x,y,s,o={}){
  const wool=o.wool||'#fbfaf6', face=o.face||'#2b2522';
  ctx.save(); ctx.translate(x,y);
  ctx.strokeStyle=face; ctx.lineWidth=s*.07; ctx.lineCap='round';
  [-.25,-.1,.12,.27].forEach(lx=>{ ctx.beginPath(); ctx.moveTo(lx*s,s*.12); ctx.lineTo(lx*s,s*.42); ctx.stroke(); });
  ctx.fillStyle=wool; ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=Math.max(1,s*.01);
  [[-.28,0,.2],[-.1,-.1,.24],[.12,-.1,.24],[.3,0,.2],[0,.08,.26],[-.2,.1,.18],[.2,.1,.18]].forEach(([cx,cy,cr])=>{ ctx.beginPath(); ctx.arc(cx*s,cy*s,cr*s,0,7); ctx.fill(); ctx.stroke(); });
  if(o.facing==='away'){
    ctx.fillStyle=wool; ctx.beginPath(); ctx.arc(.42*s,-.02*s,.07*s,0,7); ctx.fill();
  } else {
    const front=o.facing==='front';
    const hx=(front?0:-.45)*s, hy=(front?.04:-.02)*s;
    ctx.fillStyle=face;
    ctx.beginPath(); ctx.ellipse(hx-s*.16,hy-s*.07,s*.08,s*.035,-.5,0,7); ctx.ellipse(hx+s*.16,hy-s*.07,s*.08,s*.035,.5,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx,hy,s*.14,s*.17,0,0,7); ctx.fill();
    if(o.eyes!==false){
      const er=s*.028;
      if(o.glow){ ctx.shadowColor=o.glow; ctx.shadowBlur=s*.15; }
      ctx.fillStyle=o.glow||'#fff';
      ctx.beginPath(); ctx.arc(hx-s*.055,hy-s*.03,er,0,7); ctx.arc(hx+s*.055,hy-s*.03,er,0,7); ctx.fill();
      if(o.third){ ctx.beginPath(); ctx.arc(hx,hy-s*.09,er*.8,0,7); ctx.fill(); }
      ctx.shadowBlur=0;
    }
    if(o.cheeks){ ctx.fillStyle='rgba(244,169,189,.8)'; ctx.beginPath(); ctx.ellipse(hx-s*.08,hy+s*.06,s*.03,s*.017,0,0,7); ctx.ellipse(hx+s*.08,hy+s*.06,s*.03,s*.017,0,0,7); ctx.fill(); }
  }
  ctx.restore();
}
function blob(ctx,x,y,s,r,c1,c2){
  const n=6+Math.floor(r()*5);
  for(let i=0;i<n;i++){
    const a=r()*6.28, d=r()*s*.45, cx=x+Math.cos(a)*d, cy=y+Math.sin(a)*d*.8, cr=s*(.22+r()*.22);
    const g=ctx.createRadialGradient(cx-cr*.3,cy-cr*.3,cr*.1,cx,cy,cr);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,cr,0,7); ctx.fill();
  }
}
function flash(ctx,w,h,x,y,strength){
  const g=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.8);
  g.addColorStop(0,`rgba(255,255,250,${.55*strength})`); g.addColorStop(.35,`rgba(255,255,245,${.15*strength})`); g.addColorStop(1,`rgba(0,0,0,${.75*strength})`);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
}
const P = {
  field(ctx,w,h,r){
    const sky=ctx.createLinearGradient(0,0,0,h*.6); sky.addColorStop(0,'#a9d8ff'); sky.addColorStop(1,'#fdf1fa');
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,246,200,.9)'; ctx.beginPath(); ctx.arc(w*(.7+r()*.2),h*.16,w*.08,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.85)'; for(let i=0;i<3;i++){ const cx=r()*w, cy=h*(.08+r()*.2); [0,1,2].forEach(k=>{ ctx.beginPath(); ctx.arc(cx+k*w*.04,cy+(k%2)*-4,w*.035,0,7); ctx.fill(); }); }
    ctx.fillStyle='#a6d58f'; ctx.beginPath(); ctx.moveTo(0,h*.55); ctx.bezierCurveTo(w*.3,h*.42,w*.6,h*.62,w,h*.5); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
    ctx.fillStyle='#8cc678'; ctx.beginPath(); ctx.moveTo(0,h*.72); ctx.bezierCurveTo(w*.4,h*.6,w*.7,h*.78,w,h*.68); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
    for(let i=0;i<40;i++){ ctx.fillStyle=['#fff','#ffd6e5','#fff2a8'][i%3]; ctx.beginPath(); ctx.arc(r()*w,h*(.6+r()*.4),1.5+r()*1.5,0,7); ctx.fill(); }
    const n=3+Math.floor(r()*3);
    const pts=Array.from({length:n},()=>({x:w*(.12+r()*.76),y:h*(.58+r()*.3),s:w*(.13+r()*.08)})).sort((a,b)=>a.y-b.y);
    pts.forEach(p=>sheepAt(ctx,p.x,p.y,p.s,{facing:r()<.5?'side':'front',cheeks:true}));
  },
  wall(ctx,w,h,r){
    ctx.fillStyle='#e7e1d5'; ctx.fillRect(0,0,w,h*.68);
    ctx.strokeStyle='rgba(120,110,95,.18)'; ctx.lineWidth=1;
    for(let y=14;y<h*.68;y+=18){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); for(let x=(y/18%2)*24;x<w;x+=48){ ctx.beginPath(); ctx.moveTo(x,y-18); ctx.lineTo(x,y); ctx.stroke(); } }
    const g=ctx.createLinearGradient(0,h*.68,0,h); g.addColorStop(0,'#9db586'); g.addColorStop(1,'#7f9b6c'); ctx.fillStyle=g; ctx.fillRect(0,h*.68,w,h*.32);
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(0,h*.66,w,h*.04);
    const n=3+Math.floor(r()*2);
    for(let i=0;i<n;i++){ sheepAt(ctx,w*(.16+i*(.7/(n-1||1))),h*.72,w*.17,{facing:'away'}); }
  },
  grains(ctx,w,h,r){
    const g=ctx.createRadialGradient(w*.5,h*.4,10,w*.5,h*.5,Math.max(w,h)*.8); g.addColorStop(0,'#f8f2e6'); g.addColorStop(1,'#d9cbb0');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    const n=18+Math.floor(r()*10);
    for(let i=0;i<n;i++){
      const x=r()*w, y=r()*h, s=w*(.08+r()*.12);
      ctx.fillStyle='rgba(90,70,40,.12)'; ctx.beginPath(); ctx.ellipse(x+s*.15,y+s*.25,s*.6,s*.35,0,0,7); ctx.fill();
      blob(ctx,x,y,s,r,'#fffdf7','#e6d9bd');
    }
  },
  jar(ctx,w,h,r){
    ctx.fillStyle='#efe4d8'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#e8d9c9'; for(let x=0;x<w;x+=w/8){ ctx.fillRect(x,0,1,h*.72); }
    const c=ctx.createLinearGradient(0,h*.72,0,h); c.addColorStop(0,'#cfb595'); c.addColorStop(1,'#b89c79'); ctx.fillStyle=c; ctx.fillRect(0,h*.72,w,h*.28);
    const x0=w*.27,x1=w*.73,y0=h*.22,y1=h*.84;
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(w*.5,y1,w*.27,h*.025,0,0,7); ctx.fill();
    ctx.fillStyle='#faf8f1'; ctx.beginPath(); ctx.roundRect(x0,y0+h*.1,x1-x0,y1-y0-h*.1,w*.05); ctx.fill();
    for(let i=0;i<7;i++) blob(ctx,x0+(x1-x0)*(.15+r()*.7),y0+h*.12+r()*h*.06,w*.06,r,'#fffef8','#e9dfc6');
    ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=w*.012; ctx.beginPath(); ctx.roundRect(x0,y0,x1-x0,y1-y0,w*.05); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=w*.02; ctx.beginPath(); ctx.moveTo(x0+w*.05,y0+h*.12); ctx.lineTo(x0+w*.05,y1-h*.08); ctx.stroke();
    ctx.fillStyle='#e9a3b5'; ctx.beginPath(); ctx.moveTo(x0-w*.05,y0+h*.02); ctx.lineTo(x1+w*.05,y0+h*.02); ctx.lineTo(x1-w*.02,y0-h*.07); ctx.lineTo(x0+w*.02,y0-h*.07); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)'; for(let x=x0-w*.04;x<x1+w*.04;x+=w*.04) ctx.fillRect(x,y0-h*.06,w*.02,h*.08);
    ctx.strokeStyle='#8a6a4a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x0,y0+h*.01); ctx.lineTo(x1,y0+h*.01); ctx.stroke();
  },
  glass(ctx,w,h,r){
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#f6f1ea'); g.addColorStop(1,'#e2d7ca'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#d4c3ad'; ctx.fillRect(0,h*.78,w,h*.22);
    const top=h*.25, bot=h*.82, tl=w*.3, tr=w*.7, bl=w*.35, br=w*.65;
    ctx.fillStyle='rgba(0,0,0,.1)'; ctx.beginPath(); ctx.ellipse(w*.5,bot,w*.2,h*.02,0,0,7); ctx.fill();
    ctx.fillStyle='#fbfaf4'; ctx.beginPath(); ctx.moveTo(tl+w*.01,top+h*.07); ctx.lineTo(tr-w*.01,top+h*.07); ctx.lineTo(br,bot); ctx.lineTo(bl,bot); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.lineWidth=w*.01; ctx.beginPath(); ctx.moveTo(tl,top); ctx.lineTo(bl,bot); ctx.lineTo(br,bot); ctx.lineTo(tr,top); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(tl+w*.04,top+h*.1,w*.025,h*.4);
    blob(ctx,w*.5,top+h*.08,w*.05,r,'#fffef9','#ece3cd');
  },
  bag(ctx,w,h,r,dark){
    const g=ctx.createRadialGradient(w*.35,h*.25,10,w*.5,h*.5,Math.max(w,h)); g.addColorStop(0,'#3a2e24'); g.addColorStop(1,'#0d0a08');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#a08566'; ctx.lineWidth=w*.012; ctx.beginPath(); ctx.moveTo(w*.5,0); ctx.lineTo(w*.5,h*.2); ctx.stroke();
    const bx=w*.5, by=h*.55, bw=w*.34, bh=h*.36;
    const lg=ctx.createRadialGradient(bx-bw*.3,by-bh*.3,5,bx,by,bw*1.3); lg.addColorStop(0,'#8a5d38'); lg.addColorStop(.6,'#5a3a20'); lg.addColorStop(1,'#2a1a0d');
    ctx.fillStyle=lg; ctx.beginPath();
    ctx.moveTo(bx-w*.05,h*.2); ctx.bezierCurveTo(bx-bw*1.1,h*.3,bx-bw*1.2,by+bh*.9,bx-bw*.2,by+bh); ctx.bezierCurveTo(bx+bw*.4,by+bh*1.08,bx+bw*1.25,by+bh*.7,bx+bw*.9,by-bh*.2);
    ctx.bezierCurveTo(bx+bw*.7,h*.28,bx+w*.08,h*.24,bx+w*.05,h*.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(30,18,8,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([4,5]);
    ctx.beginPath(); ctx.moveTo(bx-bw*.1,h*.24); ctx.bezierCurveTo(bx-bw*.5,by,bx-bw*.3,by+bh*.6,bx,by+bh*.95); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,220,180,.18)'; ctx.beginPath(); ctx.ellipse(bx-bw*.45,by-bh*.15,bw*.15,bh*.3,.3,0,7); ctx.fill();
    ctx.strokeStyle='#c4a37c'; ctx.lineWidth=w*.015; ctx.beginPath(); ctx.moveTo(bx-w*.06,h*.21); ctx.lineTo(bx+w*.06,h*.21); ctx.stroke();
    if(dark>.5){ ctx.fillStyle='rgba(230,225,200,.85)'; ctx.beginPath(); ctx.arc(bx-bw*.25,by,2.2,0,7); ctx.arc(bx+bw*.05,by,2.2,0,7); ctx.fill(); }
    flash(ctx,w,h,w*.45,h*.4,.6);
  },
  tiles(ctx,w,h,r,dark){
    ctx.fillStyle='#d6d6d0'; ctx.fillRect(0,0,w,h);
    ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(-.5); const t=w*.2;
    ctx.strokeStyle='#9d9d97'; ctx.lineWidth=2;
    for(let x=-w*1.5;x<w*1.5;x+=t){ ctx.beginPath(); ctx.moveTo(x,-h*1.5); ctx.lineTo(x,h*1.5); ctx.stroke(); }
    for(let y=-h*1.5;y<h*1.5;y+=t){ ctx.beginPath(); ctx.moveTo(-w*1.5,y); ctx.lineTo(w*1.5,y); ctx.stroke(); }
    ctx.restore();
    for(let i=0;i<12;i++){ ctx.fillStyle=`rgba(60,55,45,${.05+r()*.1})`; ctx.beginPath(); ctx.arc(r()*w,r()*h,1+r()*4,0,7); ctx.fill(); }
    ctx.fillStyle='rgba(10,10,12,.85)'; ctx.beginPath(); ctx.moveTo(0,h*.55); ctx.bezierCurveTo(w*.2,h*.6,w*.25,h*.9,w*.15,h); ctx.lineTo(0,h); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w,0); ctx.lineTo(w*.78,0); ctx.bezierCurveTo(w*.8,h*.12,w*.9,h*.2,w,h*.18); ctx.fill();
    if(dark>.5){ ctx.fillStyle='rgba(20,20,20,.5)'; ctx.beginPath(); ctx.ellipse(w*.6,h*.62,w*.09,h*.05,.4,0,7); ctx.ellipse(w*.48,h*.75,w*.09,h*.05,.4,0,7); ctx.fill(); }
    flash(ctx,w,h,w*.5,h*.45,1);
  },
  corridor(ctx,w,h,r){
    ctx.fillStyle='#1d1f1c'; ctx.fillRect(0,0,w,h);
    const cx=w*.5, cy=h*.48;
    for(let i=0;i<9;i++){ const k=1-i/10, x0=cx-w*.5*k, y0=cy-h*.5*k, ww=w*k, hh=h*k;
      ctx.strokeStyle=`rgba(190,195,180,${.22-i*.02})`; ctx.lineWidth=1.5; ctx.strokeRect(x0,y0,ww,hh); }
    ctx.strokeStyle='rgba(190,195,180,.12)';
    for(let i=0;i<=8;i++){ ctx.beginPath(); ctx.moveTo(i*w/8,h); ctx.lineTo(cx+(i/8-.5)*w*.1,cy+h*.05); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i*w/8,0); ctx.lineTo(cx+(i/8-.5)*w*.1,cy-h*.05); ctx.stroke(); }
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,w*.12); g.addColorStop(0,'rgba(210,225,190,.65)'); g.addColorStop(1,'rgba(210,225,190,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    sheepAt(ctx,cx,cy+h*.02,w*.06,{facing:'front',wool:'#2c2c28',face:'#050505',glow:'#e6e0c4'});
  },
  eyes(ctx,w,h,r){
    ctx.fillStyle='#050505'; ctx.fillRect(0,0,w,h);
    const n=5+Math.floor(r()*5);
    for(let i=0;i<n;i++){ const x=w*(.1+r()*.8), y=h*(.25+r()*.6), s=2+r()*4, gap=s*4;
      ctx.shadowColor='#e9e2c6'; ctx.shadowBlur=s*3; ctx.fillStyle='rgba(235,228,200,.9)';
      ctx.beginPath(); ctx.arc(x,y,s,0,7); ctx.arc(x+gap,y,s,0,7); ctx.fill(); }
    ctx.shadowBlur=0;
  },
  flockdark(ctx,w,h,r){
    const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0a0c12'); g.addColorStop(.55,'#141720'); g.addColorStop(.56,'#0c0e0a'); g.addColorStop(1,'#050604'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(220,220,200,.85)'; ctx.beginPath(); ctx.arc(w*.8,h*.15,w*.04,0,7); ctx.fill();
    const pts=Array.from({length:8},()=>({x:w*(.08+r()*.84),y:h*(.6+r()*.3)})).sort((a,b)=>a.y-b.y);
    pts.forEach(p=>sheepAt(ctx,p.x,p.y,w*(.07+(p.y/h-.6)*.25),{facing:'front',wool:'#2a2a25',face:'#020202',glow:'#d9d2b0'}));
  },
  scan(ctx,w,h,r){
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#ece2c9'); g.addColorStop(1,'#d8c9a8'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    for(let i=0;i<5;i++){ const x=r()*w,y=r()*h,s=w*(.05+r()*.12); const sg=ctx.createRadialGradient(x,y,0,x,y,s); sg.addColorStop(0,'rgba(140,100,50,.18)'); sg.addColorStop(1,'rgba(140,100,50,0)'); ctx.fillStyle=sg; ctx.fillRect(0,0,w,h); }
    ctx.strokeStyle='rgba(50,38,28,.75)'; ctx.lineWidth=Math.max(1,w*.005); ctx.lineCap='round';
    for(let l=0;l<9;l++){ const y=h*(.1+l*.055); let x=w*.1; ctx.beginPath(); ctx.moveTo(x,y);
      const end=w*(.75+r()*.15); while(x<end){ x+=w*(.01+r()*.02); ctx.lineTo(x,y+(r()-.5)*h*.018); if(r()<.08){ x+=w*.03; ctx.moveTo(x,y); } } ctx.stroke(); }
    ctx.fillStyle='rgba(40,30,22,.9)'; ctx.fillRect(w*.3,h*.3,w*.25,h*.02);
    const bx=w*.5, by=h*.78, s=w*.16;
    ctx.lineWidth=Math.max(1.5,w*.008); ctx.beginPath(); ctx.moveTo(bx,by-s*1.3); ctx.lineTo(bx,by-s*.9);
    ctx.moveTo(bx-s*.2,by-s*.9); ctx.bezierCurveTo(bx-s*1.3,by-s*.6,bx-s*1.1,by+s*.9,bx,by+s*.85); ctx.bezierCurveTo(bx+s*1.1,by+s*.9,bx+s*1.2,by-s*.6,bx+s*.2,by-s*.9); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='rgba(40,30,22,.9)'; ctx.beginPath(); ctx.arc(bx-s*.3,by,s*.07,0,7); ctx.arc(bx+s*.3,by,s*.07,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(bx,by+s*.15,s*.35,.15*Math.PI,.85*Math.PI); ctx.stroke();
    ctx.font=`${Math.round(w*.05)}px Georgia,serif`; ctx.fillText('12',w*.86,h*.95);
  },
  void(ctx,w,h){ ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h); }
};
const GRITTY = {bag:1,tiles:1,corridor:1,eyes:1,flockdark:1,void:1,scan:.5};
function paint(cv){
  if(cv.dataset.done) return;
  const kind=cv.dataset.paint; const fn=P[kind]||P.field;
  const ctx=cv.getContext('2d'), w=cv.width, h=cv.height;
  const seed=+cv.dataset.seed||1, dark=+cv.dataset.dark||0, r=rng(seed*7919+kind.length);
  fn(ctx,w,h,r,dark);
  if(dark>0){ ctx.fillStyle=`rgba(8,8,12,${dark*.5})`; ctx.fillRect(0,0,w,h); }
  const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(0,0,0,${.12+dark*.6})`); ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
  const amt=6+(GRITTY[kind]||0)*22+dark*28;
  try{ const im=ctx.getImageData(0,0,w,h), d=im.data;
    for(let i=0;i<d.length;i+=4){ const n=(r()-.5)*amt; d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
    ctx.putImageData(im,0,0);
  }catch(e){}
  cv.dataset.done='1';
}
function paintAll(scope){ scope.querySelectorAll('canvas[data-paint]').forEach(paint); }
function imgDark(img){ return Math.max(img.dark||0, S.stage>=4?.7:S.stage>=3?.5:S.stage>=2?.25:0); }
function canvasFor(o, W, extra=''){
  const h=Math.round(W*(o.h||1));
  return `<canvas data-paint="${o.p}" data-seed="${o.seed||1}" data-dark="${o.darkOverride ?? (o.dark||0)}" width="${W}" height="${h}" ${extra} aria-hidden="true"></canvas>`;
}
function imgTag(o, W){
  if(o.asset) return `<img src="${ASSET[o.asset]}" alt="${esc(o.t)}" loading="lazy">`;
  return canvasFor({...o, darkOverride:imgDark(o)}, W);
}

/* ======================= navigation ======================= */
let pushOK = true;
function go(view){
  S.stack.push({view:S.cur, scroll:window.scrollY});
  S.cur = view;
  if(view.type==='page') logHistory(pageLabel(view.id, view.arg), view.arg?`${view.id}:${view.arg}`:view.id);
  if(view.type==='viewer') logHistory((imgById(view.id)||{}).t||'image', 'img:'+view.id);
  try{ history.pushState({d:S.stack.length}, ''); }catch(e){ pushOK=false; }
  render({top:true});
}
function back(){
  if(!S.stack.length) return;
  if(pushOK){ try{ history.back(); return; }catch(e){ pushOK=false; } }
  popView();
}
function popView(){
  const prev = S.stack.pop(); if(!prev) return;
  S.cur = prev.view; render({scrollTo:prev.scroll});
}
window.addEventListener('popstate', () => { if(S.stack.length) popView(); });

function navTo(target){
  if(!target) return;
  const [kind, ...rest] = target.split(':'); const arg = rest.join(':');
  if(kind==='tab') return setTab(arg);
  if(kind==='q') return runSearch(arg);
  if(kind==='drawer') return openDrawer();
  if(kind==='img') return go({type:'viewer', id:arg});
  if(kind==='thread') return go({type:'page', id:'thread', arg});
  if(['product','video','news'].includes(kind)) return go({type:'page', id:kind, arg});
  go({type:'page', id:kind});
}
function setTab(tab){
  if(S.cur.type==='serp'){ S.cur = {type:'serp', tab}; render({top:true}); }
  else go({type:'serp', tab});
}
function runSearch(q, chip=null){
  q = (q||'').trim(); if(!q) return;
  S.query = q; S.queryDefault = false; S.moreShown = 0; S.chip = chip;
  logHistory(q, 'q:'+q);
  visit('q:'+q.toLowerCase());
  const tab = (S.cur.type==='serp') ? S.cur.tab : 'all';
  if(S.cur.type==='serp'){ S.cur={type:'serp',tab}; render({top:true}); }
  else go({type:'serp', tab:'all'});
}
function logHistory(label, target){
  S.history.push({t:new Date(), label, target});
  if(S.history.length>60) S.history.shift();
}

/* ======================= render ======================= */
let rafId = 0;
function render(opt={}){
  cancelAnimationFrame(rafId); rafId=0;
  closeOverlay();
  const v = S.cur;
  let html='';
  if(v.type==='serp') html = renderSerp(v.tab);
  else if(v.type==='viewer') html = renderViewer(v.id);
  else html = renderPage(v.id, v.arg);
  app.innerHTML = `<main class="page" id="page">${html}</main>`;
  document.getElementById('page').classList.toggle('flicker', S.stage>=3);
  paintAll(app);
  afterRender(v);
  if(opt.top) window.scrollTo(0,0);
  else if(opt.scrollTo!=null) window.scrollTo(0,opt.scrollTo);
  else if(opt.keepScroll){ /* browser keeps it */ }
  document.title = titleFor(v);
}
function titleFor(v){
  if(S.stage>=4) return 'shake the bag';
  if(v.type==='serp') return `${S.query} - flock Search`;
  if(v.type==='viewer') return (imgById(v.id)||{}).t || 'flock Images';
  return pageTitle || 'flock';
}

/* ---------- header ---------- */
function headerHTML(){
  const tabs = TAB_LABELS[S.stage];
  const curTab = S.cur.type==='serp' ? S.cur.tab : 'all';
  return `
  <div class="topbar">
    <button class="btn-reset icon-btn press" data-act="menu" aria-label="History">${I.menu}</button>
    <button class="btn-reset brand press" data-act="home" aria-label="flock home">${SHEEP_SVG}<span class="logo">flock</span></button>
    <div class="right-tools">
      <button class="btn-reset icon-btn press" data-act="cart" aria-label="Your bag">${I.bag}${S.cart?`<span class="badge">${S.cart}</span>`:''}</button>
      <button class="btn-reset press" data-act="account" aria-label="Account" style="border-radius:50%"><span class="avatar">${S.stage>=3?'?':I.user.replace('<svg','<svg width="20" height="20" fill="none" stroke-width="2"')}</span></button>
    </div>
  </div>
  <div class="search-wrap">
    <form class="search" id="sf" role="search" autocomplete="off">
      ${I.search}
      <input id="q" type="text" enterkeyhint="search" aria-label="Search" spellcheck="false" autocomplete="off" value="${esc(S.query)}">
      <button type="button" class="btn-reset icon-btn press" data-act="clear" aria-label="Clear search">${I.x}</button>
      <button type="button" class="btn-reset icon-btn press" data-act="mic" aria-label="Search by voice">${I.mic}</button>
    </form>
    <ul class="suggest" id="sug" role="listbox" hidden></ul>
  </div>
  <nav class="tabs" aria-label="Search type">${TAB_IDS.map((id,k)=>`<button class="tab${id===curTab?' on':''}" data-tab="${id}">${tabs[k]}</button>`).join('')}</nav>`;
}

/* ---------- SERP ---------- */
function renderSerp(tab){
  if(S.queryDefault) S.query = defaultQuery();
  let body='';
  if(tab==='images') body = serpImages();
  else if(tab==='shopping') body = serpShopping();
  else if(tab==='videos') body = serpVideos();
  else if(tab==='news') body = serpNews();
  else if(tab==='forums') body = serpForums();
  else body = serpAll();
  return headerHTML() + body;
}
function chipsHTML(){
  return `<div class="chips">${CHIPS[S.stage].map(c=>`<button class="chip${S.chip===c?' on':''}" data-chip="${esc(c)}">${c}</button>`).join('')}</div>`;
}
function resultHTML(key, s){
  const r = RES[key];
  return `<article class="result${S.seen.has(r.go)?' visited':''}">
    <button class="result-link" data-go="${r.go}">
      <div class="src"><span class="fav">${r.fav}</span><span class="src-t"><span class="src-name">${r.site}</span><span class="src-url">${r.url}</span></span></div>
      <h2>${r.title(s)}</h2>
    </button>
    <p><span class="d">${r.date(s)} — </span>${r.text(s)}</p>
    ${r.links?`<div class="sitelinks">${r.links.filter(l=>l!=='Legend'||s>=1).map(l=>`<button data-go="${r.go}">${l}</button>`).join('')}</div>`:''}
  </article>`;
}
function serpAll(){
  const s=S.stage, topic=topicOf(S.query);
  const keys = TOPIC_RESULTS[topic].filter(k=>(RES[k].min||0)<=s);
  const shown = 3 + S.moreShown*2;
  const ov = OVERVIEW[topic][s];
  let dym='';
  if(topic==='other') dym = `<div class="dym">${s>=2?'Showing results for':'Did you mean:'} <button data-q="how to make kefir at home">how to make kefir at home</button>${s>=2?'<small>You meant kefir.</small>':''}</div>`;
  const meta = topic==='other' && s<2 ? `About ${(S.query.length*48211).toLocaleString('en-US')} results (0.${(S.query.length%9)+1}2 seconds)` : META[s];
  return `${chipsHTML()}${dym}<div class="meta">${meta}</div>
  <section class="overview" aria-label="Overview">
    <div class="ov-h">${I.spark}Overview</div>
    <p>${ov[0]}</p>${S.ovMore?`<p>${ov[1]}</p>`:''}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <button class="ov-more" data-act="ovmore">${S.ovMore?'Show less':'Show more'}</button>
      <div class="ov-actions">
        <button data-act="vote" data-v="1" class="${S.ovVote===1?'on':''}" aria-label="Good response">${I.up}</button>
        <button data-act="vote" data-v="-1" class="${S.ovVote===-1?'on':''}" aria-label="Bad response">${I.down}</button>
        <button data-act="copyov" aria-label="Copy">${I.copy}</button>
      </div>
    </div>
  </section>
  ${keys[0]?resultHTML(keys[0],s):''}
  ${paaHTML()}
  ${keys.slice(1,shown).map(k=>resultHTML(k,s)).join('')}
  ${shown<keys.length?`<button class="more" data-act="more">More results ${I.chev}</button>`:''}
  <section class="related"><h3>${s>=3?'people also search':'People also search for'}</h3>
    <div class="related-grid">${RELATED[s].map(q=>`<button data-q="${esc(q)}">${I.search}<span>${esc(q)}</span></button>`).join('')}</div>
  </section>`;
}
function paaHTML(){
  const items=[];
  for(let i=0;i<S.paaShown && i<Q.length;i++){
    const open=S.paaOpen.has(i);
    items.push(`<div class="item${open?' open':''}${i>=S.paaRendered?' new':''}" data-i="${i}">
      <button class="q" type="button" aria-expanded="${open}" aria-controls="a${i}" id="q${i}" data-paa="${i}">
        <span class="t">${Q[i].q}</span><span class="chev" aria-hidden="true">${I.chev}</span></button>
      <div class="a" id="a${i}" ${open?'':'hidden'}>${open?answerHTML(i):''}</div></div>`);
  }
  S.paaRendered = Math.max(S.paaRendered, Math.min(S.paaShown,Q.length));
  const h = S.stage===4 ? 'people also ask people also' : 'People also ask';
  return `<section class="paa" aria-labelledby="paaTitle">
    <div class="paa-h"><h3 id="paaTitle">${h}</h3>${I.kebab}</div>
    <div class="paa-list">${items.join('')}</div>
    <div class="fb"><button data-act="feedback">Feedback</button></div></section>`;
}
const ROT = {'o':'0','a':'ą','e':'ę','i':'ı','s':'ʂ','u':'ų','t':'ŧ','k':'ķ','n':'ŋ'};
function corrupt(html, rate){
  if(!rate) return html;
  return html.replace(/>([^<]+)</g,(m,txt)=>'>'+[...txt].map(c=>(ROT[c]&&Math.random()<rate)?ROT[c]:c).join('')+'<');
}
function answerHTML(i){
  if(S.paaHTML[i]) return S.paaHTML[i];
  const d=Q[i], s=stageOfIndex(i);
  let a=(S.loop && d.loopA)?d.loopA:d.a;
  if(!a.trim().startsWith('<')) a=`<p>${a}</p>`;
  const date = s>=3?'01 Jan 1908':s===2?'12 Oct 2015 (updated: now)':'12 Oct 2015';
  const inner = `<div class="src"><span class="fav">${d.fav}</span><span class="src-t"><span class="src-url">${d.url}</span></span></div><span class="ttl">${d.t}</span>`;
  const cite = d.go ? `<button class="cite" data-go="${esc(d.go)}">${inner}</button>` : `<div class="cite" style="cursor:default">${inner}</div>`;
  let html = corrupt('>'+`${a}<div class="when">${date}</div>`+'<', s===3?.04:s===4?.09:0).slice(1,-1) + cite;
  html = html.replace(/<div class='flock-row js-flock'><\/div>/, ()=>{ const n=9+Math.floor(Math.random()*4)+S.loop; return `<div class="flock-row" aria-label="${n} sheep">${'🐑'.repeat(n)}</div>`; })
             .replace(/<p class='js-echo'><\/p>/, `<p>${'people also ask '.repeat(48).trim()}</p>`)
             .replace(/<span class='js-depth'>20<\/span>/, `<span>${S.paaDeepest+1}</span>`);
  S.paaHTML[i]=html;
  return html;
}
function togglePAA(i){
  const wasOpen = S.paaOpen.has(i);
  if(wasOpen) S.paaOpen.delete(i); else S.paaOpen.add(i);
  const item = app.querySelector(`.item[data-i="${i}"]`);
  if(!wasOpen){
    S.paaShown = Math.max(S.paaShown, Math.min(Q.length, i+5));
    const deeper = i > S.paaDeepest;
    if(deeper) S.paaDeepest = i;
    const before = S.stage;
    if(deeper){ const s=computeStage(); if(s!==before){ S.stage=s; applyStage(); render({keepScroll:true}); updateStatus(); const b=document.getElementById('q'+i); if(b) b.focus({preventScroll:true}); return; } }
    updateStatus();
  }
  // patch in place
  if(item){
    const ans=item.querySelector('.a'), btn=item.querySelector('.q');
    if(!wasOpen){ ans.innerHTML=answerHTML(i); }
    ans.hidden = wasOpen; item.classList.toggle('open', !wasOpen); btn.setAttribute('aria-expanded', String(!wasOpen));
  }
  // append newly revealed questions
  const list = app.querySelector('.paa-list');
  if(list){
    for(let k=list.children.length;k<S.paaShown && k<Q.length;k++){
      const div=document.createElement('div'); div.className='item new'; div.dataset.i=k;
      div.innerHTML=`<button class="q" type="button" aria-expanded="false" aria-controls="a${k}" id="q${k}" data-paa="${k}"><span class="t">${Q[k].q}</span><span class="chev" aria-hidden="true">${I.chev}</span></button><div class="a" id="a${k}" hidden></div>`;
      list.appendChild(div);
    }
    S.paaRendered = list.children.length;
  }
}

/* ---------- images ---------- */
function visibleImages(){
  const s=S.stage;
  let list = IMGS.filter(x=>x.min<=s);
  if(s>=2) list = list.slice().sort((a,b)=>(b.min>=s-1)-(a.min>=s-1));
  return list;
}
function imgCard(o, W=300){
  return `<button class="img-card" data-go="img:${o.id}">
    <span class="thumb">${imgTag(o,W)}</span>
    <span class="cap"><span class="fav">${o.fav}</span><span>${o.site}</span></span>
    <span class="ttl">${o.t}</span></button>`;
}
function serpImages(){
  return `<div class="chips">${['All','Sheep','Grains','Bottle','Bag'].concat(S.stage>=2?['Tiles']:[]).map(c=>`<button class="chip${(S.imgFilter||'All')===c?' on':''}" data-imgfilter="${c}">${c}</button>`).join('')}</div>
  <div class="img-grid">${visibleImages().filter(imgFilterFn).map(o=>imgCard(o)).join('')}</div>`;
}
function imgFilterFn(o){
  const f=S.imgFilter||'All'; if(f==='All') return true;
  const m={Sheep:['field','lambs','wall','flockdark','corridor'],Grains:['grains','jar','glass','shot'],Bottle:['photo','glass','jar'],Bag:['bag','bag48','scan'],Tiles:['tiles','youwere','corridor']};
  return (m[f]||[]).includes(o.id);
}
function renderViewer(id){
  const o = imgById(id) || IMGS[0];
  visit('img:'+id);
  const rel = visibleImages().filter(x=>x.id!==id).slice(0,3);
  const big = o.asset ? `<img src="${ASSET[o.asset]}" alt="${esc(o.t)}">` : canvasFor({...o, darkOverride:imgDark(o)}, 720);
  const voidNote = id==='void' ? `<p style="margin:0;color:var(--soft)">0 bytes. Not taken yet.</p>` : '';
  return `<div class="topbar" style="padding-top:6px">
      <button class="btn-reset icon-btn press" data-act="back" aria-label="Close">${I.x}</button>
      <span style="font-size:14px;color:var(--soft)">${S.stage>=3?'it is looking back':'flock Images'}</span>
      <button class="btn-reset icon-btn press" data-act="share" aria-label="Share">${I.share}</button></div>
    <div class="viewer-img">${big}</div>
    <div class="src"><span class="fav">${o.fav}</span><span class="src-t"><span class="src-name">${o.site}</span></span></div>
    <h2 style="margin:0;font-size:20px;font-weight:400">${o.t}</h2>${voidNote}
    <div class="viewer-actions">
      <button class="pill primary press" data-go="${o.go}">${I.ext} Visit</button>
      <button class="pill press" data-act="saveimg">${S.stage>=2?'Keep it':'Save'}</button>
      <button class="pill press" data-act="share">${I.share} Share</button>
    </div>
    ${rel.length?`<h3 style="margin:8px 0 0;font-size:16px;font-weight:500">Related images</h3><div class="strip">${rel.map(x=>imgCard(x,200)).join('')}</div>`:''}`;
}

/* ---------- shopping ---------- */
function serpShopping(){
  const s=S.stage;
  const list = PRODUCTS.filter(p=>(p.min||0)<=s);
  return `<div class="meta">${s>=2?'Sponsored · Some items are already in your bag':'Sponsored · Prices may vary'}</div>
  <div class="prod-grid">${list.map(p=>`<button class="prod" data-go="product:${p.id}">
    <span class="thumb">${canvasFor({p:p.p,seed:p.seed,h:1,darkOverride:imgDark({})},300)}</span>
    <span class="pt">${p.t}</span><span class="pp">${p.price}</span>
    <span class="ps">${p.seller} · <span class="stars">★ ${p.rating}</span></span></button>`).join('')}</div>`;
}

/* ---------- videos ---------- */
function serpVideos(){
  const s=S.stage;
  return `<div class="img-grid" style="columns:1">${VIDEOS.filter(v=>v.min<=s).map(v=>`<button class="img-card" data-go="video:${v.id}">
    <span class="thumb">${canvasFor({p:v.p,seed:v.seed,h:9/16,darkOverride:Math.max(v.dark||0,imgDark({}))},640)}${v.live?'<span class="live">LIVE</span>':`<span class="dur">${v.dur}</span>`}</span>
    <span class="ttl" style="font-size:16px">${v.t}</span>
    <span class="cap"><span class="fav">${v.chav}</span><span>${v.ch} · ${v.views} · ${v.ago}</span></span></button>`).join('')}</div>`;
}

/* ---------- news ---------- */
function serpNews(){
  const s=S.stage;
  return `<div class="news-list">${NEWS.filter(n=>n.min<=s).slice().reverse().map(n=>`<button class="news-item" data-go="news:${n.id}">
    <span><span class="ns"><span class="fav">${n.fav}</span>${n.src}</span><span class="nt" style="display:block">${n.t}</span><span class="nd">${n.ago}</span></span>
    ${canvasFor({p:n.p,seed:n.seed,h:1,darkOverride:Math.max(n.dark||0,imgDark({}))},184)}</button>`).join('')}</div>`;
}

/* ---------- forums ---------- */
function serpForums(){
  const s=S.stage;
  return `<div>${Object.entries(THREADS).filter(([,t])=>t.min<=s).map(([id,t])=>`<button class="thread-row" data-go="thread:${id}">
    <span class="tm">${t.forum} · ${t.meta}</span><span class="tt">${t.title}</span>
    <span class="tx">${esc(t.posts.filter(p=>p.min<=s).slice(-1)[0].b)}</span></button>`).join('')}</div>`;
}

/* ---------- pages ---------- */
let pageTitle='';
function sitebar(url){
  return `<div class="sitebar">
    <button class="btn-reset icon-btn press" data-act="back" aria-label="Back">${I.back}</button>
    <div class="addr">${I.lock}<span>${url}</span></div>
    <button class="btn-reset icon-btn press" data-act="share" aria-label="Share">${I.share}</button></div>`;
}
function renderPage(id, arg){
  const s=S.stage;
  const key = arg ? `${id}:${arg}` : id;
  visit(key);
  const fn = PAGES[id] || PAGES.notfound;
  const out = fn(s, arg);
  pageTitle = out.title;
  return sitebar(out.url) + `<div class="site ${out.cls||''}">${out.html}</div>`;
}
function pageLabel(id,arg){
  if(id==='thread') return (THREADS[arg]||{}).title||'thread';
  if(id==='product') return (PRODUCTS.find(p=>p.id===arg)||{}).t||'product';
  if(id==='video') return (VIDEOS.find(p=>p.id===arg)||{}).t||'video';
  if(id==='news') return (NEWS.find(p=>p.id===arg)||{}).t||'news';
  return ({wiki:'Kefir - Milk Wiki',guide:"Kefir at home - Sheep Corner",blog:'kefir mama',farm:'Farm Handbook',archive:'scan_0012',onion:'index of /bag/'})[id]||id;
}
const lnk = (target, text) => `<button class="lnk" data-go="${target}">${text}</button>`;
const PAGES = {
  wiki(s){
    const legend = s>=1 ? `<h2 id="legend">Legend</h2>
      <p>According to one legend, the first grains were made in the mountains by shepherds who used a ${lnk('product:bag','goatskin bag')} that had to be shaken every hour for 48 hours.${s>=2?` A young sheep was involved.<button class="sup" data-go="archive">[citation needed]</button>`:''}</p>
      ${s>=2?`<p>Discussion of this legend on ${lnk('thread:4471','cheesetalk.org')} was locked by moderators.</p>`:''}
      ${s>=3?`<p><span class="redact">██████████████████ ███████ ████ ███████████</span>. The sheep did not know.</p>`:''}` : '';
    return {title:'Kefir - Milk Wiki', url:'milkwiki.org/wiki/Kefir', cls:'site-wiki', html:`
      ${s>=3?'<div class="banner">This page is protected. It is being watched by 1 user.</div>':''}
      <h1>Kefir</h1><div class="from">From Milk Wiki, the free encyclopedia</div>
      <div class="infobox"><div class="ib-t">Kefir</div>${canvasFor({p:'glass',seed:4,h:.9,darkOverride:imgDark({})},420)}
        <table><tr><th>Type</th><td>Fermented milk drink</td></tr><tr><th>Origin</th><td>North Caucasus</td></tr>
        <tr><th>Main ingredients</th><td>Milk, kefir grains${s>=2?', <span class="redact">█████</span>':''}</td></tr><tr><th>First recorded</th><td>${s>=2?'1908':'19th century'}</td></tr></table></div>
      <p><b>Kefir</b> is a fermented milk drink made by adding kefir grains to milk. The grains are a living culture of bacteria and yeast held together by proteins and sugars. ${lnk('img:grains','Kefir grains')} grow as they ferment and can be passed on indefinitely.</p>
      <div class="toc"><b>Contents</b><ol><li>Production</li><li>History</li>${s>=1?'<li>Legend</li>':''}<li>See also</li></ol></div>
      <h2>Production</h2><p>Grains are added to fresh milk and left at room temperature for about 24 hours. The grains are strained out and moved to fresh milk. ${lnk('guide','A beginner\'s guide')} is available.</p>
      <h2>History</h2><p>Kefir has been made in the Caucasus for centuries. Grains were traditionally passed from family to family and were rarely sold.${s>=1?' Nobody quite remembers where the first ones came from.':''}</p>
      ${legend}
      <h2>See also</h2><p>${lnk('farm','Sheep behavior')} · ${lnk('blog','Naming your grain')} · ${lnk('tab:images','Images of kefir')}${s>=2?' · '+lnk('onion','/bag/'):''}</p>`};
  },
  guide(s){
    const steps = [
      ['Get fresh milk','Whole milk works best. Cow, goat or sheep milk are all fine.'],
      ['Add the grains','About one tablespoon of grains per cup of milk.'],
      ['Wait about 24 hours',s>=2?'Keep the jar warm. Keep the jar company. Do not leave the room for long.':'Cover the jar with a cloth and keep it at room temperature.'],
      ['Strain and repeat','Move the grains to fresh milk. Enjoy your kefir!'],
      [s>=2?'Do not thank the sheep':'Thank the sheep 🐑', s>=2?'It hears you.':'Not strictly necessary, but it is nice.']
    ];
    return {title:"Kefir at home - Sheep Corner", url:'sheepcorner.com/kefir', cls:'site-blog', html:`
      <div class="blog-h"><span class="blog-name">Sheep Corner</span><span class="blog-sub">recipes, sheep & slow living</span></div>
      <h1>${RES.guide.title(s)}</h1><div class="post-meta">3 Mar 2019 · 4 min read</div>
      <figure>${canvasFor({p:'field',seed:3,h:.6,darkOverride:imgDark({})},640)}<figcaption>${s>=2?'They are not looking at the camera.':'Our sheep, Dolly and friends, supervising.'}</figcaption></figure>
      <p>Making kefir at home is easy and fun. All you need is milk, a jar and ${lnk('product:grains','live kefir grains')}.</p>
      <ol style="display:flex;flex-direction:column;gap:10px;padding-left:22px;margin:0">${steps.map(([a,b])=>`<li><b style="font-weight:500">${a}.</b> ${b}</li>`).join('')}</ol>
      <p>Questions? Ask in the ${lnk('thread:812','Home Cultures forum')}.${s>=1?` Curious where grains come from? Read ${lnk('thread:4471','this thread')}.`:''}</p>`};
  },
  blog(s){
    const replies = ['aww thank you sweetie 💛 bobby says hi','thank you 💛 have you shaken yours today?','you came back. bobby is heavier today.','we read everything you write here. we read it before you wrote it.','shake the bag.'];
    const base = [
      {u:'milk_and_honey',av:'M',d:'2 days ago',b:'Bobby is adorable!! Mine is called Pearl 🥹'},
      {u:'curdnerd',av:'C',d:'1 day ago',b:'Great tips. Change the milk daily, people!'},
    ].concat(s>=1?[{u:'old_shepherd',av:'O',d:'5 hours ago',b:'Have you told them where Bobby came from?'}]:[])
     .concat(s>=2?[{u:'kefir_mama',av:'🫙',d:'5 hours ago',b:'not yet 💛',reply:true}]:[]);
    const all = base.concat(S.blog);
    return {title:'kefir mama', url:'kefirmama.blog/bobby', cls:'site-blog', html:`
      <div class="blog-h"><span class="blog-name">kefir mama</span><span class="blog-sub">a little blog about living cultures 🫙</span></div>
      <h1>${RES.blog.title(s)}</h1><div class="post-meta">14 Feb 2024 · by kefir_mama${s>=2?' · last seen 1971':''}</div>
      <figure>${canvasFor({p:'grains',seed:5,h:.75,darkOverride:imgDark({})},640)}<figcaption>Bobby, ${s>=2?'heavier':'one year old'}.</figcaption></figure>
      <p>A whole year with my little grain! Bobby came to me in a jar of milk from a friend, who got him from a friend, who got him from ${s>=1?'someone nobody remembers':'a friend'}.</p>
      <p>Feed your grain fresh milk every day. Talk to it. ${s>=2?'It grows when it is loved. It grows when it is fed. Sometimes these are the same thing.':'Grains like a calm, warm kitchen.'}</p>
      <p>${s>=1?`If you have a goatskin bag, shake it every hour. ${lnk('product:bag','I got mine here.')}`:`You can ${lnk('product:grains','get your own grains here')}.`}</p>
      <section class="comments" id="comments"><h3>Comments (${(1371+S.blog.length+(s>=2?1:0)).toLocaleString('en-US')})</h3>
        ${all.map(c=>`<div class="cmt${c.you?' you':''}${c.reply?' reply':''}${c.typing?' typing':''}"><span class="av">${c.av}</span><div class="body"><span class="who">${esc(c.u)} <span>· ${c.d}</span></span><p>${c.typing?'typing…':esc(c.b)}</p></div></div>`).join('')}
        <form class="form-row" data-form="blog"><label for="blogc" style="font-size:14px;font-weight:500">Leave a comment</label>
          <textarea id="blogc" rows="3" placeholder="${s>=2?'bobby is listening':'Say something nice to Bobby'}" required></textarea>
          <button class="pill primary press" type="submit" style="align-self:flex-start">Post comment</button></form>
      </section>`, replies};
  },
  thread(s, id){
    const t = THREADS[id] || THREADS['4471'];
    const mine = S.forum[id]||[];
    const locked = S.forumLocked[id];
    const posts = t.posts.filter(p=>p.min<=s).concat(mine);
    return {title:t.title, url:`${t.forum.toLowerCase().replace(/\s+/g,'')}${t.forum.includes('.')?'':'.forum'}/thread/${id}`, cls:'site-forum', html:`
      <div class="forum-h">${t.forum} › Fermentation › General</div>
      <h1>${t.title}</h1><div style="font-size:13px;color:var(--soft);margin-top:-8px">${t.meta}</div>
      ${posts.map((p,k)=>`<article class="post${p.del?' deleted':''}${p.you?' you':''}">
        <div class="post-head"><b>${esc(p.u)}</b><span>#${k+1} · ${p.d}</span></div>
        <div class="post-body"><p>${p.typing?'<i style="color:var(--soft)">typing…</i>':esc(p.b)}</p>${p.img?`<button class="btn-reset" data-go="img:${p.img}" aria-label="Open attachment"><img src="${ASSET[imgById(p.img).asset]}" alt="attachment"></button>`:''}</div></article>`).join('')}
      ${locked?`<div class="locked-note">This thread has been locked by a moderator.</div>`:`<form class="form-row" data-form="thread" data-id="${id}"><label for="fr" style="font-weight:500">Reply</label>
        <textarea id="fr" rows="3" placeholder="${s>=2?'they will read it':'Write a reply…'}" required></textarea>
        <button class="pill primary press" type="submit" style="align-self:flex-start">Post reply</button></form>`}
      <p style="font-size:13px;color:var(--soft)">Related: ${Object.entries(THREADS).filter(([k,x])=>k!==id&&x.min<=s).map(([k,x])=>lnk('thread:'+k,x.title)).join(' · ')}</p>`};
  },
  farm(s){
    const rows = [
      ['Grazing','Normal. Sheep graze for up to 10 hours a day.'],
      ['Flocking','Normal. Sheep feel safe close to each other.'],
      ['Resting in shade','Normal in warm weather.'],
      ['Standing facing a wall','Usually heat-related. Harmless.'+(s>=2?' They are not looking at the house.':'')],
      ...(s>=1?[['Standing facing a wall at night','Uncommon. Count them.']]:[]),
      ...(s>=2?[['Turning around','Do not make eye contact.']]:[]),
      ...(s>=3?[['Facing the house','There should be eight.']]:[])
    ];
    return {title:"Sheep behavior - Farm Handbook", url:'farmhandbook.org/sheep/behavior', cls:'site-farm', html:`
      <h1>Sheep behavior: a farmer's handbook</h1>
      <figure>${canvasFor({p:s>=3?'flockdark':'wall',seed:6,h:.55,darkOverride:imgDark({})},640)}<figcaption>${s>=3?'Night, 03:12. Eight.':'Sheep resting by a barn wall.'}</figcaption></figure>
      <p>Sheep are calm, social animals. Most of what they do is easy to read once you know the signs.</p>
      <div class="tbl"><table><thead><tr><th>Behavior</th><th>What it means</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div>
      <p>See also: ${lnk('video:wall','Video: sheep facing the wall')} · ${lnk('news:farm','In the news')}</p>`};
  },
  archive(s){
    return {title:'scan_0012', url:'archive.flock/scan_0012', cls:'site-archive', html:`
      <h1>scan_0012.jpg</h1><div style="color:var(--soft)">Household recipe book · dated 1908 · page 12 · 1 of 1 surviving</div>
      <figure>${canvasFor({p:'scan',seed:12,h:1.35,darkOverride:imgDark({})},640)}<figcaption>Scan quality: poor. The drawing at the bottom is clear.</figcaption></figure>
      <h2 style="font-size:16px;margin:0">Transcription</h2>
      <div class="transcript">Take a young one, before it knows.<br>${s>=2?'<span class="redact">██████████ ████ ██████</span>':'[illegible]'}<br>Into the bag with the milk. Hang it by the door.<br>Shake it every hour. Forty-eight times.<br>${s>=1?'It will ask for more. Give it more.':'[illegible]'}<br>${s>=3?'It will smile.':''}</div>
      <p>Mirrors: ${lnk('onion','/bag/')}${s>=2?' · '+lnk('news:archive','press')+'':''}</p>`};
  },
  onion(s){
    const files = [['bag_0001.jpg','12 KB','bag'],['bag_0002.jpg','12 KB','bag'],['bag_0003.jpg','13 KB','bag'],['… 44 more','',''],['bag_0048.jpg','48 KB','bag48'],['notes.txt','1 KB','notes'],['you.jpg','0 B','void']];
    return {title:'index of /bag/', url:'xq7mh2kd.onion/bag/', cls:'site-onion', html:`
      <h1>index of /bag/</h1>
      <div class="listing">${files.map(([n,sz,t])=>t?`<button data-act="file" data-f="${t}"><span>${n}</span><span>${n==='you.jpg'?'modified: now':sz}</span></button>`:`<div style="padding:8px 2px;color:var(--soft);border-bottom:1px solid var(--line)">${n}</div>`).join('')}</div>
      <pre id="notes" hidden style="white-space:pre-wrap;background:var(--surface);padding:12px;border-radius:6px;margin:0">hour 01. shook it.\nhour 02. shook it.\nhour 13. it is warm.\nhour 31. it moved by itself.\nhour 47. it said my name.\nhour 48. it is still asking.</pre>
      <p style="color:var(--soft)">Apache Server at xq7mh2kd.onion Port 80</p>`};
  },
  product(s, id){
    const p = PRODUCTS.find(x=>x.id===id) || PRODUCTS[0];
    const out = p.out && !(s>=3 && id==='sheep');
    return {title:p.t, url:'flock.shopping/'+id, cls:'site-shop', html:`
      <div class="prod" style="cursor:default"><span class="thumb">${canvasFor({p:p.p,seed:p.seed,h:.85,darkOverride:imgDark({})},640)}</span></div>
      <div style="font-size:13px;color:var(--soft)">${p.seller}</div>
      <h1>${p.t}</h1>
      <div class="stars">★★★★★ <span>${p.rating} (${p.reviews})</span></div>
      <div class="price">${p.price}<small>${s>=2?'Free shipping. It is already on its way.':'Free shipping over €30'}</small></div>
      <div class="stock${out?' out':''}">${p.stock(s)}</div>
      <div class="viewer-actions">
        <button class="pill primary press" data-act="addcart" data-p="${p.id}" ${out?'disabled':''}>${I.bag} ${id==='sheep'&&s>=3?'Reserve':'Add to bag'}</button>
        <button class="pill press" data-act="share">${I.share} Share</button></div>
      <p>${p.desc(s)}</p>
      ${p.revs(s).length?`<h2 style="font-size:16px;font-weight:500;margin:0">Reviews</h2>`+p.revs(s).map(r=>`<div class="review"><b>${esc(r[0])}</b><span class="stars">${r[1]}</span><span>${esc(r[2])}</span></div>`).join(''):''}
      <p style="font-size:13px;color:var(--soft)">More from flock Shopping: ${PRODUCTS.filter(x=>x.id!==id&&(x.min||0)<=s).map(x=>lnk('product:'+x.id,x.t)).join(' · ')}</p>`};
  },
  video(s, id){
    const v = VIDEOS.find(x=>x.id===id) || VIDEOS[0];
    const comments = [['milk_and_honey','So relaxing 💛'],['curdnerd','Change the milk daily!']].concat(s>=1?[['old_shepherd','Watch until the end.']]:[]).concat(s>=3?[['[unknown]','i can see you watching']]:[]);
    return {title:v.t, url:'flock.video/watch?v='+id, cls:'site-video', html:`
      <div class="player"><canvas id="vid" width="640" height="360" aria-label="Video: ${esc(v.t)}"></canvas>
        <div class="ctrl"><button data-act="vplay" aria-label="Pause">${I.pause}</button><span id="vt">0:00</span><span class="bar"><i id="vbar"></i></span><span>${v.live?'<b style="color:#f33">● LIVE</b>':v.dur}</span></div></div>
      <div class="vid-meta"><h1>${v.t}</h1><div class="views">${v.views} · ${v.ago}</div></div>
      <div class="channel"><span class="av">${v.chav}</span><span class="cn">${v.ch}<span>${v.subs} subscribers</span></span>
        <button class="pill ${S.subscribed?'':'primary'} press" data-act="subscribe">${S.subscribed?(s>=2?'Subscribed. Forever.':'Subscribed'):'Subscribe'}</button></div>
      <div class="desc">${v.desc}</div>
      <section class="comments"><h3>Comments</h3>${comments.map(c=>`<div class="cmt"><span class="av">${esc(c[0][0].toUpperCase())}</span><div class="body"><span class="who">${esc(c[0])}</span><p>${esc(c[1])}</p></div></div>`).join('')}</section>
      <p style="font-size:13px;color:var(--soft)">Up next: ${VIDEOS.filter(x=>x.id!==id&&x.min<=s).map(x=>lnk('video:'+x.id,x.t)).join(' · ')}</p>`, video:v};
  },
  news(s, id){
    const n = NEWS.find(x=>x.id===id) || NEWS[0];
    return {title:n.t, url:n.src.toLowerCase().replace(/\s+/g,'')+'.news/'+id, cls:'site-news', html:`
      <div class="byline">${n.fav} ${n.src} · ${n.ago}</div>
      <h1>${n.t}</h1>
      <figure>${canvasFor({p:n.p,seed:n.seed,h:.6,darkOverride:Math.max(n.dark||0,imgDark({}))},640)}</figure>
      ${n.body.map(b=>`<p>${b}</p>`).join('')}
      <p style="font-family:var(--f-body);font-size:13px;color:var(--soft)">More news: ${NEWS.filter(x=>x.id!==id&&x.min<=s).map(x=>lnk('news:'+x.id,x.t)).join(' · ')}</p>`};
  },
  notfound(){ return {title:'Not found', url:'404', html:`<div class="empty"><b>This page is gone.</b><span>It was here a moment ago.</span></div>`}; }
};

/* ---------- after render: video loop ---------- */
let vidPlaying = true;
function afterRender(v){
  if(v.type==='page' && v.id==='video'){
    const vd = VIDEOS.find(x=>x.id===v.arg) || VIDEOS[0];
    startVideo(vd);
  }
  if(v.type==='page' && v.id==='blog' && S.scrollComments){ S.scrollComments=false; const c=document.getElementById('comments'); if(c) c.scrollIntoView(); }
}
function startVideo(vd){
  const cv=document.getElementById('vid'); if(!cv) return;
  const ctx=cv.getContext('2d'), w=cv.width, h=cv.height;
  const base=document.createElement('canvas'); base.width=w; base.height=h;
  base.dataset.paint=vd.p; base.dataset.seed=vd.seed; base.dataset.dark=Math.max(vd.dark||0,imgDark({})); paint(base);
  const noise=[0,1,2].map(()=>{ const c=document.createElement('canvas'); c.width=160; c.height=90; const x=c.getContext('2d'); const im=x.createImageData(160,90); for(let i=0;i<im.data.length;i+=4){ const n=Math.random()*255; im.data[i]=im.data[i+1]=im.data[i+2]=n; im.data[i+3]=40; } x.putImageData(im,0,0); return c; });
  let t0=performance.now(), elapsed=0, last=t0; vidPlaying=true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=(now)=>{
    if(vidPlaying) elapsed += Math.max(0,(now-last)/1000); last=Math.max(last,now);
    const t=elapsed;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
    ctx.save();
    if(!reduce){
      if(vd.motion==='sway'){ ctx.translate(w/2,0); ctx.rotate(Math.sin(t*1.3)*.035); ctx.translate(-w/2,0); }
      else if(vd.motion==='pulse'){ const k=1+Math.sin(t*.9)*.015; ctx.translate(w/2,h/2); ctx.scale(k,k); ctx.translate(-w/2,-h/2); }
      else if(vd.motion==='shake'){ ctx.translate(Math.sin(t*7)*1.2,Math.cos(t*5)*1.2); }
    }
    ctx.drawImage(base,0,0); ctx.restore();
    ctx.globalAlpha=.5+.3*(S.stage/4); ctx.drawImage(noise[Math.floor(t*12)%3],0,0,w,h); ctx.globalAlpha=1;
    if(vd.live||S.stage>=3){ ctx.fillStyle='rgba(255,40,40,.9)'; if(Math.floor(t*2)%2===0){ ctx.beginPath(); ctx.arc(24,24,7,0,7); ctx.fill(); } ctx.fillStyle='#fff'; ctx.font='14px "Roboto Mono",monospace'; ctx.fillText(vd.live?'LIVE':'REC',38,29); }
    const vt=document.getElementById('vt'), vb=document.getElementById('vbar');
    if(vt){ const tt=Math.floor(t); vt.textContent = vd.live ? 'now' : `${Math.floor(tt/60)}:${String(tt%60).padStart(2,'0')}`; }
    if(vb && vd.secs){ vb.style.width = Math.min(100, t/vd.secs*100)+'%'; }
    rafId=requestAnimationFrame(tick);
  };
  rafId=requestAnimationFrame(tick);
}

/* ======================= overlays ======================= */
function closeOverlay(){ overlay.innerHTML=''; document.body.classList.remove('locked'); }
function openDrawer(){
  const s=S.stage;
  const fmt=d=>d.toTimeString().slice(0,5);
  let entries = S.history.slice().reverse().map(h=>({...h, time:fmt(h.t)}));
  if(s>=3){
    const fake=[{time:'03:12',label:'how to open a sheep gently',notyou:true,target:'q:how to open a sheep gently'},{time:'03:13',label:'is the bag supposed to be warm',notyou:true,target:'q:is the bag supposed to be warm'},{time:'03:48',label:'index of /bag/',notyou:true,target:'onion'}];
    entries = fake.concat(entries);
  }
  overlay.innerHTML = `<div class="scrim" data-act="closeov"></div>
    <aside class="drawer" role="dialog" aria-label="History">
      <div style="display:flex;align-items:center;justify-content:space-between"><span class="logo" style="font-size:22px">flock</span><button class="btn-reset icon-btn press" data-act="closeov" aria-label="Close">${I.x}</button></div>
      <h3>${s>=3?'history (not all of it is yours)':'Your history'}</h3>
      <div class="hist">${entries.length?entries.map(e=>`<button data-go="${esc(e.target||'')}" data-closeov="1"><time>${e.time}</time><span class="${e.notyou?'notyou':''}">${esc(e.label)}${e.notyou?'<small>searched from this device</small>':''}</span></button>`).join(''):'<p style="color:var(--soft);font-size:14px;margin:0">Nothing yet. Search for something.</p>'}</div>
      <h3>Settings</h3>
      <button class="pill press" data-act="clearhist">${s>=2?'Clear history (it remembers anyway)':'Clear history'}</button>
    </aside>`;
  document.body.classList.add('locked');
}
function openAccount(){
  const s=S.stage;
  overlay.innerHTML = `<div class="scrim" data-act="closeov" style="background:transparent"></div>
    <div class="pop" role="dialog" aria-label="Account">
      <span class="avatar">${s>=3?'?':'🐑'}</span>
      <b style="font-weight:500">${s>=3?'Signed in as: the flock':'Hi there!'}</b>
      <p>${s>=3?'1 of 8. There should be eight.':s>=2?'You have been signed in for 48 hours.':'Signed in on this device.'}</p>
      <button class="pill press" data-act="closeov">${s>=2?'You cannot sign out':'Close'}</button></div>`;
}
let toastT=0;
function toast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600);
}

/* ======================= events ======================= */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-paa],[data-go],[data-q],[data-tab],[data-act],[data-chip],[data-imgfilter],[data-sug]');
  if(!el) { if(!e.target.closest('#sf,#sug')) hideSug(); return; }
  if(el.dataset.paa!=null){ togglePAA(+el.dataset.paa); return; }
  if(el.dataset.sug!=null){ hideSug(); runSearch(el.dataset.sug); return; }
  if(el.dataset.closeov){ closeOverlay(); }
  if(el.dataset.go!=null){ e.preventDefault(); if(el.dataset.go) navTo(el.dataset.go); return; }
  if(el.dataset.q!=null){ runSearch(el.dataset.q); return; }
  if(el.dataset.tab){ setTab(el.dataset.tab); return; }
  if(el.dataset.chip){ chipClick(el.dataset.chip); return; }
  if(el.dataset.imgfilter){ S.imgFilter=el.dataset.imgfilter; render({keepScroll:true}); return; }
  const a = el.dataset.act; if(!a) return;
  const s=S.stage;
  switch(a){
    case 'home': S.queryDefault=true; S.chip=null; S.moreShown=0; S.stack=[]; S.cur={type:'serp',tab:'all'}; render({top:true}); break;
    case 'back': back(); break;
    case 'menu': openDrawer(); break;
    case 'account': openAccount(); break;
    case 'closeov': closeOverlay(); break;
    case 'clearhist': S.history=[]; closeOverlay(); toast(s>=2?'History cleared. It remembers anyway.':'History cleared'); break;
    case 'cart': toast(S.cart? (s>=3?'Your bag is shaking.':s>=2?`Your bag: ${S.cart} item${S.cart>1?'s':''}. It is warm.`:`Your bag: ${S.cart} item${S.cart>1?'s':''}`) : (s>=2?'Your bag is empty. For now.':'Your bag is empty')); break;
    case 'clear': { const q=document.getElementById('q'); q.value=''; q.focus(); showSug(''); break; }
    case 'mic': toast(s>=2?'We already heard you.':'Voice search isn’t available here'); break;
    case 'more': S.moreShown++; visit('more'+S.moreShown); render({keepScroll:true}); break;
    case 'ovmore': S.ovMore=!S.ovMore; render({keepScroll:true}); break;
    case 'vote': S.ovVote = (+el.dataset.v===S.ovVote)?0:+el.dataset.v; render({keepScroll:true}); toast(S.ovVote===-1?(s>=2?'Feedback noted. It will remember.':'Thanks for your feedback'):S.ovVote===1?'Thanks for your feedback':'Feedback removed'); break;
    case 'copyov': copyText(document.querySelector('.overview p')?.textContent||''); break;
    case 'feedback': toast(s>=2?'Thank you. We already knew.':'Thanks for your feedback'); break;
    case 'share': copyText(location.href, s>=2?'Link copied. Send it to someone. It gets lonely.':'Link copied'); break;
    case 'saveimg': toast(s>=2?'Saved. It will stay with you.':'Saved to your collection'); break;
    case 'addcart': S.cart++; visit('cart'+S.cart); toast(el.dataset.p==='sheep'?'Reserved. It does not know yet.':s>=2?'Added. Your bag is getting heavier.':'Added to your bag'); render({keepScroll:true}); break;
    case 'subscribe': S.subscribed=!S.subscribed || s>=2; render({keepScroll:true}); if(s>=2) toast('You cannot unsubscribe.'); break;
    case 'vplay': vidPlaying=!vidPlaying; el.innerHTML = vidPlaying?I.pause:I.play; el.setAttribute('aria-label', vidPlaying?'Pause':'Play'); if(!vidPlaying && s>=2) toast('It keeps playing when you are not watching.'); break;
    case 'file': fileClick(el.dataset.f); break;
    case 'shake': shake(); break;
  }
});
function chipClick(c){
  const s=S.stage, lc=c.toLowerCase();
  if(['buy','price','online','bag'].includes(lc) && s<4){ S.chip=c; setTab('shopping'); return; }
  if(lc==='reviews'){ S.chip=c; setTab('forums'); return; }
  const base = defaultQuery().replace(/ at home.*$/,'');
  runSearch(lc==='dog'?'kefir for dogs':lc==='sheep'?'how many sheep to make kefir':lc==='legend'?'kefir grains legend':lc==='wall'?'why do sheep face the wall':lc==='smell'?'kefir smells like sheep':lc==='recipe'?'how to make kefir at home':`${base} ${lc}`, c);
}
function fileClick(f){
  if(f==='notes'){ const n=document.getElementById('notes'); n.hidden=!n.hidden; visit('notes'); return; }
  navTo('img:'+f);
}
function copyText(t, msg='Copied'){
  try{ navigator.clipboard.writeText(t).then(()=>toast(msg),()=>toast(msg)); }catch(e){ toast(msg); }
}

/* forms */
document.addEventListener('submit', e => {
  const f=e.target;
  if(f.id==='sf'){ e.preventDefault(); hideSug(); runSearch(document.getElementById('q').value); document.getElementById('q')?.blur(); return; }
  if(f.dataset.form==='blog'){
    e.preventDefault(); const ta=f.querySelector('textarea'); const text=ta.value.trim(); if(!text) return;
    S.blog.push({u:'you',av:'Y',d:'just now',b:text,you:true});
    const reply={u:'kefir_mama',av:'🫙',d:'just now',b:'',reply:true,typing:true}; S.blog.push(reply);
    visit('comment'+S.blog.length); S.scrollComments=true; render({keepScroll:true});
    const replies=['aww thank you sweetie 💛 bobby says hi','thank you 💛 have you shaken yours today?','you came back. bobby is heavier today.','we read everything you write here. we read it before you wrote it.','shake the bag.'];
    setTimeout(()=>{ reply.typing=false; reply.b=replies[S.stage]; if(S.cur.type==='page'&&S.cur.id==='blog') render({keepScroll:true}); }, 2400);
    return;
  }
  if(f.dataset.form==='thread'){
    e.preventDefault(); const id=f.dataset.id; const ta=f.querySelector('textarea'); const text=ta.value.trim(); if(!text) return;
    (S.forum[id]=S.forum[id]||[]).push({u:'you',d:'just now',b:text,you:true,min:0});
    visit('post:'+id+(S.forum[id].length)); render({keepScroll:true});
    const s=S.stage;
    setTimeout(()=>{
      if(s>=2){ S.forumLocked[id]=true; if(s>=3) S.forum[id].push({u:'kefir_mama',d:'just now',b:'you should not have posted here 💛',min:0}); }
      else S.forum[id].push({u:'old_shepherd',d:'just now',b:'Welcome to the forum. Please read the rules before posting. And keep shaking.',min:0});
      if(S.cur.type==='page'&&S.cur.id==='thread'&&S.cur.arg===id) render({keepScroll:true});
    }, 2600);
  }
});

/* search suggestions */
let sugIdx=-1, sugItems=[];
function hideSug(){ const u=document.getElementById('sug'); if(u){ u.hidden=true; document.getElementById('sf')?.classList.remove('open'); } sugIdx=-1; }
function showSug(val){
  const u=document.getElementById('sug'); if(!u) return;
  const s=S.stage, v=val.toLowerCase().trim();
  let pool=[]; for(let k=0;k<=s;k++) pool=pool.concat(SUGG[k]);
  let items = v ? pool.filter(p=>p.includes(v)) : pool.slice(-6).reverse();
  if(s>=3 && v){ items = [SUGG[Math.min(s,4)][Math.floor(Math.random()*SUGG[Math.min(s,4)].length)]].concat(items.filter(x=>!SUGG[3].includes(x))); }
  items = [...new Set(items)].slice(0,7);
  if(s>=4) items = items.map(()=> 'shake the bag');
  sugItems = items;
  if(!items.length){ hideSug(); return; }
  u.innerHTML = items.map((it,k)=>{
    const creepy = SUGG.slice(2).some(arr=>arr.includes(it));
    const i=v?it.indexOf(v):-1;
    const label = i>=0 ? esc(it.slice(0,i+v.length)) + '<b>'+esc(it.slice(i+v.length))+'</b>' : '<b>'+esc(it)+'</b>';
    return `<li role="option"><button type="button" data-sug="${esc(it)}" class="${k===sugIdx?'hl':''}">${v?I.search:I.clock}<span class="${creepy&&s>=2?'bad':''}">${label}</span></button></li>`;
  }).join('');
  u.hidden=false; document.getElementById('sf').classList.add('open');
}
document.addEventListener('input', e => { if(e.target.id==='q'){ sugIdx=-1; showSug(e.target.value); } });
document.addEventListener('focusin', e => { if(e.target.id==='q') showSug(e.target.value===S.query?'':e.target.value); });
document.addEventListener('keydown', e => {
  if(e.target.id==='q'){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ if(!sugItems.length) return; e.preventDefault(); sugIdx=(sugIdx+(e.key==='ArrowDown'?1:-1)+sugItems.length)%sugItems.length; e.target.value=sugItems[sugIdx]; showSug(e.target.value); }
    if(e.key==='Escape') hideSug();
  } else if(e.key==='Escape'){ if(overlay.innerHTML) closeOverlay(); else if(S.cur.type!=='serp') back(); }
});

/* ======================= stage, status, sound, loop ======================= */
function applyStage(){
  root.dataset.stage=String(S.stage);
  drone(S.stage);
  document.getElementById('status').classList.toggle('show', S.stage>=2);
}
function updateStatus(){
  document.getElementById('depth').textContent = (S.paaDeepest+1)+S.visits.size;
}
setInterval(()=>{
  const el=document.getElementById('lastShake');
  if(!S.lastShakeAt){ el.textContent = S.stage>=3?'never':'—'; return; }
  const m=Math.floor((Date.now()-S.lastShakeAt)/60000);
  el.textContent = m<1?'just now':m+' min ago';
},1000);

let actx=null, gain=null, soundOn=false;
document.getElementById('soundBtn').addEventListener('click', e=>{
  soundOn=!soundOn; e.currentTarget.textContent='sound: '+(soundOn?'on':'off');
  try{
    if(soundOn && !actx){
      actx=new (window.AudioContext||window.webkitAudioContext)();
      gain=actx.createGain(); gain.gain.value=0; gain.connect(actx.destination);
      [43,43.7,86.2].forEach(f=>{ const o=actx.createOscillator(); o.type='sine'; o.frequency.value=f; o.connect(gain); o.start(); });
    }
    drone(S.stage);
  }catch(err){}
});
function drone(s){ if(!gain||!actx) return; try{ gain.gain.setTargetAtTime(soundOn?[0,0,.03,.07,.12][s]:0, actx.currentTime, 1.5); }catch(e){} }

function shake(){
  S.lastShakeAt=Date.now();
  try{ navigator.vibrate && navigator.vibrate([90,60,90,60,200]); }catch(e){}
  document.body.classList.add('shaking');
  setTimeout(()=>{
    document.body.classList.add('blackout');
    setTimeout(()=>{
      S.loop++; root.dataset.loop=String(S.loop);
      S.paaDeepest=-1; S.paaShown=4; S.paaOpen.clear(); S.paaHTML={}; S.paaRendered=0;
      S.visits.clear(); S.queryDefault=true; S.moreShown=0; S.chip=null; S.ovMore=false;
      S.stage=0; applyStage(); updateStatus();
      S.stack=[]; S.cur={type:'serp',tab:'all'}; render({top:true});
      document.body.classList.remove('shaking','blackout');
    },900);
  },1500);
}

/* ======================= boot ======================= */
S.query = defaultQuery();
try{ history.replaceState({d:0},''); }catch(e){ pushOK=false; }
applyStage(); updateStatus();
render();
})();
