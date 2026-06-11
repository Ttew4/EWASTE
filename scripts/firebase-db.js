import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    return await addDoc(collection(db, "postagens"), { ...dados, dataHora: new Date() });
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
    return await addDoc(collection(db, "videos"), { ...dados, dataHora: new Date() });
}

export async function lerVideosFirebase() {
    const snapshot = await getDocs(collection(db, "videos"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deletarVideoFirebase(id) {
    await deleteDoc(doc(db, "videos", id));
}

export async function obterUsuarioFirebase(nome) {
    const docRef = doc(db, "usuarios", nome);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export async function cadastrarOuAtualizarUsuarioFirebase(nome, dados) {
    const docRef = doc(db, "usuarios", nome);
    await setDoc(docRef, dados, { merge: true });
}

export async function obterTodasFotosFirebase() {
    const snapshot = await getDocs(collection(db, "usuarios"));
    let fotos = {};
    snapshot.forEach(doc => {
        if (doc.data().fotoPerfil) {
            fotos[doc.id] = doc.data().fotoPerfil;
        }
    });
    return fotos;
}

export async function lerImpactoFirebase() {
    const snapshot = await getDocs(collection(db, "reciclagem"));
    return snapshot.docs.map(doc => doc.data());
}
