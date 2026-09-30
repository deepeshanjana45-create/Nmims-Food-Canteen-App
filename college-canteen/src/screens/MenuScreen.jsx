// src/screens/MenuScreen.jsx — Today's Menu screen matching reference screenshot

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DARK_PURPLE_THEME = {
  bg: '#110F24',
  cardBg: '#2E151B',
  cardBgGradient: '#3B1A22',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textWhite: '#FFFFFF',
  textSub: '#A5A1C9',
  textMuted: '#CBD5E1',
  accentRed: '#FF4D4D',
};

const MEAL_CARDS = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    subtitle: 'Start your day right with fresh breakfast',
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'lunch',
    title: 'Lunch',
    subtitle: 'Wholesome & Nutritious meals',
    emoji: '🥣',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'dinner',
    title: 'Dinner',
    subtitle: 'Delicious end to your day',
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
];

export default function MenuScreen({ navigation }) {
  // Current date formatted e.g. "Fri, 19 Sep"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_PURPLE_THEME.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header (Title + Subtitle + Date) */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Today's Menu</Text>
            <View style={styles.dateChip}>
              <Text style={styles.dateText}>📅 {formattedDate}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Freshly prepared for you</Text>
        </View>

        {/* Meal Cards Section (Breakfast, Lunch, Dinner) */}
        <View style={styles.cardsContainer}>
          {MEAL_CARDS.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('FoodListing', { mealType: meal.id })}
            >
              {/* Left Content */}
              <View style={styles.cardLeft}>
                <View style={styles.emojiBadge}>
                  <Text style={styles.emojiText}>{meal.emoji}</Text>
                </View>

                <Text style={styles.cardTitle}>{meal.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {meal.subtitle}
                </Text>
              </View>

              {/* Right Content — Dish Image with Arrow Overlay */}
              <View style={styles.cardRight}>
                <Image
                  source={{ uri: meal.image }}
                  style={styles.dishImage}
                  resizeMode="cover"
                />

                <View style={styles.arrowOverlay}>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_PURPLE_THEME.bg,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: DARK_PURPLE_THEME.textWhite,
    letterSpacing: 0.3,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK_PURPLE_THEME.cardBorder,
  },
  dateText: {
    color: DARK_PURPLE_THEME.textSub,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: DARK_PURPLE_THEME.textSub,
    fontWeight: '500',
  },

  // Cards
  cardsContainer: {
    gap: 18,
  },
  card: {
    backgroundColor: DARK_PURPLE_THEME.cardBg,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: DARK_PURPLE_THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    height: 155,
  },

  // Left side info
  cardLeft: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  emojiBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emojiText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: DARK_PURPLE_THEME.textWhite,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: DARK_PURPLE_THEME.textSub,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Right side dish image
  cardRight: {
    position: 'relative',
    width: 125,
    height: 125,
    borderRadius: 62.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishImage: {
    width: '100%',
    height: '100%',
    borderRadius: 62.5,
  },
  arrowOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  arrowIcon: {
    color: DARK_PURPLE_THEME.textWhite,
    fontSize: 16,
    fontWeight: '900',
  },
});
