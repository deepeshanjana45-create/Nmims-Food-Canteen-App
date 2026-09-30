import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const FOODS_COLLECTION = 'foods';

/**
 * Add a new food item to Firestore
 * @param {{ name: string, price: number, category: string, image: string, available: boolean }} data
 */
export async function addFood({ name, price, category, image, available = true }) {
  if (!name || name.trim() === '') {
    throw new Error('Food name is required.');
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    throw new Error('Please enter a valid price (greater than or equal to 0).');
  }

  const payload = {
    name: name.trim(),
    price: numericPrice,
    category: (category || 'Other').trim(),
    image: (image || '').trim(),
    available: Boolean(available),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const colRef = collection(db, FOODS_COLLECTION);
  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
}

/**
 * Update an existing food item in Firestore
 * @param {string} id 
 * @param {{ name?: string, price?: number, category?: string, image?: string, available?: boolean }} data 
 */
export async function updateFood(id, { name, price, category, image, available }) {
  if (!id) throw new Error('Document ID is required to update.');

  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (name !== undefined) {
    if (!name.trim()) throw new Error('Food name cannot be empty.');
    payload.name = name.trim();
  }

  if (price !== undefined) {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      throw new Error('Please enter a valid price (greater than or equal to 0).');
    }
    payload.price = numericPrice;
  }

  if (category !== undefined) {
    payload.category = (category || 'Other').trim();
  }

  if (image !== undefined) {
    payload.image = (image || '').trim();
  }

  if (available !== undefined) {
    payload.available = Boolean(available);
  }

  const docRef = doc(db, FOODS_COLLECTION, id);
  await updateDoc(docRef, payload);
  return { id, ...payload };
}

/**
 * Toggle food availability between true and false
 * @param {string} id 
 * @param {boolean} currentStatus 
 */
export async function toggleFoodAvailability(id, currentStatus) {
  if (!id) throw new Error('Document ID is required to toggle availability.');
  const docRef = doc(db, FOODS_COLLECTION, id);
  await updateDoc(docRef, {
    available: !currentStatus,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a food item from Firestore
 * @param {string} id 
 */
export async function deleteFood(id) {
  if (!id) throw new Error('Document ID is required to delete.');
  const docRef = doc(db, FOODS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Real-time listener for foods collection
 * @param {(foods: Array<any>) => void} onData 
 * @param {(err: Error) => void} onError 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeFoods(onData, onError) {
  const colRef = collection(db, FOODS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = [];
      snapshot.forEach((d) => {
        items.push({
          id: d.id,
          ...d.data(),
        });
      });

      // Sort client-side by createdAt desc (or name as fallback)
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        if (timeA && timeB) return timeB - timeA;
        return (a.name || '').localeCompare(b.name || '');
      });

      onData(items);
    },
    (err) => {
      console.error('Error listening to foods collection:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seed initial canteen foods into Firestore if collection is empty
 * @param {Array<any>} sampleFoods 
 */
export async function seedSampleFoods(sampleFoods) {
  const colRef = collection(db, FOODS_COLLECTION);
  const existing = await getDocs(colRef);
  if (!existing.empty) {
    throw new Error(`Firestore 'foods' collection already contains ${existing.size} items.`);
  }

  const results = [];
  for (const item of sampleFoods) {
    const payload = {
      name: item.name,
      price: Number(item.price),
      category: item.category || item.mealType || 'Breakfast',
      image: item.image || '',
      available: item.available !== undefined ? Boolean(item.available) : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(colRef, payload);
    results.push({ id: ref.id, ...payload });
  }

  return results;
}
