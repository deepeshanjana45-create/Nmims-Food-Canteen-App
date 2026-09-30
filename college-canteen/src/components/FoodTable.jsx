import React from 'react';
import { Edit2, Trash2, Power } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';

export default function FoodTable({ foods, onEdit, onDelete, onToggleAvailability }) {
  return (
    <div className="table-responsive-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Quick Toggle</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id} className={!food.available ? 'row-unavailable' : ''}>
              {/* Item with Thumbnail & Name */}
              <td>
                <div className="table-item-cell">
                  <img
                    src={food.image || FALLBACK_IMAGE}
                    alt={food.name}
                    className="table-item-thumb"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div>
                    <span className="table-item-name">{food.name}</span>
                    <span className="table-item-id">ID: {food.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td>
                <span className="category-pill">{food.category || 'General'}</span>
              </td>

              {/* Price */}
              <td>
                <span className="table-price">₹{food.price}</span>
              </td>

              {/* Availability Status */}
              <td>
                <span
                  className={`status-pill ${
                    food.available ? 'status-available' : 'status-unavailable'
                  }`}
                >
                  <span className="status-pill-dot" />
                  {food.available ? 'Available' : 'Unavailable'}
                </span>
              </td>

              {/* Quick Toggle Action */}
              <td>
                <button
                  type="button"
                  className={`btn-toggle-availability compact ${
                    food.available ? 'is-available' : 'is-unavailable'
                  }`}
                  onClick={() => onToggleAvailability(food.id, food.available)}
                >
                  <Power size={13} />
                  <span>{food.available ? 'Available' : 'Unavailable'}</span>
                </button>
              </td>

              {/* Actions */}
              <td className="text-right">
                <div className="action-buttons-group inline">
                  <button
                    type="button"
                    className="action-icon-btn btn-edit"
                    onClick={() => onEdit(food)}
                    title="Edit Item"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn btn-delete"
                    onClick={() => onDelete(food)}
                    title="Delete Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
