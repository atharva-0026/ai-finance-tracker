import { AICategorizeResult } from '../types';

export const CATEGORY_METADATA: Record<string, { icon: string; color: string }> = {
  'Food & Dining': { icon: 'Utensils', color: '#f97316' },
  'Groceries': { icon: 'ShoppingCart', color: '#10b981' },
  'Transportation': { icon: 'Car', color: '#06b6d4' },
  'Housing & Rent': { icon: 'Home', color: '#6366f1' },
  'Utilities & Bills': { icon: 'Zap', color: '#eab308' },
  'Entertainment': { icon: 'Film', color: '#ec4899' },
  'Shopping': { icon: 'ShoppingBag', color: '#8b5cf6' },
  'Health & Fitness': { icon: 'Activity', color: '#14b8a6' },
  'Travel': { icon: 'Plane', color: '#3b82f6' },
  'Personal Care': { icon: 'Smile', color: '#f43f5e' },
  'Education & Learning': { icon: 'BookOpen', color: '#84cc16' },
  'Other / Miscellaneous': { icon: 'MoreHorizontal', color: '#64748b' },
};

// Keyword and regex rules for ultra-fast, robust offline classification
const RULES: Array<{ pattern: RegExp; category: string; confidence: number; reasoning: string }> = [
  // Food & Dining
  {
    pattern: /\b(restaurant|cafe|coffee|starbucks|mcdonalds|burger|pizza|chipotle|subway|tacos|sushi|dinner|lunch|breakfast|bakery|bar|pub|bistro|diner|ramen|doordash|uber\s?eats|grubhub|sweetgreen|wendys|kfc|dunkin|dominos)\b/i,
    category: 'Food & Dining',
    confidence: 0.95,
    reasoning: 'Matches dining out, restaurant, or meal delivery',
  },
  // Groceries
  {
    pattern: /\b(grocery|groceries|supermarket|trader\s?joe|whole\s?foods|kroger|safeway|costco|aldi|walmart\s?grocery|target\s?grocery|market|produce|fruit|vegetable|meat|bakery\s?bread|milk|eggs)\b/i,
    category: 'Groceries',
    confidence: 0.94,
    reasoning: 'Supermarket or grocery store purchase',
  },
  // Transportation
  {
    pattern: /\b(uber|lyft|taxi|cab|metro|subway\s?ticket|bus|transit|train|amtrak|gas|fuel|petrol|shell|chevron|bp|exxon|parking|toll|ezpass|ev\s?charging|tesla\s?supercharger|bike\s?rental)\b/i,
    category: 'Transportation',
    confidence: 0.96,
    reasoning: 'Ride-share, public transit, fuel, or commuting expense',
  },
  // Housing & Rent
  {
    pattern: /\b(rent|mortgage|landlord|lease|hoa|apartment|condo|property\s?tax|home\s?insurance|maintenance\s?fee)\b/i,
    category: 'Housing & Rent',
    confidence: 0.98,
    reasoning: 'Rent, mortgage, or property maintenance payment',
  },
  // Utilities & Bills
  {
    pattern: /\b(electric|electricity|power|water|gas\s?bill|utility|internet|wifi|comcast|verizon|at&t|t-mobile|broadband|sewer|trash|coned|pge)\b/i,
    category: 'Utilities & Bills',
    confidence: 0.95,
    reasoning: 'Utility, telecommunication, or municipal service bill',
  },
  // Entertainment
  {
    pattern: /\b(netflix|spotify|hulu|disney\s?\+|youtube\s?premium|apple\s?music|cinema|movie|theater|theatre|concert|ticketmaster|playstation|xbox|nintendo|steam|gaming|hbo|paramount|audible)\b/i,
    category: 'Entertainment',
    confidence: 0.97,
    reasoning: 'Digital streaming, concerts, cinema, or gaming',
  },
  // Shopping
  {
    pattern: /\b(amazon|ebay|target|walmart|clothing|shoes|zara|h&m|nike|adidas|nordstrom|best\s?buy|electronics|gadget|apple\s?store|furniture|ikea|home\s?depot|lowes)\b/i,
    category: 'Shopping',
    confidence: 0.91,
    reasoning: 'Retail, e-commerce, electronics, or apparel store',
  },
  // Health & Fitness
  {
    pattern: /\b(gym|fitness|workout|crossfit|yoga|equinox|planet\s?fitness|pharmacy|cvs|walgreens|medicine|doctor|dentist|hospital|clinic|optometrist|prescription|vitamins|therapy)\b/i,
    category: 'Health & Fitness',
    confidence: 0.96,
    reasoning: 'Healthcare, pharmacy, or fitness membership',
  },
  // Travel
  {
    pattern: /\b(flight|airline|delta|united|american\s?airlines|southwest|hotel|airbnb|booking\.com|expedia|resort|hostel|vacation|cruise|luggage|tsa\s?precheck)\b/i,
    category: 'Travel',
    confidence: 0.96,
    reasoning: 'Airfare, hotel lodging, or vacation travel',
  },
  // Personal Care
  {
    pattern: /\b(haircut|salon|barber|spa|massage|manicure|pedicure|skincare|sephora|ulta|cosmetics|shaving)\b/i,
    category: 'Personal Care',
    confidence: 0.93,
    reasoning: 'Grooming, salon, or personal aesthetics',
  },
  // Education & Learning
  {
    pattern: /\b(tuition|school|college|university|udemy|coursera|course|textbook|bookstore|chegg|duolingo|masterclass|bootcamp)\b/i,
    category: 'Education & Learning',
    confidence: 0.94,
    reasoning: 'Educational course, tuition, or learning materials',
  },
];

export function categorizeHeuristic(title: string): AICategorizeResult {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return {
      category: 'Other / Miscellaneous',
      confidence: 0.5,
      reasoning: 'Expense title is empty',
      suggestedIcon: CATEGORY_METADATA['Other / Miscellaneous'].icon,
      suggestedColor: CATEGORY_METADATA['Other / Miscellaneous'].color,
    };
  }

  for (const rule of RULES) {
    if (rule.pattern.test(cleanTitle)) {
      const meta = CATEGORY_METADATA[rule.category] || CATEGORY_METADATA['Other / Miscellaneous'];
      return {
        category: rule.category,
        confidence: rule.confidence,
        reasoning: rule.reasoning,
        suggestedIcon: meta.icon,
        suggestedColor: meta.color,
      };
    }
  }

  // Fallback default
  return {
    category: 'Other / Miscellaneous',
    confidence: 0.6,
    reasoning: 'General expense item',
    suggestedIcon: CATEGORY_METADATA['Other / Miscellaneous'].icon,
    suggestedColor: CATEGORY_METADATA['Other / Miscellaneous'].color,
  };
}
