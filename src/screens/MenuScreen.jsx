// src/screens/MenuScreen.jsx — Student Menu matching Admin portal card aesthetics

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { subscribeFoods } from '../services/foodService';
import { useCart } from '../context/CartContext';

const THEME = {
  bg: '#110F24',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.08)',
  primaryRed: '#FF4D4D',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#A5A1C9',
  success: '#10B981',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

// Spacing between cards
const GAP = 20;
const H_PAD = 20;

/** Returns number of columns based on screen width (matches 4-column layout of admin dashboard on wide screens) */
function getColumns(width) {
  if (width >= 1100) return 4;
  if (width >= 820) return 3;
  if (width >= 540) return 2;
  return 1;
}

export default function MenuScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const columns = getColumns(screenWidth);

  const cardWidth =
    (screenWidth - H_PAD * 2 - GAP * (columns - 1)) / columns;

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { addItem, getQuantity, increment, decrement } = useCart();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Subscribe to Firestore (Load all foods, both available and unavailable)
  useEffect(() => {
    const unsubscribe = subscribeFoods(
      (items) => {
        setFoods(items);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load foods:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Dynamic categories including unavailable item categories
  const categories = useMemo(() => {
    const set = new Set();
    foods.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [foods]);

  // Filter foods by selected category
  const foodList = useMemo(() => {
    if (selectedCategory === 'All') return foods;
    return foods.filter(
      (f) =>
        f.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [foods, selectedCategory]);

  // Build rows of `columns` items each
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < foodList.length; i += columns) {
      result.push(foodList.slice(i, i + columns));
    }
    return result;
  }, [foodList, columns]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Today's Menu</Text>
            <Text style={styles.subtitle}>Freshly prepared for you</Text>
          </View>

          <View style={styles.dateChip}>
            <Text style={styles.dateText}>📅 {formattedDate}</Text>
          </View>
        </View>

        {/* Horizontal Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContent}
        >
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? foods.length
                : foods.filter(
                    (f) =>
                      f.category?.toLowerCase() === cat.toLowerCase()
                  ).length;

            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catPill,
                  selectedCategory === cat && styles.catPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.catPillText,
                    selectedCategory === cat && styles.catPillTextActive,
                  ]}
                >
                  {cat} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.primaryRed} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      ) : foodList.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No Items Available</Text>
          <Text style={styles.emptyDesc}>
            {foods.length === 0
              ? 'The admin has not added any food items yet.'
              : 'No items in this category.'}
          </Text>
          {selectedCategory !== 'All' && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={styles.clearBtnText}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.gridContainer,
            { paddingHorizontal: H_PAD },
          ]}
        >
          <Text style={styles.itemCount}>
            {foodList.length} items available
          </Text>

          {rows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[
                styles.row,
                {
                  gap: GAP,
                  marginBottom: GAP,
                },
              ]}
            >
              {row.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  cardWidth={cardWidth}
                  navigation={navigation}
                  qty={getQuantity(food.id)}
                  addItem={addItem}
                  increment={increment}
                  decrement={decrement}
                />
              ))}

              {/* Fill empty slots in the last row to preserve column layout */}
              {row.length < columns &&
                Array(columns - row.length)
                  .fill(null)
                  .map((_, i) => (
                    <View
                      key={`empty-${i}`}
                      style={{ width: cardWidth }}
                    />
                  ))}
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FoodCard({
  food,
  cardWidth,
  navigation,
  qty,
  addItem,
  increment,
  decrement,
}) {
  const [imgError, setImgError] = useState(false);
  const isAvailable = food.available !== false;
  const imageUri = !imgError && food.image ? food.image : FALLBACK_IMAGE;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth },
        !isAvailable && styles.cardUnavailable,
      ]}
      activeOpacity={isAvailable ? 0.9 : 1}
      onPress={() => {
        if (isAvailable) {
          navigation.navigate('FoodDetail', { food });
        }
      }}
    >
      {/* Food Image & Top Badges (Matching Admin Layout) */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.foodImg, !isAvailable && styles.foodImgUnavailable]}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />

        {/* Top Badges Overlay */}
        <View style={styles.cardTopBadges}>
          {/* Category Pill (Top Left) */}
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>
              {(food.category || 'General').toUpperCase()}
            </Text>
          </View>

          {/* Status Pill (Top Right: Available / Unavailable) */}
          <View
            style={[
              styles.statusPill,
              isAvailable ? styles.statusAvailable : styles.statusUnavailable,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailable ? styles.statusDotAvailable : styles.statusDotUnavailable,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isAvailable ? styles.statusTextAvailable : styles.statusTextUnavailable,
              ]}
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <Text style={styles.foodName} numberOfLines={1}>
          {food.name}
        </Text>

        <View style={styles.cardFooter}>
          {/* Price with Red Rupee Sign */}
          <View style={styles.priceRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <Text style={styles.priceAmount}>{food.price}</Text>
          </View>

          {/* Action button */}
          {!isAvailable ? (
            <View style={styles.unavailableBtn}>
              <Text style={styles.unavailableBtnText}>Unavailable</Text>
            </View>
          ) : qty === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation?.();
                addItem(food);
              }}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  decrement(food.id);
                }}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qtyNum}>{qty}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
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
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  // Header
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.white,
  },

  subtitle: {
    fontSize: 12,
    color: THEME.textSub,
    marginTop: 2,
  },

  dateChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },

  dateText: {
    color: THEME.textSub,
    fontSize: 11,
    fontWeight: '700',
  },

  // Category pills
  catContent: {
    gap: 8,
    paddingBottom: 10,
  },

  catPill: {
    backgroundColor: THEME.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
  },

  catPillActive: {
    backgroundColor: THEME.primaryRed,
    borderColor: THEME.primaryRed,
  },

  catPillText: {
    color: THEME.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  catPillTextActive: {
    color: THEME.white,
  },

  // Loading / Empty
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: THEME.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },

  emptyTitle: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyDesc: {
    color: THEME.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },

  clearBtn: {
    marginTop: 16,
    backgroundColor: THEME.primaryRed,
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 14,
  },

  clearBtnText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '800',
  },

  // Grid
  gridContainer: {
    paddingTop: 14,
  },

  itemCount: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
  },

  // Food Card (Matching Admin Portal Design)
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  cardUnavailable: {
    opacity: 0.82,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },

  imgWrap: {
    width: '100%',
    height: 175,
    position: 'relative',
    backgroundColor: '#111320',
    overflow: 'hidden',
  },

  foodImg: {
    width: '100%',
    height: '100%',
  },

  foodImgUnavailable: {
    opacity: 0.65,
  },

  cardTopBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Category Pill (Top-left, translucent dark badge)
  catBadge: {
    backgroundColor: 'rgba(15, 17, 30, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  catBadgeText: {
    color: THEME.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  // Status Pill (Top-right, green/red with glow dot)
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusAvailable: {
    backgroundColor: 'rgba(6, 78, 59, 0.88)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },

  statusUnavailable: {
    backgroundColor: 'rgba(127, 29, 29, 0.88)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusDotAvailable: {
    backgroundColor: '#34D399',
  },

  statusDotUnavailable: {
    backgroundColor: '#F87171',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  statusTextAvailable: {
    color: '#6EE7B7',
  },

  statusTextUnavailable: {
    color: '#FCA5A5',
  },

  // Card Content
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  foodName: {
    color: THEME.white,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  rupeeSign: {
    color: THEME.primaryRed,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 2,
  },

  priceAmount: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '900',
  },

  // Buttons
  addBtn: {
    backgroundColor: THEME.primaryRed,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 2,
  },

  addBtnText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '900',
  },

  unavailableBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  unavailableBtnText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },

  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,77,77,0.15)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.primaryRed,
  },

  qtyBtn: {
    backgroundColor: THEME.primaryRed,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyBtnText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '900',
  },

  qtyNum: {
    width: 24,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
    color: THEME.white,
  },
});
