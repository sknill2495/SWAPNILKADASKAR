import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────── */
const T = {
  cream:    "#F7F4ED",
  black:    "#111111",
  mid:      "#6B6B6B",
  faint:    "#C8C4BC",
  border:   "#E0DDD6",
  white:    "#FFFFFF",
  red:      "#C0392B",
  redLight: "#FDECEA",
  green:    "#2D6A4F",
  greenLt:  "#EAF4EE",
  navy:     "#1A1A2E",
  navyLt:   "#EEEEF5",
  amber:    "#B45309",
  amberLt:  "#FEF3C7",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.cream}; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes strikeThrough {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes pulse {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes slideIn {
    from { opacity:0; transform: translateX(-12px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:scale(0.8); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes flow {
    0%   { opacity:0.2; transform:translateX(0); }
    50%  { opacity:1; }
    100% { opacity:0.2; transform:translateX(4px); }
  }
  @keyframes filterOut {
    0%   { opacity:1; transform:translateX(0); max-height:80px; }
    60%  { opacity:0; transform:translateX(20px); }
    100% { opacity:0; transform:translateX(20px); max-height:0; padding:0; margin:0; }
  }
  @keyframes blink {
    0%,100% { border-color: ${T.black}; }
    50%      { border-color: transparent; }
  }
  .result-filtered {
    animation: filterOut 0.5s ease forwards;
  }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .score-in { animation: countUp 0.4s ease both; }
`;

/* ─── PRODUCTS DATA ────────────────────────────────────── */
const PRODUCTS = [
  { id:1, title:"Ergonomic Office Chair",     cat:"Chairs",      rel:true,  reason:"Title + Category match" },
  { id:2, title:"Gaming Chair Pro X",         cat:"Chairs",      rel:true,  reason:"Title match" },
  { id:3, title:"Wooden Dining Table",        cat:"Tables",      rel:false, reason:"Description only — \"pairs well with dining chairs\"" },
  { id:4, title:"Standing Desk Converter",    cat:"Desks",       rel:false, reason:"Description only — \"no chair needed while standing\"" },
  { id:5, title:"Bean Bag Chair",             cat:"Chairs",      rel:true,  reason:"Title match" },
  { id:6, title:"Laptop Stand",               cat:"Accessories", rel:false, reason:"Description only — \"used alongside a chair\"" },
  { id:7, title:"Accent Chair Velvet",        cat:"Chairs",      rel:true,  reason:"Title match" },
  { id:8, title:"Desk Lamp with USB",         cat:"Lighting",    rel:false, reason:"Description only — \"great for your chair workspace\"" },
];

const WEIGHTS = [
  { field:"Title",       w:100, color:T.green,  why:"If query isn't in the name, product isn't it." },
  { field:"Category",    w:75,  color:"#2563EB", why:"Structural taxonomy — strongest context." },
  { field:"Tags",        w:50,  color:"#7C3AED", why:"Curated relevance labels, high trust." },
  { field:"Attributes",  w:35,  color:T.amber,  why:"Specs, material, type — for attribute queries." },
  { field:"Description", w:10,  color:T.red,    why:"Context only. Keyword stuffing lives here." },
];

/* ─── HELPERS ──────────────────────────────────────────── */
function useInView(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function Divider() {
  return <div style={{ height:1, background:T.border, margin:"64px 0" }} />;
}

function Eyebrow({ children, color = T.mid }) {
  return (
    <div style={{
      fontFamily:"'DM Sans',sans-serif", fontSize:11,
      fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
      color, marginBottom:16,
    }}>{children}</div>
  );
}

function Metric({ value, label, sub }) {
  const ref = useRef();
  const vis  = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(16px)",
      transition:"all 0.5s ease",
    }}>
      <div style={{
        fontFamily:"'Playfair Display',serif",
        fontSize:52, fontWeight:900, color:T.black, lineHeight:1,
      }}>{value}</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:T.black, marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.mid, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

/* ─── SECTION: HERO ─────────────────────────────────────── */
function Hero() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0); // 0=typing, 1=pause, 2=results
  const full = "chair";

  useEffect(() => {
    if (phase === 0) {
      if (typed.length < full.length) {
        const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 120);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase(1), 600);
        return () => clearTimeout(t);
      }
    }
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 400);
      return () => clearTimeout(t);
    }
  }, [typed, phase]);

  return (
    <div style={{ background:T.cream, padding:"60px 0 80px" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>

        <Eyebrow color={T.red}>Search Engine Optimisation · Scoring Model & AI</Eyebrow>

        <h1 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(36px,6vw,64px)",
          fontWeight:900, lineHeight:1.08,
          color:T.black, marginBottom:24, letterSpacing:"-1px",
        }}>
          The keyword matched.<br />
          The product{" "}
          <em style={{ fontStyle:"italic", color:T.red }}>didn't.</em>
        </h1>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:18,
          lineHeight:1.7, color:T.mid, maxWidth:560, marginBottom:48,
        }}>
          A product search returning 800 results for "chair" — including
          desk lamps, laptop stands, and yoga mats — because they mentioned
          the word in a description. This is the investigation and the fix.
        </p>

        {/* Animated search box */}
        <div style={{
          background:T.white, border:`1.5px solid ${T.border}`,
          borderRadius:12, padding:"20px 24px",
          boxShadow:"0 4px 32px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            borderBottom:`1px solid ${T.border}`, paddingBottom:16, marginBottom:16,
          }}>
            <svg width="18" height="18" fill="none" stroke={T.mid} strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:16,
              color:T.black, letterSpacing:0.3,
            }}>
              {typed}
              <span style={{
                borderRight:`2px solid ${T.black}`,
                marginLeft:1,
                animation:"blink 1s step-end infinite",
              }}>&nbsp;</span>
            </span>
            <span style={{
              marginLeft:"auto", fontFamily:"'DM Sans',sans-serif",
              fontSize:11, color:T.mid, opacity: phase === 2 ? 1 : 0,
              transition:"opacity 0.3s",
            }}>Many results</span>
          </div>

          {/* Results preview */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {PRODUCTS.slice(0,5).map((p,i) => (
              <div key={p.id} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                opacity: phase === 2 ? 1 : 0,
                transform: phase === 2 ? "none" : "translateY(6px)",
                transition:`all 0.3s ease ${i*80}ms`,
                padding:"8px 10px", borderRadius:6,
                background: p.rel ? "transparent" : T.redLight,
                border: p.rel ? "1px solid transparent" : `1px solid ${T.red}22`,
              }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.black }}>{p.title}</span>
                {!p.rel && (
                  <span style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:10,
                    color:T.red, fontWeight:600, background:T.redLight,
                    border:`1px solid ${T.red}33`, padding:"2px 7px", borderRadius:4,
                  }}>False positive</span>
                )}
                {p.rel && (
                  <span style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:10,
                    color:T.green, fontWeight:600,
                  }}>✓ Relevant</span>
                )}
              </div>
            ))}
            <div style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.mid,
              textAlign:"center", padding:"4px 0",
              opacity: phase===2?1:0, transition:"opacity 0.3s 500ms",
            }}>+ 844 more results, many irrelevant</div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display:"flex", gap:32, marginTop:40, flexWrap:"wrap",
        }}>
          {[
            { label:"Role", value:"UX & Systems Design" },
            { label:"Problem", value:"False positive search results" },
            { label:"Solution", value:"Field-weighted relevance engine" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:T.faint, letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.label}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.mid, marginTop:3 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: PROBLEM ──────────────────────────────────── */
function ProblemSection() {
  const ref = useRef();
  const vis  = useInView(ref);

  return (
    <div ref={ref} style={{ padding:"0 0 80px" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow>The Problem</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(28px,4vw,42px)",
          fontWeight:700, color:T.black, marginBottom:24, lineHeight:1.15,
        }}>A keyword in the wrong place<br />is not a match</h2>

        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, lineHeight:1.75, color:T.mid, marginBottom:32 }}>
          The original search engine treated every field equally.
          A product with "chair" anywhere — title, description, or a
          throwaway sentence like <em>"pairs well with dining chairs"</em> —
          ranked identically. The result was a 800-item wall that buried
          what users actually wanted.
        </p>

        {/* Before/after animated cards */}
        <div style={{
          background:T.redLight, border:`1.5px solid ${T.red}33`,
          borderRadius:12, padding:24, marginBottom:16,
        }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            fontWeight:700, color:T.red, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:16,
          }}>Before — Query: "chair"</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { name:"Ergonomic Office Chair", match:"Title match", bad:false },
              { name:"Wooden Dining Table",    match:"Desc: \"pairs well with dining chairs\"", bad:true },
              { name:"Standing Desk",          match:"Desc: \"no chair needed while standing\"", bad:true },
              { name:"Gaming Chair Pro",       match:"Title match", bad:false },
              { name:"Desk Lamp",              match:"Desc: \"great for your chair workspace\"", bad:true },
            ].map((r,i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"9px 12px", borderRadius:7,
                background: r.bad ? "#fff0ee" : T.white,
                border: `1px solid ${r.bad ? T.red+"33" : T.border}`,
                opacity: vis ? 1 : 0,
                transform: vis ? "none" : "translateY(8px)",
                transition:`all 0.4s ease ${i*60}ms`,
              }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.black }}>{r.name}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color: r.bad ? T.red : T.green }}>
                  {r.match}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.red,
            marginTop:14, fontWeight:600,
          }}>3 of 5 results are irrelevant — but the engine doesn't know that.</div>
        </div>

        {/* Callout quote */}
        <blockquote style={{
          borderLeft:`3px solid ${T.black}`,
          paddingLeft:20, margin:"32px 0",
          fontFamily:"'Playfair Display',serif",
          fontSize:22, fontStyle:"italic",
          color:T.black, lineHeight:1.5,
        }}>
          "The search engine couldn't tell the difference between a product
          that <em>is</em> a chair and a product that <em>mentions</em> chairs."
        </blockquote>
      </div>
    </div>
  );
}

/* ─── SECTION: ROOT CAUSE ───────────────────────────────── */
function RootCause() {
  const ref = useRef();
  const vis  = useInView(ref);

  return (
    <div ref={ref} style={{ background:T.navy, padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow color={T.faint}>Root Cause</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.white, marginBottom:24, lineHeight:1.2,
        }}>Not all fields carry equal signal</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:"#9BA4B5", marginBottom:36,
        }}>
          The core problem: the system weighted every text field identically.
          A title match and a throwaway description mention both scored the same.
          The fix required assigning explicit priority weights based on where a
          match actually signals user intent.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {WEIGHTS.map((w,i) => (
            <div key={w.field} style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateX(-16px)",
              transition:`all 0.45s ease ${i*80}ms`,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13,
                  fontWeight:700, color:T.white,
                }}>{w.field}</span>
                <span style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontSize:13, fontWeight:600, color:w.color,
                }}>×{w.w}</span>
              </div>
              <div style={{ position:"relative", height:8, background:"#2A2A3E", borderRadius:4, overflow:"hidden" }}>
                <div style={{
                  position:"absolute", top:0, left:0, height:"100%",
                  width: vis ? `${w.w}%` : "0%",
                  background:w.color,
                  borderRadius:4,
                  transition:`width 0.7s cubic-bezier(.4,0,.2,1) ${i*80}ms`,
                }} />
              </div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:11,
                color:"#555A6E", marginTop:4,
              }}>{w.why}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop:32, background:"#2A2A3E",
          border:`1px solid ${T.red}40`,
          borderRadius:10, padding:"16px 20px",
        }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.red, fontWeight:700, marginBottom:6 }}>
            The false-positive rule
          </div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9BA4B5", lineHeight:1.7 }}>
            Description-only match = max <strong style={{ color:T.white }}>10 points</strong>.
            Threshold = <strong style={{ color:T.white }}>45</strong>.
            A product found only in description never clears the bar — eliminated automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: RELEVANCE MODEL ──────────────────────────── */
const SCORE_FIELDS = [
  { key:"title",       label:"Title",       weight:100, color:"#2D6A4F" },
  { key:"category",    label:"Category",    weight:75,  color:"#2563EB" },
  { key:"tags",        label:"Tags",        weight:50,  color:"#7C3AED" },
  { key:"attributes",  label:"Attributes",  weight:35,  color:"#B45309" },
  { key:"description", label:"Description", weight:10,  color:"#C0392B" },
];

const FULL_PRODUCTS = [
  { id:1, title:"Ergonomic Office Chair", category:"Chairs",      tags:"chair ergonomic office seating lumbar", attributes:"mesh adjustable armrests", description:"Premium chair with lumbar support for long work sessions." },
  { id:2, title:"Gaming Chair Pro X",     category:"Chairs",      tags:"gaming chair racing RGB high-back",     attributes:"leather recliner tilt",      description:"High-back gaming chair with racing style design." },
  { id:3, title:"Wooden Dining Table",    category:"Tables",      tags:"table dining wood furniture",           attributes:"oak solid rectangular",      description:"Solid oak table, pairs well with dining chairs." },
  { id:4, title:"Standing Desk Converter",category:"Desks",       tags:"desk standing adjustable ergonomic",    attributes:"metal height-adjustable",    description:"Convert any desk to standing. No chair needed." },
  { id:5, title:"Bean Bag Chair",         category:"Chairs",      tags:"bean bag chair lounge casual",          attributes:"fabric soft indoor",         description:"Ultra-soft bean bag for relaxed casual seating." },
  { id:6, title:"Laptop Stand",           category:"Accessories", tags:"laptop stand portable ergonomic",       attributes:"aluminium adjustable foldable", description:"Adjustable stand, used alongside a chair at a desk." },
  { id:7, title:"Accent Chair Velvet",    category:"Chairs",      tags:"accent chair velvet living room",       attributes:"velvet decorative armchair",  description:"Luxurious velvet accent chair for living rooms." },
  { id:8, title:"Desk Lamp with USB",     category:"Lighting",    tags:"lamp desk LED USB lighting",           attributes:"metal dimmable flexible",    description:"LED desk lamp — great for your office chair workspace." },
];

function RelevanceModel() {
  const [query, setQuery]       = useState("chair");
  const [expanded, setExpanded] = useState(null);

  function tokenize(t) {
    return t.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
  }
  function matchScore(tokens, text) {
    if (!text) return 0;
    const norm = text.toLowerCase();
    if (norm.includes(tokens.join(" "))) return 1;
    const m = tokens.filter(t => norm.includes(t));
    return m.length / tokens.length;
  }

  const tokens = tokenize(query);

  const scored = FULL_PRODUCTS.map(p => {
    const breakdown = {};
    let total = 0;
    SCORE_FIELDS.forEach(f => {
      const s = f.key === "tags"
        ? Math.max(...(p.tags.split(" ").map(t => matchScore(tokens, t))), 0)
        : matchScore(tokens, p[f.key] || "");
      breakdown[f.key] = Math.round(s * f.weight);
      total += breakdown[f.key];
    });
    return { ...p, breakdown, total, relevant: total >= 45 };
  }).sort((a,b) => b.total - a.total);

  const relevant   = scored.filter(r => r.relevant);
  const irrelevant = scored.filter(r => !r.relevant);

  return (
    <div style={{ padding:"80px 0", background:"#F0EEE7" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow>Search Relevance Model</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:16, lineHeight:1.2,
        }}>Score every field.<br />Hide what doesn't clear the bar.</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:T.mid, marginBottom:28,
        }}>
          Each product is scored across five fields with different priority weights.
          Anything below threshold is hidden — even if the keyword exists in the text.
          Click any result to see the exact field-by-field breakdown.
        </p>

        {/* Search input */}
        <div style={{
          display:"flex", alignItems:"center", gap:12,
          border:`1.5px solid ${T.black}`, borderRadius:10,
          padding:"12px 18px", marginBottom:10, background:T.white,
        }}>
          <svg width="15" height="15" fill="none" stroke={T.mid} strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setExpanded(null); }}
            placeholder="Type a query…"
            style={{
              flex:1, border:"none", outline:"none",
              fontFamily:"'DM Sans',sans-serif", fontSize:15,
              color:T.black, background:"transparent",
            }}
          />
        </div>

        {/* Threshold legend */}
        <div style={{
          display:"flex", gap:16, marginBottom:20,
          fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.mid,
        }}>
          <span style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:T.green, display:"inline-block" }} />
            {relevant.length} shown (score ≥ 45)
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:T.red, display:"inline-block" }} />
            {irrelevant.length} hidden (score &lt; 45)
          </span>
        </div>

        {/* Result list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {scored.map(p => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} style={{
                background: T.white,
                border:`1px solid ${p.relevant ? T.border : T.red+"40"}`,
                borderLeft:`3px solid ${p.relevant ? T.green : T.red}`,
                borderRadius:"0 8px 8px 0",
                overflow:"hidden",
                opacity: p.relevant ? 1 : 0.6,
                transition:"opacity 0.2s",
              }}>
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  style={{
                    width:"100%", background:"none", border:"none",
                    padding:"12px 16px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:12, textAlign:"left",
                  }}
                >
                  {/* Score pill */}
                  <div style={{
                    minWidth:38, height:28,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: p.relevant ? T.greenLt : T.redLight,
                    borderRadius:5,
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize:11, fontWeight:700,
                    color: p.relevant ? T.green : T.red,
                    flexShrink:0,
                  }}>{p.total}</div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:T.black }}>{p.title}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.mid, marginTop:1 }}>{p.category}</div>
                  </div>

                  <div style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700,
                    padding:"3px 8px", borderRadius:4, flexShrink:0,
                    background: p.relevant ? T.greenLt : T.redLight,
                    color: p.relevant ? T.green : T.red,
                    border:`1px solid ${p.relevant ? T.green+"44" : T.red+"33"}`,
                  }}>{p.relevant ? "SHOW" : "HIDE"}</div>

                  <div style={{ color:T.faint, fontSize:12, flexShrink:0 }}>{isOpen ? "▲" : "▼"}</div>
                </button>

                {/* Expanded breakdown */}
                {isOpen && (
                  <div style={{
                    borderTop:`1px solid ${T.border}`,
                    padding:"14px 16px 16px",
                    background:"#FAFAF8",
                  }}>
                    <div style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:10,
                      fontWeight:700, color:T.mid, letterSpacing:"0.1em",
                      textTransform:"uppercase", marginBottom:12,
                    }}>Field score breakdown</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {SCORE_FIELDS.map(f => {
                        const pts = p.breakdown[f.key] || 0;
                        const pct = (pts / f.weight) * 100;
                        return (
                          <div key={f.key}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color: pts > 0 ? f.color : T.faint }}>
                                {f.label} <span style={{ fontWeight:400, color:T.faint }}>×{f.weight}</span>
                              </span>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: pts > 0 ? f.color : T.faint }}>
                                {pts} / {f.weight}
                              </span>
                            </div>
                            <div style={{ height:5, background:T.border, borderRadius:3, overflow:"hidden" }}>
                              <div style={{
                                height:"100%", width:`${pct}%`,
                                background: f.color, borderRadius:3,
                                transition:"width 0.4s ease",
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!p.relevant && (
                      <div style={{
                        marginTop:12, padding:"8px 12px",
                        background:T.redLight, borderRadius:6,
                        fontFamily:"'DM Sans',sans-serif", fontSize:11,
                        color:T.red, lineHeight:1.6,
                      }}>
                        Total score {p.total} is below threshold of 45.
                        The keyword exists in this product's text but not in a high-priority field.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <div style={{
          marginTop:16, padding:"12px 16px",
          background:T.navyLt, border:`1px solid ${T.navy}18`,
          borderRadius:8, fontFamily:"'DM Sans',sans-serif",
          fontSize:12, color:T.navy, lineHeight:1.7,
        }}>
          Try "lamp", "gaming", "yoga", "desk" — then click any hidden result
          to see exactly which field has the keyword and why the score stays below threshold.
        </div>
      </div>
    </div>
  );
}

function LiveDemo() { return <RelevanceModel />; }

/* ─── SECTION: 3-STAGE PIPELINE ─────────────────────────── */
function PipelineSection() {
  const [active, setActive] = useState(0);
  const stages = [
    {
      num:"01", label:"Retrieval",
      sub:"Full catalogue → candidates",
      color:"#2563EB",
      desc:"Broad pre-filter using inverted index + vector ANN search. Fast and imprecise — designed for recall, not precision.",
      detail:"This stage uses Elasticsearch or FAISS to get a large candidate pool quickly. False positives are expected and handled downstream.",
    },
    {
      num:"02", label:"Field Scoring",
      sub:"Candidates → scored shortlist",
      color:T.green,
      desc:"Each candidate is scored field-by-field using weighted matching. Products below the relevance threshold are dropped.",
      detail:"This is where description-only false positives die. The scoring engine runs in-memory on the candidate pool — fast enough to be synchronous.",
    },
    {
      num:"03", label:"AI Re-ranking",
      sub:"Shortlist → final results",
      color:"#7C3AED",
      desc:"BERT cross-encoder + user behaviour signals (CTR, CVR) re-order the shortlist. Most accurate, most expensive — only runs on a small pool.",
      detail:"Uses cross-encoder/ms-marco to score [query, title] pairs. Blended with historical click/purchase data at ratio 40% semantic, 35% behaviour, 25% field score.",
    },
  ];

  return (
    <div style={{ background:"#F0EEE7", padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow>Architecture</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:24, lineHeight:1.2,
        }}>Three stages, one goal:<br />shrink the irrelevant pool</h2>

        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32, overflowX:"auto" }}>
          {stages.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <button
                onClick={() => setActive(i)}
                style={{
                  flex:1, background: active===i ? s.color : T.white,
                  border:`2px solid ${active===i ? s.color : T.border}`,
                  borderRadius:10, padding:"16px 14px",
                  cursor:"pointer", textAlign:"center",
                  transition:"all 0.25s",
                  boxShadow: active===i ? `0 4px 20px ${s.color}33` : "none",
                }}
              >
                <div style={{
                  fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600,
                  color: active===i ? "rgba(255,255,255,0.7)" : T.mid, marginBottom:4,
                }}>{s.num}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
                  color: active===i ? T.white : T.black,
                }}>{s.label}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:10,
                  color: active===i ? "rgba(255,255,255,0.6)" : T.mid, marginTop:3,
                }}>{s.sub}</div>
              </button>
              {i < stages.length-1 && (
                <div style={{
                  color:T.faint, fontSize:20, padding:"0 8px", flexShrink:0,
                  animation:"flow 1.5s ease-in-out infinite",
                }}>→</div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          background:T.white, border:`1.5px solid ${stages[active].color}44`,
          borderRadius:12, padding:24,
          borderTop:`4px solid ${stages[active].color}`,
          transition:"all 0.3s",
        }}>
          <h3 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:22, fontWeight:700, color:T.black, marginBottom:10,
          }}>Stage {stages[active].num} — {stages[active].label}</h3>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:14,
            lineHeight:1.75, color:T.mid, marginBottom:14,
          }}>{stages[active].desc}</p>
          <div style={{
            background:"#F8F8F5", borderRadius:8, padding:"12px 16px",
            fontFamily:"'DM Sans',sans-serif", fontSize:13,
            color:T.black, lineHeight:1.7, borderLeft:`3px solid ${stages[active].color}`,
          }}>{stages[active].detail}</div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, gap:12 }}>
          {[
            { n:"All",      l:"Full catalogue"     },
            { n:"Broad",    l:"After retrieval"    },
            { n:"Scored",   l:"After field scoring"},
            { n:"Relevant", l:"Shown to user"      },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:"center", flex:1 }}>
              <div style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:22, fontWeight:900, color:T.black,
              }}>{s.n}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:10, color:T.mid, marginTop:3,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: SCORE SIMULATOR ───────────────────────────── */
function ScoreSimulator() {
  const [query,   setQuery]   = useState("ergonomic chair");
  const [product, setProduct] = useState({
    title:"Ergonomic Office Chair", category:"Chairs",
    brand:"ComfortPro", tags:"chair ergonomic office seating",
    attributes:"mesh lumbar adjustable", description:"Premium chair with lumbar support",
  });

  const SIM_FIELDS = [
    { key:"title",       label:"Title",       weight:100, color:"#22c55e" },
    { key:"category",    label:"Category",    weight:75,  color:"#2563EB" },
    { key:"brand",       label:"Brand",       weight:60,  color:"#7C3AED" },
    { key:"tags",        label:"Tags",        weight:50,  color:"#f59e0b" },
    { key:"attributes",  label:"Attributes",  weight:35,  color:"#0891b2" },
    { key:"description", label:"Description", weight:10,  color:"#C0392B" },
  ];

  function tokenize(t) {
    return t.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
  }
  function matchScore(tokens, text) {
    if (!text) return 0;
    const norm = text.toLowerCase();
    if (norm.includes(tokens.join(" "))) return 1;
    const m = tokens.filter(tk => norm.includes(tk));
    return m.length / tokens.length;
  }

  const tokens = tokenize(query);
  const scores = {};
  let total = 0;
  SIM_FIELDS.forEach(f => {
    const val = f.key === "tags"
      ? Math.max(...product.tags.split(" ").map(t => matchScore(tokens, t)), 0)
      : matchScore(tokens, product[f.key] || "");
    scores[f.key] = Math.round(val * f.weight);
    total += scores[f.key];
  });
  const relevant = total >= 45;

  return (
    <div style={{ background:T.navy, padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow color={T.faint}>Score Simulator</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.white, marginBottom:12, lineHeight:1.2,
        }}>Edit any field.<br />See why it shows or hides.</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:14,
          lineHeight:1.75, color:"#9BA4B5", marginBottom:28,
        }}>
          Change the query or any product field. The scorer runs live —
          every point is traceable to a specific field match.
          Try putting "chair" only in the description to see the false-positive rule enforce itself.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Left — editable fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700,
                color:"#9BA4B5", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4,
              }}>Search Query</div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width:"100%", boxSizing:"border-box",
                  background:"#0f172a", border:"1px solid #2A2A3E",
                  borderRadius:6, padding:"8px 10px",
                  color:"#38bdf8", fontSize:13,
                  fontFamily:"'JetBrains Mono',monospace", outline:"none",
                }}
              />
            </div>
            {Object.entries(product).map(([key, val]) => {
              const fw = SIM_FIELDS.find(f => f.key === key);
              return (
                <div key={key}>
                  <div style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700,
                    color: fw ? fw.color : "#9BA4B5",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3,
                  }}>{key}{fw ? ` ×${fw.weight}` : ""}</div>
                  <input
                    value={val}
                    onChange={e => setProduct(p => ({ ...p, [key]: e.target.value }))}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      background:"#0f172a", border:"1px solid #2A2A3E",
                      borderRadius:6, padding:"6px 10px",
                      color:"#94a3b8", fontSize:11,
                      fontFamily:"'JetBrains Mono',monospace", outline:"none",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Right — live score */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{
              background: relevant ? "#052e16" : "#450a0a",
              border:`2px solid ${relevant ? "#22c55e" : "#ef4444"}`,
              borderRadius:10, padding:"16px",
              textAlign:"center", marginBottom:4,
            }}>
              <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:40,
                fontWeight:900, color: relevant ? "#22c55e" : "#ef4444",
                lineHeight:1, transition:"color 0.3s",
              }}>{total}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
                color: relevant ? "#4ade80" : "#f87171", marginTop:6,
              }}>{relevant ? "✓ SHOW — above threshold" : "✗ HIDE — below threshold"}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:10,
                color:"#9BA4B5", marginTop:3,
              }}>Threshold: 45 pts</div>
            </div>

            {SIM_FIELDS.map(f => {
              const pts = scores[f.key] || 0;
              return (
                <div key={f.key}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700,
                      color: pts > 0 ? f.color : "#334155",
                    }}>{f.label}</span>
                    <span style={{
                      fontFamily:"'JetBrains Mono',monospace", fontSize:10,
                      color: pts > 0 ? f.color : "#334155",
                    }}>{pts} / {f.weight}</span>
                  </div>
                  <div style={{ height:5, background:"#1e293b", borderRadius:3, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${(pts/f.weight)*100}%`,
                      background:f.color, borderRadius:3,
                      transition:"width 0.3s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}




/* ─── SECTION: DISAMBIGUATION ───────────────────────────── */
function DisambigSection() {
  const [activeQ, setActiveQ] = useState(0);
  const queries = [
    { q:"chair",                 conf:"low",    outcome:"Disambiguation page",  color:T.red,   why:"Generic single noun — 8 categories match equally" },
    { q:"ergonomic office chair",conf:"high",   outcome:"Direct results",       color:T.green, why:"3 specific terms — office category dominates" },
    { q:"adjustable chair",      conf:"medium", outcome:"Results + filter strip",color:T.amber, why:"Attribute keyword present, 2–3 categories qualify" },
    { q:"Herman Miller Aeron",   conf:"high",   outcome:"Direct results",       color:T.green, why:"Brand name detected — single intent" },
  ];
  const aq = queries[activeQ];

  return (
    <div style={{ padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow>Query Routing</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:16, lineHeight:1.2,
        }}>Where the user lands<br />depends on the query</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:T.mid, marginBottom:32,
        }}>
          Not every query should land on the same page. The routing engine
          reads query confidence — token count, category spread, brand detection —
          and picks the right entry point.
        </p>

        {/* Query selector */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 }}>
          {queries.map((q,i) => (
            <button key={i} onClick={() => setActiveQ(i)} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 16px", borderRadius:9,
              background: activeQ===i ? T.white : "transparent",
              border: `1.5px solid ${activeQ===i ? T.black : T.border}`,
              cursor:"pointer", textAlign:"left", transition:"all 0.2s",
            }}>
              <span style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:13, color:T.black,
              }}>"{q.q}"</span>
              <span style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700,
                color:q.color, background:`${q.color}15`,
                border:`1px solid ${q.color}33`,
                padding:"2px 8px", borderRadius:4, letterSpacing:"0.08em",
                textTransform:"uppercase",
              }}>{q.conf}</span>
            </button>
          ))}
        </div>

        {/* Outcome card */}
        <div style={{
          background:T.white, border:`1.5px solid ${aq.color}44`,
          borderTop:`4px solid ${aq.color}`,
          borderRadius:12, padding:24, transition:"all 0.3s",
        }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
            color:aq.color, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10,
          }}>→ Routes to</div>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:24, fontWeight:700, color:T.black, marginBottom:10,
          }}>{aq.outcome}</div>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:14,
            color:T.mid, lineHeight:1.7,
          }}>{aq.why}</p>
        </div>

        {/* Rule table */}
        <div style={{
          marginTop:24, display:"grid",
          gridTemplateColumns:"repeat(3,1fr)", gap:12,
        }}>
          {[
            { conf:"Low",    color:T.red,   rule:"1 generic word", dest:"Disambiguation page" },
            { conf:"Medium", color:T.amber, rule:"2–3 word query", dest:"Results + filters" },
            { conf:"High",   color:T.green, rule:"Brand / 3+ terms",dest:"Direct results" },
          ].map(r => (
            <div key={r.conf} style={{
              background:T.white, border:`1px solid ${T.border}`,
              borderRadius:9, padding:"14px 14px",
              borderTop:`3px solid ${r.color}`,
            }}>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:10,
                fontWeight:700, color:r.color,
                textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6,
              }}>{r.conf}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.black, marginBottom:4,
              }}>{r.rule}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.mid,
              }}>{r.dest}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: AI LAYER ─────────────────────────────────── */
function AISection() {
  const ref = useRef();
  const vis  = useInView(ref);

  const components = [
    { icon:"🔢", title:"Text Embeddings", model:"sentence-transformers/all-MiniLM-L6-v2", desc:"Converts query and product text into dense vectors. 'Sofa' and 'couch' end up close together — semantic matches without exact keywords." },
    { icon:"📐", title:"Vector Index (ANN)", model:"FAISS / Qdrant", desc:"Stores all product embeddings. At query time, finds the nearest 500 neighbours in milliseconds. Powers the Stage 1 candidate pool." },
    { icon:"🤖", title:"Cross-Encoder", model:"cross-encoder/ms-marco-MiniLM", desc:"Takes [query + product title] as a pair, outputs a 0–1 relevance score. Most precise — kills false positives a vector search might miss." },
    { icon:"📈", title:"Learning to Rank", model:"LightGBM LambdaMART", desc:"Trained on click/purchase logs. Learns which feature blend (semantic score + CTR + CVR + field score) predicts user satisfaction." },
  ];

  return (
    <div ref={ref} style={{ background:T.navy, padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow color={T.faint}>AI Layer</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.white, marginBottom:16, lineHeight:1.2,
        }}>Beyond keywords —<br />what your own AI needs</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:"#9BA4B5", marginBottom:36,
        }}>
          Field-weighted scoring eliminates false positives. To then
          understand intent — finding "lumbar support seat" for query
          "chair for back pain" — you need a semantic layer.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {components.map((c,i) => (
            <div key={i} style={{
              background:"#1E1E30",
              border:"1px solid #2A2A3E",
              borderRadius:12, padding:20,
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(16px)",
              transition:`all 0.45s ease ${i*80}ms`,
            }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
              <div style={{
                fontFamily:"'DM Sans',sans-serif",
                fontSize:14, fontWeight:700, color:T.white, marginBottom:4,
              }}>{c.title}</div>
              <div style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:10, color:"#555A6E", marginBottom:10,
              }}>{c.model}</div>
              <p style={{
                fontFamily:"'DM Sans',sans-serif",
                fontSize:12, color:"#9BA4B5", lineHeight:1.7, margin:0,
              }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: IMPACT ───────────────────────────────────── */
function ImpactSection() {
  return (
    <div style={{ padding:"80px 0" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
        <Eyebrow>Outcome</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:48, lineHeight:1.2,
        }}>What changes when<br />irrelevant results disappear</h2>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, marginBottom:48 }}>
          <Metric value="0→45" label="Relevance threshold" sub="Any result below this is never shown" />
          <Metric value="×10" label="Description penalised" sub="From equal weight to 10% of title" />
          <Metric value="3→1" label="Search stages" sub="Retrieval → scoring → AI re-rank" />
          <Metric value="↓80%" label="False positive rate" sub="Description-only matches eliminated" />
        </div>

        {/* Before/after comparison */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:40,
        }}>
          {[
            {
              label:"Before", color:T.red, items:[
                "Dining Table appearing for 'chair'",
                "Desk lamps in furniture results",
                "800 mixed, uncategorised results",
                "User scrolls, confused, exits",
              ]
            },
            {
              label:"After", color:T.green, items:[
                "Only chair-category products shown",
                "Disambiguation on generic queries",
                "10–20 highly relevant results",
                "User finds product, converts",
              ]
            },
          ].map(col => (
            <div key={col.label} style={{
              background:T.white, border:`1.5px solid ${col.color}33`,
              borderTop:`4px solid ${col.color}`,
              borderRadius:12, padding:20,
            }}>
              <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:11,
                fontWeight:700, color:col.color,
                textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14,
              }}>{col.label}</div>
              {col.items.map((it,i) => (
                <div key={i} style={{
                  display:"flex", gap:8, marginBottom:10, alignItems:"flex-start",
                }}>
                  <span style={{ color:col.color, fontSize:12, marginTop:2 }}>
                    {col.color===T.red ? "✗" : "✓"}
                  </span>
                  <span style={{
                    fontFamily:"'DM Sans',sans-serif",
                    fontSize:13, color:T.black, lineHeight:1.5,
                  }}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Closing thought */}
        <div style={{
          borderLeft:`3px solid ${T.black}`,
          paddingLeft:20,
        }}>
          <p style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:20, fontStyle:"italic",
            color:T.black, lineHeight:1.6, margin:0,
          }}>
            "The fix wasn't adding more AI. It was deciding that a keyword
            in the wrong field shouldn't count — and enforcing that
            mathematically."
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: MEASUREMENT ──────────────────────────────── */
function MeasurementSection() {
  const ref  = useRef();
  const vis  = useInView(ref);
  const [activeMetric, setActiveMetric] = useState(0);
  const [simZeroRate, setSimZeroRate]   = useState(12);
  const [simNDCG,     setSimNDCG]       = useState(0.61);
  const [simExit,     setSimExit]       = useState(38);

  // Simulate threshold adjustment effect on metrics
  const [threshold, setThreshold] = useState(45);
  const zeroRate  = Math.max(2,  Math.round(simZeroRate + (threshold - 45) * 0.4));
  const ndcg      = Math.min(0.97, Math.max(0.3, (simNDCG  - (threshold - 45) * 0.004)));
  const exitRate  = Math.max(8,  Math.round(simExit  + (threshold - 45) * 0.5));
  const precision = Math.min(99, Math.max(20, Math.round(68 + (threshold - 45) * 0.7)));
  const recall    = Math.min(99, Math.max(20, Math.round(91 - (threshold - 45) * 0.8)));

  const METRICS = [
    {
      id:"ndcg",
      name:"NDCG@10",
      full:"Normalised Discounted Cumulative Gain",
      value: ndcg.toFixed(2),
      target:"≥ 0.75",
      status: ndcg >= 0.75 ? "good" : ndcg >= 0.6 ? "warn" : "bad",
      what:"Measures whether the most relevant products appear at the top of the first 10 results. A score of 1.0 = perfect ordering. The 'discounted' part penalises relevant results appearing lower down the list.",
      howto:"For each query, manually label a sample of results as [0=irrelevant, 1=partial, 2=relevant]. Compare your system's ranking against ideal ordering. Run this monthly on a fixed test set of 500 queries.",
      alarm:"NDCG below 0.65 means your top results are wrong more than they're right. Check if new product data has corrupted field weights or if index drift has occurred.",
      color:"#2563EB",
    },
    {
      id:"zeroResult",
      name:"Zero-result Rate",
      full:"Queries returning 0 results",
      value: zeroRate + "%",
      target:"< 5%",
      status: zeroRate < 5 ? "good" : zeroRate < 12 ? "warn" : "bad",
      what:"The percentage of searches that return no products after threshold filtering. A rising zero-result rate usually means the threshold is too aggressive, catalogue gaps exist, or new query patterns aren't covered by existing field data.",
      howto:"Log every search with result_count=0. Cluster them weekly. Common zero-result queries reveal either catalogue gaps (product doesn't exist) or scoring failures (product exists but doesn't score above threshold).",
      alarm:"If zero-result rate crosses 8%, lower the threshold temporarily and analyse which query types are failing. Don't raise it again until field data quality for that category improves.",
      color:T.red,
    },
    {
      id:"exit",
      name:"Search Exit Rate",
      full:"Users who search then leave without clicking",
      value: exitRate + "%",
      target:"< 25%",
      status: exitRate < 25 ? "good" : exitRate < 40 ? "warn" : "bad",
      what:"The proportion of search sessions where the user searches, sees results, and exits without clicking anything. High exit rate after filtering means results are present but wrong — not the same as a zero-result problem.",
      howto:"Measure: sessions with ≥1 search query + 0 product clicks + session end within 60 seconds. Segment by query confidence tier (low/medium/high). High exit on low-confidence queries = disambiguation is needed. High exit on high-confidence = scoring failure.",
      alarm:"Exit rate rising on high-confidence queries (specific product searches) is the most dangerous signal. It means the system is confidently showing the wrong thing.",
      color:T.amber,
    },
    {
      id:"precision",
      name:"Precision@10",
      full:"Relevant results in the top 10",
      value: precision + "%",
      target:"≥ 80%",
      status: precision >= 80 ? "good" : precision >= 60 ? "warn" : "bad",
      what:"Of the first 10 results shown, what percentage are genuinely relevant to the query. This is the metric that directly measures false positives — the original problem this system was built to solve.",
      howto:"Sample 100 queries per week. For each, manually judge the top 10 results as relevant or not. Track the percentage of relevant results in position 1–10. Automate with a judged query set and run nightly.",
      alarm:"Precision dropping while zero-result rate stays stable means false positives are creeping back in — likely from new products with poor field data quality (missing titles, keyword-stuffed descriptions).",
      color:T.green,
    },
    {
      id:"recall",
      name:"Recall@50",
      full:"Known relevant products found in top 50",
      value: recall + "%",
      target:"≥ 85%",
      status: recall >= 85 ? "good" : recall >= 70 ? "warn" : "bad",
      what:"Of all products genuinely relevant to a query, what percentage appear in the top 50 results. Low recall means real products are being buried below the threshold or excluded by the filter — the precision/recall tradeoff made explicit.",
      howto:"Requires a ground-truth judgement set: for 50 benchmark queries, manually tag every relevant product in the catalogue. Run the search. Check how many tagged products appear in top 50. This is expensive to build but the most honest signal you have.",
      alarm:"Recall dropping below 70% means the threshold is too aggressive. Either lower it by 5–10 points, or improve field data quality for the failing categories before tightening again.",
      color:"#7C3AED",
    },
  ];

  const m = METRICS[activeMetric];
  const statusColor = m.status==="good" ? T.green : m.status==="warn" ? T.amber : T.red;
  const statusLabel = m.status==="good" ? "On target" : m.status==="warn" ? "Watch" : "Action needed";

  return (
    <div style={{ padding:"80px 0 100px" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }} ref={ref}>

        <Eyebrow>Measurement</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:16, lineHeight:1.15,
        }}>How you know<br />if it's actually working</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:T.mid, marginBottom:10,
        }}>
          A search system with no measurement contract is a guess that shipped.
          These are the five metrics that together tell you whether the scoring
          engine is doing its job — what each means, how to track it, and
          what rising numbers are telling you.
        </p>

        {/* Threshold simulator */}
        <div style={{
          background:"#F0EEE7", borderRadius:12,
          padding:"20px 24px", marginBottom:36,
          border:`1px solid ${T.border}`,
        }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            fontWeight:700, color:T.mid, letterSpacing:"0.1em",
            textTransform:"uppercase", marginBottom:10,
          }}>Threshold simulator — drag to see metric impact</div>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:T.black, minWidth:80 }}>
              Threshold: <strong>{threshold}</strong>
            </span>
            <input
              type="range" min={20} max={80} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              style={{ flex:1, accentColor:T.navy }}
            />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { label:"NDCG@10",    v: ndcg.toFixed(2),     good: ndcg >= 0.75,      c:"#2563EB" },
              { label:"Zero-result",v: zeroRate+"%",         good: zeroRate < 5,       c:T.red    },
              { label:"Exit rate",  v: exitRate+"%",         good: exitRate < 25,      c:T.amber  },
              { label:"Precision",  v: precision+"%",        good: precision >= 80,    c:T.green  },
            ].map(s => (
              <div key={s.label} style={{
                background:T.white, borderRadius:8,
                padding:"10px 12px", textAlign:"center",
                border:`1px solid ${s.good ? s.c+"33" : T.red+"33"}`,
              }}>
                <div style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:20, fontWeight:900,
                  color: s.good ? s.c : T.red,
                  transition:"all 0.3s",
                }}>{s.v}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:10, color:T.mid, marginTop:2,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.mid,
            marginTop:10, lineHeight:1.6,
          }}>
            {threshold < 35 && "Threshold too low — false positives return. Precision drops as description-only matches pass through."}
            {threshold >= 35 && threshold <= 55 && "Operating range. Adjust based on real click data, not assumptions."}
            {threshold > 55 && "Threshold too aggressive — real products are being hidden. Zero-result rate and exit rate climb."}
          </div>
        </div>

        {/* Metric selector */}
        <div style={{
          display:"flex", gap:6, flexWrap:"wrap", marginBottom:20,
          opacity: vis ? 1 : 0,
          transition:"opacity 0.4s ease 0.1s",
        }}>
          {METRICS.map((mt,i) => (
            <button key={mt.id} onClick={() => setActiveMetric(i)} style={{
              background: activeMetric===i ? T.black : T.white,
              border:`1.5px solid ${activeMetric===i ? T.black : T.border}`,
              color: activeMetric===i ? T.white : T.mid,
              fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
              padding:"6px 14px", borderRadius:20,
              cursor:"pointer", transition:"all 0.2s",
            }}>{mt.name}</button>
          ))}
        </div>

        {/* Metric detail card */}
        <div style={{
          background:T.white,
          border:`1px solid ${T.border}`,
          borderTop:`4px solid ${m.color}`,
          borderRadius:"0 0 12px 12px",
          overflow:"hidden",
          opacity: vis ? 1 : 0,
          transition:"opacity 0.4s ease 0.2s",
        }}>
          {/* Header */}
          <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:11,
                  color:T.mid, letterSpacing:"0.08em", marginBottom:4,
                }}>{m.full}</div>
                <div style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:24, fontWeight:700, color:T.black,
                }}>{m.name}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:32, fontWeight:900, color:m.color, lineHeight:1,
                }}>{m.value}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:10,
                  color:statusColor, fontWeight:700, marginTop:4,
                }}>Target {m.target} · {statusLabel}</div>
              </div>
            </div>
          </div>

          {/* Three panels */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
            {[
              { label:"What it measures", body:m.what,   bg:T.white,  border:T.border },
              { label:"How to track it",  body:m.howto,  bg:"#FAFAF8", border:T.border },
              { label:"When to act",      body:m.alarm,  bg:T.redLight, border:T.red+"22" },
            ].map((p,i) => (
              <div key={i} style={{
                padding:"16px 18px",
                background:p.bg,
                borderLeft: i > 0 ? `1px solid ${p.border}` : "none",
              }}>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:10,
                  fontWeight:700, color:T.mid, textTransform:"uppercase",
                  letterSpacing:"0.1em", marginBottom:8,
                }}>{p.label}</div>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:12,
                  color:T.black, lineHeight:1.75, margin:0,
                }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data quality note */}
        <div style={{ height:1, background:T.border, margin:"48px 0" }} />

        <Eyebrow>What breaks this system</Eyebrow>
        <h3 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:24, fontWeight:700, color:T.black,
          marginBottom:24, lineHeight:1.2,
        }}>The failure modes to watch</h3>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {[
            {
              trigger:"Product data quality degrades",
              effect:"New suppliers submit products with missing titles and keyword-stuffed descriptions. Precision drops. False positives return.",
              fix:"Run a weekly data quality audit. Flag products where title word count < 3 or description contains >5 repetitions of the same keyword. Block ingestion until corrected.",
              severity:"high",
            },
            {
              trigger:"Catalogue expands into a new category",
              effect:"The threshold of 45 was calibrated on existing category vocabulary. A new category (e.g. industrial equipment) may use terminology that doesn't tokenise against current tags, causing relevant products to score below threshold.",
              fix:"When adding a new category, run a recall audit before launch. Temporarily lower threshold for that category while building its tag/attribute vocabulary.",
              severity:"medium",
            },
            {
              trigger:"Search volume shifts to long-tail queries",
              effect:"The field-weight engine handles single and 2-3 word queries well. Queries like 'best adjustable ergonomic office chair under 300 for tall person' fragment into tokens that partially match many fields weakly, producing low total scores on every product including relevant ones.",
              fix:"For queries with >5 tokens, switch to a phrase-match mode that scores the full phrase rather than individual tokens. Or route directly to the AI re-ranking stage, bypassing field scoring.",
              severity:"medium",
            },
            {
              trigger:"Weights never get updated",
              effect:"Title×100 is a prior. If user behaviour consistently shows that brand-matched products convert better than title-matched ones, the weights are lying to you. An uncalibrated scoring system drifts from reality silently.",
              fix:"Quarterly: run an offline experiment. Take 1,000 randomly sampled queries with known click outcomes. Use LightGBM to learn optimal weights from the data. Compare against the hardcoded weights. If NDCG improvement > 0.05, update.",
              severity:"low",
            },
          ].map((f,i) => (
            <div key={i} style={{
              borderBottom:`1px solid ${T.border}`,
              padding:"24px 0",
              opacity: vis ? 1 : 0,
              transition:`opacity 0.4s ease ${i*80 + 200}ms`,
            }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700,
                  padding:"3px 8px", borderRadius:4, letterSpacing:"0.08em",
                  textTransform:"uppercase", flexShrink:0, marginTop:2,
                  background: f.severity==="high" ? T.redLight : f.severity==="medium" ? T.amberLt : T.greenLt,
                  color: f.severity==="high" ? T.red : f.severity==="medium" ? T.amber : T.green,
                  border:`1px solid ${f.severity==="high" ? T.red+"33" : f.severity==="medium" ? T.amber+"33" : T.green+"33"}`,
                }}>{f.severity}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:14,
                  fontWeight:700, color:T.black,
                }}>{f.trigger}</div>
              </div>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:13,
                color:T.mid, lineHeight:1.75, margin:"0 0 10px",
              }}>{f.effect}</p>
              <div style={{
                background:"#F8F8F5", borderRadius:6,
                padding:"10px 14px", borderLeft:`3px solid ${T.border}`,
                fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:T.black, lineHeight:1.7,
              }}>
                <strong style={{ color:T.black }}>Fix: </strong>{f.fix}
              </div>
            </div>
          ))}
        </div>

        {/* Final statement */}
        <div style={{
          marginTop:48, padding:"28px 32px",
          background:T.navy, borderRadius:12,
        }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            fontWeight:700, color:"#555A6E",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14,
          }}>The honest position</div>
          <p style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:20, fontStyle:"italic",
            color:T.white, lineHeight:1.6, marginBottom:16,
          }}>
            The threshold of 45 is not a product decision. It is a hypothesis.
            It holds until click data, conversion data, and user sessions say otherwise.
            Any case study that doesn't say this is presenting a guess as a conclusion.
          </p>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16,
          }}>
            {[
              { label:"Measure weekly",    v:"NDCG@10 · Zero-result rate" },
              { label:"Calibrate quarterly", v:"Retrain weights on click logs" },
              { label:"Audit on catalogue change", v:"Recall check per new category" },
            ].map(s => (
              <div key={s.label} style={{
                background:"#1E1E30", borderRadius:8, padding:"12px 14px",
              }}>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:10,
                  fontWeight:700, color:"#555A6E",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4,
                }}>{s.label}</div>
                <div style={{
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, color:T.white,
                }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── NAV ───────────────────────────────────────────────── */
const NAV_LINKS = [
  { label:"Problem",      anchor:"section-problem"      },
  { label:"Architecture", anchor:"section-architecture" },
  { label:"Model",        anchor:"section-model"        },
  { label:"Impact",       anchor:"section-impact"       },
];

function Nav() { return null; }

/* ─── FOOTER ────────────────────────────────────────────── */
function Footer() {
  return (
    <div style={{
      borderTop:`1px solid ${T.border}`,
      padding:"40px 32px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      flexWrap:"wrap", gap:16,
    }}>
      <div>
        <div style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:18, fontWeight:700, color:T.black, marginBottom:4,
        }}>Search Relevance Engine</div>
        <div style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:12, color:T.mid,
        }}>UX + Systems Design · Built with field-weighted scoring + AI re-ranking</div>
      </div>
      <div style={{ display:"flex", gap:32 }}>
        {[
          { label:"Threshold", value:"45 pts" },
          { label:"Fields scored", value:"6" },
          { label:"Pipeline stages", value:"3" },
        ].map(s => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <div style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:20, fontWeight:900, color:T.black,
            }}>{s.value}</div>
            <div style={{
              fontFamily:"'DM Sans',sans-serif",
              fontSize:10, color:T.mid, marginTop:2,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ROOT ──────────────────────────────────────────────── */
export default function CaseStudy() {
  return (
    <>
      <style>{css}</style>
      <div style={{ background:T.cream, minHeight:"100vh" }}>
        <Nav />
        <Hero />

        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
          <Divider />
        </div>

        <div id="section-problem"><ProblemSection /></div>

        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
          <Divider />
        </div>

        <RootCause />
        <div id="section-model"><LiveDemo /></div>
        <div id="section-architecture"><PipelineSection /></div>
        <ScoreSimulator />

        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
          <Divider />
        </div>

        <DisambigSection />
        <AISection />

        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }}>
          <Divider />
        </div>
        <div id="section-impact"><ImpactOutcomeSection /></div>
      </div>
    </>
  );
}

/* ─── IMPACT & OUTCOME ──────────────────────────────────── */
function ImpactOutcomeSection() {
  const ref = useRef();
  const vis  = useInView(ref);

  const rows = [
    { label:"Results for \"chair\"",  before:"Mixed wall",    after:"Filtered set",  bnote:"Desk lamps, yoga mats, dining tables surfaced", anote:"Only title / category / tag matches pass threshold" },
    { label:"False positive source",  before:"Description",   after:"Blocked",       bnote:"Keyword anywhere in text = ranked result", anote:"Description weight too low to clear threshold alone" },
    { label:"Generic query path",     before:"Dead end",      after:"Routed",        bnote:"Undifferentiated results, no guidance, high exit", anote:"Disambiguation or filter strip by confidence tier" },
    { label:"Scoring model",          before:"None",          after:"6-field weighted", bnote:"All fields equal — position 1 same as position last", anote:"Title×100 → Description×10, threshold enforced" },
  ];

  const outcomes = [
    {
      label:"System outcome",
      tag:"Certain",
      title:"False positives structurally eliminated",
      body:"Any product scoring below 45 is excluded regardless of query volume or catalogue size. Dining tables do not appear for 'chair' — not because the engine got lucky, but because they cannot structurally clear the bar.",
      color:"#2563EB",
    },
    {
      label:"UX outcome",
      tag:"Certain",
      title:"Ambiguous queries now have a path",
      body:"Before: 'chair' returned an undifferentiated wall. After: low-confidence queries route to a disambiguation page. Medium-confidence get an inline filter strip. High-confidence go straight to results. No query ends in a dead end.",
      color:T.green,
    },
    {
      label:"Projected outcome",
      tag:"Likely — needs A/B test",
      title:"Search exit rate should drop on generic queries",
      body:"Users who get 10 relevant results convert at a higher rate than users who get 800 mixed ones. This is a projection. It requires instrumented A/B testing against real session data before it becomes a claim.",
      color:T.amber,
    },
    {
      label:"Open problem",
      tag:"Certain",
      title:"Vocabulary mismatch is unsolved",
      body:"'Chair for back pain' will not find 'lumbar support seat'. Field-weighted scoring eliminates false positives but does not bridge the gap between how users describe needs and how products are labelled. That requires Stage 3 semantic search.",
      color:T.red,
    },
  ];

  return (
    <div style={{ padding:"80px 0 100px" }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 32px" }} ref={ref}>

        <Eyebrow>Impact & Outcome</Eyebrow>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(26px,3.5vw,38px)",
          fontWeight:700, color:T.black, marginBottom:16, lineHeight:1.15,
        }}>What changed,<br />what didn't, what's next</h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:15,
          lineHeight:1.75, color:T.mid, marginBottom:40,
        }}>
          This is a system-level design intervention, not a shipped product with analytics.
          Outcomes below are tagged by confidence — structurally certain from the design,
          or projected and requiring measurement to confirm.
        </p>

        {/* Before / After comparison */}
        <div style={{
          border:`1px solid ${T.border}`, borderRadius:12,
          overflow:"hidden", marginBottom:48,
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
            <div style={{ padding:"10px 16px", background:"#F8F7F4", borderBottom:`1px solid ${T.border}` }} />
            <div style={{ padding:"10px 16px", background:T.redLight, borderBottom:`1px solid ${T.border}`, borderLeft:`1px solid ${T.border}` }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:T.red, letterSpacing:"0.1em", textTransform:"uppercase" }}>Before</span>
            </div>
            <div style={{ padding:"10px 16px", background:T.greenLt, borderBottom:`1px solid ${T.border}`, borderLeft:`1px solid ${T.border}` }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:T.green, letterSpacing:"0.1em", textTransform:"uppercase" }}>After</span>
            </div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
              borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              opacity: vis ? 1 : 0,
              transition:`opacity 0.4s ease ${i * 70}ms`,
            }}>
              <div style={{ padding:"14px 16px", background:T.white }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:T.black }}>{r.label}</div>
              </div>
              <div style={{ padding:"14px 16px", background:"#FFF8F8", borderLeft:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:T.red }}>{r.before}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:T.mid, marginTop:3, lineHeight:1.5 }}>{r.bnote}</div>
              </div>
              <div style={{ padding:"14px 16px", background:"#F6FBF8", borderLeft:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:T.green }}>{r.after}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:T.mid, marginTop:3, lineHeight:1.5 }}>{r.anote}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Outcome cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48 }}>
          {outcomes.map((o, i) => (
            <div key={i} style={{
              background:T.white,
              border:`1px solid ${T.border}`,
              borderLeft:`4px solid ${o.color}`,
              borderRadius:"0 10px 10px 0",
              padding:"18px 22px",
              opacity: vis ? 1 : 0,
              transform: vis ? "none" : "translateY(10px)",
              transition:`all 0.4s ease ${i * 80 + 200}ms`,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:o.color, textTransform:"uppercase", letterSpacing:"0.1em" }}>{o.label}</div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:T.mid, background:"#F0EEE7", border:`1px solid ${T.border}`, padding:"2px 8px", borderRadius:4 }}>{o.tag}</span>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:T.black, marginBottom:8 }}>{o.title}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:T.mid, lineHeight:1.75, margin:0 }}>{o.body}</p>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div style={{ background:T.navy, borderRadius:12, padding:"24px 28px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
          {[
            { label:"Core fix",       value:"Field-weighted threshold",   sub:"Eliminates description-only false positives" },
            { label:"UX routing fix", value:"Query confidence scoring",   sub:"3 patterns: disambig / hybrid / direct" },
            { label:"Remaining gap",  value:"Semantic intent layer",      sub:"Stage 3 — vocabulary mismatch unsolved" },
          ].map((s, i) => (
            <div key={i} style={{ borderLeft: i > 0 ? "1px solid #2A2A3E" : "none", paddingLeft: i > 0 ? 20 : 0 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:"#9BA4B5", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>{s.label}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:T.white, marginBottom:3 }}>{s.value}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#9BA4B5", lineHeight:1.5 }}>{s.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
