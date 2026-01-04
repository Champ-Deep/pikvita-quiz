import React, { useState, useRef, useEffect } from 'react';

const PikvitaQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState({});

  // Question definitions with spectrum-based interactions
  const questions = [
    {
      id: 'shopping_soul',
      type: '2d-position',
      question: "Where does your shopping soul live?",
      subtitle: "Drag the pin to your sweet spot",
      xAxis: { left: 'Plan Everything', right: 'Spontaneous Sprees' },
      yAxis: { top: 'Love the Hunt', bottom: 'Just Get It Done' },
      quadrants: [
        { emoji: '🗺️', label: 'The Strategist' },
        { emoji: '✨', label: 'The Explorer' },
        { emoji: '⚡', label: 'The Efficient' },
        { emoji: '🎲', label: 'The Adventurer' }
      ]
    },
    {
      id: 'time_value',
      type: 'gradient-slider',
      question: "Your time-to-money exchange rate",
      subtitle: "Where do you fall on this spectrum?",
      leftLabel: "I'll wait 3 days to save ₹50",
      rightLabel: "I'll pay ₹50 to save 3 hours",
      leftEmoji: '🐢',
      rightEmoji: '🚀',
      gradient: ['#4a7c59', '#f4a259', '#e07a5f']
    },
    {
      id: 'local_connection',
      type: 'emotion-spectrum',
      question: "How connected are you to local shops?",
      subtitle: "Slide through the feelings",
      emotions: [
        { emoji: '😶', label: 'Stranger', color: '#94a3b8' },
        { emoji: '👋', label: 'Acquaintance', color: '#f59e0b' },
        { emoji: '🤝', label: 'Regular', color: '#10b981' },
        { emoji: '🫂', label: 'Family', color: '#ec4899' },
        { emoji: '💚', label: 'Soulmate', color: '#8b5cf6' }
      ]
    },
    {
      id: 'category_gravity',
      type: 'gravity-wells',
      question: "What pulls you in?",
      subtitle: "Drag categories closer to show stronger pull",
      categories: [
        { id: 'art', emoji: '🎨', label: 'Art & Craft' },
        { id: 'stationery', emoji: '✏️', label: 'Stationery' },
        { id: 'gifts', emoji: '🎁', label: 'Gifts' },
        { id: 'party', emoji: '🎉', label: 'Party' },
        { id: 'diy', emoji: '🔧', label: 'DIY' },
        { id: 'books', emoji: '📚', label: 'Books' }
      ]
    },
    {
      id: 'frustration_heat',
      type: 'heat-map',
      question: "What heats you up?",
      subtitle: "Tap repeatedly to show intensity of frustration",
      items: [
        { id: 'discovery', emoji: '🔍', label: "Can't find what I need" },
        { id: 'timing', emoji: '⏰', label: 'Store closed when I arrive' },
        { id: 'delivery', emoji: '🚫', label: 'No delivery option' },
        { id: 'variety', emoji: '📉', label: 'Limited selection' },
        { id: 'price', emoji: '💰', label: 'Unclear pricing' },
        { id: 'quality', emoji: '❓', label: 'Inconsistent quality' }
      ]
    },
    {
      id: 'delivery_comfort',
      type: 'comfort-zone',
      question: "Your delivery comfort zone",
      subtitle: "Set your ideal balance of speed vs. cost",
      zones: [
        { time: '15 min', cost: '₹80', intensity: 1 },
        { time: '30 min', cost: '₹50', intensity: 0.75 },
        { time: '1 hour', cost: '₹30', intensity: 0.5 },
        { time: '3 hours', cost: '₹15', intensity: 0.25 },
        { time: 'Next day', cost: 'Free', intensity: 0 }
      ]
    },
    {
      id: 'value_blend',
      type: 'mixer',
      question: "Mix your perfect app recipe",
      subtitle: "Adjust the blend — total must equal 100%",
      ingredients: [
        { id: 'speed', emoji: '⚡', label: 'Speed', color: '#f59e0b' },
        { id: 'local', emoji: '❤️', label: 'Local Love', color: '#ec4899' },
        { id: 'variety', emoji: '✨', label: 'Variety', color: '#8b5cf6' },
        { id: 'price', emoji: '🏷️', label: 'Best Price', color: '#10b981' }
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setHasInteracted(prev => ({ ...prev, [questionId]: true }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 400);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 400);
    }
  };

  // 2D Position Picker Component
  const TwoDPositionPicker = ({ question, value, onChange }) => {
    const containerRef = useRef(null);
    const [position, setPosition] = useState(value || { x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      setPosition({ x, y });
      onChange({ x, y });
    };

    const getQuadrant = () => {
      if (position.x < 50 && position.y < 50) return 0;
      if (position.x >= 50 && position.y < 50) return 1;
      if (position.x < 50 && position.y >= 50) return 2;
      return 3;
    };

    return (
      <div className="space-y-4">
        <div 
          ref={containerRef}
          className="relative w-full aspect-square rounded-3xl cursor-crosshair overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse at ${position.x}% ${position.y}%, rgba(232, 121, 91, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, #fef3e2 0%, #fde8d7 50%, #f5e6d3 100%)
            `
          }}
          onMouseDown={(e) => { setIsDragging(true); handleInteraction(e); }}
          onMouseMove={(e) => isDragging && handleInteraction(e)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => { setIsDragging(true); handleInteraction(e); }}
          onTouchMove={(e) => isDragging && handleInteraction(e)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-amber-900/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-amber-900/20" />
          </div>

          {/* Quadrant labels */}
          {question.quadrants.map((q, i) => (
            <div 
              key={i}
              className={`absolute text-center transition-all duration-300 ${
                getQuadrant() === i ? 'opacity-100 scale-110' : 'opacity-40 scale-100'
              }`}
              style={{
                top: i < 2 ? '15%' : '75%',
                left: i % 2 === 0 ? '15%' : '75%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-3xl mb-1">{q.emoji}</div>
              <div className="text-xs font-medium text-amber-900/70">{q.label}</div>
            </div>
          ))}

          {/* Axis labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-amber-800/60 tracking-wide">
            {question.yAxis.top}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-amber-800/60 tracking-wide">
            {question.yAxis.bottom}
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-800/60 tracking-wide writing-mode-vertical">
            {question.xAxis.left}
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-800/60 tracking-wide writing-mode-vertical">
            {question.xAxis.right}
          </div>

          {/* Position marker */}
          <div 
            className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-coral-500 to-terracotta-600 rounded-full shadow-lg animate-pulse" 
                 style={{ background: 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)' }} />
            <div className="absolute inset-2 bg-cream-100 rounded-full flex items-center justify-center"
                 style={{ background: '#fef7ed' }}>
              <span className="text-lg">📍</span>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-amber-700/70 font-medium">
          {question.quadrants[getQuadrant()].emoji} You're in <span className="text-amber-900">{question.quadrants[getQuadrant()].label}</span> territory
        </div>
      </div>
    );
  };

  // Gradient Slider Component
  const GradientSlider = ({ question, value, onChange }) => {
    const [sliderValue, setSliderValue] = useState(value || 50);

    const handleChange = (e) => {
      const val = parseInt(e.target.value);
      setSliderValue(val);
      onChange(val);
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-4xl mb-2">{question.leftEmoji}</div>
            <div className="text-sm text-amber-800/70 max-w-24 mx-auto leading-tight">{question.leftLabel}</div>
          </div>
          
          <div className="text-6xl mx-4 transition-all duration-300" style={{
            transform: `translateX(${(sliderValue - 50) * 0.5}px) scale(${1 + Math.abs(sliderValue - 50) / 100})`
          }}>
            {sliderValue < 30 ? '🐢' : sliderValue > 70 ? '🚀' : '⚖️'}
          </div>
          
          <div className="text-center flex-1">
            <div className="text-4xl mb-2">{question.rightEmoji}</div>
            <div className="text-sm text-amber-800/70 max-w-24 mx-auto leading-tight">{question.rightLabel}</div>
          </div>
        </div>

        <div className="relative px-2">
          <div 
            className="absolute inset-x-2 h-4 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${question.gradient.join(', ')})`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleChange}
            className="relative w-full h-4 appearance-none bg-transparent cursor-pointer z-10"
            style={{
              '--thumb-size': '2.5rem'
            }}
          />
          <div 
            className="absolute w-10 h-10 rounded-full bg-white shadow-xl border-4 pointer-events-none flex items-center justify-center"
            style={{
              left: `calc(${sliderValue}% - 1.25rem + 0.5rem)`,
              top: '50%',
              transform: 'translateY(-50%)',
              borderColor: question.gradient[Math.floor(sliderValue / 34)]
            }}
          >
            <div className="w-3 h-3 rounded-full" style={{
              background: question.gradient[Math.floor(sliderValue / 34)]
            }} />
          </div>
        </div>

        <div className="flex justify-between text-xs text-amber-700/50 px-2">
          <span>Patient Saver</span>
          <span>Balanced</span>
          <span>Time Champion</span>
        </div>
      </div>
    );
  };

  // Emotion Spectrum Component
  const EmotionSpectrum = ({ question, value, onChange }) => {
    const [position, setPosition] = useState(value || 50);
    const containerRef = useRef(null);

    const handleInteraction = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      setPosition(pos);
      onChange(pos);
    };

    const getCurrentEmotion = () => {
      const index = Math.min(Math.floor(position / 20), question.emotions.length - 1);
      return question.emotions[index];
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div 
            className="text-7xl mb-3 transition-all duration-300"
            style={{ 
              filter: `drop-shadow(0 0 20px ${getCurrentEmotion().color}40)`,
              transform: `scale(${1 + position / 200})`
            }}
          >
            {getCurrentEmotion().emoji}
          </div>
          <div 
            className="text-xl font-semibold transition-colors duration-300"
            style={{ color: getCurrentEmotion().color }}
          >
            {getCurrentEmotion().label}
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative h-20 rounded-2xl cursor-pointer overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${question.emotions.map(e => e.color).join(', ')})`
          }}
          onMouseDown={handleInteraction}
          onMouseMove={(e) => e.buttons === 1 && handleInteraction(e)}
          onTouchStart={handleInteraction}
          onTouchMove={handleInteraction}
        >
          {/* Emotion markers */}
          <div className="absolute inset-0 flex justify-between items-center px-4">
            {question.emotions.map((emotion, i) => (
              <div 
                key={i}
                className={`text-2xl transition-all duration-300 ${
                  Math.abs((i * 25) - position) < 15 ? 'scale-125 opacity-100' : 'scale-100 opacity-60'
                }`}
              >
                {emotion.emoji}
              </div>
            ))}
          </div>

          {/* Thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-8 h-16 bg-white/90 rounded-xl shadow-lg backdrop-blur transition-all duration-100 flex items-center justify-center"
            style={{ left: `calc(${position}% - 1rem)` }}
          >
            <div className="w-1 h-8 rounded-full bg-amber-900/30" />
          </div>
        </div>

        <div className="flex justify-between text-xs text-amber-700/60 font-medium">
          {question.emotions.map((e, i) => (
            <span key={i} style={{ color: Math.abs((i * 25) - position) < 15 ? e.color : undefined }}>
              {e.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Gravity Wells Component
  const GravityWells = ({ question, value, onChange }) => {
    const [positions, setPositions] = useState(
      value || question.categories.reduce((acc, cat, i) => {
        const angle = (i / question.categories.length) * 2 * Math.PI;
        const radius = 35;
        return { ...acc, [cat.id]: { 
          x: 50 + radius * Math.cos(angle), 
          y: 50 + radius * Math.sin(angle) 
        }};
      }, {})
    );
    const [dragging, setDragging] = useState(null);
    const containerRef = useRef(null);

    const handleDrag = (e, catId) => {
      if (!containerRef.current || dragging !== catId) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));
      
      const newPositions = { ...positions, [catId]: { x, y } };
      setPositions(newPositions);
      onChange(newPositions);
    };

    const getDistanceFromCenter = (pos) => {
      return Math.sqrt(Math.pow(pos.x - 50, 2) + Math.pow(pos.y - 50, 2));
    };

    return (
      <div className="space-y-4">
        <div 
          ref={containerRef}
          className="relative w-full aspect-square rounded-3xl overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, rgba(232, 121, 91, 0.2) 0%, transparent 30%),
              radial-gradient(circle at 50% 50%, rgba(232, 121, 91, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, #fef3e2 0%, #fde8d7 100%)
            `
          }}
          onMouseMove={(e) => dragging && handleDrag(e, dragging)}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
          onTouchMove={(e) => dragging && handleDrag(e, dragging)}
          onTouchEnd={() => setDragging(null)}
        >
          {/* Center target */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-900/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-900/20 flex items-center justify-center">
                <div className="text-2xl">🎯</div>
              </div>
            </div>
          </div>

          {/* Concentric guides */}
          {[70, 50, 30].map((size, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-900/10"
              style={{ width: `${size}%`, height: `${size}%` }}
            />
          ))}

          {/* Category bubbles */}
          {question.categories.map((cat) => {
            const pos = positions[cat.id];
            const dist = getDistanceFromCenter(pos);
            const intensity = Math.max(0.3, 1 - dist / 50);
            
            return (
              <div
                key={cat.id}
                className="absolute cursor-grab active:cursor-grabbing transition-transform duration-100"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: dragging === cat.id ? 10 : 1
                }}
                onMouseDown={() => setDragging(cat.id)}
                onTouchStart={() => setDragging(cat.id)}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, rgba(232, 121, 91, ${intensity}) 0%, rgba(196, 93, 58, ${intensity}) 100%)`,
                    transform: `scale(${0.8 + intensity * 0.4})`
                  }}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-medium text-white/90 mt-1">{cat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm text-amber-700/70">
          Drag closer to center = stronger pull toward that category
        </div>
      </div>
    );
  };

  // Heat Map Component
  const HeatMap = ({ question, value, onChange }) => {
    const [heat, setHeat] = useState(value || {});

    const addHeat = (itemId) => {
      const newHeat = { ...heat, [itemId]: Math.min((heat[itemId] || 0) + 1, 5) };
      setHeat(newHeat);
      onChange(newHeat);
    };

    const getHeatColor = (level) => {
      const colors = [
        'bg-amber-100',
        'bg-orange-200',
        'bg-orange-400',
        'bg-red-500',
        'bg-red-600',
        'bg-red-700'
      ];
      return colors[level] || colors[0];
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {question.items.map((item) => {
            const level = heat[item.id] || 0;
            return (
              <button
                key={item.id}
                onClick={() => addHeat(item.id)}
                className={`relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden ${
                  level === 0 ? 'bg-amber-50 border-2 border-amber-200' : ''
                }`}
                style={{
                  background: level > 0 ? `linear-gradient(135deg, 
                    ${level === 1 ? '#fed7aa' : level === 2 ? '#fdba74' : level === 3 ? '#fb923c' : level === 4 ? '#f97316' : '#ea580c'} 0%, 
                    ${level === 1 ? '#fcd34d' : level === 2 ? '#fb923c' : level === 3 ? '#f97316' : level === 4 ? '#ea580c' : '#dc2626'} 100%)` : undefined
                }}
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className={`text-sm font-medium ${level > 2 ? 'text-white' : 'text-amber-900'}`}>
                  {item.label}
                </div>
                
                {/* Heat indicator */}
                <div className="absolute top-2 right-2 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-4 rounded-full transition-all duration-200 ${
                        i < level ? 'bg-white/80' : 'bg-black/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Fire animation for high heat */}
                {level >= 4 && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    🔥
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center text-sm text-amber-700/70">
          Tap multiple times to increase frustration intensity
        </div>
        
        <button 
          onClick={() => { setHeat({}); onChange({}); }}
          className="w-full py-2 text-sm text-amber-600 hover:text-amber-800 transition-colors"
        >
          🧊 Cool down (reset)
        </button>
      </div>
    );
  };

  // Comfort Zone Slider
  const ComfortZone = ({ question, value, onChange }) => {
    const [zone, setZone] = useState(value || 2);

    return (
      <div className="space-y-6">
        <div className="relative">
          {question.zones.map((z, i) => (
            <button
              key={i}
              onClick={() => { setZone(i); onChange(i); }}
              className={`w-full mb-3 p-4 rounded-2xl transition-all duration-300 flex items-center justify-between ${
                zone === i 
                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 shadow-lg scale-102' 
                  : 'bg-white/50 border-2 border-amber-200/50 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  zone === i ? 'bg-amber-400 text-white' : 'bg-amber-100'
                }`}>
                  {i === 0 ? '⚡' : i === 1 ? '🏃' : i === 2 ? '🚶' : i === 3 ? '🐢' : '📦'}
                </div>
                <div className="text-left">
                  <div className={`font-semibold ${zone === i ? 'text-amber-900' : 'text-amber-700'}`}>
                    {z.time}
                  </div>
                  <div className="text-xs text-amber-600/70">delivery</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-bold ${zone === i ? 'text-amber-900' : 'text-amber-700'}`}>
                  {z.cost}
                </div>
                <div className="text-xs text-amber-600/70">delivery fee</div>
              </div>

              {zone === i && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-amber-50 rounded-xl">
          <span className="text-sm text-amber-700">Urgency</span>
          <div className="flex-1 mx-4 h-2 bg-amber-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-amber-500 transition-all duration-300"
              style={{ width: `${100 - zone * 25}%` }}
            />
          </div>
          <span className="text-sm text-amber-700">Savings</span>
        </div>
      </div>
    );
  };

  // Value Mixer Component
  const ValueMixer = ({ question, value, onChange }) => {
    const [mix, setMix] = useState(value || { speed: 25, local: 25, variety: 25, price: 25 });

    const adjustValue = (id, delta) => {
      const newVal = Math.max(0, Math.min(100, mix[id] + delta));
      const diff = newVal - mix[id];
      
      // Redistribute to maintain 100%
      const others = question.ingredients.filter(i => i.id !== id);
      const totalOthers = others.reduce((sum, i) => sum + mix[i.id], 0);
      
      if (totalOthers === 0 && diff > 0) return;
      
      const newMix = { ...mix, [id]: newVal };
      others.forEach(i => {
        newMix[i.id] = Math.max(0, mix[i.id] - (diff * mix[i.id] / totalOthers));
      });
      
      // Normalize
      const total = Object.values(newMix).reduce((a, b) => a + b, 0);
      Object.keys(newMix).forEach(k => newMix[k] = Math.round(newMix[k] * 100 / total));
      
      setMix(newMix);
      onChange(newMix);
    };

    return (
      <div className="space-y-4">
        {/* Visual mixer */}
        <div className="h-16 rounded-2xl overflow-hidden flex shadow-inner">
          {question.ingredients.map((ing) => (
            <div 
              key={ing.id}
              className="transition-all duration-300 flex items-center justify-center"
              style={{ 
                width: `${mix[ing.id]}%`,
                background: ing.color,
                minWidth: mix[ing.id] > 5 ? '40px' : '0'
              }}
            >
              {mix[ing.id] > 10 && (
                <span className="text-white text-lg">{ing.emoji}</span>
              )}
            </div>
          ))}
        </div>

        {/* Individual sliders */}
        <div className="space-y-4">
          {question.ingredients.map((ing) => (
            <div key={ing.id} className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${ing.color}20` }}
              >
                {ing.emoji}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-amber-800">{ing.label}</span>
                  <span className="text-sm font-bold" style={{ color: ing.color }}>{Math.round(mix[ing.id])}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustValue(ing.id, -5)}
                    className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold transition-colors"
                  >
                    −
                  </button>
                  <div className="flex-1 h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${mix[ing.id]}%`, background: ing.color }}
                    />
                  </div>
                  <button 
                    onClick={() => adjustValue(ing.id, 5)}
                    className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const value = answers[question.id];
    const onChange = (val) => handleAnswer(question.id, val);

    switch (question.type) {
      case '2d-position':
        return <TwoDPositionPicker question={question} value={value} onChange={onChange} />;
      case 'gradient-slider':
        return <GradientSlider question={question} value={value} onChange={onChange} />;
      case 'emotion-spectrum':
        return <EmotionSpectrum question={question} value={value} onChange={onChange} />;
      case 'gravity-wells':
        return <GravityWells question={question} value={value} onChange={onChange} />;
      case 'heat-map':
        return <HeatMap question={question} value={value} onChange={onChange} />;
      case 'comfort-zone':
        return <ComfortZone question={question} value={value} onChange={onChange} />;
      case 'mixer':
        return <ValueMixer question={question} value={value} onChange={onChange} />;
      default:
        return null;
    }
  };

  // Calculate persona from answers
  const getPersona = () => {
    const pos = answers.shopping_soul || { x: 50, y: 50 };
    const timeValue = answers.time_value || 50;
    const local = answers.local_connection || 50;
    const mix = answers.value_blend || { speed: 25, local: 25, variety: 25, price: 25 };

    // Determine primary trait
    const traits = [
      { name: 'speed', value: timeValue + (mix.speed || 0) },
      { name: 'local', value: local + (mix.local || 0) },
      { name: 'explorer', value: (pos.x > 50 ? 30 : 0) + (pos.y < 50 ? 30 : 0) + (mix.variety || 0) },
      { name: 'saver', value: (100 - timeValue) + (mix.price || 0) }
    ].sort((a, b) => b.value - a.value);

    const personas = {
      speed: {
        title: 'The Velocity Seeker',
        emoji: '⚡',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-orange-500',
        description: "Time bends to your will. You've mastered the art of getting things done at lightning speed, and waiting feels like moving backward.",
        strength: 'Speed Obsession',
        tip: "Pikvita's 30-min delivery was literally designed for souls like yours."
      },
      local: {
        title: 'The Neighborhood Guardian',
        emoji: '🏪',
        color: '#10b981',
        gradient: 'from-emerald-400 to-teal-500',
        description: "You see magic in corner shops and meaning in supporting your community. Every purchase is a vote for the neighborhood you want.",
        strength: 'Community Connection',
        tip: "Every Pikvita order keeps a local store thriving. You're not just shopping—you're building community."
      },
      explorer: {
        title: 'The Treasure Hunter',
        emoji: '🗺️',
        color: '#8b5cf6',
        gradient: 'from-violet-400 to-purple-500',
        description: "Shopping isn't a chore—it's an adventure. You live for the thrill of unexpected finds and serendipitous discoveries.",
        strength: 'Discovery Drive',
        tip: "Pikvita connects you to hidden gems in your area you never knew existed."
      },
      saver: {
        title: 'The Strategic Optimizer',
        emoji: '🎯',
        color: '#06b6d4',
        gradient: 'from-cyan-400 to-blue-500',
        description: "You play the long game. Every purchase is calculated, every deal analyzed. Patience isn't just a virtue—it's your superpower.",
        strength: 'Value Maximization',
        tip: "Compare local prices instantly on Pikvita. Best deals, no compromise."
      }
    };

    return personas[traits[0].name];
  };

  // Results Screen
  const renderResults = () => {
    const persona = getPersona();
    
    return (
      <div className="min-h-screen p-4" style={{
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(232, 121, 91, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(74, 124, 89, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #fef7ed 0%, #fde8d7 50%, #f5e6d3 100%)
        `
      }}>
        <div className="max-w-md mx-auto pt-8">
          {/* Persona reveal */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div 
                className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${persona.color}20 0%, ${persona.color}40 100%)`,
                  boxShadow: `0 20px 40px ${persona.color}30`
                }}
              >
                {persona.emoji}
              </div>
            </div>
            
            <div className="text-sm uppercase tracking-widest text-amber-600 mb-2 font-medium">
              Your Shopping Soul
            </div>
            
            <h1 
              className="text-3xl font-bold mb-4"
              style={{ color: persona.color }}
            >
              {persona.title}
            </h1>
            
            <p className="text-amber-800/80 leading-relaxed max-w-sm mx-auto">
              {persona.description}
            </p>
          </div>

          {/* Traits visualization */}
          <div 
            className="rounded-3xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}
          >
            <div className="text-sm font-semibold text-amber-800 mb-4">Your Shopping DNA</div>
            
            <div className="space-y-4">
              {[
                { label: 'Speed Priority', value: (answers.time_value || 50), color: '#f59e0b', emoji: '⚡' },
                { label: 'Local Connection', value: (answers.local_connection || 50), color: '#10b981', emoji: '❤️' },
                { label: 'Discovery Drive', value: answers.shopping_soul ? (answers.shopping_soul.x > 50 ? 70 : 30) : 50, color: '#8b5cf6', emoji: '✨' },
                { label: 'Value Focus', value: 100 - (answers.time_value || 50), color: '#06b6d4', emoji: '🎯' }
              ].map((trait, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{trait.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-700">{trait.label}</span>
                      <span style={{ color: trait.color }} className="font-bold">{Math.round(trait.value)}%</span>
                    </div>
                    <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${trait.value}%`, 
                          background: trait.color,
                          animation: 'grow 1s ease-out'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          <div 
            className="rounded-2xl p-5 mb-6 border-2"
            style={{ 
              background: `${persona.color}10`,
              borderColor: `${persona.color}30`
            }}
          >
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <div className="font-semibold text-amber-900 mb-1">Perfect for You</div>
                <p className="text-sm text-amber-700/80">{persona.tip}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button 
            className="w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${persona.color} 0%, ${persona.color}dd 100%)`,
              boxShadow: `0 10px 30px ${persona.color}40`
            }}
          >
            <span>Join Pikvita Waitlist</span>
            <span>→</span>
          </button>

          {/* Share & retake */}
          <div className="flex justify-center gap-4 mt-6">
            <button className="px-5 py-2 rounded-xl bg-white/60 text-amber-700 text-sm font-medium hover:bg-white transition-colors">
              📤 Share
            </button>
            <button 
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setAnswers({});
                setHasInteracted({});
              }}
              className="px-5 py-2 rounded-xl bg-white/60 text-amber-700 text-sm font-medium hover:bg-white transition-colors"
            >
              🔄 Retake
            </button>
          </div>

          <div className="text-center mt-8 text-amber-600/50 text-sm">
            Crafted with 🧡 by Pikvita
          </div>
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(232, 121, 91, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(74, 124, 89, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #fef7ed 0%, #fde8d7 50%, #f5e6d3 100%)
        `
      }}
    >
      {/* Texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)' }}>
              🛒
            </div>
            <span className="font-bold text-amber-900 text-lg tracking-tight">pikvita</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/60 text-sm text-amber-700 font-medium">
            {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-amber-200/50 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #e8795b 0%, #c45d3a 50%, #4a7c59 100%)'
            }}
          />
        </div>

        {/* Question Card */}
        <div 
          className={`rounded-3xl p-6 mb-6 transition-all duration-400 ${
            isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
          }`}
          style={{ 
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(139, 90, 43, 0.1)'
          }}
        >
          <h2 className="text-2xl font-bold text-amber-900 mb-2 leading-tight">
            {question.question}
          </h2>
          <p className="text-amber-600/80 mb-8 text-sm">
            {question.subtitle}
          </p>

          {renderQuestion(question)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white/60 text-amber-700 hover:bg-white shadow-sm'
            }`}
          >
            ← Back
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)',
              boxShadow: '0 4px 20px rgba(232, 121, 91, 0.4)'
            }}
          >
            {currentStep === questions.length - 1 ? 'See My Results' : 'Continue'}
            <span>→</span>
          </button>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-8 text-amber-600/50 text-xs">
          ✨ Every answer is a spectrum, not a box
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600;700&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Fraunces', serif;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
        }
        
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        @keyframes grow {
          from { width: 0; }
        }
      `}</style>
    </div>
  );
};

export default PikvitaQuiz;
