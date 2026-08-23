const screens = ["welcome","celebrate","cake","birthday","letter"];
const $ = id => document.getElementById(id);

function show(id){
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  window.scrollTo(0,0);
}

function burst(containerId, count=35){
  const box=$(containerId);
  box.innerHTML="";
  const emojis=["💖","✨","🎈","🌸","💕","⭐","🎉"];
  for(let i=0;i<count;i++){
    const el=document.createElement("span");
    el.className=containerId==="confetti"?"conf":"particle";
    el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left=Math.random()*100+"%";
    el.style.top=(Math.random()*35+55)+"%";
    el.style.animationDelay=(Math.random()*1.4)+"s";
    el.style.fontSize=(16+Math.random()*28)+"px";
    box.appendChild(el);
  }
}

function startSurprise(){
  $("teddy").classList.add("bounce");
  setTimeout(()=>{
    burst("particles",55);
    show("celebrate");
    setTimeout(()=>show("cake"),3600);
  },700);
}

$("teddyBtn").addEventListener("click", startSurprise);
$("teddy").addEventListener("click", startSurprise);
$("teddy").addEventListener("keydown", e => {
  if(e.key==="Enter" || e.key===" ") startSurprise();
});

let audioCtx, analyser, stream, listening=false;

async function listenForBlow(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    const source=audioCtx.createMediaStreamSource(stream);
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=1024;
    source.connect(analyser);
    listening=true;
    $("blowText").textContent="Ab microphone ke paas halka sa blow karo… 💨";
    const data=new Uint8Array(analyser.fftSize);
    let hits=0;
    const check=()=>{
      if(!listening)return;
      analyser.getByteTimeDomainData(data);
      let sum=0;
      for(let i=0;i<data.length;i++){const v=(data[i]-128)/128;sum+=v*v}
      const rms=Math.sqrt(sum/data.length);
      if(rms>.12) hits++; else hits=Math.max(0,hits-1);
      if(hits>=3){extinguish();return}
      requestAnimationFrame(check);
    };
    check();
  }catch(err){
    $("blowText").textContent="Microphone permission nahi mili. Neeche wale button se candles off kar sakte ho.";
  }
}

function extinguish(){
  if(!listening && $("candles").classList.contains("off")) return;
  listening=false;
  if(stream) stream.getTracks().forEach(t=>t.stop());
  if(audioCtx) audioCtx.close().catch(()=>{});
  $("candles").classList.add("off");
  $("blowText").textContent="Wish made… ✨";
  setTimeout(()=>{
    burst("confetti",80);
    show("birthday");
  },900);
}

$("blowBtn").addEventListener("click",listenForBlow);
$("skipBlow").addEventListener("click",extinguish);
$("letterBtn").addEventListener("click",()=>show("letter"));
$("replayBtn").addEventListener("click",()=>{
  $("candles").classList.remove("off");
  $("blowText").textContent="Tap the button and allow microphone access, then blow toward the microphone.";
  $("particles").innerHTML="";
  $("confetti").innerHTML="";
  $("teddy").classList.remove("bounce");
  show("welcome");
});
