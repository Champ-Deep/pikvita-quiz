import React, { useState, useRef, useEffect } from 'react';

const PikvitaQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInteracted, setHasInteracted] = useState({});

  // Question definitions with mobile-friendly interactions
  const questions = [
    {
      id: 'shopping_soul',
      type: 'quadrant-selector',
      question: "What's your shopping vibe?",
      subtitle: "Choose the one that feels most like you ❤️",
      quadrants: [
        {
          id: 'strategist',
          emoji: '🗺️',
          label: 'The Thoughtful Planner',
          description: "I research, plan, and know exactly what I need",
          position: { x: 25, y: 25 }
        },
        {
          id: 'explorer',
          emoji: '✨',
          label: 'The Joyful Explorer',
          description: "I love discovering new things on a whim",
          position: { x: 75, y: 25 }
        },
        {
          id: 'efficient',
          emoji: '⚡',
          label: 'The Time Saver',
          description: "Get in, get what I need, get out—done!",
          position: { x: 25, y: 75 }
        },
        {
          id: 'adventurer',
          emoji: '🎲',
          label: 'The Spontaneous Soul',
          description: "Every shopping trip is an adventure",
          position: { x: 75, y: 75 }
        }
      ]
    },
    {
      id: 'time_value',
      type: 'gradient-slider',
      question: "How do you value your time?",
      subtitle: "Move the slider to find your sweet spot",
      leftLabel: "I'll wait to save money",
      rightLabel: "I'll pay to save time",
      leftEmoji: '💰',
      rightEmoji: '⏰',
      gradient: ['#10b981', '#f59e0b', '#ef4444']
    },
    {
      id: 'local_connection',
      type: 'emotion-spectrum',
      question: "How do you feel about your local shops?",
      subtitle: "Every shop has a story, and so do you 🏪",
      emotions: [
        { emoji: '😶', label: 'New Here', color: '#94a3b8', message: "Still exploring the neighborhood" },
        { emoji: '👋', label: 'Familiar Face', color: '#f59e0b', message: "They recognize me sometimes" },
        { emoji: '🤝', label: 'Regular', color: '#10b981', message: "We know each other's names" },
        { emoji: '🫂', label: 'Like Family', color: '#ec4899', message: "They ask about my life" },
        { emoji: '💚', label: 'Heart & Soul', color: '#8b5cf6', message: "These shops ARE my community" }
      ]
    },
    {
      id: 'category_preferences',
      type: 'importance-ranking',
      question: "What pulls at your heartstrings?",
      subtitle: "Rate how much each category matters to you",
      categories: [
        { id: 'art', emoji: '🎨', label: 'Art & Craft Supplies' },
        { id: 'stationery', emoji: '✏️', label: 'Stationery & Paper Goods' },
        { id: 'gifts', emoji: '🎁', label: 'Unique Gifts' },
        { id: 'party', emoji: '🎉', label: 'Party Supplies' },
        { id: 'diy', emoji: '🔧', label: 'DIY & Hardware' },
        { id: 'books', emoji: '📚', label: 'Books & Magazines' }
      ]
    },
    {
      id: 'frustration_heat',
      type: 'heat-map',
      question: "What frustrates you most?",
      subtitle: "Tap each card to show how much it bothers you",
      items: [
        { id: 'discovery', emoji: '🔍', label: "Can't find what I need", supportMsg: "We feel you—we're making local shopping searchable!" },
        { id: 'timing', emoji: '⏰', label: 'Store closed when I arrive', supportMsg: "Real-time hours + delivery means you're never too late" },
        { id: 'delivery', emoji: '🚫', label: 'No delivery option', supportMsg: "We're bringing delivery to every local shop" },
        { id: 'variety', emoji: '📉', label: 'Limited selection', supportMsg: "Access inventory from ALL nearby shops at once" },
        { id: 'price', emoji: '💰', label: 'Unclear pricing', supportMsg: "Transparent prices, always—no surprises" },
        { id: 'quality', emoji: '❓', label: 'Inconsistent quality', supportMsg: "Reviews and ratings from real neighbors" }
      ]
    },
    {
      id: 'delivery_comfort',
      type: 'comfort-zone',
      question: "What's your delivery sweet spot?",
      subtitle: "We'll match you with what works best ✨",
      zones: [
        { time: '15 min', cost: '₹80', intensity: 1, label: 'Lightning Fast', emoji: '⚡', desc: 'Emergency mode activated' },
        { time: '30 min', cost: '₹50', intensity: 0.75, label: 'Quick & Easy', emoji: '🏃', desc: 'Perfect for busy days' },
        { time: '1 hour', cost: '₹30', intensity: 0.5, label: 'Relaxed Pace', emoji: '🚶', desc: 'Good balance of speed & savings' },
        { time: '3 hours', cost: '₹15', intensity: 0.25, label: 'Patient Saver', emoji: '🐢', desc: 'Great value, flexible timing' },
        { time: 'Next day', cost: 'Free', intensity: 0, label: 'Planning Ahead', emoji: '📦', desc: 'Maximum savings, zero rush' }
      ]
    },
    {
      id: 'value_blend',
      type: 'simple-ranking',
      question: "What matters most to you?",
      subtitle: "Rank these from most to least important",
      ingredients: [
        { id: 'speed', emoji: '⚡', label: 'Fast Delivery', color: '#f59e0b' },
        { id: 'local', emoji: '❤️', label: 'Supporting Local', color: '#ec4899' },
        { id: 'variety', emoji: '✨', label: 'Wide Selection', color: '#8b5cf6' },
        { id: 'price', emoji: '🏷️', label: 'Best Prices', color: '#10b981' }
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
      }, 300);
    } else {
      setShowUserForm(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();

    // Save quiz data
    const quizData = {
      userDetails,
      answers,
      persona: getPersona(),
      timestamp: new Date().toISOString(),
      score: calculateScore()
    };

    try {
      // Send to backend API
      const response = await fetch('/api/quiz-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        console.log('Quiz response saved successfully');
      }
    } catch (error) {
      console.error('Error saving quiz response:', error);
      // Still show results even if saving fails
    }

    setShowResults(true);
  };

  const calculateScore = () => {
    // Calculate engagement and affinity scores
    const localAffinity = (answers.local_connection || 50) / 100;
    const speedPreference = (answers.time_value || 50) / 100;

    const categoryEngagement = Object.keys(answers.category_preferences || {}).length / 6;

    const frustrationIntensity = Object.values(answers.frustration_heat || {})
      .reduce((sum, val) => sum + val, 0) / 30; // max is 6 items * 5 levels

    return {
      localAffinity: Math.round(localAffinity * 100),
      speedPreference: Math.round(speedPreference * 100),
      categoryEngagement: Math.round(categoryEngagement * 100),
      frustrationIntensity: Math.round(frustrationIntensity * 100),
      overall: Math.round(((localAffinity + categoryEngagement + (frustrationIntensity * 0.5)) / 2.5) * 100)
    };
  };

  // Mobile-friendly Quadrant Selector Component
  const QuadrantSelector = ({ question, value, onChange }) => {
    const [selected, setSelected] = useState(value || null);

    const handleSelect = (quadrant) => {
      setSelected(quadrant.id);
      onChange(quadrant);
    };

    return (
      <div className="space-y-3">
        {question.quadrants.map((quadrant) => (
          <button
            key={quadrant.id}
            onClick={() => handleSelect(quadrant)}
            className={`w-full p-4 rounded-2xl text-left transition-all duration-300 transform active:scale-98 ${
              selected === quadrant.id
                ? 'bg-gradient-to-br from-coral-100 to-terracotta-100 border-2 border-coral-400 shadow-lg scale-102'
                : 'bg-white/60 border-2 border-amber-200/50 hover:border-amber-300 shadow-sm'
            }`}
            style={{
              background: selected === quadrant.id
                ? 'linear-gradient(135deg, #fee2d5 0%, #ffd7ba 100%)'
                : 'rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="flex items-start gap-4">
              <div className={`text-4xl transition-transform duration-300 ${
                selected === quadrant.id ? 'scale-110' : 'scale-100'
              }`}>
                {quadrant.emoji}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg mb-1 ${
                  selected === quadrant.id ? 'text-amber-900' : 'text-amber-800'
                }`}>
                  {quadrant.label}
                </div>
                <p className="text-sm text-amber-700/80 leading-snug">
                  {quadrant.description}
                </p>
              </div>
              {selected === quadrant.id && (
                <div className="text-2xl">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Gradient Slider Component (enhanced for mobile)
  const GradientSlider = ({ question, value, onChange }) => {
    const [sliderValue, setSliderValue] = useState(value || 50);

    const handleChange = (e) => {
      const val = parseInt(e.target.value);
      setSliderValue(val);
      onChange(val);
    };

    const getMessage = () => {
      if (sliderValue < 25) return "Money saved is money earned 💰";
      if (sliderValue < 40) return "Smart spending, patient waiting 🌱";
      if (sliderValue < 60) return "Balanced and flexible ⚖️";
      if (sliderValue < 75) return "Time is precious ⏰";
      return "Life's too short to wait ⚡";
    };

    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="text-6xl mb-3 transition-all duration-300" style={{
            transform: `scale(${1 + Math.abs(sliderValue - 50) / 100})`
          }}>
            {sliderValue < 30 ? question.leftEmoji : sliderValue > 70 ? question.rightEmoji : '⚖️'}
          </div>
          <div className="text-base text-amber-800 font-medium px-4">
            {getMessage()}
          </div>
        </div>

        <div className="px-4">
          <div className="relative mb-6">
            <div
              className="h-3 rounded-full shadow-inner"
              style={{
                background: `linear-gradient(90deg, ${question.gradient.join(', ')})`
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleChange}
              className="absolute top-0 left-0 w-full h-3 appearance-none bg-transparent cursor-pointer"
              style={{ marginTop: '-4px' }}
            />
            <div
              className="absolute w-12 h-12 rounded-full bg-white shadow-xl border-4 pointer-events-none flex items-center justify-center transition-all duration-100"
              style={{
                left: `calc(${sliderValue}% - 24px)`,
                top: '-16px',
                borderColor: question.gradient[Math.min(Math.floor(sliderValue / 34), 2)]
              }}
            >
              <div className="w-4 h-4 rounded-full" style={{
                background: question.gradient[Math.min(Math.floor(sliderValue / 34), 2)]
              }} />
            </div>
          </div>

          <div className="flex justify-between items-start gap-4 text-sm">
            <div className="flex-1 text-left">
              <div className="text-2xl mb-1">{question.leftEmoji}</div>
              <div className="text-amber-700/80 leading-tight">{question.leftLabel}</div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-2xl mb-1">{question.rightEmoji}</div>
              <div className="text-amber-700/80 leading-tight">{question.rightLabel}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Emotion Spectrum Component (touch-optimized)
  const EmotionSpectrum = ({ question, value, onChange }) => {
    const [selected, setSelected] = useState(value !== undefined ? Math.floor(value / 25) : null);

    const handleSelect = (index) => {
      setSelected(index);
      onChange(index * 25);
    };

    return (
      <div className="space-y-4">
        {selected !== null && (
          <div className="text-center py-4 px-4 bg-white/60 rounded-2xl mb-2">
            <div className="text-5xl mb-2">{question.emotions[selected].emoji}</div>
            <div
              className="text-xl font-bold mb-1"
              style={{ color: question.emotions[selected].color }}
            >
              {question.emotions[selected].label}
            </div>
            <p className="text-sm text-amber-700/70">{question.emotions[selected].message}</p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {question.emotions.map((emotion, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`aspect-square rounded-2xl transition-all duration-300 transform ${
                selected === i
                  ? 'scale-110 shadow-lg'
                  : 'scale-100 hover:scale-105 shadow-sm'
              }`}
              style={{
                background: selected === i
                  ? `linear-gradient(135deg, ${emotion.color}40 0%, ${emotion.color}60 100%)`
                  : 'rgba(255, 255, 255, 0.6)',
                border: `2px solid ${selected === i ? emotion.color : 'transparent'}`
              }}
            >
              <div className={`text-3xl transition-transform ${selected === i ? 'scale-110' : ''}`}>
                {emotion.emoji}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between text-xs text-amber-700/60 px-1">
          <span>New</span>
          <span>Connected</span>
          <span>Family</span>
        </div>
      </div>
    );
  };

  // Importance Ranking Component (slider-based, mobile-friendly)
  const ImportanceRanking = ({ question, value, onChange }) => {
    const [importance, setImportance] = useState(
      value || question.categories.reduce((acc, cat) => ({ ...acc, [cat.id]: 3 }), {})
    );

    const handleChange = (catId, val) => {
      const newImportance = { ...importance, [catId]: val };
      setImportance(newImportance);
      onChange(newImportance);
    };

    const getLabel = (val) => {
      const labels = ['Not for me', 'Rarely', 'Sometimes', 'Often', 'Love it!'];
      return labels[val];
    };

    return (
      <div className="space-y-4">
        {question.categories.map((cat) => {
          const val = importance[cat.id];
          return (
            <div key={cat.id} className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-medium text-amber-900">{cat.label}</span>
                </div>
                <span className="text-sm font-bold text-coral-600">{getLabel(val)}</span>
              </div>

              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleChange(cat.id, level)}
                    className={`flex-1 h-12 rounded-lg transition-all duration-200 ${
                      val === level
                        ? 'bg-gradient-to-t from-coral-400 to-coral-300 shadow-md transform scale-105'
                        : 'bg-amber-100 hover:bg-amber-200'
                    }`}
                    style={{
                      opacity: val === level ? 1 : 0.4 + (level * 0.15)
                    }}
                  >
                    {val === level && (
                      <div className="text-white font-bold text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Simple Ranking Component
  const SimpleRanking = ({ question, value, onChange }) => {
    const [ranking, setRanking] = useState(value || []);

    const handleToggle = (item) => {
      let newRanking = [...ranking];
      const index = newRanking.findIndex(r => r.id === item.id);

      if (index >= 0) {
        newRanking.splice(index, 1);
      } else {
        newRanking.push(item);
      }

      setRanking(newRanking);
      onChange(newRanking);
    };

    const getRank = (itemId) => {
      const index = ranking.findIndex(r => r.id === itemId);
      return index >= 0 ? index + 1 : null;
    };

    return (
      <div className="space-y-3">
        <div className="text-center text-sm text-amber-700/70 mb-4">
          Tap to add to your priorities (order matters!)
        </div>

        {ranking.length > 0 && (
          <div className="bg-gradient-to-r from-coral-50 to-amber-50 rounded-xl p-4 mb-4">
            <div className="text-xs font-medium text-amber-700 mb-2">Your Priority Order:</div>
            <div className="flex flex-wrap gap-2">
              {ranking.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ background: item.color }}
                >
                  <span>#{index + 1}</span>
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {question.ingredients.map((item) => {
          const rank = getRank(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleToggle(item)}
              className={`w-full p-4 rounded-2xl transition-all duration-300 transform active:scale-98 ${
                rank
                  ? 'shadow-lg scale-102'
                  : 'bg-white/60 border-2 border-amber-200/50 hover:border-amber-300'
              }`}
              style={{
                background: rank
                  ? `linear-gradient(135deg, ${item.color}30 0%, ${item.color}50 100%)`
                  : undefined,
                border: rank ? `2px solid ${item.color}` : undefined
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="font-bold text-amber-900">{item.label}</span>
                </div>
                {rank && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: item.color }}
                  >
                    {rank}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // Heat Map Component (unchanged, already mobile-friendly)
  const HeatMap = ({ question, value, onChange }) => {
    const [heat, setHeat] = useState(value || {});

    const addHeat = (itemId) => {
      const newHeat = { ...heat, [itemId]: Math.min((heat[itemId] || 0) + 1, 5) };
      setHeat(newHeat);
      onChange(newHeat);
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
                className="relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden min-h-[120px]"
                style={{
                  background: level > 0
                    ? `linear-gradient(135deg,
                        ${level === 1 ? '#fed7aa' : level === 2 ? '#fdba74' : level === 3 ? '#fb923c' : level === 4 ? '#f97316' : '#ea580c'} 0%,
                        ${level === 1 ? '#fcd34d' : level === 2 ? '#fb923c' : level === 3 ? '#f97316' : level === 4 ? '#ea580c' : '#dc2626'} 100%)`
                    : 'rgba(255, 255, 255, 0.6)',
                  border: level === 0 ? '2px solid rgba(251, 191, 36, 0.3)' : 'none'
                }}
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className={`text-sm font-medium leading-tight ${level > 2 ? 'text-white' : 'text-amber-900'}`}>
                  {item.label}
                </div>

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

                {level >= 4 && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    🔥
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {Object.values(heat).some(v => v > 0) && (
          <button
            onClick={() => { setHeat({}); onChange({}); }}
            className="w-full py-3 text-sm text-amber-600 hover:text-amber-800 transition-colors bg-white/50 rounded-xl"
          >
            🧊 Reset all
          </button>
        )}
      </div>
    );
  };

  // Comfort Zone (enhanced with descriptions)
  const ComfortZone = ({ question, value, onChange }) => {
    const [zone, setZone] = useState(value !== undefined ? value : null);

    return (
      <div className="space-y-3">
        {question.zones.map((z, i) => (
          <button
            key={i}
            onClick={() => { setZone(i); onChange(i); }}
            className={`w-full p-4 rounded-2xl transition-all duration-300 transform active:scale-98 ${
              zone === i
                ? 'bg-gradient-to-r from-coral-100 to-amber-100 border-2 border-coral-400 shadow-lg scale-102'
                : 'bg-white/60 border-2 border-amber-200/50 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  zone === i ? 'bg-coral-400 text-white' : 'bg-amber-100'
                }`}>
                  {z.emoji}
                </div>
                <div className="text-left">
                  <div className={`font-bold ${zone === i ? 'text-amber-900' : 'text-amber-700'}`}>
                    {z.label}
                  </div>
                  <div className="text-xs text-amber-600/70">{z.desc}</div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold text-lg ${zone === i ? 'text-amber-900' : 'text-amber-700'}`}>
                  {z.cost}
                </div>
                <div className="text-xs text-amber-600/70">{z.time}</div>
              </div>
            </div>

            {zone === i && (
              <div className="mt-2 pt-2 border-t border-amber-300/30 text-sm text-amber-700 text-center">
                ✓ This feels right for you
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const value = answers[question.id];
    const onChange = (val) => handleAnswer(question.id, val);

    switch (question.type) {
      case 'quadrant-selector':
        return <QuadrantSelector question={question} value={value} onChange={onChange} />;
      case 'gradient-slider':
        return <GradientSlider question={question} value={value} onChange={onChange} />;
      case 'emotion-spectrum':
        return <EmotionSpectrum question={question} value={value} onChange={onChange} />;
      case 'importance-ranking':
        return <ImportanceRanking question={question} value={value} onChange={onChange} />;
      case 'simple-ranking':
        return <SimpleRanking question={question} value={value} onChange={onChange} />;
      case 'heat-map':
        return <HeatMap question={question} value={value} onChange={onChange} />;
      case 'comfort-zone':
        return <ComfortZone question={question} value={value} onChange={onChange} />;
      default:
        return null;
    }
  };

  // Calculate persona from answers
  const getPersona = () => {
    const shoppingSoul = answers.shopping_soul || {};
    const timeValue = answers.time_value || 50;
    const local = answers.local_connection || 50;
    const ranking = answers.value_blend || [];

    // Determine primary trait based on ranking
    let primaryTrait = 'local'; // default
    if (ranking.length > 0) {
      primaryTrait = ranking[0].id;
    } else if (timeValue > 70) {
      primaryTrait = 'speed';
    } else if (local > 70) {
      primaryTrait = 'local';
    }

    const personas = {
      speed: {
        title: 'The Time Warrior',
        emoji: '⚡',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-orange-500',
        description: "Your time is precious, and you know it. You've mastered the art of efficiency without sacrificing what matters.",
        heartfelt: "We see you—always on the move, making every moment count. Pikvita was built for people like you who refuse to waste a single minute.",
        strength: 'Lightning-Fast Decision Making',
        tip: "30-minute delivery from local shops? That's your sweet spot.",
        personalizedMessage: "Hey speed demon! ⚡ We've matched you with the fastest local shops in your area. Get what you need in 30 minutes or less—because your time matters."
      },
      local: {
        title: 'The Community Champion',
        emoji: '🏪',
        color: '#10b981',
        gradient: 'from-emerald-400 to-teal-500',
        description: "You understand that every purchase is a vote for the world you want to see. Your neighborhood isn't just where you live—it's home.",
        heartfelt: "Thank you for caring. Seriously. People like you keep local shops alive and neighborhoods vibrant. Pikvita exists to support your values.",
        strength: 'Building Community, One Purchase at a Time',
        tip: "Every order supports a real person with a real dream.",
        personalizedMessage: "You're a neighborhood hero! 🏪 Every time you shop with Pikvita, you're helping keep local businesses thriving. Your shopkeeper remembers your name—and that matters."
      },
      explorer: {
        title: 'The Discovery Artist',
        emoji: '✨',
        color: '#8b5cf6',
        gradient: 'from-violet-400 to-purple-500',
        description: "Life's too short for boring shopping. You seek the unexpected, the unique, the story behind every find.",
        heartfelt: "Your curiosity makes the world more interesting. We've designed Pikvita to help you discover hidden gems you never knew existed—right in your neighborhood.",
        strength: 'Finding Magic in the Unexpected',
        tip: "Discover unique local shops you'll fall in love with.",
        personalizedMessage: "Adventure awaits! ✨ We've found 12 unique local shops near you that aren't on any app. Ready to discover your new favorite place?"
      },
      variety: {
        title: 'The Collector',
        emoji: '🎨',
        color: '#ec4899',
        gradient: 'from-pink-400 to-rose-500',
        description: "You love options. The more choices, the better. You know that variety isn't just nice—it's essential.",
        heartfelt: "We get it—you want access to everything. Pikvita brings you inventory from dozens of local shops, all in one place.",
        strength: 'Maximizing Your Options',
        tip: "Browse inventory from 20+ local shops at once.",
        personalizedMessage: "Variety lover! 🎨 Why settle for one shop when you can browse 20+ local stores at once? Your perfect find is waiting."
      },
      price: {
        title: 'The Smart Shopper',
        emoji: '🎯',
        color: '#06b6d4',
        gradient: 'from-cyan-400 to-blue-500',
        description: "You play chess while others play checkers. Every rupee is respected, every deal is analyzed. Smart isn't cheap—it's strategic.",
        heartfelt: "Your intelligence with money is admirable. Pikvita helps you compare prices across local shops instantly—so you always know you're getting the best deal.",
        strength: 'Strategic Value Optimization',
        tip: "Compare prices across all local shops in real-time.",
        personalizedMessage: "Smart cookie! 🎯 See prices from all nearby shops instantly. No more wondering if you're getting the best deal—you'll know."
      }
    };

    return personas[primaryTrait] || personas.local;
  };

  // User Details Form
  const renderUserForm = () => {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(232, 121, 91, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #fef7ed 0%, #fde8d7 100%)
        `
      }}>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-amber-900 mb-2">
              You're Almost There!
            </h2>
            <p className="text-amber-700/80">
              Just a couple details so we can personalize your local shopping experience
            </p>
          </div>

          <form onSubmit={handleUserFormSubmit} className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  What's your name? 👋
                </label>
                <input
                  type="text"
                  required
                  value={userDetails.name || ''}
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                  placeholder="Your friendly name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-coral-400 focus:outline-none bg-white/80 text-amber-900 placeholder-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Email address 📧
                </label>
                <input
                  type="email"
                  required
                  value={userDetails.email || ''}
                  onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-coral-400 focus:outline-none bg-white/80 text-amber-900 placeholder-amber-400"
                />
                <p className="text-xs text-amber-600/70 mt-1">We'll send your results + early access to Pikvita</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Phone (optional) 📱
                </label>
                <input
                  type="tel"
                  value={userDetails.phone || ''}
                  onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                  placeholder="+91 xxxxx xxxxx"
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-coral-400 focus:outline-none bg-white/80 text-amber-900 placeholder-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Where do you shop? 📍
                </label>
                <input
                  type="text"
                  value={userDetails.location || ''}
                  onChange={(e) => setUserDetails({ ...userDetails, location: e.target.value })}
                  placeholder="Neighborhood or area"
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-coral-400 focus:outline-none bg-white/80 text-amber-900 placeholder-amber-400"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)',
                    boxShadow: '0 10px 30px rgba(232, 121, 91, 0.4)'
                  }}
                >
                  Show Me My Results! ✨
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-amber-600/60">
              We respect your privacy. No spam, ever. 🤝
            </div>
          </form>

          <button
            onClick={() => setShowUserForm(false)}
            className="mt-4 w-full py-2 text-sm text-amber-600 hover:text-amber-800"
          >
            ← Back to quiz
          </button>
        </div>
      </div>
    );
  };

  // Results Screen with personalized communication
  const renderResults = () => {
    const persona = getPersona();
    const scores = calculateScore();

    return (
      <div className="min-h-screen p-4 pb-12" style={{
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(232, 121, 91, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(74, 124, 89, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #fef7ed 0%, #fde8d7 50%, #f5e6d3 100%)
        `
      }}>
        <div className="max-w-md mx-auto pt-8">
          {/* Personalized greeting */}
          <div className="text-center mb-6">
            <div className="inline-block mb-4 animate-bounce-slow">
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
              Hey {userDetails.name || 'Friend'}! 👋
            </div>

            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: persona.color }}
            >
              You're a {persona.title}
            </h1>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 mb-4">
              <p className="text-amber-800/90 leading-relaxed mb-3">
                {persona.description}
              </p>
              <p className="text-amber-700/80 leading-relaxed text-sm italic">
                {persona.heartfelt}
              </p>
            </div>
          </div>

          {/* Personalized message */}
          <div
            className="rounded-2xl p-5 mb-6 border-2"
            style={{
              background: `${persona.color}15`,
              borderColor: `${persona.color}40`
            }}
          >
            <div className="flex gap-3">
              <span className="text-2xl">{persona.emoji}</span>
              <div>
                <div className="font-bold text-amber-900 mb-2">Your Personalized Insight:</div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {persona.personalizedMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Shopping DNA */}
          <div
            className="rounded-3xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <div className="text-sm font-semibold text-amber-800 mb-4">Your Shopping DNA</div>

            <div className="space-y-4">
              {[
                { label: 'Speed Priority', value: scores.speedPreference, color: '#f59e0b', emoji: '⚡' },
                { label: 'Local Love', value: scores.localAffinity, color: '#10b981', emoji: '❤️' },
                { label: 'Engagement', value: scores.categoryEngagement, color: '#8b5cf6', emoji: '✨' }
              ].map((trait, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{trait.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-700 font-medium">{trait.label}</span>
                      <span style={{ color: trait.color }} className="font-bold">{trait.value}%</span>
                    </div>
                    <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${trait.value}%`,
                          background: trait.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we heard from you */}
          {answers.frustration_heat && Object.keys(answers.frustration_heat).length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 mb-6">
              <div className="font-semibold text-amber-900 mb-3">We Heard You 👂</div>
              <div className="space-y-2 text-sm">
                {Object.entries(answers.frustration_heat)
                  .filter(([_, level]) => level >= 3)
                  .map(([itemId, _]) => {
                    const item = questions.find(q => q.id === 'frustration_heat')
                      ?.items.find(i => i.id === itemId);
                    return item ? (
                      <div key={itemId} className="flex items-start gap-2 text-amber-800">
                        <span>{item.emoji}</span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-coral-600 mt-0.5">{item.supportMsg}</div>
                        </div>
                      </div>
                    ) : null;
                  })}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => {
              window.open('https://pikvita.com/waitlist', '_blank');
            }}
            className="w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mb-4"
            style={{
              background: `linear-gradient(135deg, ${persona.color} 0%, ${persona.color}dd 100%)`,
              boxShadow: `0 10px 30px ${persona.color}40`
            }}
          >
            <span>Get Early Access to Pikvita</span>
            <span>→</span>
          </button>

          {/* Share results */}
          <div className="text-center">
            <button
              onClick={() => {
                const text = `I'm a ${persona.title}! 🎉 Find out your shopping personality with Pikvita's quiz.`;
                if (navigator.share) {
                  navigator.share({ text, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(text);
                  alert('Copied to clipboard!');
                }
              }}
              className="px-6 py-3 rounded-xl bg-white/70 text-amber-700 text-sm font-medium hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              <span>📤</span>
              <span>Share Your Results</span>
            </button>
          </div>

          <div className="text-center mt-8 text-amber-600/50 text-sm">
            Made with 🧡 by people who care about local communities
          </div>
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  if (showUserForm) {
    return renderUserForm();
  }

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const hasAnswer = answers[question.id] !== undefined;

  return (
    <div
      className="min-h-screen p-4 safe-area-padding"
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(232, 121, 91, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(74, 124, 89, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #fef7ed 0%, #fde8d7 50%, #f5e6d3 100%)
        `
      }}
    >
      <div className="max-w-md mx-auto relative pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                 style={{ background: 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)' }}>
              🛒
            </div>
            <span className="font-bold text-amber-900 text-lg tracking-tight">pikvita</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/70 text-sm text-amber-700 font-medium shadow-sm">
            {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-amber-200/50 rounded-full mb-6 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #e8795b 0%, #c45d3a 50%, #4a7c59 100%)'
            }}
          />
        </div>

        {/* Question Card */}
        <div
          className={`rounded-3xl p-5 mb-6 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(139, 90, 43, 0.12)'
          }}
        >
          <h2 className="text-2xl font-bold text-amber-900 mb-2 leading-tight">
            {question.question}
          </h2>
          <p className="text-amber-600/80 mb-6 text-sm leading-relaxed">
            {question.subtitle}
          </p>

          {renderQuestion(question)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-3 px-1">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'bg-white/70 text-amber-700 hover:bg-white shadow-md active:scale-95'
            }`}
          >
            ← Back
          </button>

          <button
            onClick={nextStep}
            disabled={!hasAnswer}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
              hasAnswer
                ? 'hover:scale-105 active:scale-95'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: hasAnswer
                ? 'linear-gradient(135deg, #e8795b 0%, #c45d3a 100%)'
                : '#ccc',
              boxShadow: hasAnswer ? '0 4px 20px rgba(232, 121, 91, 0.4)' : 'none'
            }}
          >
            {currentStep === questions.length - 1 ? 'See My Results' : 'Continue'}
            <span>→</span>
          </button>
        </div>

        {/* Encouragement message */}
        <div className="text-center mt-6 text-amber-600/60 text-sm px-4 leading-relaxed">
          {currentStep === 0 && "✨ No right or wrong answers—just you being you"}
          {currentStep > 0 && currentStep < questions.length - 1 && "💚 You're helping us understand how to serve you better"}
          {currentStep === questions.length - 1 && "🎉 Last one! Your results are going to be amazing"}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600;700&display=swap');

        * {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        h1, h2, h3 {
          font-family: 'Fraunces', serif;
        }

        /* Mobile-optimized range slider */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          height: 48px;
          padding: 20px 0;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 4px solid #e8795b;
        }

        input[type="range"]::-moz-range-thumb {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 4px solid #e8795b;
        }

        /* Safe area padding for notched devices */
        .safe-area-padding {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Prevent text selection on buttons */
        button {
          -webkit-user-select: none;
          user-select: none;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PikvitaQuiz;
