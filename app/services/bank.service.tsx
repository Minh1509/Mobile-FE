import { db } from "@/firebase_config.env";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ParsedSms } from "../interface/Sms";
import { addExpense, addIncome } from "./budget.service";
import { ITransaction, PayMethod } from "../interface/Transaction";
import { formatDate } from "../utils/normalizeDate";

// Tạo transactionId duy nhất từ các trường của parsedSms
const generateTransactionId = (parsedSms: ParsedSms): string => {
  // Tạo chuỗi duy nhất từ các trường của parsedSms và thời gian hiện tại
  return `${parsedSms.accountNumber}|${parsedSms.amount}|${parsedSms.date}|${parsedSms.time}|${parsedSms.originalMessage}}`;
};

export const saveBankSmsToFirestore = async (
  userId: string,
  parsedSms: ParsedSms
): Promise<void> => {
  const docId = `${userId}_${parsedSms.accountNumber}`;
  const docRef = doc(collection(db, "bank_integrations"), docId);
  const docSnap = await getDoc(docRef);

  // Tạo transactionId duy nhất cho giao dịch này
  const transactionId = generateTransactionId(parsedSms);

  const smsTransaction = {
    id: transactionId, // Thêm id duy nhất cho giao dịch
    amount: parsedSms.amount,
    category: "Khác",
    createdAt: Timestamp.now(),
    date: parsedSms.date,
    time: parsedSms.time,
    type: parsedSms.type,
    message: parsedSms.originalMessage,
  };

  // Kiểm tra giao dịch có trùng lặp không
  if (docSnap.exists()) {
    const existingTransactions = docSnap.data().smsTransactions || [];
    const isDuplicate = existingTransactions.some(
      (tx: any) => tx.id === transactionId
    );

    if (!isDuplicate) {
      await updateDoc(docRef, {
        smsTransactions: arrayUnion(smsTransaction),
      });
      const transaction: Omit<
        ITransaction,
        "id" | "type" | "createdAt" | "updatedAt"
      > = {
        userId,
        amount: parsedSms.amount ? Math.abs(parsedSms.amount) : 0,
        date:
          typeof parsedSms.date === "string"
            ? parsedSms.date
            : formatDate(parsedSms.date || new Date()),
        time:
          parsedSms.time ||
          new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        category: "Khác",
        description: parsedSms.originalMessage,
        paymentMethod: PayMethod.BANK_TRANSFER,
        note: "",
        image: "",
        location: "",
      };

      if (parsedSms.type === "income") {
        await addIncome(transaction);
      } else if (parsedSms.type === "expense") {
        await addExpense(transaction);
      }
    }
  } else {
    await setDoc(docRef, {
      userId,
      bankName: parsedSms.bankName,
      accountNumber: parsedSms.accountNumber,
      smsTransactions: [smsTransaction],
    });
  }

  // Tạo dữ liệu giao dịch phù hợp với ITransaction (trừ id, createdAt, updatedAt)
};
