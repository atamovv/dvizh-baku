const products = [
  {id:"white-pink", name:"Футболка / White Pink", price:24, image:"assets/white-pink.jpg", tag:"WHITE / PINK"},
  {id:"white-yellow", name:"Футболка / White Yellow", price:24, image:"assets/white-yellow.jpg", tag:"WHITE / YELLOW"},
  {id:"black-yellow", name:"Футболка / Black Yellow", price:26, image:"assets/black-yellow.jpg", tag:"BLACK / YELLOW"},
  {id:"combo", name:"Комбо / White + Black", price:48, images:["assets/black-yellow.jpg","assets/white-yellow.jpg"], tag:"COMBO — 2 T-SHIRTS", combo:true},
  {id:"sticker", name:"Стикер Dvizh Baku", price:5, image:"assets/logo-transparent.png", tag:"КОМПЛЕКТ / 15 ШТ", description:"Стикер Dvizh Baku — комплект 15 шт.", sticker:true}
];

let cart = [];
let selectedProduct = null;

const $ = (s) => document.querySelector(s);
const productsEl = $("#products");
const cartCount = $("#cartCount");

function money(v){ return `${v} AZN`; }

function imageMarkup(p, className=""){
  if(p.images){
    return `<div class="combo-image ${className}">${p.images.map(src => `<img src="${src}" alt="${p.name}">`).join("")}</div>`;
  }
  return `<img class="${className}" src="${p.image}" alt="${p.name}">`;
}

function renderProducts(){
  productsEl.innerHTML = products.map(p => `
    <article class="product">
      <div class="product-image">${imageMarkup(p)}</div>
      <div class="product-body">
        <div class="product-tag">${p.tag}</div>
        <h3>${p.name}</h3>
        <div class="product-meta">
          <span class="price">${money(p.price)}</span>
          <button class="view-btn" onclick="openProduct('${p.id}')">ВЫБРАТЬ</button>
        </div>
      </div>
    </article>
  `).join("");
}

function openProduct(id){
  selectedProduct = products.find(p => p.id === id);
  const modalMedia = $("#modalMedia");
  modalMedia.innerHTML = imageMarkup(selectedProduct, "modal-product-image");
  $("#modalName").textContent = selectedProduct.name;
  $("#modalPrice").textContent = money(selectedProduct.price);
  $("#modalType").textContent = selectedProduct.combo ? "COMBO / 2 T-SHIRTS" : (selectedProduct.sticker ? "DVIZH BAKU / STICKER" : "DVIZH BAKU / FIRST DROP");

  const sizeArea = $("#sizeArea");
  if(selectedProduct.combo){
    sizeArea.innerHTML = `
      <div class="combo-sizes">
        <label>РАЗМЕР ЧЁРНОЙ ФУТБОЛКИ
          <select id="comboBlackSize"><option>M</option><option>L</option><option>XL</option><option>XXL</option></select>
        </label>
        <label>РАЗМЕР БЕЛОЙ ФУТБОЛКИ
          <select id="comboWhiteSize"><option>M</option><option>L</option><option>XL</option><option>XXL</option></select>
        </label>
      </div>`;
  } else if(selectedProduct.sticker){
    sizeArea.innerHTML = `<div class="no-size">Комплект 15 шт.</div>`;
  } else {
    sizeArea.innerHTML = `
      <label>РАЗМЕР
        <select id="modalSize"><option>M</option><option>L</option><option>XL</option><option>XXL</option></select>
      </label>`;
  }

  $("#productModal").classList.add("active");
  document.body.classList.add("no-scroll");
}
window.openProduct = openProduct;

function closeProduct(){
  $("#productModal").classList.remove("active");
  document.body.classList.remove("no-scroll");
}
$("#closeModal").onclick = closeProduct;
$("#productModal").addEventListener("click", e => { if(e.target.id === "productModal") closeProduct(); });

$("#addToCart").onclick = () => {
  if(!selectedProduct) return;

  if(selectedProduct.combo){
    const blackSize = $("#comboBlackSize").value;
    const whiteSize = $("#comboWhiteSize").value;
    const existing = cart.find(i => i.id === selectedProduct.id && i.blackSize === blackSize && i.whiteSize === whiteSize);
    if(existing) existing.qty++;
    else cart.push({...selectedProduct, blackSize, whiteSize, qty:1});
  } else {
    const size = selectedProduct.sticker ? "—" : $("#modalSize").value;
    const existing = cart.find(i => i.id === selectedProduct.id && i.size === size);
    if(existing) existing.qty++;
    else cart.push({...selectedProduct, size, qty:1});
  }

  closeProduct();
  renderCart();
  openCart();
};

function cartItemText(i){
  if(i.combo) return `Чёрная: ${i.blackSize} · Белая: ${i.whiteSize} · ${i.qty} шт. · ${money(i.price*i.qty)}`;
  if(i.sticker) return `Комплект 15 шт. · ${i.qty} шт. · ${money(i.price*i.qty)}`;
  return `Размер: ${i.size} · ${i.qty} шт. · ${money(i.price*i.qty)}`;
}

function orderLine(i){
  if(i.combo) return `• ${i.name} — Чёрная: ${i.blackSize} — Белая: ${i.whiteSize} — ${i.qty} шт. — ${money(i.price*i.qty)}`;
  if(i.sticker) return `• ${i.name} — комплект 15 шт. — ${i.qty} шт. — ${money(i.price*i.qty)}`;
  return `• ${i.name} — ${i.size} — ${i.qty} шт. — ${money(i.price*i.qty)}`;
}

function renderCart(){
  const count = cart.reduce((n,i)=>n+i.qty,0);
  cartCount.textContent = count;
  const items = $("#cartItems");
  if(!cart.length){
    items.innerHTML = `<p class="small">Корзина пока пустая.</p>`;
  } else {
    items.innerHTML = cart.map((i,idx)=>`
      <div class="cart-item">
        ${imageMarkup(i)}
        <div>
          <h4>${i.name}</h4>
          <p>${cartItemText(i)}</p>
        </div>
        <button class="remove" onclick="removeItem(${idx})">УДАЛИТЬ</button>
      </div>
    `).join("");
  }
  const subtotal = cart.reduce((n,i)=>n+i.price*i.qty,0);
  $("#cartTotal").textContent = money(subtotal);
  const deliveryNote = document.querySelector(".cart-delivery-note");
  if (deliveryNote) deliveryNote.textContent = subtotal >= 50 ? "Доставка по Баку — бесплатно" : "Доставка по Баку — 3 AZN • бесплатно от 50 AZN";
}
window.removeItem = (idx) => { cart.splice(idx,1); renderCart(); };

function openCart(){
  $("#cartDrawer").classList.add("active");
  $("#overlay").classList.add("active");
  document.body.classList.add("no-scroll");
}
function closeCart(){
  $("#cartDrawer").classList.remove("active");
  $("#overlay").classList.remove("active");
  document.body.classList.remove("no-scroll");
}
$("#openCart").onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = closeCart;

$("#checkout").onclick = () => {
  if(!cart.length){ alert("Сначала добавь товар в корзину."); return; }
  $("#checkoutModal").classList.add("active");
  closeCart();
  document.body.classList.add("no-scroll");
};
$("#closeCheckout").onclick = () => {
  $("#checkoutModal").classList.remove("active");
  document.body.classList.remove("no-scroll");
};

$("#orderForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = new FormData(e.target);
  const lines = cart.map(orderLine);
  const subtotal = cart.reduce((n,i)=>n+i.price*i.qty,0);
  const delivery = subtotal >= 50 ? 0 : 3;
  const total = subtotal + delivery;
  const deliveryText = delivery === 0 ? "Бесплатно" : "3 AZN";

  const text = [
    "ЗАКАЗ — ДВИЖ БАКУ",
    "",
    ...lines,
    "",
    `Товары: ${money(subtotal)}`,
    `Доставка по Баку: ${deliveryText}`,
    `Итого: ${money(total)}`,
    `Имя: ${data.get("name")}`,
    `Телефон: ${data.get("phone")}`,
    `Получение: ${data.get("delivery")}`,
    `Комментарий: ${data.get("comment") || "—"}`
  ].join("\n");

  const encoded = encodeURIComponent(text);
  const telegramUrl = "https://t.me/dvizh_merch?text=" + encoded;
  const instagramUrl = "https://www.instagram.com/27.1.004/";

  $("#orderResult").classList.remove("hidden");
  $("#orderResult").innerHTML = `
    <strong>Заказ готов.</strong><br>
    Сумма товаров: ${money(subtotal)}<br>
    Доставка: ${deliveryText}<br>
    <strong>Итого: ${money(total)}</strong><br><br>
    Выбери удобный способ для связи что-бы менеджер отправил реквизиты оплаты.<br><br>
    <div class="contact-actions">
      <a class="contact-btn full" href="${telegramUrl}" target="_blank" rel="noopener">НАПИСАТЬ В TELEGRAM</a>
      <a class="contact-btn full" href="${instagramUrl}" target="_blank" rel="noopener">НАПИСАТЬ В INSTAGRAM</a>
      <button class="contact-btn full" type="button" onclick="copyOrder()">СКОПИРОВАТЬ ЗАКАЗ</button>
    </div>
  `;
  window.generatedOrder = text;
});
window.copyOrder = async () => {
  try {
    await navigator.clipboard.writeText(window.generatedOrder);
    alert("Текст заказа скопирован.");
  } catch {
    alert("Не удалось скопировать заказ автоматически.");
  }
};

renderProducts();
renderCart();
