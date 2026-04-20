import {
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  formatCurrency,
  formatDateTime,
  getDateKeyFromValue,
} from "../utils/format";

function salesCollection(uid) {
  return collection(db, "users", uid, "sales");
}

export function subscribeSales(uid, callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(query(salesCollection(uid), orderBy("soldAt", "desc")), (snapshot) => {
    callback(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        readableDate: formatDateTime(item.data().soldAt),
        profitDisplay: formatCurrency(item.data().profit || 0),
      })),
    );
  });
}

export async function createSale(uid, sale) {
  if (!db) {
    return null;
  }

  return addDoc(salesCollection(uid), {
    ...sale,
    quantity: Number(sale.quantity || 0),
    revenue: Number(sale.revenue || 0),
    cost: Number(sale.cost || 0),
    profit: Number(sale.profit || 0),
    extraCost: Number(sale.extraCost || 0),
    soldAt: serverTimestamp(),
    dateKey: getDateKeyFromValue(new Date()),
  });
}
