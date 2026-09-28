// src/screens/FoodDetailScreen.jsx — Dark theme food details screen

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
} from 'react-native';
import { useCart } from '../context/CartContext';

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

export default function FoodDetailScreen({ route, navigation }) {
  const { food } = route.params;
  const { addItem, getQuantity, increment, decrement } = useCart();

  const existingCartQty = getQuantity(food.id);
  const [selectedQty, setSelectedQty] = useState(existingCartQty > 0 ? existingCartQty : 1);

  const handleAddToCart = () => {
    const currentQtyInCart = getQuantity(food.id);
    if (currentQtyInCart === 0) {
      for (let i = 0; i < selectedQty; i++) addItem(food);
    } else if (selectedQty > currentQtyInCart) {
      const diff = selectedQty - currentQtyInCart;
      for (let i = 0; i < diff; i++) increment(food.id);
    } else if (selectedQty < currentQtyInCart) {
      const diff = currentQtyInCart - selectedQty;
      for (let i = 0; i < diff; i++) decrement(food.id);
    }
    navigation.navigate('CartTab');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.bg} />

      {/* Hero Image Section */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: food.image }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />

        {/* Floating Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {/* Veg Badge Overlay */}
        <View style={styles.vegBadge}>
          <View style={styles.vegSymbol}>
            <View style={styles.vegSymbolDot} />
          </View>
          <Text style={styles.vegBadgeText}>100% Pure Veg</Text>
        </View>
      </View>

      {/* Food Information Body */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Food Name & Price Header */}
        <View style={styles.titleRow}>
          <Text style={styles.foodName}>{food.name}</Text>
          <View style={styles.priceWrap}>
            <Text style={styles.priceSymbol}>₹</Text>
            <Text style={styles.priceText}>{food.price}</Text>
          </View>
        </View>

        {/* Rating & Prep details */}
        <View style={styles.metaStrip}>
          <View style={styles.ratingPill}>
            <Text style={styles.starText}>⭐</Text>
            <Text style={styles.ratingVal}>{food.rating}</Text>
            <Text style={styles.ratingSub}>(120+ ratings)</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaChip}>
            <Text style={styles.metaIcon}>⏱</Text>
            <Text style={styles.metaVal}>{food.prepTime}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaChip}>
            <Text style={styles.metaIcon}>🔥</Text>
            <Text style={styles.metaVal}>{food.calories} cal</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{food.description}</Text>
        </View>

        {/* Canteen Highlights */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Canteen Highlights</Text>
          <View style={styles.highlightsList}>
            <Text style={styles.highlightItem}>✓ Freshly prepared at SVKM's NMIMS Canteen</Text>
            <Text style={styles.highlightItem}>✓ Quick & convenient campus pickup</Text>
            <Text style={styles.highlightItem}>✓ Preparation time: {food.prepTime}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity selector [-] 1 [+] */}
        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setSelectedQty(Math.max(1, selectedQty - 1))}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{selectedQty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setSelectedQty(selectedQty + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart Red Button */}
        <TouchableOpacity style={styles.addToCartBtn} activeOpacity={0.88} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart • ₹{food.price * selectedQty}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_THEME.bg },

  // Hero
  heroWrap: { width: '100%', height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 19, 28, 0.4)',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(28, 30, 45, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backBtnText: { color: DARK_THEME.white, fontSize: 13, fontWeight: '800' },
  vegBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_THEME.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  vegSymbol: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: DARK_THEME.success,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegSymbolDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DARK_THEME.success },
  vegBadgeText: { fontSize: 12, fontWeight: '800', color: DARK_THEME.success },

  // Body
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodName: { fontSize: 24, fontWeight: '900', color: DARK_THEME.white, flex: 1, marginRight: 12 },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  priceSymbol: { fontSize: 18, fontWeight: '900', color: DARK_THEME.primaryRed, marginRight: 2 },
  priceText: { fontSize: 26, fontWeight: '900', color: DARK_THEME.primaryRed },

  // Meta strip
  metaStrip: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starText: { fontSize: 14 },
  ratingVal: { fontSize: 15, fontWeight: '900', color: DARK_THEME.white },
  ratingSub: { fontSize: 11, color: DARK_THEME.textMuted },

  metaDivider: { width: 1, height: 24, backgroundColor: DARK_THEME.cardBorder },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 14 },
  metaVal: { fontSize: 13, fontWeight: '700', color: DARK_THEME.textSub },

  // Cards
  sectionCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: DARK_THEME.white, marginBottom: 8 },
  descText: { fontSize: 14, color: DARK_THEME.textMuted, lineHeight: 22 },

  highlightsList: { gap: 6, marginTop: 4 },
  highlightItem: { fontSize: 13, color: DARK_THEME.textSub, fontWeight: '600' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK_THEME.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.cardBorder,
    gap: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryRed,
  },
  qtyBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: DARK_THEME.white, fontSize: 18, fontWeight: '900' },
  qtyNum: { width: 32, textAlign: 'center', fontSize: 16, fontWeight: '900', color: DARK_THEME.white },

  addToCartBtn: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryRed,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: { color: DARK_THEME.white, fontSize: 15, fontWeight: '900' },
});
