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

function amountFrom(text) {
  const match = text.replaceAll(',', '').match(/(\d+(?:\.\d+)?)\s*(만원|천원|원)?/);
  if (!match) return -1;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === '만원') return value * 10000;
  if (unit === '천원') return value * 1000;
  return value;
}

function saveGifts() {
  localStorage.setItem(storageKey, JSON.stringify(gifts));
}

function rankedGifts() {
  return [...gifts].sort((a, b) => {
    const amountDifference = amountFrom(b.gift) - amountFrom(a.gift);
    if (amountDifference !== 0) return amountDifference;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

function renderGifts() {
  const ranked = rankedGifts();
  emptyState.hidden = ranked.length !== 0;
  list.innerHTML = ranked.map((item, index) => {
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

  gifts.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    giver,
    gift,
    createdAt: Date.now()
  });
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