const storageKey = 'pengdori-gift-archive';
const form = document.querySelector('#gift-form');
const giverInput = document.querySelector('#giver');
const giftInput = document.querySelector('#gift');
const list = document.querySelector('#pencil-list');
const emptyState = document.querySelector('#empty-state');

let gifts = JSON.parse(localStorage.getItem(storageKey) || '[]');

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

function saveGifts() {
  localStorage.setItem(storageKey, JSON.stringify(gifts));
}

function renderGifts() {
  emptyState.hidden = gifts.length !== 0;
  list.innerHTML = gifts.map((item, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    return `
      <li class="pencil-pencil">
        <span class="rank" data-medal="${medal}" data-rank="${String(rank).padStart(2, '0')}"></span>
        <span class="pencil-body">
          <b>${escapeHtml(item.giver)}</b>
          <small>${escapeHtml(item.gift)}</small>
        </span>
        <span class="pencil-tip" aria-hidden="true"></span>
        <button class="remove-gift" type="button" data-id="${item.id}" aria-label="${escapeHtml(item.giver)} 선물 삭제">×</button>
      </li>
    `;
  }).join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const giver = giverInput.value.trim();
  const gift = giftInput.value.trim();
  if (!giver || !gift) return;

  gifts.push({ id: crypto.randomUUID(), giver, gift });
  saveGifts();
  renderGifts();
  form.reset();
  giverInput.focus();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-gift');
  if (!button) return;

  gifts = gifts.filter((item) => item.id !== button.dataset.id);
  saveGifts();
  renderGifts();
});

renderGifts();