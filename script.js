const form = document.querySelector("#form");
const checkBoxes = document.querySelectorAll("[data-checkbox]");
const selectBoxes = document.querySelectorAll("select");
const textInputs = document.querySelectorAll('[type="text"]');
const orderTotal = document.querySelector(".order-total");
const orderTotalInput = document.querySelector("[data-order-total-input]");

const SESSION_STORAGE_PREFIX = "SAUERS_PHOTOGRAPHY_SPORTS_ORDER_FORM";
const SESSION_STORAGE_KEY_PRODUCTS = `${SESSION_STORAGE_PREFIX}-SELECTED_PRODUCTS`;
const SESSION_STORAGE_KEY_CUSTOMER_INFO = `${SESSION_STORAGE_PREFIX}-CUSTOMER_INFO`;

let errorArray = [];
let traderCardsInOrder = false;
let totalPrice = 0;
let selectedProducts = loadSessionProductData();
let customerInfo = loadSessionCustomerData();

clearSelections();
loadProductSelections();
loadCustomerData();

form.addEventListener("click", (e) => {
  if (!e.target.matches("input[type='checkbox'")) return;
  selectProducts(e);
  calcPrice();
  checkForItemsInOrder();
  saveSessionData();
});

form.addEventListener("change", (e) => {
  if (!e.target.matches("select")) return;

  updateQuantity(e);
  calcPrice();
  saveSessionData();
});

form.addEventListener("change", (e) => {
  if (!e.target.matches("input[type='text']")) return;

  checkInputFields(e.target);

  const key = e.target.name;
  const value = e.target.value;

  customerInfo[key] = value;
  saveSessionData();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitForm();
});

function selectProducts(e) {
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
    quantitySelector.value = 1;
    selectedProducts = selectedProducts.filter(
      (product) => product.name !== e.target.name
    );
  }
}

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
  orderTotalInput.value = `Order Total: $${totalPrice} - Includes sales tax and $4 for shipping`;
}

function checkForItemsInOrder() {
  customerInfoSection = document.querySelector("#customer-info");

  if (selectedProducts.length === 0) {
    customerInfoSection.hidden = true;
  } else {
    customerInfoSection.hidden = false;
  }

  checkForTradersInOrder();
}

function checkForTradersInOrder() {
  traderCardsInOrder = selectedProducts.find(
    (entry) =>
      entry.name === "Package-C" || entry.name === "8-Deluxe-Trading-Cards"
  );

  const traderCardInfoSection = document.querySelector("#trader-card-info");
  const traderFields = traderCardInfoSection.querySelectorAll("input");

  if (traderCardsInOrder) {
    traderCardInfoSection.hidden = false;
    traderFields.forEach((field) => (field.disabled = false));
  } else {
    traderCardInfoSection.hidden = true;
    traderFields.forEach((field) => (field.disabled = true));
  }
}

function updateQuantity(e) {
  const id = e.target.name.replace("-Quantity", "");
  const productBox = e.target.closest(".product-box");
  const product = productBox.querySelector(`#Label-${id}`);

  if (e.target.checked === false) return;

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
}

function submitForm() {
  const customerInfoSection = document.querySelector("#customer-info");
  const customerInfoFields = customerInfoSection.querySelectorAll("input");
  let textFieldArray = Array.from(customerInfoFields);

  errorArray = [];

  if (!traderCardsInOrder) {
    textFieldArray = Array.from(customerInfoFields).filter(
      (entry) =>
        entry.name !== "name-athlete" &&
        entry.name !== "age" &&
        entry.name !== "height" &&
        entry.name !== "position" &&
        entry.name !== "coach"
    );
  }
  textFieldArray.forEach((field) => {
    checkInputFields(field);
  });

  if (errorArray.length !== 0) {
    errorArray[0].scrollIntoView();
    errorArray[0].focus();
  } else {
    form.submit();
    sessionStorage.removeItem(SESSION_STORAGE_KEY_PRODUCTS);
  }
}

function checkInputFields(field) {
  const fieldGroup = field.closest(".field-group");
  const fieldValue = field.value.trim();
  const label = fieldGroup.querySelector("label");
  const errorMessage = fieldGroup.querySelector("small");
  const errorMessageText = label.innerText;

  if (fieldValue === "") {
    fieldGroup.className = `field-group error`;
    errorMessage.innerText = `${errorMessageText} cannot be blank.`;
    errorArray.push(field);
  } else {
    fieldGroup.className = `field-group success`;
  }

  if (
    field.getAttribute("class") === "phone-field" &&
    fieldValue !== "" &&
    !isPhone(fieldValue)
  ) {
    fieldGroup.className = `field-group error`;
    errorMessage.innerText = `Not a valid phone number.`;
    errorArray.push(field);
  }

  if (
    field.getAttribute("class") === "email-field" &&
    fieldValue !== "" &&
    !isEmail(fieldValue)
  ) {
    fieldGroup.className = `field-group error`;
    errorMessage.innerText = `Not a valid email.`;
    errorArray.push(field);
  }
}

function isEmail(email) {
  // RFC2822 Email Validation from https://regexr.com/2rhq7
  return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(
    email
  );
}

function isPhone(phone) {
  // From stackoverflow: https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript/4338544#4338544
  return phone.match(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
}

function saveSessionData() {
  sessionStorage.setItem(
    SESSION_STORAGE_KEY_PRODUCTS,
    JSON.stringify(selectedProducts)
  );
  sessionStorage.setItem(
    SESSION_STORAGE_KEY_CUSTOMER_INFO,
    JSON.stringify(customerInfo)
  );
}

function loadSessionProductData() {
  const storedSessionProductData = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY_PRODUCTS)
  );
  return storedSessionProductData || [];
}

function loadSessionCustomerData() {
  const storedSessionCustomerData = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY_CUSTOMER_INFO)
  );
  return storedSessionCustomerData || {};
}

function loadProductSelections() {
  selectedProducts.forEach((entry) => {
    const id = entry.name;
    const productInput = document.querySelector(`input[name="${id}"]`);
    const productBox = productInput.closest(".product-box");
    const quantityLabel = productBox.querySelector(`#Label-${id}`);
    const quantitySelector = quantityLabel.querySelector("select");

    productInput.checked = true;
    quantityLabel.hidden = false;
    quantitySelector.disabled = false;
    quantitySelector.value = entry.quantity;
    calcPrice();
    checkForItemsInOrder();
  });
}

function loadCustomerData() {
  for (let entry in customerInfo) {
    const field = document.querySelector(`input[name="${entry}"]`);
    field.value = customerInfo[entry];
  }
}

function clearSelections() {
  checkBoxes.forEach((checkbox) => (checkbox.checked = false));
  selectBoxes.forEach((selectBox) => (selectBox.value = "1"));
  textInputs.forEach((input) => (input.value = ""));
}
