import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Album } from '../types';

export const StorageService = {
  async loadCrate(): Promise<Album[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'albums'));
      const albums: Album[] = [];
      querySnapshot.forEach((doc) => {
        albums.push({ id: doc.id, ...doc.data() } as Album);
      });
      return albums;
    } catch (e) {
      console.error("Storage Load Failed", e);
      return [];
    }
  },

  async addAlbum(albumData: Omit<Album, 'id'>): Promise<Album> {
    try {
      const newDocRef = doc(collection(db, 'albums'));
      const payload = {
        ...albumData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(newDocRef, payload);
      return { id: newDocRef.id, ...albumData };
    } catch (e) {
      console.error("Add Album Failed:", e);
      throw e;
    }
  },

  async updateAlbum(id: string, updates: Partial<Album>): Promise<void> {
    try {
      const docRef = doc(db, 'albums', id);
      await updateDoc(docRef, {
      	...updates,
      	updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Update Album Failed", e);
      throw e;
    }
  },

  async removeAlbum(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'albums', id));
    } catch (e) {
      console.error("Remove Album Failed", e);
      throw e;
    }
  }
};