// src/services/foodService.js
// Firestore real-time listener for foods collection

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Subscribe to real-time Firestore `foods` collection updates.
 * Calls onData(items) whenever data changes.
 * Returns an unsubscribe function.
 */
export function subscribeFoods(onData, onError) {
  const q = query(collection(db, 'foods'), orderBy('name'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(items);
    },
    (err) => {
      console.error('Firestore error:', err);
      if (onError) onError(err);
    }
  );
}
