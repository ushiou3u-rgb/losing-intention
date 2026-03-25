import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'motion/react';

const HASHTAGS = ['#STUDYWITHME', '#OOTD', '#MAKEUP', '#IDOL', '#DESIGN', 'SUBSCRIBE', 'BUY NOW', 'TRENDING', 'NEW POST', '#drama', '#100K', '#breaking_news', '#MBTI', '#fyp', '#viral', '#trending'];
const COLORS = ['#FF0033', '#0033FF', '#00FF66', '#111111', '#FF0033'];
const IMAGES = [
  '/IMG_0250.jpg',
  '/IMG_2726.jpg',
  '/IMG_3137.jpg',
  '/IMG_3144.jpg',
  '/IMG_3146.jpg',
  '/IMG_3147.jpg',
  '/IMG_3150.PNG',
  '/IMG_3152.jpg',
  '/IMG_3153.jpg',
  '/IMG_3154.jpg',
  '/IMG_3155.jpg',
  '/IMG_3156.jpg',
  '/IMG_3159.jpg',
  '/IMG_3160.jpg',
  '/IMG_3162.jpg',
  '/IMG_3163.jpg',
  '/IMG_3165.jpg',
  '/IMG_3166.jpg',
  '/IMG_3253.jpg',
  '/IMG_3255.jpg',
  '/IMG_3256.jpg',
  '/IMG_3257.jpg',
  '/IMG_3258.jpg',
  '/IMG_9613.jpg',
  '/maxresdefault.jpg',
  '/infj.jpg',
];

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const DISTRACTING_QUESTIONS = [
  "What did you have for dinner yesterday?",
  "2026-1982=?",
  "What was the last thing you searched on your phone?"
];

const PromptWord = ({ word, mousePos }: { word: string, mousePos: { x: number, y: number } }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = mousePos.x - centerX;
    const distY = mousePos.y - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 250) {
      const angle = Math.atan2(distY, distX);
      const push = (250 - distance) * 0.6;
      setOffset({ x: -Math.cos(angle) * push, y: -Math.sin(angle) * push });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [mousePos]);

  return (
    <motion.span
      ref={ref}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      className="inline-block mr-4 md:mr-8 text-5xl md:text-8xl lg:text-[8rem] font-black tracking-tighter uppercase text-[#111] select-none leading-none"
    >
      {word}
    </motion.span>
  );
};

const DistractionItem = ({ d, onRemove }: { d: any, onRemove: (id: number) => void }) => {
  const [interactedState, setInteractedState] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isPop = d.styleType === 'pop';
  const isWindow = d.styleType === 'window';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const elemX = rect.left + rect.width / 2;
    const elemY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dx = elemX - mouseX;
    const dy = elemY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const threshold = 300; // Distance to trigger repel
    if (distance < threshold) {
      const force = (threshold - distance) * 0.8; // Repel strength
      
      setInteractedState(prev => {
        const currentX = prev ? prev.x : rect.left;
        const currentY = prev ? prev.y : rect.top;
        
        return {
          x: currentX + (dx / distance) * force,
          y: currentY + (dy / distance) * force
        };
      });
    }
  };

  let animateObj;
  let transitionObj;

  if (interactedState) {
    animateObj = {
      x: interactedState.x,
      y: interactedState.y,
      opacity: 1,
      rotate: d.rotation,
      scale: isPop || isWindow ? 1 : undefined
    };
    transitionObj = {
      type: "spring",
      damping: 20,
      stiffness: 300,
      mass: 0.8
    };
  } else {
    animateObj = isPop
      ? { x: d.startX, y: d.startY, opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0.8], rotate: d.rotation }
      : (isWindow
        ? { x: d.startX, y: d.startY, opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.8], rotate: 0 }
        : { x: d.endX, y: d.endY, opacity: 1, rotate: d.rotation });
    transitionObj = isPop
      ? { duration: d.duration * 1.5, times: [0, 0.1, 0.8, 1], ease: "easeInOut" }
      : (isWindow
        ? { duration: d.duration, times: [0, 0.05, 0.95, 1], ease: "easeOut", delay: d.delay || 0 }
        : { duration: d.duration * 1.5, ease: "linear" });
  }

  return (
    <motion.div
      ref={ref}
      drag
      dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
      whileHover={{ scale: 1.05, zIndex: 100 }}
      whileDrag={{ scale: 1.1, zIndex: 110, cursor: 'grabbing' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setInteractedState({ x: rect.left, y: rect.top });
        }
      }}
      onMouseMove={handleMouseMove}
      initial={isPop 
        ? { x: d.startX, y: d.startY, opacity: 0, scale: 0, rotate: d.rotation - 30 }
        : (isWindow 
          ? { x: d.startX, y: d.startY, opacity: 0, scale: 0.5, rotate: 0 }
          : { x: d.startX, y: d.startY, opacity: 0, rotate: d.rotation })
      }
      animate={animateObj}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={transitionObj}
      onAnimationComplete={() => {
        if (!interactedState && !isDragging) {
          onRemove(d.id);
        }
      }}
      className={`absolute top-0 left-0 pointer-events-auto cursor-grab ${!isWindow && (d.type === 'text' || hasError) ? 'whitespace-nowrap font-sans font-black tracking-tighter' : ''}`}
      style={{ 
        zIndex: d.zIndex,
        ...(!isWindow && (d.type === 'text' || hasError) ? {
          fontSize: `${d.scale * 8}rem`,
          color: d.isOutline ? 'transparent' : d.color,
          WebkitTextStroke: d.isOutline ? `3px ${d.color}` : 'none',
        } : {})
      }}
    >
      {isWindow ? (
        <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#050505] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-[2px] min-w-[200px] pointer-events-none">
          <div className="bg-[#000080] text-white flex justify-between items-center px-1 py-[2px] mb-1">
            <span className="font-sans text-xs font-bold tracking-wider">System Error</span>
            <button className="bg-[#c0c0c0] text-black border-t border-l border-white border-b border-r border-black px-1.5 py-0.5 text-[10px] font-bold leading-none">X</button>
          </div>
          <div className="p-3 bg-[#c0c0c0] flex items-center justify-center">
            {d.type === 'text' || hasError ? (
              <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">!</div>
                <span className="text-black font-sans text-sm font-medium">{hasError ? HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)] : d.content}</span>
              </div>
            ) : (
              <img 
                src={d.content} 
                alt="error" 
                className="w-48 h-auto object-cover border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white" 
                onError={() => setHasError(true)}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      ) : (
        (d.type === 'text' || hasError) ? (
          hasError ? HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)] : d.content
        ) : (
          <img 
            src={d.content} 
            alt="distraction" 
            className="w-64 md:w-96 h-auto object-cover shadow-2xl pointer-events-none"
            style={{ transform: `scale(${d.scale})` }}
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
          />
        )
      )}
    </motion.div>
  );
};

const DataCircle = ({ delay, left, sizeClass, colorClass, shadowClass, pulseDuration = 2, time }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isHovered ? { scale: 1.3 } : { scale: [1, 1.15, 1] }}
        transition={isHovered ? { duration: 0.2 } : { duration: pulseDuration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
        className={`${sizeClass} rounded-full ${colorClass} ${shadowClass} relative cursor-pointer`}
      >
        <AnimatePresence>
          {isHovered && time && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: -5, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.8 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#111] text-white text-xs md:text-sm font-normal px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50 flex flex-col items-center"
              style={{ fontFamily: "'Akzidenz-Grotesk BQ Light', sans-serif", letterSpacing: "0.05em" }}
            >
              {time}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111]"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [text, setText] = useState('');
  const [chars, setChars] = useState<{id: number, char: string, dropped: boolean}[]>([]);
  const [distractions, setDistractions] = useState<any[]>([]);
  const [isLost, setIsLost] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [shake, setShake] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [page, setPage] = useState<'home' | 'transition' | 'data'>('home');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageQueue = useRef<string[]>([]);

  const handleReset = () => {
    setText('');
    setChars([]);
    setDistractions([]);
    setIsLost(false);
    setIsInputDisabled(false);
    setShake(false);
    setCurrentQuestion(null);
    setIsHoveringButton(false);
    setPage('home');
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // Keep input focused
  useEffect(() => {
    const focusInput = () => {
      if (!isLost && inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener('click', focusInput);
    focusInput();
    return () => document.removeEventListener('click', focusInput);
  }, [isLost]);

  // Timer (Extended to 16 seconds)
  useEffect(() => {
    if (text.length > 0 && !isLost) {
      const timer = setTimeout(() => {
        setIsLost(true);
      }, 16000);
      return () => clearTimeout(timer);
    }
  }, [text.length > 0, isLost]);

  // Disable input after 2 seconds
  useEffect(() => {
    if (text.length > 0 && !isLost) {
      const timer = setTimeout(() => {
        setIsInputDisabled(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [text.length > 0, isLost]);

  // Distractions Spawner
  useEffect(() => {
    if (text.length > 0 && !isLost) {
      // Show all questions sequentially, 3 seconds apart
      const q1Timer = setTimeout(() => setCurrentQuestion(DISTRACTING_QUESTIONS[0]), 4000);
      const q2Timer = setTimeout(() => setCurrentQuestion(DISTRACTING_QUESTIONS[1]), 7000);
      const q3Timer = setTimeout(() => setCurrentQuestion(DISTRACTING_QUESTIONS[2]), 10000);

      // Initialize image queue with exactly 25 images (looping if necessary)
      let shuffled = shuffleArray(IMAGES);
      while (shuffled.length < 25) {
        shuffled = [...shuffled, ...shuffleArray(IMAGES)];
      }
      imageQueue.current = shuffled.slice(0, 25);

      const interval = setInterval(() => {
        const isImage = imageQueue.current.length > 0 && Math.random() > 0.60; // 40% chance for an image if we still have images
        
        let content;
        if (isImage) {
          content = imageQueue.current.pop();
        } else {
          content = HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)];
        }

        const rand = Math.random();
        const styleType = rand > 0.9 ? 'window' : (rand > 0.7 ? 'pop' : 'flow'); // 10% window, 20% pop, 70% flow
        
        if (styleType === 'window') {
          const cascadeCount = Math.floor(Math.random() * 5) + 4; // 4 to 8 windows
          const baseX = Math.random() * 60 + 10; // 10vw to 70vw
          const baseY = Math.random() * 60 + 10; // 10vh to 70vh
          
          const newItems = Array.from({ length: cascadeCount }).map((_, i) => ({
            id: Date.now() + Math.random() + i,
            type: isImage ? 'image' : 'text',
            styleType: 'window',
            content,
            startX: `${baseX + i * 2}vw`,
            startY: `${baseY + i * 2}vh`,
            endX: `${baseX + i * 2}vw`,
            endY: `${baseY + i * 2}vh`,
            duration: 8, // stay longer
            isOutline: false,
            color: '#000',
            scale: 1,
            rotation: 0,
            zIndex: 200 + i, // High z-index to appear on top
            isDragged: false,
            delay: i * 0.15 // Cascade effect delay
          }));
          
          setDistractions(prev => [...prev, ...newItems].slice(-60));
        } else {
          const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
          let startX, startY, endX, endY;
          
          if (styleType === 'flow') {
            if (edge === 0) { // Top to Bottom
              startX = `${Math.random() * 100}vw`;
              startY = '-50vh';
              endX = `${Math.random() * 100}vw`;
              endY = '150vh';
            } else if (edge === 1) { // Right to Left
              startX = '150vw';
              startY = `${Math.random() * 100}vh`;
              endX = '-50vw';
              endY = `${Math.random() * 100}vh`;
            } else if (edge === 2) { // Bottom to Top
              startX = `${Math.random() * 100}vw`;
              startY = '150vh';
              endX = `${Math.random() * 100}vw`;
              endY = '-50vh';
            } else { // Left to Right
              startX = '-50vw';
              startY = `${Math.random() * 100}vh`;
              endX = '150vw';
              endY = `${Math.random() * 100}vh`;
            }
          } else {
            // Pop effect: stay in one place
            startX = `${Math.random() * 80 + 10}vw`;
            startY = `${Math.random() * 80 + 10}vh`;
            endX = startX;
            endY = startY;
          }

          setDistractions(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: isImage ? 'image' : 'text',
            styleType,
            content,
            startX, startY, endX, endY,
            duration: isImage ? Math.random() * 5 + 5 : Math.random() * 4 + 3, // Increased duration for better interaction
            isOutline: Math.random() > 0.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            scale: isImage ? Math.random() * 0.5 + 0.8 : Math.random() * 1 + 0.5,
            rotation: Math.random() * 30 - 15,
            zIndex: styleType === 'pop' ? Math.floor(Math.random() * 20) + 10 : (Math.random() > 0.5 ? 10 : 0),
            isDragged: false,
            delay: 0
          }].slice(-60)); // Keep up to 60 distractions on screen
        }
      }, 200); // Faster spawn rate
      return () => {
        clearInterval(interval);
        clearTimeout(q1Timer);
        clearTimeout(q2Timer);
        clearTimeout(q3Timer);
      };
    }
  }, [text.length > 0, isLost]);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLost) return;
    
    if (isInputDisabled) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const val = e.target.value;
    
    if (val.length > text.length) {
      const newChar = val.slice(-1);
      const id = Date.now() + Math.random();
      setChars(prev => [...prev, { id, char: newChar, dropped: false }]);
      
      // Characters physically drop after a short delay
      setTimeout(() => {
        setChars(prev => prev.map(c => c.id === id ? { ...c, dropped: true } : c));
      }, 600 + Math.random() * 400);
    } else if (val.length < text.length) {
      setChars(prev => prev.slice(0, -1));
    }
    
    setText(val);
  };

  const promptWords = "what's on your mind today?".split(" ");

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ${isLost ? 'bg-[#050505]' : 'bg-[#EAEAEA]'}`}
      style={{ cursor: 'none' }}
      onClick={() => {
        if (!isLost && inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      <div className="noise-overlay mix-blend-difference opacity-[0.06]"></div>

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{ 
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          backgroundColor: isHoveringButton ? '#00FF66' : '#FF0033',
          scale: isHoveringButton ? 1.5 : 1 
        }}
        transition={{ 
          x: { duration: 0.1, ease: "easeOut" },
          y: { duration: 0.1, ease: "easeOut" },
          backgroundColor: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
      />

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleType}
        maxLength={8}
        className="absolute opacity-0 w-0 h-0"
        autoFocus
        spellCheck="false"
        disabled={isLost}
        onBlur={() => {
          if (!isLost && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
      />

      <AnimatePresence mode="wait">
        {!isLost ? (
          <motion.div 
            key="active-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full flex items-center justify-center p-8"
          >
            {/* Distractions */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <AnimatePresence>
                {distractions.map(d => (
                  <DistractionItem 
                    key={d.id} 
                    d={d} 
                    onRemove={(id) => setDistractions(prev => prev.filter(item => item.id !== id))} 
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 max-w-6xl w-full flex flex-wrap justify-center items-center pointer-events-none">
              
              {/* Interaction Cue */}
              <AnimatePresence>
                {isInputDisabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-50 -translate-y-[80px] md:-translate-y-[100px] flex justify-center pointer-events-none"
                  >
                    <motion.p 
                      animate={{ 
                        boxShadow: [
                          "0px 0px 15px rgba(255, 255, 255, 0.4)", 
                          "0px 0px 40px rgba(255, 255, 255, 1)", 
                          "0px 0px 15px rgba(255, 255, 255, 0.4)"
                        ] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="text-[#111] font-sans text-lg md:text-2xl tracking-[0.2em] uppercase font-bold bg-white px-14 py-6 rounded-full shadow-xl border border-gray-200"
                    >
                      Move your mouse around to interact
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Distracting Question */}
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="absolute z-50 bg-[#EAEAEA]/90 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border-2 border-[#111] text-center"
                  >
                    <h2 className="text-3xl md:text-5xl font-black tracking-wider text-[#FF0033] leading-tight">
                      {currentQuestion}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>

              {text.length === 0 ? (
                // Prompt Phase
                <div className="flex flex-col items-center justify-center">
                  <div className="flex flex-wrap justify-center">
                    {promptWords.map((word, i) => (
                      <PromptWord key={i} word={word} mousePos={mousePos} />
                    ))}
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mt-16 md:mt-24 text-base md:text-xl font-sans tracking-[0.4em] uppercase text-[#111]"
                  >
                    [ start typing anywhere ]
                  </motion.p>
                </div>
              ) : (
                // Typing Phase
                <motion.div 
                  className="flex flex-wrap justify-center gap-x-1 md:gap-x-2"
                  animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {chars.map(c => (
                    <motion.span
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={c.dropped 
                        ? { y: '100vh', rotate: Math.random() * 180 - 90, opacity: 0, scale: 0.8 } 
                        : { opacity: 1, scale: 1, y: 0, rotate: 0 }
                      }
                      transition={c.dropped 
                        ? { duration: 1.5, ease: "easeIn" } 
                        : { type: "spring", stiffness: 400, damping: 20 }
                      }
                      className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[#111]"
                    >
                      {c.char === ' ' ? '\u00A0' : c.char}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          // Lost Phase
          <motion.div
            key="lost-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 text-center space-y-6 md:space-y-8"
          >
            <p 
              className="text-3xl md:text-4xl tracking-widest opacity-80 text-white"
              style={{ fontFamily: "'Akzidenz-Grotesk BQ Super', sans-serif", fontWeight: 'normal' }}
            >
              What are you thinking about right now?
            </p>
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 1.5,
                    staggerChildren: 0.03,
                  }
                }
              }}
              className="text-xl md:text-2xl tracking-[0.25em] opacity-60 text-white"
              style={{ fontFamily: "'Akzidenz-Grotesk BQ Light', sans-serif", fontWeight: 'normal' }}
            >
              {"Is it the same thought you had a moment ago?".split("").map((char, index) => (
                <motion.span 
                  key={index} 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
            
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsHoveringButton(false);
                setPage('transition');
                setTimeout(() => setPage('data'), 2700);
              }}
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5, duration: 1.5 }}
              className="px-10 py-4 md:px-12 md:py-5 bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 rounded-full font-sans tracking-widest text-base md:text-lg uppercase font-bold pointer-events-auto shadow-lg"
            >
              See My Data
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {page === 'transition' && (
          <motion.div
            key="transition-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[999] bg-[#050505] flex items-center justify-center overflow-hidden"
          >
            {/* SVG Strokes Drawing */}
            <motion.svg 
              className="absolute w-48 h-48 z-10" 
              viewBox="0 0 100 100"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "backIn" }}
            >
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90, opacity: 0.8 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transformOrigin: "50px 50px" }}
              />
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="#FF0033" strokeWidth="1.5" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0, rotate: 90, opacity: 0.6 }}
                animate={{ pathLength: 1, rotate: 180 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                style={{ transformOrigin: "50px 50px" }}
              />
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="#00FF66" strokeWidth="1" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0, rotate: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, rotate: -180 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transformOrigin: "50px 50px" }}
              />
            </motion.svg>

            {/* Expanding Circles (Solid) */}
            <motion.div
              className="absolute w-10 h-10 rounded-full z-20 bg-[#ffd664]"
              initial={{ scale: 0 }}
              animate={{ scale: 200 }}
              transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-10 h-10 rounded-full z-30 bg-[#e83d3d]"
              initial={{ scale: 0 }}
              animate={{ scale: 200 }}
              transition={{ delay: 1.1, duration: 1.2, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-10 h-10 rounded-full z-40 bg-[#78c7c9]"
              initial={{ scale: 0 }}
              animate={{ scale: 200 }}
              transition={{ delay: 1.3, duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
        
        {page === 'data' && (
          <motion.div
            key="data-page"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className="fixed inset-0 z-[1000] bg-[#78c7c9] flex items-center justify-center p-4 md:p-8"
          >
            {/* Back to Start Button */}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              onClick={handleReset}
              className="absolute top-4 left-4 md:top-8 md:left-8 px-7 py-3.5 md:px-10 md:py-5 bg-white rounded-full shadow-xl text-sm md:text-base tracking-widest uppercase font-bold text-[#393d3d] hover:bg-gray-100 transition-all flex items-center gap-3 z-50"
              style={{ fontFamily: "'Akzidenz-Grotesk BQ Super', sans-serif" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Start
            </motion.button>

            {/* Reflective Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 text-white text-sm md:text-lg z-50 tracking-wider text-center w-full px-4 leading-tight"
              style={{ 
                fontFamily: "'Akzidenz-Grotesk BQ Light', sans-serif", 
                letterSpacing: "0.05em"
              }}
            >
              <p>These are moments when I lost my original intention.</p>
              <p>Do you ever experience this too?</p>
            </motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="bg-white rounded-[2rem] w-[95vw] max-w-[1600px] h-[85vh] shadow-2xl flex flex-col p-8 md:p-12 text-black relative overflow-hidden"
            >

              {/* Header Area */}
              <div className="flex flex-row w-full">
                {/* Spacer to align with sidebar */}
                <div className="w-24 md:w-32 border-r border-transparent pr-4 md:pr-8 mr-4 md:mr-8 shrink-0"></div>
                
                {/* Title and Times */}
                <div className="flex flex-col justify-start flex-1 w-full">
                  <h1 className="text-2xl md:text-3xl tracking-wide opacity-90 leading-snug text-center w-full" style={{ fontFamily: "'Akzidenz-Grotesk BQ Super', sans-serif" }}>
                    How often do I lose my original intention after opening an app?
                  </h1>
                  <div className="mt-8 flex flex-row justify-between w-full px-8 md:px-16 text-base md:text-lg tracking-widest opacity-60" style={{ fontFamily: "'Akzidenz-Grotesk BQ Light', sans-serif" }}>
                    <span>9 A.M.</span>
                    <span>1 A.M.</span>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-row flex-1 w-full mt-4">
                {/* Left Sidebar: Days */}
                <div className="w-24 md:w-32 border-r border-gray-200 pr-4 md:pr-8 mr-4 md:mr-8 shrink-0 flex flex-col justify-around py-4">
                  {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map((day, index) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="text-lg md:text-xl tracking-widest cursor-pointer hover:opacity-50 transition-opacity uppercase text-right text-[#393d3d]"
                      style={{ fontFamily: "'Akzidenz-Grotesk BQ Super', sans-serif" }}
                    >
                      {day}
                    </motion.div>
                  ))}
                </div>

                {/* Main Content Area (Lines) */}
                <div className="flex flex-col justify-around flex-1 w-full py-4 px-8 md:px-16 relative">
                  {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map((day, index) => (
                    <div key={`line-${index}`} className="w-full flex items-center relative">
                      <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="h-[2px] bg-gray-200 w-full origin-left"
                      />
                      {day === 'Day 1' && (
                        <>
                          <DataCircle delay={1.6} left="20%" sizeClass="w-10 h-10 md:w-14 md:h-14" colorClass="bg-[#e83d3d]" shadowClass="shadow-md" pulseDuration={2.1} time="11:07" />
                          <DataCircle delay={1.8} left="66.66%" sizeClass="w-8 h-8 md:w-12 md:h-12" colorClass="bg-[#ffd664]" shadowClass="shadow-sm" pulseDuration={2.3} time="20:49" />
                        </>
                      )}
                      {day === 'Day 2' && (
                        <>
                          <DataCircle delay={1.8} left="40%" sizeClass="w-8 h-8 md:w-12 md:h-12" colorClass="bg-[#ffd664]" shadowClass="shadow-sm" pulseDuration={2.2} time="13:23" />
                          <DataCircle delay={1.7} left="50%" sizeClass="w-16 h-16 md:w-24 md:h-24" colorClass="bg-[#e83d3d]" shadowClass="shadow-lg" pulseDuration={2.5} time="18:56" />
                          <DataCircle delay={1.9} left="66.66%" sizeClass="w-8 h-8 md:w-12 md:h-12" colorClass="bg-[#78c7c9]" shadowClass="shadow-sm" pulseDuration={2.4} time="20:02" />
                          <DataCircle delay={2.0} left="90%" sizeClass="w-10 h-10 md:w-14 md:h-14" colorClass="bg-[#ffd664]" shadowClass="shadow-md" pulseDuration={2.1} time="23:17" />
                        </>
                      )}
                      {day === 'Day 3' && (
                        <DataCircle delay={1.8} left="50%" sizeClass="w-10 h-10 md:w-14 md:h-14" colorClass="bg-[#78c7c9]" shadowClass="shadow-md" pulseDuration={2.3} time="17:18" />
                      )}
                      {day === 'Day 4' && (
                        <DataCircle delay={1.9} left="30%" sizeClass="w-8 h-8 md:w-12 md:h-12" colorClass="bg-[#e83d3d]" shadowClass="shadow-sm" pulseDuration={2.2} time="15:26" />
                      )}
                      {day === 'Day 5' && (
                        <DataCircle delay={2.0} left="70%" sizeClass="w-8 h-8 md:w-12 md:h-12" colorClass="bg-[#78c7c9]" shadowClass="shadow-sm" pulseDuration={2.4} time="19:12" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend Area */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="w-full mt-auto flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm tracking-[0.15em] text-gray-500"
                style={{ fontFamily: "'Akzidenz-Grotesk BQ Light', sans-serif" }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#e83d3d] shadow-sm"></div>
                  <span className="uppercase font-bold">Xiaohongshu</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ffd664] shadow-sm"></div>
                  <span className="uppercase font-bold">Instagram</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#78c7c9] shadow-sm"></div>
                  <span className="uppercase font-bold">Photo Album</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-300 mx-2 hidden md:block"></div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full border-2 border-gray-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-500"></div>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-500"></div>
                  </div>
                  <span className="uppercase font-bold">Size = Minutes I forgot</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
