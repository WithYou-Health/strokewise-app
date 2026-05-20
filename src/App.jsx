import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";

/* ═══════════════════════ DATA ═══════════════════════ */

const EMERGENCY = [
  { country:"United Kingdom",  number:"999",        alt:"112", emoji:"🇬🇧" },
  { country:"United States",   number:"911",        alt:"112", emoji:"🇺🇸" },
  { country:"Australia",       number:"000",        alt:"112", emoji:"🇦🇺" },
  { country:"Canada",          number:"911",        alt:"112", emoji:"🇨🇦" },
  { country:"European Union",  number:"112",        alt:"",    emoji:"🇪🇺" },
  { country:"Germany",         number:"112",        alt:"110 (police)", emoji:"🇩🇪" },
  { country:"France",          number:"15 (SAMU)",  alt:"112", emoji:"🇫🇷" },
  { country:"Spain",           number:"112",        alt:"",    emoji:"🇪🇸" },
  { country:"India",           number:"112",        alt:"102 (ambulance)", emoji:"🇮🇳" },
  { country:"Japan",           number:"119",        alt:"110 (police)", emoji:"🇯🇵" },
  { country:"China",           number:"120",        alt:"119 (fire)", emoji:"🇨🇳" },
  { country:"Brazil",          number:"192 (SAMU)", alt:"193", emoji:"🇧🇷" },
  { country:"South Africa",    number:"10177",      alt:"112", emoji:"🇿🇦" },
  { country:"New Zealand",     number:"111",        alt:"",    emoji:"🇳🇿" },
  { country:"Ireland",         number:"999",        alt:"112", emoji:"🇮🇪" },
];

const FAST_SIGNS = [
  { letter:"F", word:"FACE",   color:"#ef4444", desc:"Ask them to smile. Does one side of their face droop or look uneven?", action:"Look for an uneven or drooping smile" },
  { letter:"A", word:"ARMS",   color:"#f97316", desc:"Ask them to raise both arms. Does one arm drift downward or feel weak?", action:"Ask them to hold both arms up for 10 seconds" },
  { letter:"S", word:"SPEECH", color:"#eab308", desc:"Ask them to repeat a simple phrase. Is their speech slurred or strange?", action:"Say 'The sky is blue' — listen for slurring" },
  { letter:"T", word:"TIME",   color:"#22c55e", desc:"Time to call emergency services immediately. Note the time symptoms started.", action:"Call emergency services NOW. Note the exact time." },
];

const OTHER_SIGNS = [
  { icon:"🤕", sign:"Sudden severe headache with no known cause" },
  { icon:"👁️", sign:"Sudden vision loss or blurring in one or both eyes" },
  { icon:"😵", sign:"Sudden dizziness, loss of balance or coordination" },
  { icon:"🫸", sign:"Sudden numbness or weakness in face, arm, or leg (especially one side)" },
  { icon:"🧠", sign:"Sudden confusion or difficulty understanding others" },
];

const EDUCATION = [
  { title:"What is a Stroke?",   icon:"🧠", content:"A stroke occurs when blood supply to part of the brain is cut off. Without blood, brain cells begin to die within minutes. There are two main types: ischaemic (a blood clot blocks a vessel — 85% of strokes) and haemorrhagic (a blood vessel bursts). A TIA (Transient Ischaemic Attack) is a 'mini-stroke' with symptoms that resolve within 24 hours — it's a serious warning sign." },
  { title:"Recovery Timeline",   icon:"📈", content:"Recovery is highly individual. The fastest improvements typically occur in the first 3 months, but recovery can continue for years. The brain has remarkable plasticity — it can rewire itself and form new connections. Consistent therapy, cognitive exercises, and a positive routine significantly affect long-term outcomes." },
  { title:"Types of Stroke",     icon:"🩺", content:"Ischaemic stroke: a clot blocks blood flow (treated with clot-busting drugs if caught early). Haemorrhagic stroke: bleeding in or around the brain (may require surgery). TIA (mini-stroke): temporary blockage, no permanent damage — but 1 in 10 people have a full stroke within 2 days of a TIA. Acting fast on TIA symptoms is critical." },
  { title:"Risk Factors",        icon:"⚠️", content:"Modifiable risks: high blood pressure (the #1 risk factor), smoking, diabetes, high cholesterol, atrial fibrillation, obesity, physical inactivity, excessive alcohol. Non-modifiable: age (risk doubles every decade after 55), family history, prior stroke or TIA. Controlling blood pressure alone reduces stroke risk by up to 40%." },
  { title:"Rehabilitation",      icon:"🏥", content:"Stroke rehab typically involves physiotherapy (movement and strength), occupational therapy (daily living skills), speech and language therapy (communication and swallowing), and neuropsychology (cognition and mood). Constraint-induced movement therapy, mirror therapy, and cognitive rehabilitation are all evidence-based approaches. Consistency is the most important factor." },
  { title:"Caregiver Wellbeing", icon:"❤️", content:"Caregiver burnout is real and common. Up to 40% of stroke caregivers experience depression. It's not selfish to take care of yourself — it's essential. Regular breaks, peer support groups, respite care, and honest communication with healthcare teams all matter. You cannot pour from an empty cup." },
  { title:"Medications",         icon:"💊", content:"Common post-stroke medications include: antiplatelet drugs (aspirin, clopidogrel) to prevent clots, anticoagulants (warfarin, apixaban) for AF-related strokes, statins to reduce cholesterol, antihypertensives to control blood pressure, and antidepressants if depression is present. Never stop medication without consulting a doctor." },
  { title:"Diet & Lifestyle",    icon:"🥗", content:"A Mediterranean-style diet (rich in vegetables, fruit, wholegrains, fish, olive oil) is associated with a 30% lower stroke risk. Reducing salt lowers blood pressure. Staying physically active (even gentle walking) improves blood flow and mood. Quitting smoking halves stroke risk within 2 years." },
];

const CAREGIVER_TOPICS = [
  { title:"Communicating After Stroke", icon:"🗣️", content:"After a stroke, communication can be affected by aphasia — difficulty speaking, understanding, reading or writing. Tips that help: speak slowly and clearly, use short sentences, give time to respond, use gestures and pointing, don't finish their sentences for them, use pictures or writing to support words. Never assume someone with aphasia doesn't understand — comprehension is often better than expression." },
  { title:"Daily Caregiver Checklist",  icon:"📋", content:"A consistent daily routine helps stroke survivors feel safe and supported. Key things to cover: morning medications, personal hygiene, breakfast, 15 minutes of gentle activity, meaningful conversation or connection, afternoon medications if applicable, main meal, evening medications, comfortable settling for the night. Write it down — both for your own reference and to hand over to a relief carer." },
  { title:"Caregiver Burnout",          icon:"😔", content:"Up to 40% of stroke caregivers experience depression. Warning signs include: constant exhaustion, withdrawing from friends, feeling resentful or hopeless, neglecting your own health. This is not weakness — it is the natural result of sustained, demanding care with insufficient support. What helps: accepting help when offered, scheduling regular respite breaks, joining a caregiver support group, being honest with your GP about how you are coping." },
  { title:"Working With the Medical Team", icon:"🏥", content:"You are a vital part of the stroke survivor's care team. Keep a written log of symptoms and behaviours — this is invaluable for doctors. Ask questions and write down the answers. Request written information about medications and their side effects. Ask specifically: what should I watch out for? Who do I contact between appointments? Don't minimise difficulties — honest reporting leads to better care." },
  { title:"Legal & Financial Planning",  icon:"⚖️", content:"Early planning protects everyone. If the stroke survivor still has mental capacity, now is the time to put legal arrangements in place. Key steps: Lasting Power of Attorney (LPA) — must be done while capacity is intact. Check eligibility for Attendance Allowance and Carer's Allowance. Ensure the will is up to date. Age UK and Citizens Advice offer free initial guidance." },
];

const AFFIRMATIONS = [
  "Every small step forward is a victory.",
  "Recovery is not linear — and that's okay.",
  "Your brain is rebuilding itself every single day.",
  "Rest is part of recovery, not a setback.",
  "You are more than what the stroke took from you.",
  "Caregivers: your love makes the difference.",
  "Progress happens even when you can't see it.",
];

const MEMORY_WORDS = ["Apple","River","Chair","Music","Green","Bridge","Cloud","Tiger","Paper","Smile"];
const EMOJI_PAIRS  = ["🌸","🦊","🎵","⭐","🌊","🍎","🦋","🌙","🎯","🔥"];

const BRAIN_FREE = [
  { id:"memory",  name:"Memory Match",    icon:"🃏", desc:"Flip cards to find matching pairs. Trains short-term memory.",            diff:"Easy"   },
  { id:"wordrecall",name:"Word Recall",   icon:"📝", desc:"Remember a list of words, then recall them. Trains verbal memory.",       diff:"Medium" },
  { id:"pattern", name:"Pattern Sequence",icon:"🔢", desc:"Watch a sequence of numbers and repeat it back. Trains working memory.", diff:"Easy"   },
  { id:"maths",   name:"Simple Maths",    icon:"➕", desc:"Gentle addition and subtraction. Rebuilds number confidence step by step.", diff:"Easy" },
  { id:"colour",  name:"Tap to Colour",   icon:"🎨", desc:"Tap sections to fill with colour. Calming and creative brain exercise.",   diff:"Easy"  },
];

const BRAIN_PREMIUM = [
  { id:"stroop",   name:"Colour Word",        icon:"🌈", desc:"Name the ink colour, not the word. Trains attention & inhibition.",    diff:"Hard"   },
  { id:"wordrecog",name:"Word Recognition",   icon:"🔤", desc:"Identify the correctly spelled word. Trains language recovery.",       diff:"Medium" },
  { id:"numrecog", name:"Number Recognition", icon:"🔢", desc:"Identify numbers quickly. Rebuilds numerical cognition.",              diff:"Easy"   },
  { id:"category", name:"Category Sort",      icon:"🗂️", desc:"Sort items into the right categories. Trains executive function.",     diff:"Medium" },
  { id:"trail",    name:"Visual Trail",       icon:"👁️", desc:"Connect numbered dots in order. Trains processing speed.",             diff:"Hard"   },
];

const PAINT_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#ffffff","#1e3a5f"];
const COLOUR_SECTIONS = [
  {id:0,label:"Sky",     bg:"#e8f4f8"},
  {id:1,label:"Sun",     bg:"#fef3c7"},
  {id:2,label:"Flower",  bg:"#fce7f3"},
  {id:3,label:"Leaves",  bg:"#d1fae5"},
  {id:4,label:"Stem",    bg:"#f0fdf4"},
  {id:5,label:"Ground",  bg:"#fef9c3"},
];

const WORD_RECOG_SETS = [
  {word:"APPLE",  options:["APPLE","APLLE","APPEL","APLES"]},
  {word:"BRIDGE", options:["BRIGDE","BRIDGE","BRIDEG","BRDIGE"]},
  {word:"GARDEN", options:["GRADEN","GAREND","GARDEN","GARDNE"]},
  {word:"WINDOW", options:["WINDWO","WNDOW","WINDOW","WIDNOW"]},
  {word:"FRIEND", options:["FREIND","FRIEND","FRINED","FEIEND"]},
];

/* ═══════════════════════ STYLES ═══════════════════════ */
const BG   = "linear-gradient(160deg,#f8f4ef 0%,#eef4f8 50%,#f4f0fa 100%)";
const WARM = "#c8613a";
const TEAL = "#2a7f8a";
const NAVY = "#1e3a5f";
const GOLD = "#c9920a";
const card = (x={}) => ({ background:"#fff", borderRadius:20, boxShadow:"0 2px 20px rgba(30,58,95,0.07)", padding:"18px", border:"1px solid rgba(30,58,95,0.07)", ...x });

/* ═══════════════════════ APP ═══════════════════════ */
export default function StrokeWise() {
  const [screen,      setScreen]     = useState("home");
  const [premium,     setPremium]    = useState(false);
  const [modal,       setModal]      = useState(false);
  const [selPlan,     setSelPlan]    = useState("Annual");
  const [userType,    setUserType]   = useState(null);
  const [onboarded,   setOnboarded]  = useState(false);
  const [affIdx,      setAffIdx]     = useState(0);
  const [eduIdx,      setEduIdx]     = useState(null); // >=0 = EDUCATION, <0 = CAREGIVER_TOPICS
  const [game,        setGame]       = useState(null);
  const [fadeIn,      setFadeIn]     = useState(false);

  // Memory match
  const [memCards, setMemCards] = useState([]);
  const [flipped,  setFlipped]  = useState([]);
  const [matched,  setMatched]  = useState([]);
  const [memMoves, setMemMoves] = useState(0);
  const [memWon,   setMemWon]   = useState(false);

  // Word recall
  const [wrPhase,   setWrPhase]   = useState("study");
  const [wrInput,   setWrInput]   = useState("");
  const [wrAnswers, setWrAnswers] = useState([]);
  const [wrTimer,   setWrTimer]   = useState(60);
  const timerRef = useRef(null);

  // Pattern
  const [patSeq,   setPatSeq]   = useState([]);
  const [patInput, setPatInput] = useState([]);
  const [patPhase, setPatPhase] = useState("show");
  const [patLevel, setPatLevel] = useState(3);
  const [showIdx,  setShowIdx]  = useState(-1);

  // Simple maths
  const [mathQ,        setMathQ]        = useState(null);
  const [mathScore,    setMathScore]    = useState(0);
  const [mathTotal,    setMathTotal]    = useState(0);
  const [mathDone,     setMathDone]     = useState(false);
  const [mathFeedback, setMathFeedback] = useState(null);

  // Tap to colour / Colour by Number
  const [selPaint,     setSelPaint]     = useState("#ef4444");
  const [painted,      setPainted]      = useState({});
  const [cbnSceneIdx,  setCbnSceneIdx]  = useState(0);
  const [cbnSelPaint,  setCbnSelPaint]  = useState({num:1,color:"#ef4444",name:"Red"});
  const [cbnShowNums,  setCbnShowNums]  = useState(false);

  // Stroop
  const COLORS = [{word:"RED",color:"#ef4444"},{word:"BLUE",color:"#3b82f6"},{word:"GREEN",color:"#22c55e"},{word:"YELLOW",color:"#eab308"}];
  const [stroopItem,  setStroopItem]  = useState(null);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopTotal, setStroopTotal] = useState(0);
  const [stroopDone,  setStroopDone]  = useState(false);

  // Word recognition
  const [wrIdx,      setWrIdx]      = useState(0);
  const [wrScore,    setWrScore]    = useState(0);
  const [wrDone,     setWrDone]     = useState(false);
  const [wrFeedback, setWrFeedback] = useState(null);

  // Number recognition
  const [numQ,     setNumQ]     = useState(null);
  const [numScore, setNumScore] = useState(0);
  const [numTotal, setNumTotal] = useState(0);
  const [numDone,  setNumDone]  = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const t = setInterval(() => setAffIdx(i => (i+1) % AFFIRMATIONS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const STRIPE_KEY = "pk_live_51TXnrWHvzoFiGNgHsWGmx3EyvBed3YdtQwycuodMlkT4vBIPp4oTdLR6b1wPOAKGvEWVoCt T7qWRZ52uhWSqPFkv00T5My1Mku";
  const PRICE_MONTHLY = "price_1TYzShHvzoFiGNgHgUBKZEU3";
  const PRICE_YEARLY  = "price_1TYzUiHvzoFiGNgHVMXYnquJ";

  async function handleCheckout(priceId) {
    try {
      const stripe = await loadStripe(STRIPE_KEY);
      await stripe.redirectToCheckout({
        lineItems:[{price:priceId, quantity:1}],
        mode:"subscription",
        successUrl: window.location.origin + "?success=true",
        cancelUrl:  window.location.origin + "?canceled=true",
        subscriptionData:{ trial_period_days: 7 },
      });
    } catch(e) {
      console.error("Stripe error",e);
    }
  }

  const gate = (fn) => premium ? fn() : setModal(true);

  /* ── Memory match ── */
  function initMemory() {
    const pairs = [...EMOJI_PAIRS.slice(0,6),...EMOJI_PAIRS.slice(0,6)].sort(()=>Math.random()-0.5).map((e,i)=>({id:i,emoji:e}));
    setMemCards(pairs); setFlipped([]); setMatched([]); setMemMoves(0); setMemWon(false);
  }
  function flipCard(id) {
    if (flipped.length===2||flipped.includes(id)||matched.includes(id)) return;
    const nf=[...flipped,id]; setFlipped(nf);
    if (nf.length===2) {
      setMemMoves(m=>m+1);
      if (memCards[nf[0]].emoji===memCards[nf[1]].emoji) {
        const nm=[...matched,...nf]; setMatched(nm); setFlipped([]);
        if (nm.length===memCards.length) setMemWon(true);
      } else setTimeout(()=>setFlipped([]),900);
    }
  }

  /* ── Word recall ── */
  const studyWords = MEMORY_WORDS.slice(0,6);
  function startWrRecall() {
    setWrPhase("recall"); setWrAnswers([]); setWrInput("");
    let t=60; setWrTimer(t);
    timerRef.current = setInterval(()=>{ t--; setWrTimer(t); if(t<=0){clearInterval(timerRef.current);setWrPhase("result");}},1000);
  }
  function submitWrWord() {
    if(!wrInput.trim()) return;
    setWrAnswers(p=>[...p,wrInput.trim()]); setWrInput("");
  }
  const correctWords = wrAnswers.filter(w=>studyWords.map(s=>s.toLowerCase()).includes(w.toLowerCase()));

  /* ── Pattern ── */
  function startPattern() {
    const seq=Array.from({length:patLevel},()=>Math.floor(Math.random()*9)+1);
    setPatSeq(seq); setPatInput([]); setPatPhase("show"); setShowIdx(-1);
    let i=-1;
    const iv=setInterval(()=>{ i++; setShowIdx(i); if(i>=seq.length){clearInterval(iv);setShowIdx(-1);setTimeout(()=>setPatPhase("input"),600);}},900);
  }

  /* ── Simple maths ── */
  function genMath() {
    const op=["+","-"][Math.floor(Math.random()*2)];
    let a,b;
    if(op==="+"){a=Math.floor(Math.random()*10)+1;b=Math.floor(Math.random()*10)+1;}
    else{a=Math.floor(Math.random()*10)+5;b=Math.floor(Math.random()*a)+1;}
    const ans=op==="+"?a+b:a-b;
    const w1=ans+(Math.random()>0.5?1:-1);
    const w2=ans+(Math.random()>0.5?2:-2);
    setMathQ({a,b,op,answer:ans,options:[ans,w1,Math.abs(w2)].sort(()=>Math.random()-0.5)});
    setMathFeedback(null);
  }
  function initMaths(){setMathScore(0);setMathTotal(0);setMathDone(false);setMathFeedback(null);genMath();}
  function answerMath(val){
    const ok=val===mathQ.answer;
    setMathFeedback(ok?"correct":"wrong");
    if(ok) setMathScore(s=>s+1);
    setMathTotal(t=>t+1);
    setTimeout(()=>{ if(mathTotal+1>=10){setMathDone(true);}else{genMath();} },800);
  }

  /* ── Stroop ── */
  function nextStroop(){
    if(stroopTotal>=10){setStroopDone(true);return;}
    const word=COLORS[Math.floor(Math.random()*4)];
    let ink; do{ink=COLORS[Math.floor(Math.random()*4)];}while(ink.word===word.word);
    setStroopItem({...word,inkColor:ink.color,correctAnswer:ink.word,options:[...COLORS].sort(()=>Math.random()-0.5)});
  }
  function initStroop(){setStroopScore(0);setStroopTotal(0);setStroopDone(false);nextStroop();}
  function answerStroop(ans){if(ans===stroopItem.correctAnswer)setStroopScore(s=>s+1);setStroopTotal(t=>t+1);nextStroop();}

  /* ── Word recognition ── */
  function initWordRecog(){setWrIdx(0);setWrScore(0);setWrDone(false);setWrFeedback(null);}
  function answerWordRecog(opt){
    const ok=opt===WORD_RECOG_SETS[wrIdx].word;
    setWrFeedback(ok?"correct":"wrong");
    if(ok) setWrScore(s=>s+1);
    setTimeout(()=>{ setWrFeedback(null); if(wrIdx>=WORD_RECOG_SETS.length-1){setWrDone(true);}else{setWrIdx(i=>i+1);}},700);
  }

  /* ── Number recognition ── */
  function genNum(){
    const n=Math.floor(Math.random()*20)+1;
    const w1=n+(Math.random()>0.5?1:-1);
    const w2=n+(Math.random()>0.5?3:-3);
    setNumQ({num:n,options:[n,Math.abs(w1)||1,Math.abs(w2)||2].sort(()=>Math.random()-0.5)});
  }
  function initNumRecog(){setNumScore(0);setNumTotal(0);setNumDone(false);genNum();}
  function answerNum(val){
    if(val===numQ.num) setNumScore(s=>s+1);
    setNumTotal(t=>t+1);
    if(numTotal+1>=10){setNumDone(true);}else{genNum();}
  }

  const NAV=[{id:"home",icon:"🏠"},{id:"fast",icon:"⚡"},{id:"learn",icon:"📚"},{id:"brain",icon:"🧩"},{id:"emergency",icon:"🆘"}];

  /* ── Education detail screen ── */
  if (eduIdx !== null) {
    const isCG = eduIdx < 0;
    const topic = isCG ? CAREGIVER_TOPICS[Math.abs(eduIdx)-1] : EDUCATION[eduIdx];
    const maxIdx = isCG ? CAREGIVER_TOPICS.length : EDUCATION.length;
    const curIdx = isCG ? Math.abs(eduIdx)-1 : eduIdx;
    return (
      <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",maxWidth:"100%",margin:"0 auto",padding:"50px 16px 80px"}}>
        <button onClick={()=>setEduIdx(null)} style={{background:"transparent",border:"none",color:NAVY,fontSize:14,cursor:"pointer",marginBottom:20}}>← Back to Learn</button>
        <div style={{fontSize:40,marginBottom:12}}>{topic.icon}</div>
        <div style={{fontSize:22,fontWeight:700,color:isCG?WARM:NAVY,marginBottom:16,lineHeight:1.25}}>{topic.title}</div>
        <div style={{fontSize:15,color:"#3a4a5a",lineHeight:1.9}}>{topic.content}</div>
        <div style={{...card({marginTop:24,background:"#f0f9ff",border:"1px solid rgba(42,127,138,0.2)"})}}>
          <div style={{fontSize:10,color:TEAL,letterSpacing:1.5,marginBottom:6}}>MEDICAL NOTE</div>
          <div style={{fontSize:12,color:"#3a4a5a",lineHeight:1.6}}>This information is for educational purposes only. Always follow the advice of your medical team and never adjust medication or treatment without consulting a doctor.</div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          {curIdx>0&&<button onClick={()=>setEduIdx(isCG?-(curIdx):curIdx-1)} style={{flex:1,background:"rgba(30,58,95,0.08)",border:"none",borderRadius:12,padding:"11px",color:NAVY,fontSize:13,cursor:"pointer"}}>← Previous</button>}
          {curIdx<maxIdx-1&&<button onClick={()=>setEduIdx(isCG?-(curIdx+2):curIdx+1)} style={{flex:1,background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Next →</button>}
        </div>
      </div>
    );
  }

  /* ── Game screen ── */
  if (game) return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",maxWidth:"100%",margin:"0 auto",padding:"50px 16px 80px"}}>
      <style>{`@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}`}</style>
      <button onClick={()=>setGame(null)} style={{background:"transparent",border:"none",color:NAVY,fontSize:14,cursor:"pointer",marginBottom:20}}>← Back to Brain Training</button>

      {/* MEMORY MATCH */}
      {game==="memory"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🃏 Memory Match</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Find all matching pairs · Moves: {memMoves}</div>
          {!memCards.length
            ?<button onClick={initMemory} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start Game</button>
            :<div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                {memCards.map((c,i)=>{
                  const show=flipped.includes(i)||matched.includes(i);
                  return <button key={i} onClick={()=>flipCard(i)} style={{aspectRatio:"1",background:show?"#fff":`linear-gradient(135deg,${TEAL},${NAVY})`,border:`2px solid ${show?"#e8f4f8":TEAL}`,borderRadius:14,fontSize:26,cursor:"pointer",transition:"all 0.3s",boxShadow:matched.includes(i)?"0 0 0 3px rgba(74,124,111,0.4)":"none",animation:matched.includes(i)?"pop 0.3s ease":"none"}}>{show?c.emoji:"?"}</button>;
                })}
              </div>
              {memWon&&<div style={{...card({textAlign:"center",background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"2px solid #22c55e"})}}>
                <div style={{fontSize:32,marginBottom:6}}>🎉</div>
                <div style={{fontSize:16,fontWeight:700,color:"#15803d"}}>Completed in {memMoves} moves!</div>
                <button onClick={initMemory} style={{marginTop:12,background:"#22c55e",border:"none",borderRadius:12,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
              </div>}
            </div>
          }
        </div>
      )}

      {/* WORD RECALL */}
      {game==="wordrecall"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>📝 Word Recall</div>
          {wrPhase==="study"&&(
            <div>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:12}}>Study these 6 words, then recall them from memory.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                {studyWords.map(w=><div key={w} style={{...card({padding:"14px",textAlign:"center"}),fontSize:18,fontWeight:700,color:NAVY}}>{w}</div>)}
              </div>
              <button onClick={startWrRecall} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:14,padding:"13px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>I'm Ready</button>
            </div>
          )}
          {wrPhase==="recall"&&(
            <div>
              <div style={{...card({textAlign:"center",marginBottom:14,padding:"12px",background:"rgba(239,68,68,0.06)"})}}>
                <div style={{fontSize:30,fontWeight:700,color:"#dc2626"}}>{wrTimer}s</div>
                <div style={{fontSize:11,color:"#5a6a7a"}}>Type words you remember</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input value={wrInput} onChange={e=>setWrInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitWrWord()} placeholder="Type a word…" style={{flex:1,background:"#fff",border:`2px solid ${TEAL}`,borderRadius:12,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"Georgia,serif"}}/>
                <button onClick={submitWrWord} style={{background:TEAL,border:"none",borderRadius:12,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {wrAnswers.map((w,i)=>{const ok=studyWords.map(s=>s.toLowerCase()).includes(w.toLowerCase()); return <div key={i} style={{background:ok?"#dcfce7":"#fee2e2",borderRadius:8,padding:"5px 12px",fontSize:13,color:ok?"#15803d":"#dc2626"}}>{w}</div>;})}
              </div>
            </div>
          )}
          {wrPhase==="result"&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{correctWords.length>=5?"🏆":correctWords.length>=3?"👍":"💪"}</div>
              <div style={{fontSize:20,fontWeight:700,color:NAVY,marginBottom:6}}>{correctWords.length}/{studyWords.length} Recalled</div>
              <div style={{fontSize:12,color:"#5a6a7a",lineHeight:1.6,marginBottom:16,background:"#f0f9ff",borderRadius:10,padding:"10px"}}>{correctWords.length>=5?"Excellent memory performance!":correctWords.length>=3?"Good effort — consistent practice strengthens verbal memory.":"Keep practising — memory responds well to regular gentle exercise."}</div>
              <button onClick={()=>{setWrPhase("study");setWrAnswers([]);setWrInput("");}} style={{background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Try Again</button>
            </div>
          )}
        </div>
      )}

      {/* PATTERN SEQUENCE */}
      {game==="pattern"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🔢 Pattern Sequence</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Watch the number sequence, then repeat it. Level: {patLevel}</div>
          {patPhase==="show"&&!patSeq.length&&<button onClick={startPattern} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:14,padding:"13px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Show Sequence</button>}
          {patPhase==="show"&&patSeq.length>0&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Watch carefully…</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {patSeq.map((n,i)=><div key={i} style={{width:52,height:52,borderRadius:12,background:showIdx===i?`linear-gradient(135deg,${WARM},${GOLD})`:"#e8eef4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:showIdx===i?"#fff":NAVY,transition:"all 0.3s"}}>{showIdx>=i?n:"?"}</div>)}
              </div>
            </div>
          )}
          {patPhase==="input"&&(
            <div>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:12}}>Now tap the numbers in the same order:</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
                {patSeq.map((_,i)=><div key={i} style={{width:44,height:44,borderRadius:10,background:i<patInput.length?TEAL:"#e8eef4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:i<patInput.length?"#fff":"#9aabb8"}}>{i<patInput.length?patInput[i]:"?"}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[1,2,3,4,5,6,7,8,9].map(n=>(
                  <button key={n} onClick={()=>{const ni=[...patInput,n];setPatInput(ni);if(ni.length===patSeq.length)setPatPhase("result");}} style={{padding:"16px",background:"#fff",border:"2px solid #e8eef4",borderRadius:14,fontSize:20,fontWeight:700,color:NAVY,cursor:"pointer"}}>{n}</button>
                ))}
              </div>
              <button onClick={()=>setPatInput([])} style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #ddd",borderRadius:10,padding:"9px",color:"#5a6a7a",fontSize:12,cursor:"pointer"}}>Clear</button>
            </div>
          )}
          {patPhase==="result"&&(
            <div style={{...card({textAlign:"center"})}}>
              {JSON.stringify(patInput)===JSON.stringify(patSeq)
                ?<><div style={{fontSize:36,marginBottom:8}}>🎉</div><div style={{fontSize:18,fontWeight:700,color:"#15803d"}}>Perfect!</div></>
                :<><div style={{fontSize:36,marginBottom:8}}>💪</div><div style={{fontSize:18,fontWeight:700,color:NAVY}}>Good try!</div><div style={{fontSize:13,color:"#5a6a7a",marginTop:4}}>Correct: {patSeq.join(" → ")}</div></>
              }
              <div style={{display:"flex",gap:8,marginTop:16}}>
                <button onClick={()=>{setPatSeq([]);setPatInput([]);setPatPhase("show");setPatLevel(l=>Math.min(l+1,7));}} style={{flex:1,background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Next Level</button>
                <button onClick={()=>{setPatSeq([]);setPatInput([]);setPatPhase("show");setPatLevel(3);}} style={{flex:1,background:"rgba(30,58,95,0.08)",border:"none",borderRadius:12,padding:"11px",color:NAVY,fontSize:13,cursor:"pointer"}}>Restart</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SIMPLE MATHS */}
      {game==="maths"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>➕ Simple Maths</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Gentle addition and subtraction. Take your time. Score: {mathScore}/{mathTotal}</div>
          {!mathQ&&!mathDone&&<button onClick={initMaths} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start</button>}
          {mathQ&&!mathDone&&(
            <div style={{textAlign:"center"}}>
              <div style={{...card({padding:"32px",marginBottom:20,textAlign:"center"})}}>
                <div style={{fontSize:52,fontWeight:700,color:NAVY}}>{mathQ.a} {mathQ.op} {mathQ.b} = ?</div>
                {mathFeedback&&<div style={{fontSize:18,marginTop:12,color:mathFeedback==="correct"?"#22c55e":"#ef4444",fontWeight:700}}>{mathFeedback==="correct"?"Correct!":"Not quite — keep going!"}</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {mathQ.options.map((o,i)=>(
                  <button key={i} onClick={()=>!mathFeedback&&answerMath(o)} style={{padding:"18px",background:"#fff",border:`2px solid ${TEAL}30`,borderRadius:14,fontSize:24,fontWeight:700,color:NAVY,cursor:"pointer",boxShadow:"0 2px 8px rgba(30,58,95,0.08)"}}>{o}</button>
                ))}
              </div>
              <div style={{fontSize:11,color:"#9aabb8",marginTop:14}}>{10-mathTotal} questions remaining</div>
            </div>
          )}
          {mathDone&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{mathScore>=8?"🏆":mathScore>=5?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>{mathScore}/10 Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:6,marginBottom:16,lineHeight:1.6}}>{mathScore>=8?"Excellent! Number skills are strong.":mathScore>=5?"Good effort — maths gets easier with practice.":"Keep going — every session rebuilds those pathways."}</div>
              <button onClick={initMaths} style={{background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
            </div>
          )}
        </div>
      )}

      {/* COLOUR BY NUMBER */}
      {game==="colour"&&(()=>{
        const CBN_PALETTE=[
          {num:1,color:"#ef4444",name:"Red"},{num:2,color:"#f97316",name:"Orange"},{num:3,color:"#eab308",name:"Yellow"},
          {num:4,color:"#4ade80",name:"Green"},{num:5,color:"#60a5fa",name:"Blue"},{num:6,color:"#a78bfa",name:"Purple"},
          {num:7,color:"#f472b6",name:"Pink"},{num:8,color:"#fde68a",name:"Cream"},{num:9,color:"#d4a574",name:"Tan"},
          {num:10,color:"#92400e",name:"Brown"},{num:11,color:"#ffffff",name:"White"},{num:12,color:"#9ca3af",name:"Grey"},
          {num:13,color:"#166534",name:"Dk Green"},{num:14,color:"#1e3a5f",name:"Navy"},{num:15,color:"#1a0a00",name:"Black"},
        ];
        const CBN_SCENES=[
          {name:"Puppy",emoji:"🐶",free:true,
           defaults:{1:"#87ceeb",2:"#86efac",3:"#d4a574",4:"#b8895a",5:"#b8895a",6:"#c9a87a",7:"#c9a87a",8:"#d4a574",9:"#1a0a00",10:"#d4a574",11:"#d4a574",12:"#1a0a00",13:"#1a0a00",14:"#ef4444",15:"#eab308",16:"#f472b6",17:"#d4a574",18:"#d4a574"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Body",cx:140,cy:188},{id:4,label:"Left Ear",cx:88,cy:80},{id:5,label:"Right Ear",cx:192,cy:80},{id:6,label:"L Ear Inn",cx:88,cy:68},{id:7,label:"R Ear Inn",cx:192,cy:68},{id:8,label:"Head",cx:140,cy:106},{id:9,label:"Nose",cx:140,cy:108},{id:10,label:"Left Eye",cx:113,cy:96},{id:11,label:"Right Eye",cx:167,cy:96},{id:12,label:"L Pupil",cx:113,cy:96},{id:13,label:"R Pupil",cx:167,cy:96},{id:14,label:"Collar",cx:140,cy:150},{id:15,label:"Tag",cx:140,cy:161},{id:16,label:"Tongue",cx:140,cy:130},{id:17,label:"Left Leg",cx:100,cy:238},{id:18,label:"Right Leg",cx:180,cy:238}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><rect x="86" y="212" width="28" height="46" rx="10" fill={c(17)} stroke={NAVY} strokeWidth="1.5"/><rect x="166" y="212" width="28" height="46" rx="10" fill={c(18)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="140" cy="188" rx="64" ry="52" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="88" cy="82" rx="22" ry="32" fill={c(4)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="192" cy="82" rx="22" ry="32" fill={c(5)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="88" cy="70" rx="13" ry="18" fill={c(6)}/><ellipse cx="192" cy="70" rx="13" ry="18" fill={c(7)}/><circle cx="140" cy="107" r="54" fill={c(8)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="140" cy="119" rx="26" ry="17" fill={c(8)} stroke={NAVY} strokeWidth="1"/><ellipse cx="140" cy="110" rx="10" ry="7" fill={c(9)} stroke={NAVY} strokeWidth="1"/><circle cx="136" cy="109" r="2" fill="rgba(0,0,0,0.3)"/><circle cx="144" cy="109" r="2" fill="rgba(0,0,0,0.3)"/><circle cx="113" cy="97" r="10" fill={c(10)} stroke={NAVY} strokeWidth="1.2"/><circle cx="167" cy="97" r="10" fill={c(11)} stroke={NAVY} strokeWidth="1.2"/><circle cx="113" cy="97" r="5" fill={c(12)}/><circle cx="167" cy="97" r="5" fill={c(13)}/><circle cx="116" cy="94" r="2" fill="white"/><circle cx="170" cy="94" r="2" fill="white"/><rect x="93" y="143" width="94" height="16" rx="8" fill={c(14)} stroke={NAVY} strokeWidth="1.2"/><circle cx="140" cy="162" r="8" fill={c(15)} stroke={NAVY} strokeWidth="1"/><ellipse cx="140" cy="130" rx="12" ry="10" fill={c(16)} stroke={NAVY} strokeWidth="1"/><path d="M 127,127 Q 140,135 153,127" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/></>);}},
          {name:"Cat",emoji:"🐱",free:true,
           defaults:{1:"#fef3c7",2:"#86efac",3:"#f5e6d3",4:"#f5e6d3",5:"#f5e6d3",6:"#f472b6",7:"#f472b6",8:"#f5e6d3",9:"#f472b6",10:"#4ade80",11:"#4ade80",12:"#1a0a00",13:"#1a0a00",14:"#d4a574",15:"#d4a574",16:"#d4a574"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Body",cx:140,cy:188},{id:4,label:"Left Ear",cx:92,cy:60},{id:5,label:"Right Ear",cx:188,cy:60},{id:6,label:"Inn L Ear",cx:92,cy:62},{id:7,label:"Inn R Ear",cx:188,cy:62},{id:8,label:"Head",cx:140,cy:105},{id:9,label:"Nose",cx:140,cy:109},{id:10,label:"Left Eye",cx:112,cy:96},{id:11,label:"Right Eye",cx:168,cy:96},{id:12,label:"L Pupil",cx:112,cy:96},{id:13,label:"R Pupil",cx:168,cy:96},{id:14,label:"Left Paw",cx:100,cy:240},{id:15,label:"Right Paw",cx:180,cy:240},{id:16,label:"Tail",cx:216,cy:178}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><ellipse cx="216" cy="180" rx="28" ry="14" fill={c(16)} stroke={NAVY} strokeWidth="1.5" transform="rotate(-25,216,180)"/><rect x="86" y="214" width="28" height="44" rx="12" fill={c(14)} stroke={NAVY} strokeWidth="1.5"/><rect x="166" y="214" width="28" height="44" rx="12" fill={c(15)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="95" cy="256" rx="5" ry="3" fill={c(14)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="100" cy="258" rx="5" ry="3" fill={c(14)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="105" cy="256" rx="5" ry="3" fill={c(14)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="175" cy="256" rx="5" ry="3" fill={c(15)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="180" cy="258" rx="5" ry="3" fill={c(15)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="185" cy="256" rx="5" ry="3" fill={c(15)} stroke={NAVY} strokeWidth="0.8"/><ellipse cx="140" cy="188" rx="60" ry="50" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><path d="M 108,174 Q 140,168 172,174" fill="none" stroke="rgba(180,140,90,0.45)" strokeWidth="5" strokeLinecap="round"/><path d="M 104,188 Q 140,182 176,188" fill="none" stroke="rgba(180,140,90,0.45)" strokeWidth="5" strokeLinecap="round"/><path d="M 108,202 Q 140,196 172,202" fill="none" stroke="rgba(180,140,90,0.45)" strokeWidth="5" strokeLinecap="round"/><polygon points="78,92 70,40 118,70" fill={c(4)} stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round"/><polygon points="202,92 210,40 162,70" fill={c(5)} stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round"/><polygon points="82,86 76,48 112,68" fill={c(6)}/><polygon points="198,86 204,48 168,68" fill={c(7)}/><circle cx="140" cy="106" r="54" fill={c(8)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="108" cy="120" rx="16" ry="10" fill="rgba(244,114,182,0.18)"/><ellipse cx="172" cy="120" rx="16" ry="10" fill="rgba(244,114,182,0.18)"/><polygon points="140,103 134,112 146,112" fill={c(9)} stroke={NAVY} strokeWidth="1" strokeLinejoin="round"/><ellipse cx="112" cy="97" rx="11" ry="10" fill={c(10)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="168" cy="97" rx="11" ry="10" fill={c(11)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="112" cy="97" rx="4" ry="9" fill={c(12)}/><ellipse cx="168" cy="97" rx="4" ry="9" fill={c(13)}/><circle cx="115" cy="93" r="2" fill="white"/><circle cx="171" cy="93" r="2" fill="white"/><line x1="86" y1="113" x2="126" y2="117" stroke={NAVY} strokeWidth="1" opacity="0.45"/><line x1="86" y1="121" x2="126" y2="121" stroke={NAVY} strokeWidth="1" opacity="0.45"/><line x1="154" y1="117" x2="194" y2="113" stroke={NAVY} strokeWidth="1" opacity="0.45"/><line x1="154" y1="121" x2="194" y2="121" stroke={NAVY} strokeWidth="1" opacity="0.45"/><path d="M 133,114 Q 140,121 147,114" fill="none" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/></>);}},
          {name:"Flower",emoji:"🌸",free:true,
           defaults:{1:"#dbeafe",2:"#86efac",3:"#166534",4:"#166534",5:"#166534",6:"#f9a8d4",7:"#f9a8d4",8:"#f9a8d4",9:"#f9a8d4",10:"#f9a8d4",11:"#f9a8d4",12:"#f9a8d4",13:"#f9a8d4",14:"#fbbf24",15:"#f97316"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Stem",cx:140,cy:200},{id:4,label:"Left Leaf",cx:106,cy:192},{id:5,label:"Right Leaf",cx:174,cy:192},{id:6,label:"Top Petal",cx:140,cy:66},{id:7,label:"Bot Petal",cx:140,cy:152},{id:8,label:"Left Petal",cx:74,cy:109},{id:9,label:"Right Petal",cx:206,cy:109},{id:10,label:"Top-L Petal",cx:94,cy:78},{id:11,label:"Top-R Petal",cx:186,cy:78},{id:12,label:"Bot-L Petal",cx:94,cy:140},{id:13,label:"Bot-R Petal",cx:186,cy:140},{id:14,label:"Centre",cx:140,cy:109},{id:15,label:"Centre Dot",cx:140,cy:109}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><rect x="133" y="142" width="14" height="120" rx="7" fill={c(3)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="106" cy="194" rx="36" ry="14" fill={c(4)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-22,106,194)"/><ellipse cx="174" cy="194" rx="36" ry="14" fill={c(5)} stroke={NAVY} strokeWidth="1.2" transform="rotate(22,174,194)"/><line x1="106" y1="194" x2="134" y2="188" stroke="rgba(22,101,52,0.4)" strokeWidth="1.5"/><line x1="174" y1="194" x2="146" y2="188" stroke="rgba(22,101,52,0.4)" strokeWidth="1.5"/><ellipse cx="140" cy="70" rx="18" ry="36" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="148" rx="18" ry="36" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="74" cy="109" rx="36" ry="18" fill={c(8)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="206" cy="109" rx="36" ry="18" fill={c(9)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="94" cy="78" rx="24" ry="24" fill={c(10)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,94,78)"/><ellipse cx="186" cy="78" rx="24" ry="24" fill={c(11)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,186,78)"/><ellipse cx="94" cy="140" rx="24" ry="24" fill={c(12)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,94,140)"/><ellipse cx="186" cy="140" rx="24" ry="24" fill={c(13)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,186,140)"/><circle cx="140" cy="109" r="34" fill={c(14)} stroke={NAVY} strokeWidth="1.5"/><circle cx="140" cy="109" r="16" fill={c(15)} stroke={NAVY} strokeWidth="1.2"/><circle cx="134" cy="103" r="2.5" fill="rgba(0,0,0,0.12)"/><circle cx="146" cy="103" r="2.5" fill="rgba(0,0,0,0.12)"/><circle cx="140" cy="115" r="2.5" fill="rgba(0,0,0,0.12)"/></>);}},
          // PREMIUM SCENES
          {name:"Rose",emoji:"🌹",free:false,
           defaults:{1:"#fce7f3",2:"#86efac",3:"#166534",4:"#166534",5:"#166534",6:"#ef4444",7:"#dc2626",8:"#f87171",9:"#ef4444",10:"#dc2626",11:"#ef4444",12:"#fca5a5",13:"#fbbf24",14:"#166534"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Stem",cx:140,cy:210},{id:4,label:"Left Leaf",cx:100,cy:198},{id:5,label:"Right Leaf",cx:180,cy:198},{id:6,label:"Outer Petal L",cx:108,cy:118},{id:7,label:"Outer Petal R",cx:172,cy:118},{id:8,label:"Outer Petal Top",cx:140,cy:80},{id:9,label:"Mid Petal L",cx:116,cy:108},{id:10,label:"Mid Petal R",cx:164,cy:108},{id:11,label:"Inner Petal",cx:140,cy:98},{id:12,label:"Centre",cx:140,cy:105},{id:13,label:"Thorns",cx:155,cy:175},{id:14,label:"Sepal",cx:140,cy:140}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><rect x="135" y="148" width="10" height="118" rx="5" fill={c(3)} stroke={NAVY} strokeWidth="1"/><ellipse cx="100" cy="200" rx="34" ry="13" fill={c(4)} stroke={NAVY} strokeWidth="1" transform="rotate(-25,100,200)"/><ellipse cx="180" cy="200" rx="34" ry="13" fill={c(5)} stroke={NAVY} strokeWidth="1" transform="rotate(25,180,200)"/><polygon points="148,172 155,162 162,172" fill={c(13)}/><polygon points="155,185 162,175 169,185" fill={c(13)}/><ellipse cx="140" cy="140" rx="22" ry="12" fill={c(14)} stroke={NAVY} strokeWidth="1"/><ellipse cx="108" cy="120" rx="28" ry="38" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="172" cy="120" rx="28" ry="38" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="82" rx="32" ry="28" fill={c(8)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="116" cy="110" rx="22" ry="30" fill={c(9)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="164" cy="110" rx="22" ry="30" fill={c(10)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="100" rx="20" ry="24" fill={c(11)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="108" rx="12" ry="14" fill={c(12)} stroke={NAVY} strokeWidth="1"/></>);}},
          {name:"Sunflower",emoji:"🌻",free:false,
           defaults:{1:"#dbeafe",2:"#86efac",3:"#166534",4:"#166534",5:"#166534",6:"#fbbf24",7:"#fbbf24",8:"#fbbf24",9:"#fbbf24",10:"#fbbf24",11:"#fbbf24",12:"#fbbf24",13:"#fbbf24",14:"#92400e",15:"#78350f"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Stem",cx:140,cy:210},{id:4,label:"Left Leaf",cx:104,cy:200},{id:5,label:"Right Leaf",cx:176,cy:200},{id:6,label:"Top Petal",cx:140,cy:56},{id:7,label:"Bot Petal",cx:140,cy:162},{id:8,label:"Left Petal",cx:56,cy:109},{id:9,label:"Right Petal",cx:224,cy:109},{id:10,label:"Top-L Petal",cx:88,cy:72},{id:11,label:"Top-R Petal",cx:192,cy:72},{id:12,label:"Bot-L Petal",cx:88,cy:146},{id:13,label:"Bot-R Petal",cx:192,cy:146},{id:14,label:"Centre",cx:140,cy:109},{id:15,label:"Centre Dark",cx:140,cy:109}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><rect x="134" y="155" width="12" height="108" rx="6" fill={c(3)} stroke={NAVY} strokeWidth="1"/><ellipse cx="104" cy="202" rx="34" ry="13" fill={c(4)} stroke={NAVY} strokeWidth="1" transform="rotate(-20,104,202)"/><ellipse cx="176" cy="202" rx="34" ry="13" fill={c(5)} stroke={NAVY} strokeWidth="1" transform="rotate(20,176,202)"/><ellipse cx="140" cy="58" rx="16" ry="34" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="160" rx="16" ry="34" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="58" cy="109" rx="34" ry="16" fill={c(8)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="222" cy="109" rx="34" ry="16" fill={c(9)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="88" cy="72" rx="22" ry="22" fill={c(10)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,88,72)"/><ellipse cx="192" cy="72" rx="22" ry="22" fill={c(11)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,192,72)"/><ellipse cx="88" cy="146" rx="22" ry="22" fill={c(12)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,88,146)"/><ellipse cx="192" cy="146" rx="22" ry="22" fill={c(13)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,192,146)"/><circle cx="140" cy="109" r="38" fill={c(14)} stroke={NAVY} strokeWidth="1.5"/><circle cx="140" cy="109" r="24" fill={c(15)} stroke={NAVY} strokeWidth="1"/><circle cx="132" cy="101" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="140" cy="99" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="148" cy="101" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="130" cy="109" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="150" cy="109" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="132" cy="117" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="140" cy="119" r="3" fill="rgba(0,0,0,0.2)"/><circle cx="148" cy="117" r="3" fill="rgba(0,0,0,0.2)"/></>);}},
          {name:"Daisy",emoji:"🌼",free:false,
           defaults:{1:"#f0fdf4",2:"#86efac",3:"#166534",4:"#166534",5:"#166534",6:"#ffffff",7:"#ffffff",8:"#ffffff",9:"#ffffff",10:"#ffffff",11:"#ffffff",12:"#ffffff",13:"#ffffff",14:"#fbbf24",15:"#f97316"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Stem",cx:140,cy:210},{id:4,label:"Left Leaf",cx:106,cy:200},{id:5,label:"Right Leaf",cx:174,cy:200},{id:6,label:"Top Petal",cx:140,cy:62},{id:7,label:"Bot Petal",cx:140,cy:156},{id:8,label:"Left Petal",cx:70,cy:109},{id:9,label:"Right Petal",cx:210,cy:109},{id:10,label:"Top-L Petal",cx:90,cy:74},{id:11,label:"Top-R Petal",cx:190,cy:74},{id:12,label:"Bot-L Petal",cx:90,cy:144},{id:13,label:"Bot-R Petal",cx:190,cy:144},{id:14,label:"Centre",cx:140,cy:109},{id:15,label:"Centre Dot",cx:140,cy:109}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><rect x="134" y="148" width="12" height="116" rx="6" fill={c(3)} stroke={NAVY} strokeWidth="1"/><ellipse cx="106" cy="202" rx="34" ry="13" fill={c(4)} stroke={NAVY} strokeWidth="1" transform="rotate(-22,106,202)"/><ellipse cx="174" cy="202" rx="34" ry="13" fill={c(5)} stroke={NAVY} strokeWidth="1" transform="rotate(22,174,202)"/><ellipse cx="140" cy="64" rx="14" ry="38" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="140" cy="154" rx="14" ry="38" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="72" cy="109" rx="38" ry="14" fill={c(8)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="208" cy="109" rx="38" ry="14" fill={c(9)} stroke={NAVY} strokeWidth="1.2"/><ellipse cx="90" cy="74" rx="20" ry="20" fill={c(10)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,90,74)"/><ellipse cx="190" cy="74" rx="20" ry="20" fill={c(11)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,190,74)"/><ellipse cx="90" cy="144" rx="20" ry="20" fill={c(12)} stroke={NAVY} strokeWidth="1.2" transform="rotate(45,90,144)"/><ellipse cx="190" cy="144" rx="20" ry="20" fill={c(13)} stroke={NAVY} strokeWidth="1.2" transform="rotate(-45,190,144)"/><circle cx="140" cy="109" r="30" fill={c(14)} stroke={NAVY} strokeWidth="1.5"/><circle cx="140" cy="109" r="14" fill={c(15)} stroke={NAVY} strokeWidth="1"/></>);}},
          {name:"Robin",emoji:"🐦",free:false,
           defaults:{1:"#dbeafe",2:"#86efac",3:"#78350f",4:"#78350f",5:"#ef4444",6:"#78350f",7:"#1a0a00",8:"#1a0a00",9:"#ffffff",10:"#eab308",11:"#eab308",12:"#78350f",13:"#78350f",14:"#1e3a5f"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Body",cx:140,cy:155},{id:4,label:"Wing",cx:158,cy:148},{id:5,label:"Breast",cx:126,cy:148},{id:6,label:"Head",cx:130,cy:98},{id:7,label:"Left Eye",cx:122,cy:90},{id:8,label:"Eye Dot",cx:122,cy:90},{id:9,label:"Eye Ring",cx:122,cy:90},{id:10,label:"Beak Top",cx:108,cy:96},{id:11,label:"Beak Bot",cx:108,cy:102},{id:12,label:"Tail",cx:168,cy:178},{id:13,label:"Left Leg",cx:128,cy:215},{id:14,label:"Right Leg",cx:152,cy:215}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><line x1="128" y1="205" x2="122" y2="230" stroke={c(13)} strokeWidth="4" strokeLinecap="round"/><line x1="122" y1="230" x2="112" y2="234" stroke={c(13)} strokeWidth="3" strokeLinecap="round"/><line x1="122" y1="230" x2="118" y2="238" stroke={c(13)} strokeWidth="3" strokeLinecap="round"/><line x1="152" y1="205" x2="158" y2="230" stroke={c(14)} strokeWidth="4" strokeLinecap="round"/><line x1="158" y1="230" x2="168" y2="234" stroke={c(14)} strokeWidth="3" strokeLinecap="round"/><line x1="158" y1="230" x2="162" y2="238" stroke={c(14)} strokeWidth="3" strokeLinecap="round"/><ellipse cx="162" cy="178" rx="18" ry="28" fill={c(12)} stroke={NAVY} strokeWidth="1" transform="rotate(15,162,178)"/><ellipse cx="140" cy="158" rx="44" ry="52" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="160" cy="150" rx="30" ry="42" fill={c(4)} stroke={NAVY} strokeWidth="1" transform="rotate(10,160,150)"/><ellipse cx="122" cy="150" rx="26" ry="36" fill={c(5)} stroke={NAVY} strokeWidth="1.2"/><circle cx="130" cy="100" r="34" fill={c(6)} stroke={NAVY} strokeWidth="1.5"/><circle cx="122" cy="91" r="10" fill={c(7)} stroke={NAVY} strokeWidth="1"/><circle cx="122" cy="91" r="6" fill={c(8)}/><circle cx="122" cy="91" r="3" fill="white"/><polygon points="95,93 112,90 95,99" fill={c(10)} stroke={NAVY} strokeWidth="0.8"/><polygon points="95,99 112,99 95,105" fill={c(11)} stroke={NAVY} strokeWidth="0.8"/></>);}},
          {name:"Parrot",emoji:"🦜",free:false,
           defaults:{1:"#dbeafe",2:"#86efac",3:"#22c55e",4:"#22c55e",5:"#ef4444",6:"#eab308",7:"#22c55e",8:"#22c55e",9:"#3b82f6",10:"#1a0a00",11:"#ffffff",12:"#eab308",13:"#eab308",14:"#78350f",15:"#78350f"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:268},{id:3,label:"Body",cx:140,cy:165},{id:4,label:"Wing",cx:160,cy:155},{id:5,label:"Head",cx:130,cy:92},{id:6,label:"Forehead",cx:128,cy:78},{id:7,label:"Tail",cx:162,cy:198},{id:8,label:"Chest",cx:120,cy:158},{id:9,label:"Wing Tip",cx:168,cy:175},{id:10,label:"Eye",cx:138,cy:88},{id:11,label:"Eye Dot",cx:138,cy:88},{id:12,label:"Beak Top",cx:120,cy:95},{id:13,label:"Beak Bot",cx:120,cy:103},{id:14,label:"Left Leg",cx:126,cy:220},{id:15,label:"Right Leg",cx:154,cy:220}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="270" rx="140" ry="18" fill={c(2)}/><rect x="0" y="258" width="280" height="22" fill={c(2)}/><line x1="126" y1="210" x2="118" y2="235" stroke={c(14)} strokeWidth="5" strokeLinecap="round"/><line x1="118" y1="235" x2="106" y2="240" stroke={c(14)} strokeWidth="3" strokeLinecap="round"/><line x1="118" y1="235" x2="112" y2="244" stroke={c(14)} strokeWidth="3" strokeLinecap="round"/><line x1="154" y1="210" x2="162" y2="235" stroke={c(15)} strokeWidth="5" strokeLinecap="round"/><line x1="162" y1="235" x2="174" y2="240" stroke={c(15)} strokeWidth="3" strokeLinecap="round"/><line x1="162" y1="235" x2="168" y2="244" stroke={c(15)} strokeWidth="3" strokeLinecap="round"/><ellipse cx="162" cy="200" rx="14" ry="36" fill={c(7)} stroke={NAVY} strokeWidth="1" transform="rotate(12,162,200)"/><ellipse cx="166" cy="178" rx="22" ry="32" fill={c(9)} stroke={NAVY} strokeWidth="1" transform="rotate(8,166,178)"/><ellipse cx="140" cy="168" rx="40" ry="52" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="158" cy="158" rx="30" ry="44" fill={c(4)} stroke={NAVY} strokeWidth="1" transform="rotate(8,158,158)"/><ellipse cx="118" cy="162" rx="24" ry="32" fill={c(8)} stroke={NAVY} strokeWidth="1.2"/><circle cx="130" cy="94" r="36" fill={c(5)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="128" cy="78" rx="18" ry="12" fill={c(6)} stroke={NAVY} strokeWidth="1"/><circle cx="138" cy="89" r="9" fill={c(10)} stroke={NAVY} strokeWidth="1"/><circle cx="138" cy="89" r="4" fill={c(11)}/><circle cx="140" cy="87" r="2" fill="white"/><polygon points="104,91 122,88 104,97" fill={c(12)} stroke={NAVY} strokeWidth="0.8"/><polygon points="104,97 122,97 104,105" fill={c(13)} stroke={NAVY} strokeWidth="0.8"/></>);}},
          {name:"Owl",emoji:"🦉",free:false,
           defaults:{1:"#1e1b4b",2:"#86efac",3:"#92400e",4:"#92400e",5:"#d4a574",6:"#d4a574",7:"#ffffff",8:"#eab308",9:"#1a0a00",10:"#1a0a00",11:"#eab308",12:"#92400e",13:"#92400e",14:"#78350f"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Branch",cx:140,cy:240},{id:3,label:"Body",cx:140,cy:165},{id:4,label:"Wings",cx:140,cy:160},{id:5,label:"Chest",cx:140,cy:170},{id:6,label:"Face Disc",cx:140,cy:110},{id:7,label:"Left Eye",cx:120,cy:105},{id:8,label:"Left Iris",cx:120,cy:105},{id:9,label:"L Pupil",cx:120,cy:105},{id:10,label:"Right Eye",cx:160,cy:105},{id:11,label:"Right Iris",cx:160,cy:105},{id:12,label:"R Pupil",cx:160,cy:105},{id:13,label:"Beak",cx:140,cy:122},{id:14,label:"Ear Tufts",cx:140,cy:80}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><rect x="60" y="228" width="160" height="28" rx="14" fill="#78350f" stroke={NAVY} strokeWidth="1"/><ellipse cx="140" cy="228" rx="80" ry="14" fill="#92400e"/><ellipse cx="168" cy="185" rx="36" ry="56" fill={c(4)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="112" cy="185" rx="36" ry="56" fill={c(4)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="140" cy="168" rx="38" ry="58" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><ellipse cx="140" cy="178" rx="28" ry="40" fill={c(5)} stroke={NAVY} strokeWidth="1"/><path d="M 118,185 Q 140,178 162,185 Q 160,200 140,204 Q 120,200 118,185 Z" fill="rgba(0,0,0,0.12)"/><ellipse cx="140" cy="112" rx="36" ry="32" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><circle cx="120" cy="106" r="18" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><circle cx="160" cy="106" r="18" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><circle cx="120" cy="106" r="12" fill={c(8)}/><circle cx="160" cy="106" r="12" fill={c(11)}/><circle cx="120" cy="106" r="6" fill={c(9)}/><circle cx="160" cy="106" r="6" fill={c(12)}/><circle cx="123" cy="103" r="2.5" fill="white"/><circle cx="163" cy="103" r="2.5" fill="white"/><polygon points="132,118 140,128 148,118" fill={c(13)} stroke={NAVY} strokeWidth="0.8"/><polygon points="124,84 140,68 156,84 148,88 140,76 132,88" fill={c(14)} stroke={NAVY} strokeWidth="1"/></>);}},
          {name:"Cottage",emoji:"🏡",free:false,
           defaults:{1:"#87ceeb",2:"#86efac",3:"#dc2626",4:"#dc2626",5:"#f5e6d3",6:"#f5e6d3",7:"#92400e",8:"#60a5fa",9:"#60a5fa",10:"#60a5fa",11:"#60a5fa",12:"#166534",13:"#eab308",14:"#d4a574"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:258},{id:3,label:"Roof Left",cx:100,cy:115},{id:4,label:"Roof Right",cx:180,cy:115},{id:5,label:"Wall Left",cx:100,cy:185},{id:6,label:"Wall Right",cx:180,cy:185},{id:7,label:"Door",cx:140,cy:200},{id:8,label:"Window TL",cx:100,cy:168},{id:9,label:"Window TR",cx:180,cy:168},{id:10,label:"Win BL",cx:100,cy:195},{id:11,label:"Win BR",cx:180,cy:195},{id:12,label:"Garden",cx:140,cy:240},{id:13,label:"Chimney",cx:172,cy:95},{id:14,label:"Path",cx:140,cy:242}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="260" rx="140" ry="22" fill={c(2)}/><rect x="0" y="248" width="280" height="32" fill={c(2)}/><rect x="62" y="140" width="156" height="110" rx="4" fill={c(5)} stroke={NAVY} strokeWidth="1.5"/><rect x="62" y="140" width="78" height="110" fill={c(5)}/><rect x="140" y="140" width="78" height="110" fill={c(6)}/><polygon points="50,148 140,80 230,148" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><polygon points="140,80 230,148 230,148" fill={c(4)} stroke={NAVY} strokeWidth="1.5"/><rect x="160" y="76" width="18" height="40" rx="4" fill={c(13)} stroke={NAVY} strokeWidth="1"/><rect x="118" y="178" width="44" height="72" rx="4" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><circle cx="138" cy="214" r="3" fill="#eab308"/><rect x="74" y="158" width="34" height="26" rx="3" fill={c(8)} stroke={NAVY} strokeWidth="1"/><rect x="172" y="158" width="34" height="26" rx="3" fill={c(9)} stroke={NAVY} strokeWidth="1"/><line x1="91" y1="158" x2="91" y2="184" stroke={NAVY} strokeWidth="1"/><line x1="74" y1="171" x2="108" y2="171" stroke={NAVY} strokeWidth="1"/><line x1="189" y1="158" x2="189" y2="184" stroke={NAVY} strokeWidth="1"/><line x1="172" y1="171" x2="206" y2="171" stroke={NAVY} strokeWidth="1"/><ellipse cx="80" cy="248" rx="18" ry="8" fill={c(12)}/><ellipse cx="200" cy="248" rx="18" ry="8" fill={c(12)}/><rect x="125" y="230" width="30" height="20" rx="2" fill={c(14)}/></>);}},
          {name:"Townhouse",emoji:"🏘️",free:false,
           defaults:{1:"#87ceeb",2:"#86efac",3:"#1e3a5f",4:"#9ca3af",5:"#d4a574",6:"#d4a574",7:"#92400e",8:"#60a5fa",9:"#60a5fa",10:"#60a5fa",11:"#60a5fa",12:"#eab308",13:"#1e3a5f",14:"#9ca3af"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:262},{id:3,label:"Roof",cx:140,cy:102},{id:4,label:"Attic",cx:140,cy:130},{id:5,label:"Wall Left",cx:100,cy:188},{id:6,label:"Wall Right",cx:180,cy:188},{id:7,label:"Door",cx:140,cy:208},{id:8,label:"Win TL",cx:92,cy:162},{id:9,label:"Win TR",cx:188,cy:162},{id:10,label:"Win BL",cx:92,cy:195},{id:11,label:"Win BR",cx:188,cy:195},{id:12,label:"Chimney",cx:96,cy:90},{id:13,label:"Roof 2",cx:140,cy:108},{id:14,label:"Step",cx:140,cy:236}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="264" rx="140" ry="18" fill={c(2)}/><rect x="0" y="252" width="280" height="28" fill={c(2)}/><rect x="68" y="142" width="144" height="112" rx="3" fill={c(5)} stroke={NAVY} strokeWidth="1.5"/><rect x="68" y="142" width="72" height="112" fill={c(5)}/><rect x="140" y="142" width="72" height="112" fill={c(6)}/><polygon points="55,150 140,75 225,150" fill={c(3)} stroke={NAVY} strokeWidth="1.5"/><rect x="88" y="68" width="16" height="42" rx="3" fill={c(12)} stroke={NAVY} strokeWidth="1"/><rect x="78" y="144" width="124" height="22" fill={c(4)} stroke={NAVY} strokeWidth="1"/><rect x="115" y="180" width="50" height="74" rx="3" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><circle cx="133" cy="218" r="3" fill="#eab308"/><rect x="75" y="150" width="32" height="24" rx="2" fill={c(8)} stroke={NAVY} strokeWidth="1"/><rect x="173" y="150" width="32" height="24" rx="2" fill={c(9)} stroke={NAVY} strokeWidth="1"/><rect x="75" y="182" width="32" height="24" rx="2" fill={c(10)} stroke={NAVY} strokeWidth="1"/><rect x="173" y="182" width="32" height="24" rx="2" fill={c(11)} stroke={NAVY} strokeWidth="1"/><line x1="91" y1="150" x2="91" y2="174" stroke={NAVY} strokeWidth="0.8"/><line x1="75" y1="162" x2="107" y2="162" stroke={NAVY} strokeWidth="0.8"/><line x1="189" y1="150" x2="189" y2="174" stroke={NAVY} strokeWidth="0.8"/><line x1="173" y1="162" x2="205" y2="162" stroke={NAVY} strokeWidth="0.8"/><rect x="120" y="244" width="40" height="10" rx="3" fill={c(14)}/></>);}},
          {name:"Barn",emoji:"🏚️",free:false,
           defaults:{1:"#87ceeb",2:"#86efac",3:"#dc2626",4:"#92400e",5:"#92400e",6:"#eab308",7:"#1a0a00",8:"#60a5fa",9:"#60a5fa",10:"#92400e",11:"#d4a574",12:"#dc2626",13:"#9ca3af",14:"#d4a574"},
           sections:[{id:1,label:"Sky",cx:30,cy:30},{id:2,label:"Grass",cx:140,cy:262},{id:3,label:"Roof",cx:140,cy:100},{id:4,label:"Wall",cx:140,cy:185},{id:5,label:"Left Wall",cx:78,cy:185},{id:6,label:"Loft Door",cx:140,cy:148},{id:7,label:"Main Door",cx:140,cy:208},{id:8,label:"Win Left",cx:84,cy:178},{id:9,label:"Win Right",cx:196,cy:178},{id:10,label:"Siding",cx:140,cy:190},{id:11,label:"Right Wall",cx:202,cy:185},{id:12,label:"Roof Peak",cx:140,cy:85},{id:13,label:"Loft Frame",cx:140,cy:148},{id:14,label:"Path",cx:140,cy:245}],
           render(c){return(<><rect x="0" y="0" width="280" height="280" fill={c(1)}/><ellipse cx="140" cy="264" rx="140" ry="18" fill={c(2)}/><rect x="0" y="252" width="280" height="28" fill={c(2)}/><rect x="55" y="140" width="170" height="115" rx="3" fill={c(4)} stroke={NAVY} strokeWidth="1.5"/><rect x="55" y="140" width="34" height="115" fill={c(5)}/><rect x="191" y="140" width="34" height="115" fill={c(11)}/><line x1="55" y1="155" x2="225" y2="155" stroke="rgba(0,0,0,0.15)" strokeWidth="6"/><line x1="55" y1="171" x2="225" y2="171" stroke="rgba(0,0,0,0.15)" strokeWidth="6"/><line x1="55" y1="187" x2="225" y2="187" stroke="rgba(0,0,0,0.15)" strokeWidth="6"/><line x1="55" y1="203" x2="225" y2="203" stroke="rgba(0,0,0,0.15)" strokeWidth="6"/><polygon points="38,148 140,68 242,148" fill={c(3)} stroke={NAVY} strokeWidth="2"/><polygon points="38,148 140,68 140,68" fill={c(12)} stroke={NAVY} strokeWidth="1"/><rect x="112" y="130" width="56" height="42" rx="4" fill={c(6)} stroke={NAVY} strokeWidth="1.2"/><rect x="116" y="134" width="24" height="34" rx="2" fill={c(13)} stroke={NAVY} strokeWidth="1"/><rect x="140" y="134" width="24" height="34" rx="2" fill={c(13)} stroke={NAVY} strokeWidth="1"/><rect x="112" y="178" width="56" height="77" rx="3" fill={c(7)} stroke={NAVY} strokeWidth="1.2"/><rect x="68" y="165" width="30" height="22" rx="2" fill={c(8)} stroke={NAVY} strokeWidth="1"/><rect x="182" y="165" width="30" height="22" rx="2" fill={c(9)} stroke={NAVY} strokeWidth="1"/><line x1="83" y1="165" x2="83" y2="187" stroke={NAVY} strokeWidth="0.8"/><line x1="68" y1="176" x2="98" y2="176" stroke={NAVY} strokeWidth="0.8"/><line x1="197" y1="165" x2="197" y2="187" stroke={NAVY} strokeWidth="0.8"/><line x1="182" y1="176" x2="212" y2="176" stroke={NAVY} strokeWidth="0.8"/><rect x="125" y="242" width="30" height="13" rx="3" fill={c(14)}/></>);}},
        ];

        const cbnKey=(scIdx,id)=>`cbn-${scIdx}-${id}`;
        const cbnGetCol=(scIdx,id)=>painted[cbnKey(scIdx,id)]||CBN_SCENES[scIdx]?.defaults[id]||"#e8eef4";
        const cbnPaint=(id)=>setPainted(p=>({...p,[cbnKey(cbnSceneIdx,id)]:cbnSelPaint.color}));
        const cbnClear=()=>{const next={...painted};Object.keys(next).filter(k=>k.startsWith(`cbn-${cbnSceneIdx}-`)).forEach(k=>delete next[k]);setPainted(next);};

        const curScene=CBN_SCENES[cbnSceneIdx]||CBN_SCENES[0];
        const mainSecs=curScene.sections.filter(s=>s.label!=="Sky"&&s.label!=="Grass"&&s.label!=="Branch");
        const doneCount=mainSecs.filter(s=>painted[cbnKey(cbnSceneIdx,s.id)]).length;
        const pct=mainSecs.length>0?Math.round((doneCount/mainSecs.length)*100):0;

        return(
          <div>
            <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🎨 Colour by Number</div>
            <div style={{fontSize:13,color:"#5a6a7a",marginBottom:12}}>Pick a number colour then tap a section to paint it.</div>

            {/* Scene selector */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:8}}>FREE SCENES</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                {CBN_SCENES.filter(s=>s.free).map((s,i)=>{
                  const idx=CBN_SCENES.indexOf(s);
                  return(<button key={idx} onClick={()=>setCbnSceneIdx(idx)} style={{flex:1,background:cbnSceneIdx===idx?`${TEAL}15`:"#fff",border:`2px solid ${cbnSceneIdx===idx?TEAL:"rgba(30,58,95,0.1)"}`,borderRadius:12,padding:"8px 4px",cursor:"pointer"}}>
                    <div style={{fontSize:20,marginBottom:2}}>{s.emoji}</div>
                    <div style={{fontSize:10,fontWeight:700,color:cbnSceneIdx===idx?TEAL:NAVY}}>{s.name}</div>
                  </button>);
                })}
              </div>
              <div style={{fontSize:10,color:GOLD,letterSpacing:1.5,marginBottom:8}}>✦ PREMIUM SCENES</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {CBN_SCENES.filter(s=>!s.free).map((s,i)=>{
                  const idx=CBN_SCENES.indexOf(s);
                  return(<button key={idx} onClick={()=>premium?setCbnSceneIdx(idx):setModal(true)} style={{background:cbnSceneIdx===idx?`${WARM}15`:"rgba(201,146,10,0.05)",border:`2px solid ${cbnSceneIdx===idx?WARM:GOLD+"40"}`,borderRadius:12,padding:"8px 4px",cursor:"pointer",opacity:premium?1:0.7}}>
                    <div style={{fontSize:18,marginBottom:2}}>{s.emoji}</div>
                    <div style={{fontSize:9,fontWeight:700,color:cbnSceneIdx===idx?WARM:NAVY}}>{s.name}</div>
                    {!premium&&<div style={{fontSize:8,color:GOLD}}>✦</div>}
                  </button>);
                })}
              </div>
            </div>

            {/* Progress */}
            <div style={{...card({padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10})}}>
              <div style={{flex:1,background:"#e8eef4",borderRadius:8,height:8,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,background:`linear-gradient(90deg,${TEAL},#22c55e)`,height:8,borderRadius:8,transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:12,color:"#5a6a7a",whiteSpace:"nowrap"}}>{doneCount}/{mainSecs.length} · {pct}%</div>
            </div>

            {/* Palette */}
            <div style={{...card({marginBottom:10,padding:"12px"})}}>
              <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:8}}>PICK A COLOUR NUMBER</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
                {CBN_PALETTE.map(p=>(
                  <button key={p.num} onClick={()=>setCbnSelPaint(p)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:cbnSelPaint.num===p.num?`${TEAL}18`:"transparent",border:`2px solid ${cbnSelPaint.num===p.num?TEAL:"rgba(30,58,95,0.08)"}`,borderRadius:10,padding:"4px 2px",cursor:"pointer"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:p.color,border:p.color==="#ffffff"?"1px solid #bbb":"none"}}/>
                    <div style={{fontSize:10,fontWeight:700,color:cbnSelPaint.num===p.num?TEAL:NAVY}}>{p.num}</div>
                  </button>
                ))}
              </div>
              <div style={{marginTop:8,background:`${TEAL}10`,borderRadius:10,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:cbnSelPaint.color,border:cbnSelPaint.color==="#ffffff"?"1px solid #bbb":"none",flexShrink:0}}/>
                <div style={{fontSize:11,color:TEAL,fontWeight:600}}>#{cbnSelPaint.num} — {cbnSelPaint.name}</div>
              </div>
            </div>

            {/* Canvas */}
            <div style={{...card({marginBottom:10,padding:"10px"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5}}>TAP A SECTION</div>
                <button onClick={()=>setCbnShowNums(n=>!n)} style={{background:`${TEAL}12`,border:`1px solid ${TEAL}25`,borderRadius:8,padding:"3px 8px",fontSize:9,color:TEAL,fontWeight:700,cursor:"pointer"}}>{cbnShowNums?"Hide #s":"Show #s"}</button>
              </div>
              <svg viewBox="0 0 280 280" style={{width:"100%",borderRadius:10,display:"block"}}>
                {curScene.render(id=>cbnGetCol(cbnSceneIdx,id))}
                {curScene.sections.map(s=>(
                  <circle key={s.id} cx={s.cx} cy={s.cy} r={24} fill="transparent" style={{cursor:"pointer"}} onClick={()=>cbnPaint(s.id)}/>
                ))}
                {cbnShowNums&&curScene.sections.filter(s=>s.label!=="Sky"&&s.label!=="Grass"&&s.label!=="Branch").map(s=>(
                  <text key={`n${s.id}`} x={s.cx} y={s.cy} fontSize="9" fontWeight="bold" fill="white" stroke={NAVY} strokeWidth="2.5" paintOrder="stroke" textAnchor="middle" dominantBaseline="middle" style={{pointerEvents:"none",userSelect:"none"}}>{s.id}</text>
                ))}
              </svg>
            </div>

            {/* Section guide */}
            <div style={{...card({marginBottom:10,padding:"12px"})}}>
              <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:8}}>SECTION GUIDE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                {mainSecs.map(s=>(
                  <button key={s.id} onClick={()=>cbnPaint(s.id)} style={{display:"flex",alignItems:"center",gap:6,background:painted[cbnKey(cbnSceneIdx,s.id)]?`${TEAL}08`:"rgba(30,58,95,0.02)",border:`1px solid ${painted[cbnKey(cbnSceneIdx,s.id)]?TEAL+"25":"rgba(30,58,95,0.07)"}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:14,height:14,borderRadius:"50%",background:cbnGetCol(cbnSceneIdx,s.id),border:"1px solid rgba(30,58,95,0.15)",flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <span style={{fontSize:9,fontWeight:700,color:NAVY}}>#{s.id} </span>
                      <span style={{fontSize:8,color:"#5a6a7a"}}>{s.label}</span>
                    </div>
                    {painted[cbnKey(cbnSceneIdx,s.id)]&&<span style={{fontSize:9,color:"#22c55e"}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <button onClick={cbnClear} style={{flex:1,background:"rgba(30,58,95,0.07)",border:"1px solid rgba(30,58,95,0.1)",borderRadius:12,padding:"11px",color:NAVY,fontSize:12,cursor:"pointer"}}>Clear</button>
              {doneCount===mainSecs.length&&doneCount>0&&<div style={{flex:2,background:"linear-gradient(135deg,#22c55e,#06b6d4)",borderRadius:12,padding:"11px",textAlign:"center",color:"#fff",fontSize:12,fontWeight:700}}>🎉 Finished! Well done!</div>}
            </div>

            <div style={{...card({background:`${TEAL}08`,border:`1px solid ${TEAL}20`,padding:"12px"})}}>
              <div style={{fontSize:11,color:TEAL,fontWeight:700,marginBottom:4}}>Why colouring helps after stroke</div>
              <div style={{fontSize:11,color:"#3a4a5a",lineHeight:1.6}}>Colouring activates both brain hemispheres, reduces anxiety, and improves focus and fine motor control — all great for stroke recovery.</div>
            </div>
          </div>
        );
      })()}

      {/* STROOP */}
      {game==="stroop"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🌈 Colour Word</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Name the INK COLOUR — not the word. Score: {stroopScore}/{stroopTotal}</div>
          {!stroopItem&&!stroopDone&&<button onClick={initStroop} style={{width:"100%",background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start Challenge</button>}
          {stroopItem&&!stroopDone&&(
            <div style={{textAlign:"center"}}>
              <div style={{...card({padding:"32px",marginBottom:20,textAlign:"center"})}}>
                <div style={{fontSize:48,fontWeight:900,color:stroopItem.inkColor,letterSpacing:2}}>{stroopItem.word}</div>
                <div style={{fontSize:11,color:"#9aabb8",marginTop:8}}>What colour is the ink?</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {stroopItem.options.map(o=>(
                  <button key={o.word} onClick={()=>answerStroop(o.word)} style={{padding:"14px",background:"#fff",border:`2px solid ${o.color}40`,borderRadius:14,fontSize:15,fontWeight:700,color:o.color,cursor:"pointer"}}>{o.word}</button>
                ))}
              </div>
              <div style={{fontSize:11,color:"#9aabb8",marginTop:12}}>{10-stroopTotal} questions remaining</div>
            </div>
          )}
          {stroopDone&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{stroopScore>=8?"🏆":stroopScore>=5?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>{stroopScore}/10 Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:6,marginBottom:16}}>The Stroop task trains executive function and cognitive flexibility.</div>
              <button onClick={initStroop} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
            </div>
          )}
        </div>
      )}

      {/* WORD RECOGNITION */}
      {game==="wordrecog"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🔤 Word Recognition</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Which one is spelled correctly? Score: {wrScore}/{WORD_RECOG_SETS.length}</div>
          {!wrDone?(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:"#9aabb8",marginBottom:16}}>Question {wrIdx+1} of {WORD_RECOG_SETS.length}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {WORD_RECOG_SETS[wrIdx].options.map((o,i)=>(
                  <button key={i} onClick={()=>!wrFeedback&&answerWordRecog(o)} style={{padding:"18px 10px",background:wrFeedback?(o===WORD_RECOG_SETS[wrIdx].word?"#dcfce7":"#fff"):"#fff",border:`2px solid ${wrFeedback&&o===WORD_RECOG_SETS[wrIdx].word?"#22c55e":TEAL}20`,borderRadius:14,fontSize:16,fontWeight:700,color:NAVY,cursor:"pointer",letterSpacing:1}}>{o}</button>
                ))}
              </div>
            </div>
          ):(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{wrScore>=4?"🏆":wrScore>=3?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>{wrScore}/{WORD_RECOG_SETS.length} Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:6,marginBottom:16}}>Word recognition exercises rebuild the language pathways affected by stroke.</div>
              <button onClick={initWordRecog} style={{background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Try Again</button>
            </div>
          )}
        </div>
      )}

      {/* NUMBER RECOGNITION */}
      {game==="numrecog"&&(
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🔢 Number Recognition</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Tap the number you see. Score: {numScore}/{numTotal}</div>
          {!numQ&&!numDone&&<button onClick={initNumRecog} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start</button>}
          {numQ&&!numDone&&(
            <div style={{textAlign:"center"}}>
              <div style={{...card({padding:"40px",marginBottom:24,textAlign:"center"})}}>
                <div style={{fontSize:80,fontWeight:900,color:NAVY,lineHeight:1}}>{numQ.num}</div>
                <div style={{fontSize:11,color:"#9aabb8",marginTop:8}}>Tap this number below</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {numQ.options.map((o,i)=>(
                  <button key={i} onClick={()=>answerNum(o)} style={{padding:"20px",background:"#fff",border:`2px solid ${TEAL}25`,borderRadius:14,fontSize:28,fontWeight:700,color:NAVY,cursor:"pointer"}}>{o}</button>
                ))}
              </div>
            </div>
          )}
          {numDone&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{numScore>=8?"🏆":numScore>=5?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>{numScore}/10 Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:6,marginBottom:16}}>Number recognition rebuilds numerical processing pathways in the brain.</div>
              <button onClick={initNumRecog} style={{background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ══════════════════════ MAIN APP ══════════════════════ */
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:NAVY,maxWidth:"100%",margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        textarea::placeholder,input::placeholder{color:#9aabb8}
        button:active{opacity:0.85}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {/* Onboarding */}
      {!onboarded&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
          <div style={{textAlign:"center",maxWidth:380,animation:"fadeUp 0.7s ease both"}}>
            <div style={{fontSize:56,marginBottom:16}}>🧠</div>
            <div style={{fontSize:11,letterSpacing:3,color:TEAL,textTransform:"uppercase",marginBottom:8}}>Welcome to</div>
            <div style={{fontSize:34,fontWeight:700,color:NAVY,marginBottom:12,lineHeight:1.2}}>StrokeWise</div>
            <div style={{fontSize:15,color:"#5a6a7a",lineHeight:1.7,marginBottom:28}}>Education, recovery support, brain training, and emergency tools — for stroke survivors and their caregivers.</div>
            <div style={{fontSize:13,color:"#5a6a7a",marginBottom:14,fontWeight:600}}>I am a…</div>
            <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:20}}>
              {[{t:"Stroke Survivor",e:"🧠",v:"survivor"},{t:"Caregiver / Family",e:"❤️",v:"caregiver"}].map(u=>(
                <button key={u.v} onClick={()=>{setUserType(u.v);setOnboarded(true);}} style={{flex:1,background:"#fff",border:`2px solid ${TEAL}`,borderRadius:18,padding:"20px 12px",cursor:"pointer",boxShadow:"0 4px 20px rgba(42,127,138,0.15)"}}>
                  <div style={{fontSize:32,marginBottom:8}}>{u.e}</div>
                  <div style={{fontSize:13,fontWeight:700,color:NAVY,lineHeight:1.3}}>{u.t}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {["🚫 No ads","🚫 No pop-ups","✓ Free 7-day trial","✓ Cancel anytime"].map(b=>(
                <div key={b} style={{background:`${TEAL}12`,border:`1px solid ${TEAL}30`,borderRadius:20,padding:"4px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
              ))}
            </div>
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,padding:"12px 16px",fontSize:12,color:"#b91c1c",lineHeight:1.6}}>
              StrokeWise is for education and support only. Always follow your medical team's advice.
            </div>
          </div>
        </div>
      )}

      {/* Main app */}
      {onboarded&&(
        <>
          {/* Header */}
          <div style={{padding:"50px 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(248,244,239,0.94)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(30,58,95,0.07)",position:"sticky",top:0,zIndex:40}}>
            <div>
              <div style={{fontSize:10,letterSpacing:3,color:TEAL,textTransform:"uppercase"}}>{userType==="survivor"?"Stroke Survivor":"Caregiver"} Mode</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>StrokeWise</div>
            </div>
            {!premium
              ?<button onClick={()=>setModal(true)} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:20,padding:"6px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>✦ Premium</button>
              :<div style={{fontSize:11,color:WARM,letterSpacing:1,fontWeight:700}}>✦ PREMIUM</div>
            }
          </div>

          <div style={{padding:"16px 20px 90px"}}>

            {/* ══ HOME ══ */}
            {screen==="home"&&(
              <div style={{opacity:fadeIn?1:0,transition:"opacity 0.6s"}}>
                {/* Profile switcher */}
                <div style={{...card({marginBottom:14,padding:"12px 14px"})}}>
                  <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10}}>I AM A…</div>
                  <div style={{display:"flex",gap:8}}>
                    {[{t:"Stroke Survivor",e:"🧠",v:"survivor"},{t:"Caregiver / Family",e:"❤️",v:"caregiver"}].map(u=>(
                      <button key={u.v} onClick={()=>setUserType(u.v)} style={{flex:1,background:userType===u.v?`${TEAL}15`:"rgba(255,255,255,0.5)",border:`2px solid ${userType===u.v?TEAL:"rgba(30,58,95,0.1)"}`,borderRadius:14,padding:"10px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                        <div style={{fontSize:20,marginBottom:4}}>{u.e}</div>
                        <div style={{fontSize:11,fontWeight:700,color:userType===u.v?TEAL:NAVY,lineHeight:1.3}}>{u.t}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                  {["🚫 No ads","🚫 No pop-ups","✓ Free 7-day trial","✓ Cancel anytime"].map(b=>(
                    <div key={b} style={{background:`${TEAL}10`,border:`1px solid ${TEAL}25`,borderRadius:20,padding:"3px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
                  ))}
                </div>

                <div style={{...card({background:`linear-gradient(135deg,${NAVY},${TEAL})`,color:"#fff",marginBottom:14,padding:"20px"})}}>
                  <div style={{fontSize:9,letterSpacing:2.5,opacity:0.7,marginBottom:8}}>TODAY'S REMINDER</div>
                  <div style={{fontSize:15,lineHeight:1.65,fontStyle:"italic"}}>"{AFFIRMATIONS[affIdx]}"</div>
                </div>

                <div style={{...card({background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",marginBottom:14,padding:"14px 16px"})}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>Know the FAST signs</div>
                      <div style={{fontSize:11,color:"#7f1d1d",marginTop:2}}>Can save a life — including yours</div>
                    </div>
                    <button onClick={()=>setScreen("fast")} style={{background:"#dc2626",border:"none",borderRadius:10,padding:"7px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Review</button>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  {[
                    {e:"📚",t:"Learn",         s:userType==="caregiver"?"Caregiver & stroke topics":"Education topics", scr:"learn",     c:TEAL},
                    {e:"🧩",t:"Brain Training", s:"Daily exercises",                                                     scr:"brain",     c:WARM},
                    {e:"🆘",t:"Emergency",      s:"Worldwide numbers",                                                   scr:"emergency", c:"#dc2626"},
                    {e:"⚡",t:"FAST Signs",     s:"Stroke symptoms",                                                     scr:"fast",      c:GOLD},
                  ].map(a=>(
                    <button key={a.t} onClick={()=>setScreen(a.scr)} style={{...card({padding:"16px 14px",border:`1px solid ${a.c}20`,background:`${a.c}08`,cursor:"pointer",textAlign:"left"})}}>
                      <div style={{fontSize:26,marginBottom:6}}>{a.e}</div>
                      <div style={{fontSize:13,fontWeight:700,color:a.c}}>{a.t}</div>
                      <div style={{fontSize:10,color:"#5a6a7a",marginTop:2}}>{a.s}</div>
                    </button>
                  ))}
                </div>

                {userType==="caregiver"&&(
                  <div style={{...card({background:`${WARM}08`,border:`1px solid ${WARM}20`,padding:"14px 16px"})}}>
                    <div style={{fontSize:11,fontWeight:700,color:WARM,marginBottom:4}}>Caregiver tip</div>
                    <div style={{fontSize:12,color:"#5a6a7a",lineHeight:1.65}}>You cannot pour from an empty cup. Schedule at least 15 minutes today that are entirely for you. See the Learn section for caregiver resources.</div>
                  </div>
                )}
              </div>
            )}

            {/* ══ FAST ══ */}
            {screen==="fast"&&(
              <div>
                <div style={{...card({background:"#dc2626",color:"#fff",textAlign:"center",marginBottom:16,padding:"20px"})}}>
                  <div style={{fontSize:22,marginBottom:6}}>ACT FAST</div>
                  <div style={{fontSize:13,opacity:0.9,lineHeight:1.6}}>If you suspect a stroke, call emergency services immediately. Every minute counts — 1.9 million brain cells die every minute during a stroke.</div>
                </div>
                {FAST_SIGNS.map(s=>(
                  <div key={s.letter} style={{...card({marginBottom:12,padding:"16px",border:`2px solid ${s.color}30`,background:`${s.color}06`})}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                      <div style={{width:48,height:48,borderRadius:14,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#fff",flexShrink:0}}>{s.letter}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:s.color,marginBottom:4}}>{s.word}</div>
                        <div style={{fontSize:13,color:"#3a4a5a",lineHeight:1.6,marginBottom:6}}>{s.desc}</div>
                        <div style={{background:`${s.color}15`,borderRadius:8,padding:"6px 10px",fontSize:11,color:s.color,fontWeight:600}}>{s.action}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{...card({marginBottom:12})}}>
                  <div style={{fontSize:12,fontWeight:700,color:NAVY,marginBottom:10}}>OTHER WARNING SIGNS</div>
                  {OTHER_SIGNS.map(o=>(
                    <div key={o.sign} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(30,58,95,0.06)"}}>
                      <span style={{fontSize:18,flexShrink:0}}>{o.icon}</span>
                      <span style={{fontSize:13,color:"#3a4a5a",lineHeight:1.5}}>{o.sign}</span>
                    </div>
                  ))}
                </div>
                <div style={{...card({background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",textAlign:"center",padding:"16px"})}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#dc2626",marginBottom:4}}>Time is Brain</div>
                  <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.6}}>Clot-busting treatment must be given within 4.5 hours of symptom onset. The sooner treatment begins, the better the outcome.</div>
                  <button onClick={()=>setScreen("emergency")} style={{marginTop:12,background:"#dc2626",border:"none",borderRadius:12,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>View Emergency Numbers</button>
                </div>
              </div>
            )}

            {/* ══ LEARN ══ */}
            {screen==="learn"&&(
              <div>
                {userType==="caregiver"&&(
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:10,color:WARM,letterSpacing:1.5,marginBottom:10,fontWeight:700}}>CAREGIVER RESOURCES</div>
                    {CAREGIVER_TOPICS.map((e,i)=>(
                      <button key={i} onClick={()=>setEduIdx(-(i+1))} style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",border:`1px solid ${WARM}20`,background:`${WARM}05`})}}>
                        <div style={{fontSize:28,flexShrink:0}}>{e.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:WARM}}>{e.title}</div>
                          <div style={{fontSize:11,color:"#5a6a7a",marginTop:2,lineHeight:1.4}}>{e.content.slice(0,65)}…</div>
                        </div>
                        <div style={{fontSize:18,color:"#9aabb8"}}>›</div>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10}}>STROKE EDUCATION</div>
                {EDUCATION.map((e,i)=>(
                  <button key={i} onClick={()=>setEduIdx(i)} style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"})}}>
                    <div style={{fontSize:28,flexShrink:0}}>{e.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{e.title}</div>
                      <div style={{fontSize:11,color:"#5a6a7a",marginTop:2,lineHeight:1.4}}>{e.content.slice(0,70)}…</div>
                    </div>
                    <div style={{fontSize:18,color:"#9aabb8"}}>›</div>
                  </button>
                ))}
                <div style={{...card({background:`${GOLD}0d`,border:`1px dashed ${GOLD}40`,marginTop:4,padding:"14px 16px"})}}>
                  <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:6}}>✦ PREMIUM — More Resources</div>
                  <div style={{fontSize:12,color:"#5a6a7a",lineHeight:1.7,marginBottom:10}}>
                    {userType==="caregiver"
                      ?"• Respite care planning guide\n• Medication management tracker\n• Weekly caregiver wellbeing check-in\n• Downloadable caregiver daily log sheets\n• How to talk to children about stroke"
                      :"• Downloadable recovery tracking sheets\n• Weekly expert newsletter\n• Video exercise library\n• Medication interaction checker\n• Personalised recovery milestones"
                    }
                  </div>
                  <button onClick={()=>setModal(true)} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Unlock Premium</button>
                </div>
              </div>
            )}

            {/* ══ BRAIN TRAINING ══ */}
            {screen==="brain"&&(
              <div>
                <div style={{fontSize:13,color:"#5a6a7a",marginBottom:6,lineHeight:1.6}}>Regular cognitive exercise supports neuroplasticity — your brain's ability to rewire and recover. Aim for 10–15 minutes daily.</div>
                <div style={{...card({background:`${TEAL}0d`,border:`1px solid ${TEAL}25`,marginBottom:16,padding:"12px 14px"})}}>
                  <div style={{fontSize:11,color:TEAL,fontWeight:700}}>Why brain training helps after stroke</div>
                  <div style={{fontSize:11,color:"#3a4a5a",marginTop:4,lineHeight:1.6}}>The brain can form new neural pathways through neuroplasticity. Targeted exercises help rebuild connections affected by stroke, improving memory, maths, language, and processing speed.</div>
                </div>
                <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10}}>FREE EXERCISES</div>
                {BRAIN_FREE.map(g=>(
                  <button key={g.id} onClick={()=>{
                    if(g.id==="memory")initMemory();
                    if(g.id==="wordrecall"){setWrPhase("study");setWrAnswers([]);setWrInput("");}
                    if(g.id==="pattern"){setPatSeq([]);setPatInput([]);setPatPhase("show");setPatLevel(3);}
                    if(g.id==="maths")setMathQ(null);
                    if(g.id==="colour"){setPainted({});setSelPaint("#ef4444");}
                    setGame(g.id);
                  }} style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"})}}>
                    <div style={{fontSize:30,flexShrink:0}}>{g.icon}</div>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:NAVY}}>{g.name}</div><div style={{fontSize:11,color:"#5a6a7a",marginTop:2}}>{g.desc}</div></div>
                    <div style={{background:`${TEAL}15`,borderRadius:8,padding:"3px 8px",fontSize:9,color:TEAL,fontWeight:700}}>{g.diff}</div>
                  </button>
                ))}
                <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10,marginTop:6}}>PREMIUM EXERCISES ✦</div>
                {BRAIN_PREMIUM.map(g=>(
                  <button key={g.id} onClick={()=>gate(()=>{
                    if(g.id==="stroop")initStroop();
                    if(g.id==="wordrecog")initWordRecog();
                    if(g.id==="numrecog")initNumRecog();
                    setGame(g.id);
                  })} style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",opacity:premium?1:0.7})}}>
                    <div style={{fontSize:30,flexShrink:0}}>{g.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{g.name}</div>
                        {!premium&&<span style={{fontSize:9,color:GOLD,fontWeight:700}}>✦</span>}
                      </div>
                      <div style={{fontSize:11,color:"#5a6a7a",marginTop:2}}>{g.desc}</div>
                    </div>
                    <div style={{background:`${WARM}15`,borderRadius:8,padding:"3px 8px",fontSize:9,color:WARM,fontWeight:700}}>{g.diff}</div>
                  </button>
                ))}
              </div>
            )}

            {/* ══ EMERGENCY ══ */}
            {screen==="emergency"&&(
              <div>
                <div style={{...card({background:"#dc2626",color:"#fff",textAlign:"center",marginBottom:16,padding:"18px"})}}>
                  <div style={{fontSize:22,marginBottom:6}}>Emergency Numbers</div>
                  <div style={{fontSize:13,opacity:0.9,lineHeight:1.5}}>If you suspect a stroke, call emergency services immediately. State: "I think someone is having a stroke."</div>
                </div>
                {EMERGENCY.map(e=>(
                  <div key={e.country} style={{...card({marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12})}}>
                    <div style={{fontSize:24,flexShrink:0}}>{e.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:NAVY}}>{e.country}</div>
                      <div style={{fontSize:16,fontWeight:900,color:"#dc2626",marginTop:1}}>{e.number}</div>
                      {e.alt&&<div style={{fontSize:10,color:"#5a6a7a",marginTop:1}}>Also: {e.alt}</div>}
                    </div>
                    <a href={`tel:${e.number.replace(/\s/g,"")}`} style={{background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:10,padding:"6px 12px",color:"#dc2626",fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>Call</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(248,244,239,0.97)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(30,58,95,0.09)",display:"flex",zIndex:50}}>
            {NAV.map(tab=>(
              <button key={tab.id} onClick={()=>setScreen(tab.id)} style={{flex:1,padding:"10px 0 14px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:18}}>{tab.icon}</span>
                <span style={{fontSize:9,color:screen===tab.id?TEAL:"#9aabb8",fontFamily:"Georgia,serif",fontWeight:screen===tab.id?700:400,letterSpacing:0.5,textTransform:"capitalize"}}>{tab.id==="fast"?"FAST":tab.id==="brain"?"Brain":tab.id.charAt(0).toUpperCase()+tab.id.slice(1)}</span>
                {screen===tab.id&&<div style={{width:4,height:4,borderRadius:"50%",background:TEAL}}/>}
              </button>
            ))}
          </div>

          {/* Premium Modal */}
          {modal&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setModal(false)}>
              <div style={{background:"linear-gradient(160deg,#fff,#f8f4ef)",borderRadius:"26px 26px 0 0",padding:"28px 24px 44px",width:"100%",border:"1px solid rgba(30,58,95,0.1)",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:18,flexWrap:"wrap"}}>
                  {["🚫 No ads ever","🚫 No pop-ups","✓ Free 7-day trial","✓ Cancel anytime"].map(b=>(
                    <div key={b} style={{background:`${TEAL}12`,border:`1px solid ${TEAL}30`,borderRadius:20,padding:"4px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
                  ))}
                </div>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{fontSize:34,marginBottom:8}}>✦</div>
                  <div style={{fontSize:22,fontWeight:700,color:NAVY}}>StrokeWise Premium</div>
                  <div style={{fontSize:13,color:"#5a6a7a",marginTop:4}}>The complete recovery companion</div>
                </div>
                {["Colour Word (Stroop) attention training","Word Recognition — language recovery","Number Recognition — numerical cognition","Category Sort — executive function","Visual Trail — processing speed","Downloadable recovery tracking sheets","Weekly expert stroke recovery newsletter","Medication & lifestyle interaction guide","Personalised recovery milestone tracker","Zero ads or pop-ups — ever"].map(f=>(
                  <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(30,58,95,0.06)"}}>
                    <span style={{color:TEAL,fontSize:13}}>✓</span>
                    <span style={{fontSize:13,color:"#3a4a5a"}}>{f}</span>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:18,marginBottom:10}}>
                  {[{label:"Monthly",price:"$7.99/mo",sub:"flexible"},{label:"Annual",price:"$44.99/yr",sub:"save 53%"}].map(pl=>{
                    const sel=selPlan===pl.label;
                    return(
                    <button key={pl.label} onClick={()=>setSelPlan(pl.label)} style={{flex:1,background:sel?`${TEAL}20`:"rgba(30,58,95,0.05)",border:`2px solid ${sel?TEAL:"rgba(30,58,95,0.1)"}`,borderRadius:14,padding:"10px 6px",textAlign:"center",cursor:"pointer"}}>
                      <div style={{fontSize:10,color:"#9aabb8",marginBottom:3}}>{pl.label}</div>
                      <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{pl.price}</div>
                      <div style={{fontSize:9,color:sel?TEAL:"#9aabb8",marginTop:2}}>{pl.sub}</div>
                    </button>
                  )})}
                </div>
                <button onClick={()=>handleCheckout(selPlan==="Annual"?PRICE_YEARLY:PRICE_MONTHLY)} style={{width:"100%",background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10}}>Start Free 7-Day Trial</button>
                <button onClick={()=>setModal(false)} style={{width:"100%",background:"rgba(30,58,95,0.05)",border:"1px solid rgba(30,58,95,0.08)",borderRadius:16,padding:"11px",color:"#5a6a7a",fontSize:13,cursor:"pointer"}}>Maybe later</button>
                <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#9aabb8",lineHeight:1.7}}>
                  🚫 No ads or pop-ups — not now, not ever<br/>
                  ✓ Free for 7 days — cancel anytime before being charged
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
