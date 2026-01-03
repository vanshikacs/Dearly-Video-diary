import { getAllCaptures, saveMonthlyLetter, getMonthlyLetter, getAllMonthlyLetters } from './db';

export const generateMonthlyLetter = async (month, year) => {
  const monthYear = year + '-' + String(month).padStart(2, '0');
  
  const existing = await getMonthlyLetter(monthYear);
  if (existing) return existing;
  
  const allCaptures = await getAllCaptures();
  const monthCaptures = allCaptures.filter(capture => {
    const date = new Date(capture.timestamp);
    return date.getMonth() === month - 1 && date.getFullYear() === year;
  });
  
  if (monthCaptures.length === 0) {
    return null;
  }
  
  const analysis = analyzeMonth(monthCaptures);
  const letter = composeMonthlyLetter(analysis, month, year);
  
  const letterData = {
    monthYear,
    month,
    year,
    content: letter,
    captureCount: monthCaptures.length,
    createdAt: Date.now(),
  };
  
  await saveMonthlyLetter(letterData);
  
  return letterData;
};

const analyzeMonth = (captures) => {
  const feelings = {};
  captures.forEach(c => {
    feelings[c.feeling] = (feelings[c.feeling] || 0) + 1;
  });
  
  const dominantFeeling = Object.entries(feelings)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  captures.forEach(c => {
    const hour = new Date(c.timestamp).getHours();
    if (hour >= 6 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
    else if (hour >= 17 && hour < 21) timeSlots.evening++;
    else timeSlots.night++;
  });
  
  const preferredTime = Object.entries(timeSlots)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  const dates = captures.map(c => new Date(c.timestamp).toDateString());
  const uniqueDays = new Set(dates).size;
  
  const sorted = captures.sort((a, b) => a.timestamp - b.timestamp);
  const firstCapture = sorted[0];
  const lastCapture = sorted[sorted.length - 1];
  
  return {
    totalCaptures: captures.length,
    dominantFeeling,
    preferredTime,
    uniqueDays,
    firstFeeling: firstCapture.feeling,
    lastFeeling: lastCapture.feeling,
    feelings,
  };
};

const composeMonthlyLetter = (analysis, month, year) => {
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
  
  let letter = 'Dear you,\n\n';
  
  if (analysis.totalCaptures < 5) {
    letter += monthName + ' was quiet. You visited here ' + analysis.totalCaptures + ' ' + (analysis.totalCaptures === 1 ? 'time' : 'times') + ". That's enough.\n\n";
  } else if (analysis.totalCaptures < 15) {
    letter += monthName + ' felt unhurried. You captured ' + analysis.totalCaptures + ' moments, letting each one settle in its own time.\n\n';
  } else {
    letter += monthName + ' brought you here often. ' + analysis.totalCaptures + ' times you paused to notice something worth keeping.\n\n';
  }
  
  if (analysis.dominantFeeling) {
    const feelingMessages = {
      peaceful: 'Most days carried a sense of peace.',
      grateful: 'Gratitude colored many of your entries.',
      gentle: 'Things felt gentle, softer than usual.',
      quiet: 'You seemed to need quiet this month.',
      warm: 'There was warmth in how you saw your days.',
      hopeful: 'Hope showed up more than once.',
      tender: 'Tenderness wove through your reflections.',
      calm: 'Calm found its way to you often.',
      thoughtful: 'You spent time thinking, slowly.',
      nostalgic: 'You looked back more than forward.',
    };
    
    letter += (feelingMessages[analysis.dominantFeeling] || 'You felt many things.') + '\n\n';
  }
  
  if (analysis.preferredTime) {
    const timeMessages = {
      morning: 'You often wrote in the morning, when everything was still beginning.',
      afternoon: 'Afternoons were when you chose to pause and reflect.',
      evening: 'Evenings drew you here, when the day started to slow.',
      night: 'Late hours were yours—when things finally quieted down.',
    };
    
    letter += timeMessages[analysis.preferredTime] + '\n\n';
  }
  
  if (analysis.firstFeeling !== analysis.lastFeeling) {
    letter += 'At the start, you felt ' + analysis.firstFeeling + '. By the end, ' + analysis.lastFeeling + '. Something shifted.\n\n';
  } else {
    letter += 'From start to finish, ' + analysis.firstFeeling + ' stayed with you.\n\n';
  }
  
  if (analysis.uniqueDays >= 10) {
    letter += 'This month became a habit—' + analysis.uniqueDays + ' different days you returned. That means something.';
  } else {
    letter += 'This space held ' + analysis.uniqueDays + ' days for you. Each one mattered.';
  }
  
  letter += '\n\nUntil next time,\nDearly';
  
  return letter;
};

export { getAllMonthlyLetters };
