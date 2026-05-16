import { useState, useEffect, useRef } from "react";

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
  { letter:"F", word:"FACE",    icon:"😶", color:"#ef4444", desc:"Ask them to smile. Does one side of their face droop or look uneven?", action:"Look for an uneven or drooping smile" },
  { letter:"A", word:"ARMS",    icon:"💪", color:"#f97316", desc:"Ask them to raise both arms. Does one arm drift downward or feel weak?", action:"Ask them to hold both arms up for 10 seconds" },
  { letter:"S", word:"SPEECH",  icon:"💬", color:"#eab308", desc:"Ask them to repeat a simple phrase. Is their speech slurred, strange, or hard to understand?", action:"Say 'The sky is blue' — listen for slurring" },
  { letter:"T", word:"TIME",    icon:"⏰", color:"#22c55e", desc:"Time to call emergency services immediately. Note the time symptoms started — doctors need this.", action:"Call emergency services NOW. Note the exact time." },
];

const OTHER_SIGNS = [
  { icon:"🤕", sign:"Sudden severe headache with no known cause" },
  { icon:"👁️", sign:"Sudden vision loss or blurring in one or both eyes" },
  { icon:"😵", sign:"Sudden dizziness, loss of balance or coordination" },
  { icon:"🫸", sign:"Sudden numbness or weakness in face, arm, or leg (especially one side)" },
  { icon:"🧠", sign:"Sudden confusion or difficulty understanding others" },
];

const EDUCATION = [
  {
    title:"What is a Stroke?",
    icon:"🧠",
    content:"A stroke occurs when blood supply to part of the brain is cut off. Without blood, brain cells begin to die within minutes. There are two main types: ischaemic (a blood clot blocks a vessel — 85% of strokes) and haemorrhagic (a blood vessel bursts). A TIA (Transient Ischaemic Attack) is a 'mini-stroke' with symptoms that resolve within 24 hours — it's a serious warning sign.",
  },
  {
    title:"Recovery Timeline",
    icon:"📈",
    content:"Recovery is highly individual. The fastest improvements typically occur in the first 3 months, but recovery can continue for years. The brain has remarkable plasticity — it can rewire itself and form new connections. Consistent therapy, cognitive exercises, and a positive routine significantly affect long-term outcomes.",
  },
  {
    title:"Types of Stroke",
    icon:"🩺",
    content:"Ischaemic stroke: a clot blocks blood flow (treated with clot-busting drugs if caught early). Haemorrhagic stroke: bleeding in or around the brain (may require surgery). TIA (mini-stroke): temporary blockage, no permanent damage — but 1 in 10 people have a full stroke within 2 days of a TIA. Acting fast on TIA symptoms is critical.",
  },
  {
    title:"Risk Factors",
    icon:"⚠️",
    content:"Modifiable risks: high blood pressure (the #1 risk factor), smoking, diabetes, high cholesterol, atrial fibrillation, obesity, physical inactivity, excessive alcohol. Non-modifiable: age (risk doubles every decade after 55), family history, sex (men have more strokes, women have more severe outcomes), prior stroke or TIA. Controlling blood pressure alone reduces stroke risk by up to 40%.",
  },
  {
    title:"Rehabilitation",
    icon:"🏥",
    content:"Stroke rehab typically involves physiotherapy (movement and strength), occupational therapy (daily living skills), speech and language therapy (communication and swallowing), and neuropsychology (cognition and mood). Constraint-induced movement therapy, mirror therapy, and cognitive rehabilitation are all evidence-based approaches. Consistency is the most important factor.",
  },
  {
    title:"Caregiver Wellbeing",
    icon:"❤️",
    content:"Caregiver burnout is real and common. Up to 40% of stroke caregivers experience depression. It's not selfish to take care of yourself — it's essential. Regular breaks, peer support groups, respite care, and honest communication with healthcare teams all matter. You cannot pour from an empty cup.",
  },
  {
    title:"Medications",
    icon:"💊",
    content:"Common post-stroke medications include: antiplatelet drugs (aspirin, clopidogrel) to prevent clots, anticoagulants (warfarin, apixaban) for AF-related strokes, statins to reduce cholesterol, antihypertensives to control blood pressure, and antidepressants if depression is present. Never stop medication without consulting a doctor.",
  },
  {
    title:"Diet & Lifestyle",
    icon:"🥗",
    content:"A Mediterranean-style diet (rich in vegetables, fruit, wholegrains, fish, olive oil) is associated with a 30% lower stroke risk. Reducing salt lowers blood pressure. Staying physically active (even gentle walking) improves blood flow and mood. Quitting smoking halves stroke risk within 2 years. Limiting alcohol to 1–2 units/day is recommended.",
  },
];

const BRAIN_GAMES_FREE = [
  {
    id:"memory",
    name:"Memory Match",
    icon:"🃏",
    desc:"Flip cards to find matching pairs. Trains short-term memory.",
    difficulty:"Easy",
  },
  {
    id:"word",
    name:"Word Recall",
    icon:"📝",
    desc:"Remember a list of words, then recall them. Trains verbal memory.",
    difficulty:"Medium",
  },
  {
    id:"pattern",
    name:"Pattern Sequence",
    icon:"🔢",
    desc:"Watch a sequence of numbers and repeat it back. Trains working memory.",
    difficulty:"Easy",
  },
];

const BRAIN_GAMES_PREMIUM = [
  { id:"stroop",    name:"Colour Word",     icon:"🌈", desc:"Name the ink colour, not the word. Trains attention & inhibition.", difficulty:"Hard" },
  { id:"math",      name:"Mental Maths",    icon:"🔢", desc:"Quick arithmetic challenges. Trains numerical cognition.", difficulty:"Medium" },
  { id:"category",  name:"Category Sort",   icon:"🗂️", desc:"Sort items into the right categories fast. Trains executive function.", difficulty:"Medium" },
  { id:"spelling",  name:"Word Builder",    icon:"🔤", desc:"Rearrange scrambled letters to form words. Trains language recovery.", difficulty:"Hard" },
  { id:"trail",     name:"Visual Trail",    icon:"👁️", desc:"Connect numbered dots in order as fast as possible. Trains processing speed.", difficulty:"Hard" },
];

const AFFIRMATIONS_STROKE = [
  "Every small step forward is a victory.",
  "Recovery is not linear — and that's okay.",
  "Your brain is rebuilding itself every single day.",
  "Rest is part of recovery, not a setback.",
  "You are more than what the stroke took from you.",
  "Caregivers: your love makes the difference.",
  "Progress happens even when you can't see it.",
];

const MEMORY_WORDS = ["Apple","River","Chair","Music","Green","Bridge","Cloud","Tiger","Paper","Smile"];
const EMOJIS_PAIRS = ["🌸","🦊","🎵","⭐","🌊","🍎","🦋","🌙","🎯","🔥"];

/* ═══════════════════════ HELPERS ═══════════════════════ */
const BG = "linear-gradient(160deg,#f8f4ef 0%,#eef4f8 50%,#f4f0fa 100%)";
const WARM = "#c8613a"; // warm terracotta
const TEAL = "#2a7f8a";
const NAVY = "#1e3a5f";
const GOLD = "#c9920a";
const card = (x={}) => ({
  background:"#fff",
  borderRadius:20,
  boxShadow:"0 2px 20px rgba(30,58,95,0.07)",
  padding:"18px",
  border:"1px solid rgba(30,58,95,0.07)",
  ...x,
});

/* ═══════════════════════ APP ═══════════════════════ */
export default function StrokeWise() {
  const [screen, setScreen] = useState("home");
  const [premium, setPremium] = useState(false);
  const [modal, setModal] = useState(false);
  const [userType, setUserType] = useState(null); // "survivor" | "caregiver"
  const [onboarded, setOnboarded] = useState(false);
  const [affIdx, setAffIdx] = useState(0);
  const [eduIdx, setEduIdx] = useState(null);
  const [game, setGame] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Memory game state
  const [memCards, setMemCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [memMoves, setMemMoves] = useState(0);
  const [memWon, setMemWon] = useState(false);

  // Word recall state
  const [wordPhase, setWordPhase] = useState("study"); // study | recall | result
  const [wordInput, setWordInput] = useState("");
  const [wordAnswers, setWordAnswers] = useState([]);
  const [wordTimer, setWordTimer] = useState(15);
  const timerRef = useRef(null);

  // Pattern game
  const [pattern, setPattern] = useState([]);
  const [patternInput, setPatternInput] = useState([]);
  const [patternPhase, setPatternPhase] = useState("show"); // show | input | result
  const [patternLevel, setPatternLevel] = useState(3);
  const [showIdx, setShowIdx] = useState(-1);

  // Stroop game
  const COLORS = [{word:"RED",color:"#ef4444"},{word:"BLUE",color:"#3b82f6"},{word:"GREEN",color:"#22c55e"},{word:"YELLOW",color:"#eab308"}];
  const [stroopItem, setStroopItem] = useState(null);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopTotal, setStroopTotal] = useState(0);
  const [stroopDone, setStroopDone] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const t = setInterval(() => setAffIdx(i => (i+1) % AFFIRMATIONS_STROKE.length), 6000);
    return () => clearInterval(t);
  }, []);

  function gate(fn) { return premium ? fn() : setModal(true); }

  /* ── MEMORY GAME ── */
  function initMemory() {
    const pairs = [...EMOJIS_PAIRS.slice(0,6), ...EMOJIS_PAIRS.slice(0,6)]
      .sort(() => Math.random()-0.5)
      .map((e,i) => ({id:i, emoji:e, matched:false}));
    setMemCards(pairs); setFlipped([]); setMatched([]); setMemMoves(0); setMemWon(false);
  }
  function flipCard(id) {
    if (flipped.length===2) return;
    if (flipped.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length===2) {
      setMemMoves(m=>m+1);
      const [a,b] = newFlipped;
      if (memCards[a].emoji === memCards[b].emoji) {
        const nm = [...matched, a, b];
        setMatched(nm);
        setFlipped([]);
        if (nm.length === memCards.length) setMemWon(true);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  /* ── WORD RECALL ── */
  const STUDY_WORDS = MEMORY_WORDS.slice(0,6);
  function startWordStudy() { setWordPhase("study"); setWordAnswers([]); setWordInput(""); setWordTimer(15); }
  function startWordRecall() {
    setWordPhase("recall");
    let t = 60;
    setWordTimer(t);
    timerRef.current = setInterval(() => {
      t--;
      setWordTimer(t);
      if (t<=0) { clearInterval(timerRef.current); setWordPhase("result"); }
    }, 1000);
  }
  function submitWord() {
    if (!wordInput.trim()) return;
    const w = wordInput.trim();
    setWordAnswers(p => [...p, w]);
    setWordInput("");
  }
  const correctWords = wordAnswers.filter(w => STUDY_WORDS.map(s=>s.toLowerCase()).includes(w.toLowerCase()));

  /* ── PATTERN GAME ── */
  function startPattern() {
    const p = Array.from({length:patternLevel}, () => Math.floor(Math.random()*9)+1);
    setPattern(p); setPatternInput([]); setPatternPhase("show"); setShowIdx(-1);
    let i = -1;
    const iv = setInterval(() => {
      i++;
      setShowIdx(i);
      if (i >= p.length) { clearInterval(iv); setShowIdx(-1); setTimeout(()=>setPatternPhase("input"),500); }
    }, 800);
  }

  /* ── STROOP GAME ── */
  function nextStroop() {
    if (stroopTotal >= 10) { setStroopDone(true); return; }
    const word = COLORS[Math.floor(Math.random()*4)];
    let inkColor;
    do { inkColor = COLORS[Math.floor(Math.random()*4)]; } while (inkColor.word === word.word);
    setStroopItem({...word, inkColor: inkColor.color, correctAnswer: inkColor.word, options: [...COLORS].sort(()=>Math.random()-0.5)});
  }
  function answerStroop(answer) {
    if (answer === stroopItem.correctAnswer) setStroopScore(s=>s+1);
    setStroopTotal(t=>t+1);
    nextStroop();
  }
  function initStroop() { setStroopScore(0); setStroopTotal(0); setStroopDone(false); nextStroop(); }

  const NAV = [{id:"home",icon:"🏠"},{id:"fast",icon:"⚡"},{id:"learn",icon:"📚"},{id:"brain",icon:"🧩"},{id:"emergency",icon:"🆘"}];

  /* ── ONBOARDING ── */
  if (!onboarded) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",fontFamily:"'Georgia',serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{textAlign:"center",maxWidth:380,animation:"fadeUp 0.7s ease both"}}>
        <div style={{fontSize:56,marginBottom:16}}>🧠</div>
        <div style={{fontSize:11,letterSpacing:3,color:TEAL,textTransform:"uppercase",marginBottom:8}}>Welcome to</div>
        <div style={{fontSize:34,fontWeight:700,color:NAVY,marginBottom:12,lineHeight:1.2}}>StrokeWise</div>
        <div style={{fontSize:15,color:"#5a6a7a",lineHeight:1.7,marginBottom:36}}>
          Education, recovery support, brain training, and emergency tools — for stroke survivors and their caregivers.
        </div>
        <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16,fontWeight:600}}>I am a…</div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          {[{t:"Stroke Survivor",e:"🧠",v:"survivor"},{t:"Caregiver / Family",e:"❤️",v:"caregiver"}].map(u=>(
            <button key={u.v} onClick={()=>{setUserType(u.v);setOnboarded(true);}}
              style={{flex:1,background:"#fff",border:`2px solid ${TEAL}`,borderRadius:18,padding:"20px 12px",cursor:"pointer",
                boxShadow:"0 4px 20px rgba(42,127,138,0.15)",transition:"transform 0.15s"}}>
              <div style={{fontSize:32,marginBottom:8}}>{u.e}</div>
              <div style={{fontSize:13,fontWeight:700,color:NAVY,lineHeight:1.3}}>{u.t}</div>
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20,flexWrap:"wrap"}}>
          {["🚫 No ads ever","🚫 No pop-ups","✓ No credit card needed","✓ Cancel anytime"].map(b=>(
            <div key={b} style={{background:`${TEAL}12`,border:`1px solid ${TEAL}30`,borderRadius:20,padding:"4px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
          ))}
        </div>
        <div style={{marginTop:16,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,padding:"12px 16px",fontSize:12,color:"#b91c1c",lineHeight:1.6}}>
          ⚕️ StrokeWise is for education and support only. Always follow your medical team's advice.
        </div>
      </div>
    </div>
  );

  /* ── GAME SCREEN ── */
  if (game) return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",maxWidth:430,margin:"0 auto",padding:"50px 20px 80px"}}>
      <style>{`@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>
      <button onClick={()=>setGame(null)} style={{background:"transparent",border:"none",color:NAVY,fontSize:14,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
        ← Back to Brain Training
      </button>

      {/* MEMORY MATCH */}
      {game==="memory" && (
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🃏 Memory Match</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Find all matching pairs · Moves: {memMoves}</div>
          {memCards.length===0
            ?<button onClick={initMemory} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start Game</button>
            :<div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                {memCards.map((c,i)=>{
                  const isFlipped = flipped.includes(i)||matched.includes(i);
                  return(
                    <button key={i} onClick={()=>!matched.includes(i)&&flipCard(i)}
                      style={{aspectRatio:"1",background:isFlipped?"#fff":`linear-gradient(135deg,${TEAL},${NAVY})`,
                        border:`2px solid ${isFlipped?"#e8f4f8":TEAL}`,borderRadius:14,fontSize:24,cursor:"pointer",
                        transition:"all 0.3s",boxShadow:matched.includes(i)?"0 0 0 3px #22c55e40":"none",
                        animation:matched.includes(i)?"pop 0.3s ease":"none"}}>
                      {isFlipped?c.emoji:"❓"}
                    </button>
                  );
                })}
              </div>
              {memWon&&<div style={{...card({background:`linear-gradient(135deg,#f0fdf4,#dcfce7)`,textAlign:"center",border:"2px solid #22c55e"})}}><div style={{fontSize:28,marginBottom:6}}>🎉</div><div style={{fontSize:16,fontWeight:700,color:"#15803d"}}>Completed in {memMoves} moves!</div><button onClick={initMemory} style={{marginTop:12,background:"#22c55e",border:"none",borderRadius:12,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button></div>}
            </div>
          }
        </div>
      )}

      {/* WORD RECALL */}
      {game==="word" && (
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>📝 Word Recall</div>
          {wordPhase==="study"&&(
            <div>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Study these 6 words for 15 seconds, then recall them from memory.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                {STUDY_WORDS.map(w=><div key={w} style={{...card({padding:"14px",textAlign:"center"}),fontSize:17,fontWeight:700,color:NAVY}}>{w}</div>)}
              </div>
              <button onClick={startWordRecall} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>I'm Ready — Start Recall</button>
            </div>
          )}
          {wordPhase==="recall"&&(
            <div>
              <div style={{...card({background:"rgba(239,68,68,0.06)",marginBottom:16,padding:"12px",textAlign:"center"})}}>
                <div style={{fontSize:28,fontWeight:700,color:"#dc2626"}}>{wordTimer}s</div>
                <div style={{fontSize:11,color:"#5a6a7a"}}>Type words you remember</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={wordInput} onChange={e=>setWordInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitWord()}
                  placeholder="Type a word…" style={{flex:1,background:"#fff",border:`2px solid ${TEAL}`,borderRadius:12,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"Georgia,serif"}}/>
                <button onClick={submitWord} style={{background:TEAL,border:"none",borderRadius:12,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {wordAnswers.map((w,i)=><div key={i} style={{background:STUDY_WORDS.map(s=>s.toLowerCase()).includes(w.toLowerCase())?"#dcfce7":"#fee2e2",borderRadius:8,padding:"5px 12px",fontSize:13,color:STUDY_WORDS.map(s=>s.toLowerCase()).includes(w.toLowerCase())?"#15803d":"#dc2626"}}>{w}</div>)}
              </div>
            </div>
          )}
          {wordPhase==="result"&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{correctWords.length>=5?"🏆":correctWords.length>=3?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>{correctWords.length}/{STUDY_WORDS.length} Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>You recalled: {correctWords.join(", ")||"none"}</div>
              <div style={{fontSize:12,color:"#5a6a7a",background:"#f0f9ff",borderRadius:10,padding:"10px",marginBottom:16,lineHeight:1.6}}>
                {correctWords.length>=5?"Excellent memory performance! Verbal recall is a key cognitive skill.":correctWords.length>=3?"Good effort. Consistent practice strengthens verbal memory over time.":"Keep practising — memory recall improves significantly with repetition."}
              </div>
              <button onClick={startWordStudy} style={{background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Try Again</button>
            </div>
          )}
        </div>
      )}

      {/* PATTERN SEQUENCE */}
      {game==="pattern" && (
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🔢 Pattern Sequence</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Watch the number sequence, then repeat it. Level: {patternLevel} numbers</div>
          {patternPhase==="show"&&pattern.length===0&&(
            <button onClick={startPattern} style={{width:"100%",background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Show Sequence</button>
          )}
          {patternPhase==="show"&&pattern.length>0&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Watch carefully…</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {pattern.map((n,i)=>(
                  <div key={i} style={{width:52,height:52,borderRadius:12,background:showIdx===i?`linear-gradient(135deg,${WARM},${GOLD})`:"#e8eef4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:showIdx===i?"#fff":NAVY,transition:"all 0.3s",boxShadow:showIdx===i?"0 4px 16px rgba(200,97,58,0.4)":"none"}}>{showIdx>=i?n:"?"}</div>
                ))}
              </div>
            </div>
          )}
          {patternPhase==="input"&&(
            <div>
              <div style={{fontSize:13,color:"#5a6a7a",marginBottom:12}}>Now tap the numbers in the same order:</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
                {patternInput.map((n,i)=><div key={i} style={{width:44,height:44,borderRadius:10,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff"}}>{n}</div>)}
                {patternInput.length<pattern.length&&<div style={{width:44,height:44,borderRadius:10,background:"#e8eef4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#9aabb8"}}>?</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[1,2,3,4,5,6,7,8,9].map(n=>(
                  <button key={n} onClick={()=>{
                    const ni=[...patternInput,n];
                    setPatternInput(ni);
                    if(ni.length===pattern.length){ setPatternPhase("result"); }
                  }} style={{padding:"16px",background:"#fff",border:`2px solid #e8eef4`,borderRadius:14,fontSize:20,fontWeight:700,color:NAVY,cursor:"pointer",boxShadow:"0 2px 8px rgba(30,58,95,0.08)"}}>
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={()=>setPatternInput([])} style={{marginTop:10,width:"100%",background:"transparent",border:`1px solid #ddd`,borderRadius:10,padding:"9px",color:"#5a6a7a",fontSize:12,cursor:"pointer"}}>Clear</button>
            </div>
          )}
          {patternPhase==="result"&&(
            <div style={{...card({textAlign:"center"})}}>
              {JSON.stringify(patternInput)===JSON.stringify(pattern)
                ?<><div style={{fontSize:36,marginBottom:8}}>🎉</div><div style={{fontSize:18,fontWeight:700,color:"#15803d"}}>Perfect!</div><div style={{fontSize:13,color:"#5a6a7a",marginTop:4}}>The sequence was: {pattern.join(" → ")}</div></>
                :<><div style={{fontSize:36,marginBottom:8}}>💪</div><div style={{fontSize:18,fontWeight:700,color:NAVY}}>Keep Practising</div><div style={{fontSize:13,color:"#5a6a7a",marginTop:4}}>Correct: {pattern.join(" → ")}<br/>You entered: {patternInput.join(" → ")}</div></>
              }
              <div style={{display:"flex",gap:8,marginTop:16}}>
                <button onClick={()=>{setPattern([]);setPatternInput([]);setPatternPhase("show");setPatternLevel(l=>Math.min(l+1,7));}} style={{flex:1,background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Next Level</button>
                <button onClick={()=>{setPattern([]);setPatternInput([]);setPatternPhase("show");setPatternLevel(3);}} style={{flex:1,background:"rgba(30,58,95,0.08)",border:"none",borderRadius:12,padding:"11px",color:NAVY,fontSize:13,cursor:"pointer"}}>Restart</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STROOP */}
      {game==="stroop" && (
        <div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY,marginBottom:4}}>🌈 Colour Word</div>
          <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Name the INK COLOUR — not the word. Score: {stroopScore}/{stroopTotal}</div>
          {!stroopItem&&!stroopDone&&<button onClick={initStroop} style={{width:"100%",background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Start Challenge</button>}
          {stroopItem&&!stroopDone&&(
            <div style={{textAlign:"center"}}>
              <div style={{...card({padding:"32px",marginBottom:20,textAlign:"center"})}}>
                <div style={{fontSize:48,fontWeight:900,color:stroopItem.inkColor,letterSpacing:2,fontFamily:"'DM Sans',sans-serif"}}>{stroopItem.word}</div>
                <div style={{fontSize:11,color:"#9aabb8",marginTop:8}}>What colour is the ink?</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {stroopItem.options.map(o=>(
                  <button key={o.word} onClick={()=>answerStroop(o.word)} style={{padding:"14px",background:"#fff",border:`2px solid ${o.color}40`,borderRadius:14,fontSize:15,fontWeight:700,color:o.color,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                    {o.word}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:"#9aabb8",marginTop:12}}>{10-stroopTotal} questions remaining</div>
            </div>
          )}
          {stroopDone&&(
            <div style={{...card({textAlign:"center"})}}>
              <div style={{fontSize:36,marginBottom:8}}>{stroopScore>=8?"🏆":stroopScore>=5?"👍":"💪"}</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>{stroopScore}/10 Correct</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:6,marginBottom:16}}>The Stroop task trains executive function and cognitive flexibility — skills often affected by stroke.</div>
              <button onClick={initStroop} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ── EDUCATION DETAIL ── */
  if (eduIdx !== null) return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",maxWidth:430,margin:"0 auto",padding:"50px 20px 80px"}}>
      <button onClick={()=>setEduIdx(null)} style={{background:"transparent",border:"none",color:NAVY,fontSize:14,cursor:"pointer",marginBottom:20}}>← Back to Learn</button>
      <div style={{fontSize:40,marginBottom:12}}>{EDUCATION[eduIdx].icon}</div>
      <div style={{fontSize:24,fontWeight:700,color:NAVY,marginBottom:16,lineHeight:1.2}}>{EDUCATION[eduIdx].title}</div>
      <div style={{fontSize:15,color:"#3a4a5a",lineHeight:1.85}}>{EDUCATION[eduIdx].content}</div>
      <div style={{...card({marginTop:24,background:"#f0f9ff",border:"1px solid rgba(42,127,138,0.2)"})}}>
        <div style={{fontSize:11,color:TEAL,letterSpacing:1.5,marginBottom:6}}>MEDICAL NOTE</div>
        <div style={{fontSize:12,color:"#3a4a5a",lineHeight:1.6}}>This information is for educational purposes only. Always follow the advice of your medical team and never adjust medication or treatment without consulting a doctor.</div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20}}>
        {eduIdx>0&&<button onClick={()=>setEduIdx(i=>i-1)} style={{flex:1,background:"rgba(30,58,95,0.08)",border:"none",borderRadius:12,padding:"11px",color:NAVY,fontSize:13,cursor:"pointer"}}>← Previous</button>}
        {eduIdx<EDUCATION.length-1&&<button onClick={()=>setEduIdx(i=>i+1)} style={{flex:1,background:`linear-gradient(135deg,${TEAL},${NAVY})`,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Next Topic →</button>}
      </div>
    </div>
  );

  /* ══════════════════════ MAIN APP ══════════════════════ */
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:NAVY,maxWidth:430,margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
        textarea::placeholder,input::placeholder{color:#9aabb8}
        button:active{opacity:0.85}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {/* Header */}
      <div style={{padding:"50px 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(248,244,239,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(30,58,95,0.07)",position:"sticky",top:0,zIndex:40}}>
        <div>
          <div style={{fontSize:10,letterSpacing:3,color:TEAL,textTransform:"uppercase"}}>
            {userType==="survivor"?"Stroke Survivor":"Caregiver"} Mode
          </div>
          <div style={{fontSize:22,fontWeight:700,color:NAVY}}>StrokeWise</div>
        </div>
        {!premium
          ?<button onClick={()=>setModal(true)} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:20,padding:"6px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>✦ Premium</button>
          :<div style={{fontSize:11,color:WARM,letterSpacing:1,fontWeight:700}}>✦ PREMIUM</div>
        }
      </div>

      <div style={{padding:"0 20px 90px",paddingTop:16}}>

        {/* ══ HOME ══ */}
        {screen==="home"&&(
          <div style={{opacity:fadeIn?1:0,transition:"opacity 0.6s"}}>

            {/* Profile switcher */}
            <div style={{...card({marginBottom:14,padding:"12px 14px"})}}>
              <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10}}>I AM A…</div>
              <div style={{display:"flex",gap:8}}>
                {[{t:"Stroke Survivor",e:"🧠",v:"survivor"},{t:"Caregiver / Family",e:"❤️",v:"caregiver"}].map(u=>(
                  <button key={u.v} onClick={()=>setUserType(u.v)}
                    style={{flex:1,background:userType===u.v?`${TEAL}15`:"rgba(255,255,255,0.5)",border:`2px solid ${userType===u.v?TEAL:"rgba(30,58,95,0.1)"}`,borderRadius:14,padding:"10px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{u.e}</div>
                    <div style={{fontSize:11,fontWeight:700,color:userType===u.v?TEAL:NAVY,lineHeight:1.3}}>{u.t}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {["🚫 No ads","🚫 No pop-ups","✓ No credit card needed"].map(b=>(
                <div key={b} style={{background:`${TEAL}10`,border:`1px solid ${TEAL}25`,borderRadius:20,padding:"3px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
              ))}
            </div>

            <div style={{...card({background:`linear-gradient(135deg,${NAVY},${TEAL})`,color:"#fff",marginBottom:14,padding:"20px"})}}>
              <div style={{fontSize:9,letterSpacing:2.5,opacity:0.7,marginBottom:8}}>TODAY'S REMINDER</div>
              <div style={{fontSize:15,lineHeight:1.65,fontStyle:"italic"}}>"{AFFIRMATIONS_STROKE[affIdx]}"</div>
            </div>

            {/* FAST emergency reminder */}
            <div style={{...card({background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",marginBottom:14,padding:"14px 16px"})}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>⚡ Know the FAST signs</div>
                  <div style={{fontSize:11,color:"#7f1d1d",marginTop:2}}>Can save a life — including yours</div>
                </div>
                <button onClick={()=>setScreen("fast")} style={{background:"#dc2626",border:"none",borderRadius:10,padding:"7px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Review</button>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {e:"📚",t:"Learn",s:"Education topics",scr:"learn",c:TEAL},
                {e:"🧩",t:"Brain Training",s:"Daily exercises",scr:"brain",c:WARM},
                {e:"🆘",t:"Emergency",s:"Worldwide numbers",scr:"emergency",c:"#dc2626"},
                {e:"⚡",t:"FAST Signs",s:"Stroke symptoms",scr:"fast",c:GOLD},
              ].map(a=>(
                <button key={a.t} onClick={()=>setScreen(a.scr)} style={{...card({padding:"16px 14px",border:`1px solid ${a.c}20`,background:`${a.c}08`,cursor:"pointer",textAlign:"left"})}}>
                  <div style={{fontSize:26,marginBottom:6}}>{a.e}</div>
                  <div style={{fontSize:13,fontWeight:700,color:a.c}}>{a.t}</div>
                  <div style={{fontSize:10,color:"#5a6a7a",marginTop:2}}>{a.s}</div>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div style={{...card({marginBottom:14})}}>
              <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:12}}>THIS WEEK</div>
              <div style={{display:"flex",gap:10}}>
                {[{v:"5",l:"Brain sessions"},{v:"3",l:"Topics read"},{v:"8",l:"Day streak"}].map(s=>(
                  <div key={s.l} style={{flex:1,textAlign:"center",background:"rgba(42,127,138,0.06)",borderRadius:12,padding:"10px 6px",border:"1px solid rgba(42,127,138,0.1)"}}>
                    <div style={{fontSize:20,fontWeight:700,color:TEAL}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#5a6a7a",marginTop:2,lineHeight:1.3}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caregiver tip */}
            {userType==="caregiver"&&(
              <div style={{...card({background:"rgba(201,146,10,0.07)",border:"1px solid rgba(201,146,10,0.2)",padding:"14px 16px"})}}>
                <div style={{fontSize:11,fontWeight:700,color:GOLD,marginBottom:4}}>💛 Caregiver Tip</div>
                <div style={{fontSize:12,color:"#5a6a7a",lineHeight:1.6}}>You cannot pour from an empty cup. Schedule at least 15 minutes today that are entirely for you. See the Education section for caregiver wellbeing resources.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ FAST SIGNS ══ */}
        {screen==="fast"&&(
          <div>
            <div style={{...card({background:"#dc2626",color:"#fff",textAlign:"center",marginBottom:16,padding:"20px"})}}>
              <div style={{fontSize:28,marginBottom:6}}>⚡ ACT FAST</div>
              <div style={{fontSize:14,opacity:0.9,lineHeight:1.6}}>If you suspect a stroke, call emergency services <strong>immediately</strong>. Every minute counts — 1.9 million brain cells die every minute during a stroke.</div>
            </div>

            {FAST_SIGNS.map(s=>(
              <div key={s.letter} style={{...card({marginBottom:12,padding:"16px",border:`2px solid ${s.color}30`,background:`${s.color}06`})}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{width:48,height:48,borderRadius:14,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#fff",flexShrink:0}}>{s.letter}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:s.color,marginBottom:4}}>{s.word}</div>
                    <div style={{fontSize:13,color:"#3a4a5a",lineHeight:1.6,marginBottom:6}}>{s.desc}</div>
                    <div style={{background:`${s.color}15`,borderRadius:8,padding:"6px 10px",fontSize:11,color:s.color,fontWeight:600}}>→ {s.action}</div>
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
              <div style={{fontSize:13,fontWeight:700,color:"#dc2626",marginBottom:4}}>🕐 Time is Brain</div>
              <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.6}}>Clot-busting treatment (thrombolysis) must be given within 4.5 hours of symptom onset. The sooner treatment begins, the better the outcome.</div>
              <button onClick={()=>setScreen("emergency")} style={{marginTop:12,background:"#dc2626",border:"none",borderRadius:12,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>View Emergency Numbers →</button>
            </div>
          </div>
        )}

        {/* ══ LEARN ══ */}
        {screen==="learn"&&(
          <div>
            <div style={{fontSize:13,color:"#5a6a7a",marginBottom:16}}>Tap any topic to read in full.</div>
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
            <div style={{...card({background:"rgba(201,146,10,0.07)",border:`1px dashed ${GOLD}40`,marginTop:4,padding:"14px 16px"})}}>
              <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:4}}>✦ PREMIUM — More Resources</div>
              <div style={{fontSize:12,color:"#5a6a7a",lineHeight:1.6,marginBottom:10}}>
                • Downloadable recovery tracking sheets<br/>
                • Weekly expert newsletter<br/>
                • Video exercise library<br/>
                • Medication interaction checker<br/>
                • Personalised recovery milestones
              </div>
              <button onClick={()=>setModal(true)} style={{background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Unlock Premium</button>
            </div>
          </div>
        )}

        {/* ══ BRAIN TRAINING ══ */}
        {screen==="brain"&&(
          <div>
            <div style={{fontSize:13,color:"#5a6a7a",marginBottom:6,lineHeight:1.6}}>Regular cognitive exercise supports neuroplasticity — your brain's ability to rewire and recover. Aim for 10–15 minutes daily.</div>
            <div style={{...card({background:"rgba(42,127,138,0.07)",border:"1px solid rgba(42,127,138,0.15)",marginBottom:16,padding:"12px 14px"})}}>
              <div style={{fontSize:11,color:TEAL,fontWeight:700}}>💡 Why brain training helps after stroke</div>
              <div style={{fontSize:11,color:"#3a4a5a",marginTop:4,lineHeight:1.6}}>The brain can form new neural pathways through a process called neuroplasticity. Targeted cognitive exercises help rebuild connections affected by stroke, improving memory, attention, language, and processing speed.</div>
            </div>

            <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10}}>FREE EXERCISES</div>
            {BRAIN_GAMES_FREE.map(g=>(
              <button key={g.id} onClick={()=>{if(g.id==="memory")initMemory(); if(g.id==="word")startWordStudy(); if(g.id==="pattern"){setPattern([]);setPatternInput([]);setPatternPhase("show");setPatternLevel(3);} setGame(g.id);}}
                style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"})}}>
                <div style={{fontSize:30,flexShrink:0}}>{g.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{g.name}</div>
                  <div style={{fontSize:11,color:"#5a6a7a",marginTop:2}}>{g.desc}</div>
                </div>
                <div style={{background:`${TEAL}15`,borderRadius:8,padding:"3px 8px",fontSize:9,color:TEAL,fontWeight:700}}>{g.difficulty}</div>
              </button>
            ))}

            <div style={{fontSize:10,color:"#5a6a7a",letterSpacing:1.5,marginBottom:10,marginTop:6}}>PREMIUM EXERCISES ✦</div>
            {BRAIN_GAMES_PREMIUM.map(g=>(
              <button key={g.id} onClick={()=>gate(()=>{if(g.id==="stroop"){setStroopScore(0);setStroopTotal(0);setStroopDone(false);setStroopItem(null);} setGame(g.id);})}
                style={{...card({width:"100%",marginBottom:10,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",opacity:premium?1:0.7})}}>
                <div style={{fontSize:30,flexShrink:0}}>{g.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{g.name}</div>
                    {!premium&&<span style={{fontSize:9,color:GOLD,fontWeight:700}}>✦</span>}
                  </div>
                  <div style={{fontSize:11,color:"#5a6a7a",marginTop:2}}>{g.desc}</div>
                </div>
                <div style={{background:`${WARM}15`,borderRadius:8,padding:"3px 8px",fontSize:9,color:WARM,fontWeight:700}}>{g.difficulty}</div>
              </button>
            ))}
          </div>
        )}

        {/* ══ EMERGENCY ══ */}
        {screen==="emergency"&&(
          <div>
            <div style={{...card({background:"#dc2626",color:"#fff",textAlign:"center",marginBottom:16,padding:"18px"})}}>
              <div style={{fontSize:24,marginBottom:6}}>🆘 Emergency Numbers</div>
              <div style={{fontSize:13,opacity:0.9,lineHeight:1.5}}>If you suspect a stroke, call emergency services immediately. State: "I think someone is having a stroke."</div>
            </div>

            {EMERGENCY.map(e=>(
              <div key={e.country} style={{...card({marginBottom:8,padding:"12px 14px",display:"flex",alignItems:"center",gap:12})}}>
                <div style={{fontSize:26,flexShrink:0}}>{e.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:NAVY}}>{e.country}</div>
                  <div style={{fontSize:16,fontWeight:900,color:"#dc2626",marginTop:1}}>{e.number}</div>
                  {e.alt&&<div style={{fontSize:10,color:"#5a6a7a",marginTop:1}}>Also: {e.alt}</div>}
                </div>
                <a href={`tel:${e.number.replace(/\s/g,"")}`} style={{background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:10,padding:"7px 12px",color:"#dc2626",fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>Call</a>
              </div>
            ))}

            <div style={{...card({marginTop:8,padding:"14px 16px"})}}>
              <div style={{fontSize:12,fontWeight:700,color:NAVY,marginBottom:8}}>🏥 Stroke Support Organisations</div>
              {[
                {n:"Stroke Association (UK)",    url:"stroke.org.uk",       num:"0303 3033 100"},
                {n:"American Stroke Association",url:"stroke.org",          num:"1-888-478-7653"},
                {n:"Stroke Foundation (AU)",     url:"strokefoundation.org.au", num:"1800 787 653"},
                {n:"Heart & Stroke (Canada)",    url:"heartandstroke.ca",   num:"1-888-473-4636"},
              ].map(o=>(
                <div key={o.n} style={{padding:"8px 0",borderBottom:"1px solid rgba(30,58,95,0.06)"}}>
                  <div style={{fontSize:12,fontWeight:600,color:NAVY}}>{o.n}</div>
                  <div style={{fontSize:11,color:TEAL}}>{o.num}</div>
                  <div style={{fontSize:10,color:"#9aabb8"}}>{o.url}</div>
                </div>
              ))}
            </div>
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

            {/* trust badges */}
            <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:18,flexWrap:"wrap"}}>
              {["🚫 No ads ever","🚫 No pop-ups","✓ No credit card needed","✓ Cancel anytime"].map(b=>(
                <div key={b} style={{background:`${TEAL}12`,border:`1px solid ${TEAL}30`,borderRadius:20,padding:"4px 10px",fontSize:10,color:TEAL,fontWeight:600}}>{b}</div>
              ))}
            </div>

            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:34,marginBottom:8}}>✦</div>
              <div style={{fontSize:22,fontWeight:700,color:NAVY}}>StrokeWise Premium</div>
              <div style={{fontSize:13,color:"#5a6a7a",marginTop:4}}>The complete recovery companion</div>
            </div>

            {["5 premium brain training games","Colour Word (Stroop), Mental Maths, Visual Trail","Downloadable recovery tracking sheets","Weekly expert stroke recovery newsletter","Medication & lifestyle interaction guide","Personalised recovery milestone tracker","Video exercise library","Zero ads or pop-ups — ever","Priority email support"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(30,58,95,0.06)"}}>
                <span style={{color:TEAL,fontSize:13}}>✓</span>
                <span style={{fontSize:13,color:"#3a4a5a"}}>{f}</span>
              </div>
            ))}

            {/* plan selector */}
            <div style={{display:"flex",gap:8,marginTop:18,marginBottom:14}}>
              {[
                {label:"Monthly", price:"$7.99/mo",  sub:"flexible"},
                {label:"Annual",  price:"$44.99/yr", sub:"save 53%", highlight:true},
              ].map(pl=>(
                <div key={pl.label} style={{flex:1,background:pl.highlight?`${TEAL}20`:"rgba(30,58,95,0.05)",border:`1px solid ${pl.highlight?TEAL:"rgba(30,58,95,0.1)"}`,borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#9aabb8",marginBottom:3}}>{pl.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:NAVY}}>{pl.price}</div>
                  <div style={{fontSize:9,color:pl.highlight?TEAL:"#9aabb8",marginTop:2}}>{pl.sub}</div>
                </div>
              ))}
            </div>

            <button onClick={()=>{setPremium(true);setModal(false);}} style={{width:"100%",background:`linear-gradient(135deg,${WARM},${GOLD})`,border:"none",borderRadius:16,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 8px 24px rgba(200,97,58,0.3)`,marginBottom:10}}>
              Start Free 7-Day Trial
            </button>
            <button onClick={()=>setModal(false)} style={{width:"100%",background:"rgba(30,58,95,0.05)",border:"1px solid rgba(30,58,95,0.08)",borderRadius:16,padding:"11px",color:"#5a6a7a",fontSize:13,cursor:"pointer"}}>
              Maybe later
            </button>
            <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#9aabb8",lineHeight:1.7}}>
              🚫 No credit card required for trial<br/>
              🚫 No ads or pop-ups — not now, not ever
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
