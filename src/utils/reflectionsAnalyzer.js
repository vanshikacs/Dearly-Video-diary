import { getAllCaptures } from './db';

const FEELING_EMOJIS = {
  peaceful: '🕊️',
  grateful: '🙏',
  gentle: '🌸',
  quiet: '🌙',
  warm: '☕',
  hopeful: '🌿',
  tender: '💭',
  calm: '🌊',
  thoughtful: '🍂',
  nostalgic: '📜',
};

const TIME_NAMES = {
  earlyMorning: 'early morning',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
  lateNight: 'late night',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const generateReflections = async () => {
  const captures = await getAllCaptures();
  
  if (captures.length === 0) {
    return [{
      type: 'welcome',
      title: 'Nothing here yet',
      message: "That's okay. When you're ready, this space will hold your reflections gently.",
      icon: '🌱',
    }];
  }
  
  if (captures.length < 3) {
    return [{
      type: 'growing',
      title: 'Just beginning',
      message: 'A few more entries, and patterns will start to emerge—softly, in their own time.',
      icon: '🌿',
    }];
  }
  
  const reflections = [];
  
  // Time-of-day observation
  const timeObservation = observeTimePatterns(captures);
  if (timeObservation) reflections.push(timeObservation);
  
  // Day-of-week observation
  const dayObservation = observeDayPatterns(captures);
  if (dayObservation) reflections.push(dayObservation);
  
  // Feeling frequency
  const feelingObservation = observeFeelingPatterns(captures);
  if (feelingObservation) reflections.push(feelingObservation);
  
  // Consistency observation
  const consistencyObservation = observeConsistency(captures);
  if (consistencyObservation) reflections.push(consistencyObservation);
  
  // Emotional transitions
  const transitionObservation = observeTransitions(captures);
  if (transitionObservation) reflections.push(transitionObservation);
  
  return reflections;
};

const observeTimePatterns = (captures) => {
  const timeGroups = {};
  
  captures.forEach(capture => {
    const hour = new Date(capture.timestamp).getHours();
    let bucket;
    
    if (hour >= 5 && hour < 9) bucket = 'earlyMorning';
    else if (hour >= 9 && hour < 12) bucket = 'morning';
    else if (hour >= 12 && hour < 17) bucket = 'afternoon';
    else if (hour >= 17 && hour < 21) bucket = 'evening';
    else if (hour >= 21 || hour < 2) bucket = 'night';
    else bucket = 'lateNight';
    
    if (!timeGroups[bucket]) {
      timeGroups[bucket] = { total: 0, gentle: 0 };
    }
    
    timeGroups[bucket].total++;
    if (['peaceful', 'grateful', 'gentle', 'calm', 'warm', 'hopeful'].includes(capture.feeling)) {
      timeGroups[bucket].gentle++;
    }
  });
  
  let bestTime = null;
  let bestRatio = 0;
  
  Object.entries(timeGroups).forEach(([time, data]) => {
    if (data.total >= 3) {
      const ratio = data.gentle / data.total;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestTime = time;
      }
    }
  });
  
  if (bestTime && bestRatio > 0.6) {
    return {
      type: 'time',
      title: 'A pattern in time',
      message: `You seem most at ease when you capture days during ${TIME_NAMES[bestTime]}.`,
      icon: '⏰',
      data: { time: bestTime },
    };
  }
  
  return null;
};

const observeDayPatterns = (captures) => {
  const dayGroups = {};
  
  captures.forEach(capture => {
    const day = DAY_NAMES[new Date(capture.timestamp).getDay()];
    
    if (!dayGroups[day]) {
      dayGroups[day] = { total: 0, gentle: 0 };
    }
    
    dayGroups[day].total++;
    if (['peaceful', 'grateful', 'gentle', 'calm', 'warm'].includes(capture.feeling)) {
      dayGroups[day].gentle++;
    }
  });
  
  let bestDay = null;
  let bestRatio = 0;
  
  Object.entries(dayGroups).forEach(([day, data]) => {
    if (data.total >= 2) {
      const ratio = data.gentle / data.total;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestDay = day;
      }
    }
  });
  
  if (bestDay && bestRatio > 0.65) {
    return {
      type: 'day',
      title: 'A favorite day',
      message: `Something about ${bestDay}s feels right to you.`,
      icon: '📅',
      data: { day: bestDay },
    };
  }
  
  return null;
};

const observeFeelingPatterns = (captures) => {
  const feelingCounts = {};
  
  captures.forEach(capture => {
    feelingCounts[capture.feeling] = (feelingCounts[capture.feeling] || 0) + 1;
  });
  
  const sorted = Object.entries(feelingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (sorted.length > 0) {
    const topFeeling = sorted[0][0];
    const count = sorted[0][1];
    
    return {
      type: 'feeling',
      title: "How you've been feeling",
      message: `Lately, you've felt ${topFeeling} most often. That's been ${count} ${count === 1 ? 'moment' : 'moments'}.`,
      icon: FEELING_EMOJIS[topFeeling] || '💭',
      data: { feeling: topFeeling, count },
    };
  }
  
  return null;
};

const observeConsistency = (captures) => {
  const sorted = captures.sort((a, b) => b.timestamp - a.timestamp);
  let streak = 0;
  let lastDate = null;
  
  for (const capture of sorted) {
    const date = new Date(capture.timestamp).toDateString();
    if (!lastDate) {
      streak = 1;
      lastDate = date;
    } else {
      const prevDate = new Date(lastDate);
      const currDate = new Date(date);
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        lastDate = date;
      } else if (diffDays > 1) {
        break;
      }
    }
  }
  
  if (streak >= 3) {
    return {
      type: 'streak',
      title: 'Returning here',
      message: `You've captured moments ${streak} days in a row. This space is becoming yours.`,
      icon: '🕯️',
      data: { streak },
    };
  }
  
  return null;
};

const observeTransitions = (captures) => {
  if (captures.length < 5) return null;
  
  const sorted = captures.sort((a, b) => a.timestamp - b.timestamp);
  let gentleShifts = 0;
  
  const feelingScore = {
    peaceful: 5, calm: 5, warm: 4, grateful: 4,
    gentle: 3, hopeful: 3, thoughtful: 2, quiet: 2,
    tender: 3, nostalgic: 2,
  };
  
  for (let i = 1; i < sorted.length; i++) {
    const prevScore = feelingScore[sorted[i - 1].feeling] || 2;
    const currScore = feelingScore[sorted[i].feeling] || 2;
    if (currScore > prevScore) {
      gentleShifts++;
    }
  }
  
  const shiftRate = gentleShifts / (sorted.length - 1);
  
  if (shiftRate > 0.4) {
    return {
      type: 'transition',
      title: 'Softening over time',
      message: 'Your entries have grown gentler as days pass. Something is shifting, quietly.',
      icon: '🌸',
      data: { rate: shiftRate },
    };
  }
  
  return null;
};