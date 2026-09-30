// src/screens/FoodListingScreen.jsx — Dark Theme Food Listing Screen matching reference UI design

import React, { useState } from 'react';
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
import { MEAL_SECTIONS, getFoodsByMeal } from '../data/foodData';
import { useCart } from '../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DARK_THEME = {
  bg: '#12131C',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.08)',
  primaryRed: '#FF4D4D',
  primaryRedDark: '#E03E3E',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#CBD5E1',
  success: '#10B981',
};

export default function FoodListingScreen({ route, navigation }) {
  const initialMeal = route?.params?.mealType || 'breakfast';
  const [selectedMeal, setSelectedMeal] = useState(initialMeal);
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterUnder100, setFilterUnder100] = useState(false);

  const { addItem, getQuantity, increment, decrement } = useCart();

  const currentMealInfo = MEAL_SECTIONS.find((m) => m.id === selectedMeal) || MEAL_SECTIONS[0];

  let foodList = getFoodsByMeal(selectedMeal);
  if (filterVegOnly) foodList = foodList.filter((f) => f.isVeg);
  if (filterUnder100) foodList = foodList.filter((f) => f.price <= 100);

  // Hero image based on selected meal
  const heroImages = {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
    lunch: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    dinner: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Hero Banner with Image & Overlay (Reference style: "Different Kind of Food") */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: heroImages[selectedMeal] || heroImages.breakfast }}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CartTab')}>
              <Text style={styles.iconText}>🛒</Text>
            </TouchableOpacity>
          </View>

          {/* Banner Title */}
          <View style={styles.heroTitleBox}>
            <Text style={styles.heroMainTitle}>Different Kind of Food</Text>
            <Text style={styles.heroSubTitle}>
              {currentMealInfo.emoji} {currentMealInfo.title} Specials • {currentMealInfo.timeSlot}
            </Text>
          </View>
        </View>

        {/* Meal Selector Tabs (Breakfast / Lunch / Dinner) */}
        <View style={styles.mealTabsRow}>
          {MEAL_SECTIONS.map((meal) => {
            const isActive = selectedMeal === meal.id;
            return (
              <TouchableOpacity
                key={meal.id}
                style={[styles.mealTab, isActive && styles.mealTabActive]}
                onPress={() => setSelectedMeal(meal.id)}
              >
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                <Text style={[styles.mealLabel, isActive && styles.mealLabelActive]}>
                  {meal.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter Chips Strip */}
        <View style={styles.filterStrip}>
          <TouchableOpacity
            style={[styles.chip, filterVegOnly && styles.chipActive]}
            onPress={() => setFilterVegOnly(!filterVegOnly)}
          >
            <View style={styles.vegDotBox}>
              <View style={styles.vegDot} />
            </View>
            <Text style={[styles.chipText, filterVegOnly && styles.chipTextActive]}>Pure Veg</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filterUnder100 && styles.chipActive]}
            onPress={() => setFilterUnder100(!filterUnder100)}
          >
            <Text style={[styles.chipText, filterUnder100 && styles.chipTextActive]}>Under ₹100</Text>
          </TouchableOpacity>

          <Text style={styles.countText}>{foodList.length} Items Available</Text>
        </View>

        {/* Category Header Title with Accent Line (Matching screenshot: "Food Category ─────────") */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{currentMealInfo.title} Menu</Text>
          <View style={styles.accentLine} />
        </View>

        {/* Food Items List (Matching screenshot layout: Dark card, rounded image, Red ADD button) */}
        <View style={styles.foodListContainer}>
          {foodList.map((food) => {
            const qty = getQuantity(food.id);

            return (
              <TouchableOpacity
                key={food.id}
                style={styles.foodCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('FoodDetail', { food })}
              >
                {/* Left: Food Image */}
                <View style={styles.imageWrap}>
                  <Image source={{ uri: food.image }} style={styles.foodImg} resizeMode="cover" />
                  <View style={styles.vegBadge}>
                    <View style={styles.vegDotSmall} />
                  </View>
                </View>

                {/* Right: Info & Red ADD Button */}
                <View style={styles.cardDetails}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
                    <View style={styles.ratingTag}>
                      <Text style={styles.ratingText}>★ {food.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.foodDesc} numberOfLines={2}>{food.shortDesc || food.description}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⏱ {food.prepTime}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>🔥 {food.calories} cal</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.foodPrice}>₹{food.price}</Text>

                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.redAddBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          addItem(food);
                        }}
                      >
                        <Text style={styles.redAddBtnText}>Add Cart</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            decrement(food.id);
                          }}
                        >
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            increment(food.id);
                          }}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_THEME.bg,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Hero Banner
  heroBanner: {
    width: '100%',
    height: 220,
    position: 'relative',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 19, 28, 0.65)',
  },

  headerControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 30, 45, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconText: {
    color: DARK_THEME.white,
    fontSize: 18,
    fontWeight: '900',
  },

  heroTitleBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  heroMainTitle: {
    color: DARK_THEME.white,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubTitle: {
    color: DARK_THEME.textSub,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  // Meal Tabs
  mealTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: DARK_THEME.cardBg,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  mealTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
  },
  mealTabActive: {
    backgroundColor: DARK_THEME.primaryRed,
  },
  mealEmoji: {
    fontSize: 16,
  },
  mealLabel: {
    color: DARK_THEME.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  mealLabelActive: {
    color: DARK_THEME.white,
    fontWeight: '900',
  },

  // Filter Strip
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_THEME.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  chipActive: {
    borderColor: DARK_THEME.primaryRed,
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
  },
  chipText: {
    color: DARK_THEME.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: DARK_THEME.primaryRed,
  },
  vegDotBox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: DARK_THEME.success,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: DARK_THEME.success,
  },
  countText: {
    color: DARK_THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 'auto',
  },

  // Category Header (Matching screenshot)
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 14,
    gap: 12,
  },
  categoryTitle: {
    color: DARK_THEME.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  accentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Food List
  foodListContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  foodCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrap: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  foodImg: {
    width: '100%',
    height: '100%',
  },
  vegBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: DARK_THEME.cardBg,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: DARK_THEME.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK_THEME.success,
  },

  cardDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    color: DARK_THEME.white,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  ratingTag: {
    backgroundColor: '#16A34A',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  ratingText: {
    color: DARK_THEME.white,
    fontSize: 10,
    fontWeight: '900',
  },

  foodDesc: {
    color: DARK_THEME.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metaText: {
    color: DARK_THEME.textMuted,
    fontSize: 11,
  },
  metaDot: {
    color: DARK_THEME.textMuted,
    fontSize: 11,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    color: DARK_THEME.white,
    fontSize: 18,
    fontWeight: '900',
  },

  // RED Add Cart Button (Matching screenshot)
  redAddBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  redAddBtnText: {
    color: DARK_THEME.white,
    fontSize: 12,
    fontWeight: '900',
  },

  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DARK_THEME.primaryRed,
  },
  qtyBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: DARK_THEME.white,
    fontSize: 15,
    fontWeight: '900',
  },
  qtyNum: {
    width: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
    color: DARK_THEME.white,
  },
});
