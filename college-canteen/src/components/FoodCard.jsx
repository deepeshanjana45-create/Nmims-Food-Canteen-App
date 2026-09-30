import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export default function FoodCard({ food, onEdit, onDelete, onToggleAvailability }) {
  const [isToggling, setIsToggling] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      setIsToggling(true);
      await onToggleAvailability(food.id, food.available);
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className={`food-card ${!food.available ? 'food-card-unavailable' : ''}`}>
      {/* Food Image & Top Badges */}
      <div className="food-card-image-wrap">
        <img
          src={!imgError && food.image ? food.image : FALLBACK_IMAGE}
          alt={food.name}
          className="food-card-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        <div className="card-top-badges">
          <span className="category-badge">{food.category || 'General'}</span>

          {/* Clickable Availability Badge */}
          <button
            type="button"
            className={`status-pill clickable-pill ${food.available ? 'status-available' : 'status-unavailable'}`}
            onClick={handleToggle}
            disabled={isToggling}
            title={food.available ? 'Click to mark as Unavailable' : 'Click to mark as Available'}
          >
            <span className="status-pill-dot" />
            {isToggling ? '...' : (food.available ? 'Available' : 'Unavailable')}
          </button>
        </div>
      </div>

      {/* Card Content - COMPACT LAYOUT */}
      <div className="food-card-body">
        <h3 className="food-name" title={food.name}>
          {food.name}
        </h3>
        
        <div className="food-card-footer">
          <div className="food-price">
            <span className="rupee-sign">₹</span>
            <span className="price-amount">{food.price}</span>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="action-icon-btn btn-edit"
              onClick={() => onEdit(food)}
              title="Edit Food Item"
            >
              <Edit2 size={14} />
            </button>

            <button
              type="button"
              className="action-icon-btn btn-delete"
              onClick={() => onDelete(food)}
              title="Delete Food Item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
