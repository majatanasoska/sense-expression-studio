Object.assign(icons,{play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M9 5v14m6-14v14"/>',forward:'<path d="M5 12h14m-6-6 6 6-6 6"/>'});
// A guided preview with its own clock. Watching never creates calibration photos.
const demoScenes=[
  {duration:6000,expression:0,label:'A QUICK WALKTHROUGH',title:'Five expressions. One easy flow.',description:'Watch the face change, then try it yourself. We’ll guide you through every photo.',steps:['Find soft, even light.','Keep your whole face inside the oval.'],caption:'Start by finding your place in the frame.',narration:'Watch all five expressions. Sit in even light, with your whole face inside the oval.'},
  ...expressions.map((e,i)=>({duration:10000,expression:i,label:`EXPRESSION ${String(i+1).padStart(2,'0')} / 05`,title:e.title,description:e.description,steps:e.steps,caption:e.feature,narration:`${e.name}. ${e.description}`})),
  {duration:8000,expression:0,label:'YOU’VE SEEN ALL FIVE',title:'Now it’s your turn.',description:'For each expression, you’ll get a countdown, take a photo, then review it before moving on.',steps:['Keep a photo or retake it. You decide.','Confirm all five expressions to finish.'],caption:'You’re ready. Take it one expression at a time.',narration:'Now it’s your turn. Take and review each photo. Confirm all five expressions to finish.'}
];
const demoDuration=demoScenes.reduce((total,scene)=>total+scene.duration,0);
const demoPlayback={elapsed:0,playing:false,voice:false,scene:-1,phase:-1,lastTick:0,timer:null,utterance:null};
const demoTime=ms=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
function demoSceneStart(index){return demoScenes.slice(0,index).reduce((total,scene)=>total+scene.duration,0);}
function demoPosition(){
  let start=0;
  for(let i=0;i<demoScenes.length;i++){
    if(demoPlayback.elapsed<start+demoScenes[i].duration||i===demoScenes.length-1)return{index:i,local:demoPlayback.elapsed-start};
    start+=demoScenes[i].duration;
  }
}
function demoView(){return `<section class="workspace demo-player fade-in" aria-labelledby="demo-title">
  <div class="demo-heading"><div><span class="demo-label">GUIDED DEMO · ABOUT 1 MINUTE</span><h2 id="demo-title">See it. Then try it.</h2></div><button class="back-button" data-action="back-home">${icon('back')}Exit demo</button></div>
  <div class="demo-scene" id="demo-scene"></div>
  <div class="demo-playback">
    <label class="sr-only" for="demo-timeline">Demo playback position</label><input id="demo-timeline" class="demo-timeline" type="range" min="0" max="${demoDuration/1000}" step="1" value="0" aria-valuetext="0 seconds of 64 seconds">
    <div class="demo-controls"><div class="demo-transport"><button class="demo-play-button" data-action="demo-toggle" aria-label="Pause demo">${icon('pause')}</button><button class="demo-control" data-action="demo-replay" aria-label="Replay demo">${icon('refresh')}</button><span class="demo-time" id="demo-time">0:00 <span>/ ${demoTime(demoDuration)}</span></span></div><button class="demo-voice" data-action="demo-voice" aria-pressed="false" ${!('speechSynthesis' in window)?'hidden':''}>${icon('mute')}<span>Voice off</span></button><span class="demo-playback-status" id="demo-playback-status" role="status">Playing</span></div>
  </div>
  <div class="demo-chapters" aria-label="Jump to an expression">${expressions.map((e,i)=>`<button class="demo-chapter" data-action="demo-chapter" data-index="${i+1}" aria-label="Watch ${e.name.toLowerCase()}">${face(i)}<span><small>${String(i+1).padStart(2,'0')}</small><strong>${e.name}</strong></span><span class="chapter-track" aria-hidden="true"><span></span></span></button>`).join('')}</div>
  <div class="demo-footer"><p>${icon('lock')}Just watching. Your camera is off.</p><button class="button primary" data-action="try-camera">Try with my camera ${icon('forward')}</button></div>
</section>`;}
function demoSceneView(index){
  const s=demoScenes[index];
  const expressionScene=index>0&&index<6;
  return `<div class="demo-visual"><div class="demo-stage"><div class="demo-portrait"><div class="demo-face-base" aria-hidden="true">${face(0,'demo-portrait-photo')}</div><div class="demo-face-expression" id="demo-face-expression">${face(s.expression,'demo-portrait-photo')}</div></div><div class="demo-frame">${ticks(index===6?1:.18)}</div><div class="demo-eye-line" aria-hidden="true"></div></div><div class="demo-caption"><span class="demo-caption-icon">${icon(index===6?'check':'scan')}</span><p id="demo-caption-text">${s.caption}</p></div></div>
    <div class="demo-explanation"><span class="step-count">${s.label}</span><h3>${s.title}</h3><p class="demo-description">${s.description}</p><ol class="demo-instructions">${s.steps.map((step,i)=>`<li><span>${i+1}</span><p>${step}</p></li>`).join('')}</ol><div class="demo-context">${icon(expressionScene?'clock':index===6?'check':'info')}<p>${expressionScene?'In your session, a 3-second countdown gives you time to hold this expression.':index===6?'Every photo is yours to check. You can always try again.':'The demo plays automatically. Pause or choose an expression below.'}</p></div></div>`;
}
function updateDemo(){
  if(state.view!=='demo')return;
  const position=demoPosition();
  const s=demoScenes[position.index];
  const changed=demoPlayback.scene!==position.index;
  if(changed){
    demoPlayback.scene=position.index;demoPlayback.phase=-1;state.index=s.expression;
    document.getElementById('demo-scene').innerHTML=demoSceneView(position.index);
    announce(`${s.label}. ${s.title} ${s.description}`);
    if(demoPlayback.playing)speakDemo();
  }
  const expressionScene=position.index>0&&position.index<6;
  const phase=expressionScene?(position.local<2000?0:position.local<6500?1:2):1;
  if(demoPlayback.phase!==phase){
    demoPlayback.phase=phase;
    document.getElementById('demo-face-expression').classList.toggle('shown',phase>0);
    const caption=expressionScene?(phase===0?(s.expression===0?'Look straight ahead and let your face relax.':'Start with a relaxed face. Watch what changes.'):phase===2?(s.expression===4?'Hold gently until you hear the capture sound.':'Hold this expression. You’re ready for the photo.'):s.caption):s.caption;
    document.getElementById('demo-caption-text').textContent=caption;
  }
  const seconds=Math.floor(demoPlayback.elapsed/1000);
  const range=document.getElementById('demo-timeline');
  if(document.activeElement!==range)range.value=seconds;
  range.style.setProperty('--played',`${demoPlayback.elapsed/demoDuration*100}%`);
  range.setAttribute('aria-valuetext',`${demoTime(demoPlayback.elapsed)} of ${demoTime(demoDuration)}. ${s.label}`);
  document.getElementById('demo-time').innerHTML=`${demoTime(demoPlayback.elapsed)} <span>/ ${demoTime(demoDuration)}</span>`;
  const ended=demoPlayback.elapsed>=demoDuration;
  const play=document.querySelector('[data-action="demo-toggle"]');
  const playLabel=ended?'Replay demo':demoPlayback.playing?'Pause demo':'Play demo';
  if(play.getAttribute('aria-label')!==playLabel){play.setAttribute('aria-label',playLabel);play.innerHTML=icon(ended?'refresh':demoPlayback.playing?'pause':'play');}
  const status=document.getElementById('demo-playback-status');
  const statusText=ended?'Demo complete':demoPlayback.playing?'Playing':'Paused';
  if(status.textContent!==statusText)status.textContent=statusText;
  document.querySelectorAll('.demo-chapter').forEach((button,i)=>{
    const current=position.index===i+1;
    button.classList.toggle('current',current);
    if(current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    button.querySelector('.chapter-track span').style.width=`${Math.max(0,Math.min(1,(demoPlayback.elapsed-demoSceneStart(i+1))/10000))*100}%`;
  });
}
function stopDemoVoice(){const wasSpeaking=!!demoPlayback.utterance;demoPlayback.utterance=null;if(wasSpeaking&&'speechSynthesis' in window)window.speechSynthesis.cancel();}
function speakDemo(){
  stopDemoVoice();
  if(!demoPlayback.voice||!demoPlayback.playing||state.view!=='demo'||!('speechSynthesis' in window))return;
  const utterance=new SpeechSynthesisUtterance(demoScenes[demoPosition().index].narration);
  utterance.lang='en-US';utterance.rate=1;demoPlayback.utterance=utterance;
  utterance.onerror=()=>{if(demoPlayback.utterance!==utterance)return;demoPlayback.voice=false;demoPlayback.utterance=null;updateDemoVoiceButton();announce('Voice is unavailable. Follow the on-screen instructions.');};
  window.speechSynthesis.speak(utterance);
}
function updateDemoVoiceButton(){const b=document.querySelector('[data-action="demo-voice"]');if(b){b.setAttribute('aria-pressed',demoPlayback.voice);b.innerHTML=`${icon(demoPlayback.voice?'sound':'mute')}<span>Voice ${demoPlayback.voice?'on':'off'}</span>`;}}
function pauseDemo(){clearInterval(demoPlayback.timer);demoPlayback.timer=null;demoPlayback.playing=false;stopDemoVoice();if(state.view==='demo')updateDemo();}
function playDemo(){
  if(state.view!=='demo'||demoPlayback.playing)return;
  if(demoPlayback.elapsed>=demoDuration){demoPlayback.elapsed=0;demoPlayback.scene=-1;}
  demoPlayback.playing=true;demoPlayback.lastTick=performance.now();
  const sceneChanged=demoPlayback.scene!==demoPosition().index;
  updateDemo();if(!sceneChanged)speakDemo();
  demoPlayback.timer=setInterval(()=>{
    if(state.view!=='demo'||document.hidden){pauseDemo();return;}
    const now=performance.now();demoPlayback.elapsed=Math.min(demoDuration,demoPlayback.elapsed+now-demoPlayback.lastTick);demoPlayback.lastTick=now;
    if(demoPlayback.elapsed>=demoDuration)pauseDemo();else updateDemo();
  },100);
}
function seekDemo(milliseconds){
  if(state.view!=='demo'||!Number.isFinite(milliseconds))return;
  stopDemoVoice();demoPlayback.elapsed=Math.max(0,Math.min(demoDuration,milliseconds));demoPlayback.lastTick=performance.now();demoPlayback.scene=-1;
  if(demoPlayback.elapsed>=demoDuration)pauseDemo();else updateDemo();
}
function beginGuidedDemo(){pauseDemo();demoPlayback.voice=false;demoPlayback.elapsed=0;demoPlayback.scene=-1;demoPlayback.phase=-1;state.view='demo';render();updateDemo();focusHeading();playDemo();}
document.addEventListener('input',event=>{if(event.target.id==='demo-timeline'){pauseDemo();seekDemo(Number(event.target.value)*1000);}});

function showDemoPortrait(){document.querySelector('.demo-visual')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
