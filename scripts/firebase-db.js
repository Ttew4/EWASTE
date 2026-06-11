import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzrfwg2fzxK-JJHa3g81YlcFpBDA-p5No",
  authDomain: "e-waste-15099.firebaseapp.com",
  projectId: "e-waste-15099",
  storageBucket: "e-waste-15099.firebasestorage.app",
  messagingSenderId: "512443987345",
  appId: "1:512443987345:web:b1837abd215db723521630",
  measurementId: "G-7FBRQDZ95H"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export async function salvarPostFirebase(dados) {
    return await addDoc(collection(db, "postagens"), {
        ...dados,
        dataHora: new Date()
    });
}

export async function lerPostsFirebase() {
    const q = query(collection(db, "postagens"), orderBy("dataHora", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deletarPostFirebase(id) {
    await deleteDoc(doc(db, "postagens", id));
}

export async function atualizarPostFirebase(id, dados) {
    await updateDoc(doc(db, "postagens", id), dados);
}

export async function salvarVideoFirebase(dados) {
    return await addDoc(collection(db, "biblioteca"), {
        ...dados,
        dataAdicao: new Date()
    });
}

export async function lerVideosFirebase() {
    const q = query(collection(db, "biblioteca"), orderBy("dataAdicao", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deletarVideoFirebase(id) {
    await deleteDoc(doc(db, "biblioteca", id));
}
