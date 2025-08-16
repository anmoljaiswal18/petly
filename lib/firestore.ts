// lib/firestore.ts
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore";

const firebaseConfig = { /* your keys */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  photos: string[];
  location: { lat: number; lon: number };
};

export async function fetchPets(): Promise<Pet[]> {
  // Basic example: pull latest pets (you can add geoqueries via a GeoFirestore lib)
  const q = query(collection(db, "pets"), orderBy("updatedAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function writeSwipe({
  swiperId, targetId, targetType, direction
}: { swiperId:string; targetId:string; targetType:"user"|"pet"; direction:"right"|"left" }) {
  const { addDoc } = await import("firebase/firestore");
  const col = collection(db, "swipes");
  await addDoc({ swiperId, targetId, targetType, direction, createdAt: new Date() as any });
}
