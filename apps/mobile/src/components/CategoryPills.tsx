import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface CategoryPillsProps {
  categories?: string[];
  activeColor?: string; // 'dark' | 'lime' | 'coral'
  onSelect?: (cat: string) => void;
}

const DEFAULT_CATEGORIES = ['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga'];

export function CategoryPills({
  categories = DEFAULT_CATEGORIES,
  activeColor = 'dark',
  onSelect,
}: CategoryPillsProps) {
  const [active, setActive] = useState(categories[0]);

  const handlePress = (cat: string) => {
    setActive(cat);
    onSelect?.(cat);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 6 }}
    >
      {categories.map((cat) => {
        const isSelected = cat === active;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.8}
            onPress={() => handlePress(cat)}
            className={`px-4 py-2 rounded-full border shadow-sm ${
              isSelected
                ? 'bg-slate-900 border-slate-900'
                : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                isSelected ? 'text-white' : 'text-slate-600'
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
