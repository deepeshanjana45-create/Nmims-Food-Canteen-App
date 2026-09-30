import React from 'react';
import {
  UtensilsCrossed,
  Plus,
  Sparkles,
  RefreshCw,
  Bell,
} from 'lucide-react';

export default function AdminNavbar({
  onOpenAddModal,
  onSeedMenu,
  isSyncing,
  totalCount,
  newOrderCount = 0,
  onNotificationClick,
}) {
  return (
    <header className="admin-header">
      <div className="admin-header-container">
        {/* Brand & Campus Badge */}
        <div className="brand-section">
          <div className="brand-logo-wrap">
            <UtensilsCrossed size={22} className="brand-icon" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">NMIMS Canteen</h1>
              <span className="brand-badge">ADMIN</span>
            </div>
            <div className="campus-meta">
              <span className="live-dot" />
              <span>Indore Campus Portal</span>
              <span className="meta-divider">•</span>
              <span className="sync-status">
                <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
                {isSyncing ? 'Syncing Firestore...' : 'Firestore Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* New Order Notification Bell */}
          <button
            type="button"
            className="notification-btn"
            onClick={onNotificationClick}
            title="New Orders"
          >
            <Bell size={19} />
            {newOrderCount > 0 && (
              <span className="notification-badge">
                {newOrderCount > 99 ? '99+' : newOrderCount}
              </span>
            )}
          </button>

          {/* Seed Menu */}
          {totalCount === 0 && (
            <button
              type="button"
              className="btn btn-secondary seed-btn"
              onClick={onSeedMenu}
              title="Populate initial sample foods into Firestore"
            >
              <Sparkles size={16} />
              <span>Seed Sample Menu</span>
            </button>
          )}

          {/* Add Food */}
          <button
            type="button"
            className="btn btn-primary add-food-btn"
            onClick={onOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>
    </header>
  );
}
