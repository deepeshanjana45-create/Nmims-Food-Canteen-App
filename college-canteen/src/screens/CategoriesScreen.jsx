// CategoriesScreen.jsx — Browse food by category with grid layout

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CATEGORIES, FOODS } from '../data/foodData';
import { useCart } from '../context/CartContext';

const THEME = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#EDE9FE',
  accent: '#F59E0B',
  bg: '#F5F3FF',
  card: '#FFFFFF',
  text: '#1E1B4B',
  textSub: '#6B7280',
  success: '#10B981',
  border: '#E5E7EB',
};

export default function CategoriesScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addItem, getQuantity, increment, decrement } = useCart();

  const foods =
    activeCategory === 'all'
      ? FOODS
      : FOODS.filter((f) => f.category === activeCategory);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <Text style={styles.headerSub}>Browse all categories</Text>
      </View>

      {/* Category pills — horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catPill, activeCategory === cat.id && styles.catPillActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.count}>{foods.length} items</Text>
        {foods.map((food) => {
          const qty = getQuantity(food.id);
          return (
            <TouchableOpacity
              key={food.id}
              style={styles.row}
              onPress={() => navigation.navigate('FoodDetail', { food })}
              activeOpacity={0.85}
            >
              <View style={styles.rowLeft}>
                <View style={styles.rowEmojiBg}>
                  <Text style={styles.rowEmoji}>{food.emoji}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <View style={styles.rowNameRow}>
                    <View style={styles.vegDot} />
                    <Text style={styles.rowName}>{food.name}</Text>
                  </View>
                  <Text style={styles.rowDesc} numberOfLines={1}>{food.description}</Text>
                  <View style={styles.rowMeta}>
                    <Text style={styles.rowRating}>⭐ {food.rating}</Text>
                    <Text style={styles.rowDot}>·</Text>
                    <Text style={styles.rowPrep}>⏱ {food.prepTime}</Text>
                    <Text style={styles.rowDot}>·</Text>
                    <Text style={styles.rowCal}>🔥 {food.calories} cal</Text>
                  </View>
                  <Text style={styles.rowPrice}>₹{food.price}</Text>
                </View>
              </View>

              {qty === 0 ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addItem(food)}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decrement(food.id)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => increment(food.id)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  header: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#DDD6FE', fontSize: 13, marginTop: 2 },

  catScroll: { maxHeight: 70, marginTop: 14 },
  catContent: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: THEME.border,
  },
  catPillActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 13, fontWeight: '600', color: THEME.text },
  catLabelActive: { color: '#FFF' },

  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
  count: { fontSize: 13, color: THEME.textSub, marginBottom: 10 },

  row: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  rowLeft: { flexDirection: 'row', flex: 1, alignItems: 'center', gap: 12 },
  rowEmojiBg: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: { fontSize: 38 },
  rowInfo: { flex: 1 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.success,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  rowName: { fontSize: 15, fontWeight: '800', color: THEME.text },
  rowDesc: { fontSize: 11, color: THEME.textSub, marginBottom: 4 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rowRating: { fontSize: 11, color: THEME.text },
  rowDot: { color: THEME.textSub, fontSize: 11 },
  rowPrep: { fontSize: 11, color: THEME.textSub },
  rowCal: { fontSize: 11, color: THEME.textSub },
  rowPrice: { fontSize: 16, fontWeight: '900', color: THEME.primary },

  addBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
  },
  qtyBtn: {
    backgroundColor: THEME.primary,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  qtyNum: { width: 28, textAlign: 'center', fontSize: 14, fontWeight: '800', color: THEME.primary },
});
