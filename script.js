const form = document.querySelector("#form");
const checkBoxes = document.querySelectorAll("[data-checkbox]");
const selectBoxes = document.querySelectorAll("select");
const orderTotal = document.querySelector(".order-total");
const orderTotalInput = document.querySelector("[data-order-total-input]");

let selectedProducts = [];
let totalPrice = 0;

checkBoxes.forEach((checkbox) => (checkbox.checked = false));
selectBoxes.forEach((selectBox) => (selectBox.value = "1"));

form.addEventListener("click", (e) => {
  if (!e.target.matches("input[type='checkbox'")) return;

  const id = e.target.name;
  const price = Number(e.target.dataset.price);
  const productBox = e.target.closest(".product-box");
  const quantityLabel = productBox.querySelector(`#Label-${id}`);
  const quantitySelector = quantityLabel.querySelector("select");
  const quantity = quantitySelector.value;

  if (e.target.checked) {
    quantityLabel.hidden = false;
    quantitySelector.disabled = false;
    selectedProducts.push({
      name: e.target.name,
      price: parseInt(price),
      quantity: parseInt(quantity),
    });
  } else {
    quantityLabel.hidden = true;
    quantitySelector.disabled = true;
    selectedProducts = selectedProducts.filter(
      (product) => product.name !== e.target.name
    );
  }
  calcPrice();
  checkForTradersInOrder();
});

form.addEventListener("change", (e) => {
  if (!e.target.matches("select")) return;

  const id = e.target.name.replace("-Quantity", "");
  const productBox = e.target.closest(".product-box");
  const product = productBox.querySelector(`#Label-${id}`);

  if (product.checked === false) return;

  const existingItem = selectedProducts.find((entry) => entry.name === id);

  if (existingItem) {
    existingItem.quantity = parseInt(e.target.value);
  } else {
    selectedProducts.push({
      name: product.name,
      price: parseInt(product.dataset.price),
      quantity: parseInt(e.target.value),
    });
  }
  calcPrice();
});

function calcPrice() {
  totalPrice =
    selectedProducts.reduce(
      (sum, entry) => sum + entry.price * entry.quantity,
      0
    ) + 4;
  if (totalPrice === 4) {
    totalPrice = 0;
  }
  orderTotal.innerText = totalPrice;
  orderTotalInput.value = totalPrice;
}

function checkForTradersInOrder() {
  const traderCardsInOrder = selectedProducts.find(
    (entry) =>
      entry.name === "Package-C" || entry.name === "8-Deluxe-Trading-Cards"
  );

  const traderCardInfoSection = document.querySelector("#trader-card-info");

  if (traderCardsInOrder) {
    traderCardInfoSection.hidden = false;
  } else {
    traderCardInfoSection.hidden = true;
  }
}
