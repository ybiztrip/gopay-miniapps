import { Wifi, Car, Dumbbell, Waves, Coffee, Utensils, Wind, ShieldCheck, Sparkles } from 'lucide-react';

const ICON_MAP = { Wifi, Car, Dumbbell, Waves, Coffee, Utensils, Wind, ShieldCheck, Sparkles };

const HIGHLIGHT_FACILITIES = [
  { keywords: ['free wifi', 'wireless internet', 'wifi'], iconName: 'Wifi',       label: 'Free WiFi' },
  { keywords: ['pool', 'outdoor pool', "children's pool"], iconName: 'Waves',      label: 'Pool' },
  { keywords: ['fitness', '24-hour fitness', 'gym'],       iconName: 'Dumbbell',   label: 'Fitness' },
  { keywords: ['breakfast'],                               iconName: 'Utensils',   label: 'Breakfast' },
  { keywords: ['restaurant'],                              iconName: 'Utensils',   label: 'Restaurant' },
  { keywords: ['parking', 'self parking', 'valet'],        iconName: 'Car',        label: 'Parking' },
  { keywords: ['spa', 'full-service spa'],                 iconName: 'Sparkles',   label: 'Spa' },
  { keywords: ['air conditioning', 'climate control'],     iconName: 'Wind',       label: 'AC' },
  { keywords: ['coffee', 'café', 'cafe'],                  iconName: 'Coffee',     label: 'Café' },
  { keywords: ['smoke-free', 'non-smoking'],               iconName: 'ShieldCheck',label: 'Smoke-Free' },
];

export default function getFacilityHighlights(propertyFacilities = []) {
  const MAX_HIGHLIGHTS = 10;
  const facilityNames = propertyFacilities?.map((f) => f.name?.toLowerCase() ?? '');
  const matched = [];

  for (const highlight of HIGHLIGHT_FACILITIES) {
    const isMatch = highlight.keywords.some((kw) =>
      facilityNames.some((name) => name.includes(kw))
    );
    if (isMatch) {
      const IconComponent = ICON_MAP[highlight.iconName];
      matched.push({ ...highlight, icon: IconComponent }); // kirim komponen, bukan JSX
      if (matched.length >= MAX_HIGHLIGHTS) break;
    }
  }

  return matched;
}