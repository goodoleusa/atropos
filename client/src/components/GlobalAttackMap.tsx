import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Attack {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: "ddos" | "intrusion" | "malware" | "phishing" | "exfil";
  active: boolean;
}

interface ThreatStat {
  label: string;
  value: number;
  suffix: string;
  color: string;
}

const ATTACK_TYPES = {
  ddos: { color: "#f97316", label: "DDoS" },
  intrusion: { color: "#14b8a6", label: "Intrusion" },
  malware: { color: "#d97706", label: "Malware" },
  phishing: { color: "#0891b2", label: "Phishing" },
  exfil: { color: "#eab308", label: "Data Exfil" },
};

const CITIES = [
  { name: "New York", x: 28, y: 35 },
  { name: "London", x: 47, y: 28 },
  { name: "Tokyo", x: 85, y: 35 },
  { name: "Sydney", x: 88, y: 72 },
  { name: "Moscow", x: 58, y: 25 },
  { name: "Beijing", x: 78, y: 33 },
  { name: "Singapore", x: 76, y: 55 },
  { name: "Dubai", x: 60, y: 42 },
  { name: "São Paulo", x: 32, y: 68 },
  { name: "Lagos", x: 50, y: 52 },
  { name: "Mumbai", x: 68, y: 45 },
  { name: "Berlin", x: 52, y: 28 },
  { name: "Los Angeles", x: 15, y: 38 },
  { name: "Toronto", x: 25, y: 32 },
  { name: "Seoul", x: 82, y: 35 },
];

export function GlobalAttackMap() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [stats, setStats] = useState<ThreatStat[]>([
    { label: "Threats Blocked", value: 847293, suffix: "", color: "#f97316" },
    { label: "Active Monitors", value: 2847, suffix: "", color: "#14b8a6" },
    { label: "Response Time", value: 0.003, suffix: "ms", color: "#d97706" },
    { label: "Uptime", value: 99.99, suffix: "%", color: "#0891b2" },
  ]);
  const attackIdRef = useRef(0);

  useEffect(() => {
    const generateAttack = () => {
      const types = Object.keys(ATTACK_TYPES) as Attack["type"][];
      const fromCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      let toCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      while (toCity === fromCity) {
        toCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      }

      const newAttack: Attack = {
        id: attackIdRef.current++,
        fromX: fromCity.x,
        fromY: fromCity.y,
        toX: toCity.x,
        toY: toCity.y,
        type: types[Math.floor(Math.random() * types.length)],
        active: true,
      };

      setAttacks((prev) => [...prev.slice(-15), newAttack]);

      setTimeout(() => {
        setAttacks((prev) =>
          prev.map((a) => (a.id === newAttack.id ? { ...a, active: false } : a))
        );
      }, 2000);
    };

    const interval = setInterval(generateAttack, 800);
    generateAttack();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value:
            stat.label === "Threats Blocked"
              ? stat.value + Math.floor(Math.random() * 50)
              : stat.label === "Active Monitors"
              ? 2800 + Math.floor(Math.random() * 100)
              : stat.label === "Response Time"
              ? parseFloat((0.001 + Math.random() * 0.005).toFixed(3))
              : 99.99,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[2/1] max-h-[500px] overflow-hidden rounded-lg border border-teal-900/30 bg-gradient-to-br from-[#0a0500] via-[#0d0805] to-[#0a0a0f]">
      {/* Retro grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Vaporwave gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 via-transparent to-teal-900/10" />

      {/* World map outline - simplified SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Simplified continent outlines */}
        <g fill="url(#mapGradient)" stroke="#d97706" strokeWidth="0.2" opacity="0.6">
          {/* North America */}
          <path d="M5,20 Q15,15 25,18 L30,25 Q35,35 25,40 L15,38 Q8,35 5,25 Z" />
          {/* South America */}
          <path d="M25,45 Q35,42 32,55 L28,65 Q22,70 25,55 Z" />
          {/* Europe */}
          <path d="M45,18 Q55,15 58,22 L55,30 Q50,32 45,28 Z" />
          {/* Africa */}
          <path d="M45,35 Q55,32 58,45 L52,58 Q45,60 42,48 Z" />
          {/* Asia */}
          <path d="M58,15 Q75,12 88,25 L90,35 Q85,45 72,42 L62,35 Q58,28 58,22 Z" />
          {/* Australia */}
          <path d="M82,55 Q92,52 95,62 L88,70 Q80,68 82,58 Z" />
        </g>

        {/* City nodes */}
        {CITIES.map((city, i) => (
          <g key={city.name}>
            <circle
              cx={city.x}
              cy={city.y}
              r="0.8"
              fill="#14b8a6"
              opacity="0.8"
              filter="url(#glow)"
            />
            <circle
              cx={city.x}
              cy={city.y}
              r="1.5"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="0.2"
              opacity="0.4"
            >
              <animate
                attributeName="r"
                from="1"
                to="3"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
              <animate
                attributeName="opacity"
                from="0.6"
                to="0"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
            </circle>
          </g>
        ))}

        {/* Attack lines */}
        <AnimatePresence>
          {attacks
            .filter((a) => a.active)
            .map((attack) => (
              <motion.g key={attack.id}>
                <motion.line
                  x1={attack.fromX}
                  y1={attack.fromY}
                  x2={attack.fromX}
                  y2={attack.fromY}
                  stroke={ATTACK_TYPES[attack.type].color}
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  initial={{ x2: attack.fromX, y2: attack.fromY }}
                  animate={{ x2: attack.toX, y2: attack.toY }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <motion.circle
                  cx={attack.fromX}
                  cy={attack.fromY}
                  r="0.5"
                  fill={ATTACK_TYPES[attack.type].color}
                  initial={{ cx: attack.fromX, cy: attack.fromY, opacity: 1 }}
                  animate={{
                    cx: attack.toX,
                    cy: attack.toY,
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </motion.g>
            ))}
        </AnimatePresence>
      </svg>

      {/* Threat type legend */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        {Object.entries(ATTACK_TYPES).map(([key, { color, label }]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-[10px] font-mono bg-black/50 px-2 py-1 rounded border border-stone-800/50"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-stone-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Stats panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-lg md:text-2xl font-orbitron font-bold"
                style={{ color: stat.color }}
              >
                {typeof stat.value === "number" && stat.value > 1000
                  ? stat.value.toLocaleString()
                  : stat.value}
                {stat.suffix}
              </div>
              <div className="text-[10px] md:text-xs text-stone-500 font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-red-900/30">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-mono text-red-400">LIVE</span>
      </div>

      {/* Cassette futurism decorative elements */}
      <div className="absolute bottom-3 right-3 text-[8px] font-mono text-teal-700/50 text-right">
        NEXUS THREAT INTELLIGENCE<br />
        SYS.MONITOR v4.0.2
      </div>
    </div>
  );
}
