import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const DEFAULT_LABEL_IMG = "https://www.transparenttextures.com/patterns/black-scales.png"; 

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${file.name}-${Date.now()}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
