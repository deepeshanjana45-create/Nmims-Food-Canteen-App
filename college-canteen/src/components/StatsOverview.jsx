import React from 'react';
import { UtensilsCrossed, CheckCircle2, XCircle, Layers } from 'lucide-react';

export default function StatsOverview({ foods, selectedCategory, onSelectCategory, categories }) {
  const total = foods.length;
  const availableCount = foods.filter((f) => f.available).length;
  const unavailableCount = total - availableCount;
  const uniqueCategories = Array.from(new Set(foods.map((f) => f.category || 'Other'))).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-primary">
          <UtensilsCrossed size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Foods</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-success">
          <CheckCircle2 size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Available Now</span>
          <span className="stat-value text-success">{availableCount}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-danger">
          <XCircle size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Unavailable</span>
          <span className="stat-value text-danger">{unavailableCount}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-amber">
          <Layers size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Active Categories</span>
          <span className="stat-value">{uniqueCategories}</span>
        </div>
      </div>
    </div>
  );
}
