// src/db.js
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import app from "./firebase";

export const db = getFirestore(app);
export const productsCol = collection(db, "products");
export const transactionsCol = collection(db, "transactions");

export {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  orderBy
};
