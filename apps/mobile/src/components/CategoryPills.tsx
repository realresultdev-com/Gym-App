import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface CategoryPillsProps {
  categories?: string[];
  activeColor?: string; // 'lime' | 'coral'
  onSelect?: (cat: string) => void;
}

const DEFAULT_CATEGORIES = ['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga'];

export function CategoryPills({
  categories = DEFAULT_CATEGORIES,
  activeColor = 'lime',
  onSelect,
}: CategoryPillsProps) {
  const [active, setActive] = useState(categories[0]);

  const handlePress = (cat: string) => {
    setActive(cat);
    onSelect?.(cat);
  };

  const isLime = activeColor === 'lime';

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
            className={`px-4 py-2 rounded-full border ${
              isSelected
                ? isLime
                  ? 'border-transparent'
                  : 'bg-gym-coral border-transparent'
                : 'bg-neutral-900/80 border-neutral-800'
            }`}
            style={
              isSelected && isLime
                ? { backgroundColor: '#bbf451' }
                : isSelected && !isLime
                ? { backgroundColor: '#ff3b30' }
                : undefined
            }
          >
            <Text
              className={`text-xs font-bold ${
                isSelected
                  ? isLime
                    ? 'text-black'
                    : 'text-white'
                  : 'text-neutral-400'
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

