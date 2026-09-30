import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, IndianRupee, Tag, Check, AlertCircle, Sparkles } from 'lucide-react';

const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Snacks', 'Desserts'];

const PRESET_IMAGES = [
  { label: 'Poha', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
  { label: 'Dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80' },
  { label: 'Idli', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80' },
  { label: 'Thali', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Paneer', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Chai', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
  { label: 'Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
];

export default function FoodFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [customCategory, setCustomCategory] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      const cat = initialData.category || 'Breakfast';
      if (DEFAULT_CATEGORIES.includes(cat)) {
        setCategory(cat);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(cat);
      }
      setImage(initialData.image || '');
      setAvailable(initialData.available !== undefined ? Boolean(initialData.available) : true);
    } else {
      setName('');
      setPrice('');
      setCategory('Breakfast');
      setCustomCategory('');
      setImage('');
      setAvailable(true);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a food name.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price (greater than or equal to 0).');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'Other' : category;

    const payload = {
      name: name.trim(),
      price: numPrice,
      category: finalCategory,
      image: image.trim(),
      available: Boolean(available),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save food item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update food details and availability in the canteen menu'
                : 'Fill in the information to add a new dish to Firestore'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Food Name */}
          <div className="form-group">
            <label className="form-label">
              Food Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Masala Dosa, Poha, Veg Thali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Price & Category in 2-column grid */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">
                Price (₹) <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="form-input with-prefix"
                  placeholder="e.g. 80"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">+ Custom Category</option>
              </select>
            </div>
          </div>

          {category === 'Custom' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Custom Category Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. South Indian, Beverages, Healthy"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          {/* Image URL & Live Preview */}
          <div className="form-group">
            <label className="form-label">Food Image URL</label>
            <div className="image-input-row">
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              {image ? (
                <div className="image-preview-box">
                  <img
                    src={image}
                    alt="Preview"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              ) : (
                <div className="image-preview-placeholder">
                  <ImageIcon size={20} />
                </div>
              )}
            </div>

            {/* Quick Preset Image Selectors */}
            <div className="preset-images-row">
              <span className="preset-label">
                <Sparkles size={12} /> Presets:
              </span>
              <div className="preset-tags">
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="preset-chip"
                    onClick={() => setImage(p.url)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Radio / Switch */}
          <div className="form-group">
            <label className="form-label">Availability Status</label>
            <div className="availability-selector">
              <button
                type="button"
                className={`availability-option option-available ${available ? 'active' : ''}`}
                onClick={() => setAvailable(true)}
              >
                <div className="status-indicator-dot green" />
                <div className="option-text">
                  <span className="option-title">Available</span>
                  <span className="option-desc">Visible & orderable by students</span>
                </div>
                {available && <Check size={18} className="option-check" />}
              </button>

              <button
                type="button"
                className={`availability-option option-unavailable ${!available ? 'active' : ''}`}
                onClick={() => setAvailable(false)}
              >
                <div className="status-indicator-dot red" />
                <div className="option-text">
                  <span className="option-title">Unavailable</span>
                  <span className="option-desc">Marked out of stock / sold out</span>
                </div>
                {!available && <Check size={18} className="option-check" />}
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add Food Item'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
