import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  addDoc, collection, deleteDoc, doc, getFirestore,
  onSnapshot, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUeBs0DlyjASDW9SsBWRXC2zJ7n3RsSBg",
  authDomain: "for-peung.firebaseapp.com",
  projectId: "for-peung",
  storageBucket: "for-peung.firebasestorage.app",
  messagingSenderId: "343434963959",
  appId: "1:343434963959:web:8bfd0a137fcf61f1329cf2",
  measurementId: "G-C4GWG4E7ML"
};

const form = document.querySelector('#gift-form');
const giverInput = document.querySelector('#giver');
const giftInput = document.querySelector('#gift');
const list = document.querySelector('#pencil-list');
const emptyState = document.querySelector('#empty-state');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const giftsRef = collection(db, 'birthdays', 'pengdori', 'gifts');
let currentUserId = null;
let gifts = [];

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

function amountFrom(text) {
  const match = text.replaceAll(',', '').match(/(\d+(?:\.\d+)?)\s*(만원|천원|원)?/);
  if (!match) return -1;
  const value = Number(match[1]);
  if (match[2] === '만원') return value * 10000;
  if (match[2] === '천원') return value * 1000;
  return value;
}

function renderGifts() {
  const ranked = [...gifts].sort((a, b) => {
    const amountDifference = amountFrom(b.gift) - amountFrom(a.gift);
    if (amountDifference !== 0) return amountDifference;
    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });

  emptyState.hidden = ranked.length !== 0;
  list.innerHTML = ranked.map((item, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    const removeButton = item.authorId === currentUserId
      ? `<button class="remove-gift" type="button" data-id="${item.id}" aria-label="${escapeHtml(item.giver)} 선물 삭제">×</button>`
      : '';

    return `
      <li class="pencil-pencil">
        <span class="rank" data-medal="${medal}" data-rank="${String(rank).padStart(2, '0')}"></span>
        <span class="pencil-body">
          <b>${escapeHtml(item.giver)}</b>
          <small>${escapeHtml(item.gift)}</small>
        </span>
        <span class="pencil-tip" aria-hidden="true"></span>
        ${removeButton}
      </li>
    `;
  }).join('');
}

async function startSharedGiftList() {
  const credential = await signInAnonymously(auth);
  currentUserId = credential.user.uid;

  onSnapshot(query(giftsRef, orderBy('createdAt', 'asc')), (snapshot) => {
    gifts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    renderGifts();
  }, () => {
    emptyState.hidden = false;
    emptyState.textContent = '공유 리스트를 준비 중이에요. Firebase 설정을 확인해 주세요.';
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const giver = giverInput.value.trim();
  const gift = giftInput.value.trim();
  if (!giver || !gift || !currentUserId) return;

  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = '기록 중…';

  try {
    await addDoc(giftsRef, {
      giver,
      gift,
      authorId: currentUserId,
      createdAt: serverTimestamp()
    });
    form.reset();
    giverInput.focus();
  } finally {
    button.disabled = false;
    button.innerHTML = '선물 기록하기 <b>✦</b>';
  }
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('.remove-gift');
  if (!button) return;
  await deleteDoc(doc(db, 'birthdays', 'pengdori', 'gifts', button.dataset.id));
});

startSharedGiftList().catch(() => {
  emptyState.textContent = '공유 리스트를 준비 중이에요. Firebase 설정을 확인해 주세요.';
});
