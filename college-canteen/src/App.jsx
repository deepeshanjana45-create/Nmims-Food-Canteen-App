import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

import AdminNavbar from './components/AdminNavbar';
import StatsOverview from './components/StatsOverview';
import FoodCard from './components/FoodCard';
import FoodTable from './components/FoodTable';
import FoodFormModal from './components/FoodFormModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';

import {
  subscribeFoods,
  addFood,
  updateFood,
  toggleFoodAvailability,
  deleteFood,
  seedSampleFoods,
} from './services/foodService';

import { FOODS as DEFAULT_SAMPLE_FOODS } from './data/foodData';
import {
  Search,
  LayoutGrid,
  Table,
  Utensils,
  Sparkles,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import './App.css';

export default function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available' | 'unavailable'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Subscribe to real-time Firestore Foods
  useEffect(() => {
    setLoading(true);
    setSyncing(true);

    const unsubscribe = subscribeFoods(
      (items) => {
        setFoods(items);
        setLoading(false);
        setSyncing(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError('Failed to connect to Firestore. Please check your network and Firebase rules.');
        setLoading(false);
        setSyncing(false);
        showToast('Firestore connection error: ' + (err.message || 'Check Firestore rules'), 'error');
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Orders Listener
  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    let firstLoad = true;

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orderList = snapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
        }));

        setOrders(orderList);

        // Don't notify for old orders on initial render
        if (!firstLoad) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const order = change.doc.data();
              setNewOrderCount((prev) => prev + 1);
              showToast(
                `🔔 New order from ${
                  order.studentName || order.studentEmail || 'Student'
                }!`,
                'success'
              );
            }
          });
        }

        firstLoad = false;
      },
      (err) => {
        console.error('Orders Firestore listener error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute categories list
  const categories = useMemo(() => {
    const set = new Set();
    foods.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [foods]);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const matchesSearch =
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' ||
        (f.category && f.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && f.available === true) ||
        (availabilityFilter === 'unavailable' && f.available === false);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [foods, searchQuery, selectedCategory, availabilityFilter]);

  // Handlers for Foods
  const handleOpenAddModal = () => {
    setEditingFood(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingFood) {
      await updateFood(editingFood.id, formData);
      showToast(`Updated "${formData.name}" successfully!`, 'success');
    } else {
      await addFood(formData);
      showToast(`Added "${formData.name}" to canteen menu!`, 'success');
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const foodItem = foods.find((f) => f.id === id);
      const newStatus = !currentStatus;
      await toggleFoodAvailability(id, currentStatus);
      showToast(
        `"${foodItem?.name || 'Food'}" marked as ${newStatus ? 'Available' : 'Unavailable'}`,
        newStatus ? 'success' : 'info'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle availability: ' + err.message, 'error');
    }
  };

  const handleOpenDeleteModal = (food) => {
    setFoodToDelete(food);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!foodToDelete) return;
    try {
      setIsDeleting(true);
      await deleteFood(foodToDelete.id);
      showToast(`Deleted "${foodToDelete.name}" from menu.`, 'info');
      setIsDeleteModalOpen(false);
      setFoodToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete food: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedMenu = async () => {
    try {
      setSyncing(true);
      const seeded = await seedSampleFoods(DEFAULT_SAMPLE_FOODS);
      showToast(`Successfully seeded ${seeded.length} authentic dishes into Firestore!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Orders Handlers
  const handleNotificationClick = () => {
    setNewOrderCount(0);
    const section = document.getElementById('orders-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: newStatus,
      });
      showToast(`Order status updated to ${newStatus}`, 'success');

      if (newStatus === 'READY' && order.pushToken) {
        // Send push notification
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: order.pushToken,
            sound: 'default',
            title: 'Food is ready! 🍔',
            body: `Your order #${order.orderId || order.id.slice(0, 8)} is ready. Please collect it from the canteen.`,
            data: { screen: 'OrdersTab' },
          }),
        }).catch((err) => console.error('Push notification error:', err));
      }
    } catch (err) {
      console.error('Order status update error:', err);
      showToast('Failed to update order status', 'error');
    }
  };

  const approvePayment = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'PAID',
        orderStatus: 'PREPARING',
      });
      showToast('Payment approved! Order is now preparing.', 'success');
    } catch (err) {
      console.error('Payment approval error:', err);
      showToast('Failed to approve payment', 'error');
    }
  };

  const rejectPayment = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'FAILED',
        orderStatus: 'CANCELLED',
      });
      showToast('Payment rejected. Order cancelled.', 'info');
    } catch (err) {
      console.error('Payment rejection error:', err);
      showToast('Failed to reject payment', 'error');
    }
  };

  return (
    <div className="admin-app">
      {/* Top Navbar */}
      <AdminNavbar
        onOpenAddModal={handleOpenAddModal}
        onSeedMenu={handleSeedMenu}
        isSyncing={syncing}
        totalCount={foods.length}
        newOrderCount={newOrderCount}
        onNotificationClick={handleNotificationClick}
      />

      <main className="admin-main">
        {/* Error Alert if Firestore fails */}
        {error && (
          <div className="alert-box alert-error" style={{ margin: '0 0 24px 0' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview foods={foods} />

        {/* Toolbar: Search, Filters & View Mode */}
        <div className="toolbar-section">
          <div className="toolbar-primary">
            {/* Search Box */}
            <div className="search-box-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search food by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Availability Filter & View Mode */}
            <div className="toolbar-controls">
              <div className="filter-group-wrap">
                <button
                  type="button"
                  className={`filter-pill ${availabilityFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setAvailabilityFilter('all')}
                >
                  All ({foods.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${
                    availabilityFilter === 'available' ? 'active active-available' : ''
                  }`}
                  onClick={() => setAvailabilityFilter('available')}
                >
                  Available ({foods.filter((f) => f.available).length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${
                    availabilityFilter === 'unavailable' ? 'active active-unavailable' : ''
                  }`}
                  onClick={() => setAvailabilityFilter('unavailable')}
                >
                  Unavailable ({foods.filter((f) => !f.available).length})
                </button>
              </div>

              {/* View Switcher */}
              <div className="view-switch-wrap">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <Table size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="category-scroll-container">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="category-pill-count">
                  {cat === 'All'
                    ? foods.length
                    : foods.filter((f) => f.category?.toLowerCase() === cat.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Foods Content */}
        {loading ? (
          <div className="loading-state-box">
            <div className="loading-spinner" />
            <p>Syncing menu with Firestore real-time database...</p>
          </div>
        ) : filteredFoods.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="foods-grid animate-fade-in">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          ) : (
            <div className="animate-fade-in">
              <FoodTable
                foods={filteredFoods}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleAvailability={handleToggleAvailability}
              />
            </div>
          )
        ) : (
          <div className="empty-state-box animate-fade-in">
            <div className="empty-icon-wrap">
              <Utensils size={32} />
            </div>
            <h3 className="empty-title">
              {foods.length === 0 ? 'No Food Items in Firestore Yet' : 'No Matching Foods Found'}
            </h3>
            <p className="empty-desc">
              {foods.length === 0
                ? 'Your Firebase Firestore "foods" collection is currently empty. You can add items manually or populate the canteen default menu with 1 click.'
                : 'Try adjusting your search query, category filter, or availability status.'}
            </p>

            <div className="empty-actions">
              {foods.length === 0 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary seed-btn"
                    onClick={handleSeedMenu}
                  >
                    <Sparkles size={16} />
                    <span>Seed Canteen Menu (15 Dishes)</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenAddModal}
                  >
                    <Plus size={16} />
                    <span>Add First Food Item</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setAvailabilityFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================
            ORDERS SECTION (Real-Time from Firestore)
        ================================= */}
        <section id="orders-section" className="orders-section">
          <div className="orders-header">
            <div>
              <h2>
                <Clock size={22} style={{ color: '#FF4D4D' }} />
                Student Orders
              </h2>
              <p>Live incoming orders from student portal with status & payment controls</p>
            </div>

            {newOrderCount > 0 && (
              <span className="new-order-label">
                🔔 {newOrderCount} New Order{newOrderCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <h3>No orders yet</h3>
              <p>When students place orders on the student app, they will appear here in real time.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  {/* ORDER HEADER */}
                  <div className="order-card-header">
                    <div>
                      <h3>Order #{order.orderId || order.id.slice(0, 8)}</h3>
                      <p>{order.studentName || 'Student'}</p>
                    </div>

                    <span
                      className={`order-status ${String(
                        order.orderStatus || 'NEW'
                      ).toLowerCase()}`}
                    >
                      {order.orderStatus || 'NEW'}
                    </span>
                  </div>

                  {/* STUDENT INFO */}
                  <div className="order-info">
                    <p>
                      <strong>NMIMS ID / Email:</strong>{' '}
                      {order.studentEmail || 'Not available'}
                    </p>
                  </div>

                  {/* ITEMS */}
                  <div className="order-items">
                    <h4>Items</h4>
                    {order.items?.map((item, index) => (
                      <div className="order-item" key={index}>
                        <span>{item.name}</span>
                        <span>× {item.quantity}</span>
                        <span>
                          ₹
                          {Number(item.price || 0) * Number(item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}
                  <div className="order-total">
                    <span>Total</span>
                    <strong>₹{Number(order.totalAmount || 0)}</strong>
                  </div>

                  {/* PAYMENT */}
                  <div className="payment-section">
                    <div>
                      <strong>Payment:</strong>{' '}
                      <span
                        className={
                          order.paymentStatus === 'PAID'
                            ? 'payment-paid'
                            : 'payment-pending'
                        }
                      >
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </div>

                    {/* PAYMENT ACTIONS */}
                    {order.paymentStatus !== 'PAID' &&
                      order.orderStatus !== 'CANCELLED' && (
                        <div className="payment-actions">
                          <button
                            type="button"
                            className="approve-btn"
                            onClick={() => approvePayment(order.id)}
                          >
                            ✓ Approve Payment
                          </button>
                          <button
                            type="button"
                            className="reject-btn"
                            onClick={() => rejectPayment(order.id)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                  </div>

                  {/* ORDER STATUS CONTROL */}
                  {order.paymentStatus === 'PAID' && (
                    <div className="order-actions">
                      <label>Order Status (Live update to student)</label>
                      <select
                        value={order.orderStatus || 'PREPARING'}
                        onChange={(event) =>
                          updateOrderStatus(order, event.target.value)
                        }
                      >
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY">READY (Ready to Collect)</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Food Modal */}
      <FoodFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingFood}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFoodToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        food={foodToDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
