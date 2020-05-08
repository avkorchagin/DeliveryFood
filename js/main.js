"use strict";

//Константы
const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const loginForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");
const restaurantTitle = document.querySelector(".restaurant-title");
const rating = document.querySelector(".rating");
const minPrice = document.querySelector(".price");
const category = document.querySelector(".category");
const inputSearch = document.querySelector(".input-search");
const modalBody = document.querySelector(".modal-body");
const modalPrice = document.querySelector(".modal-pricetag");
const buttonClearCart = document.querySelector(".clear-cart");
const cart = [];

//Переменные
let login = localStorage.getItem("userLogin");

//Функции
const getData = async function (url) {
  const response = await window.fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url},
    статус ошибка ${response}!`);
  }
  return await response.json();
};

const toggleModal = function () {
  modal.classList.toggle("is-open");
};

const toggleModalAuth = function () {
  loginInput.style.borderColor = "";
  modalAuth.classList.toggle("is-open");
};

const returnMain = function () {
  containerPromo.classList.remove("hide");
  restaurants.classList.remove("hide");
  menu.classList.add("hide");
};

function authorized() {
  function logOut() {
    login = null;
    localStorage.removeItem("userLogin");
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    cartButton.style.display = "";
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
    returnMain();
  }
  console.log("Авторизован");
  userName.textContent = login;
  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "flex";
  cartButton.style.display = "flex";
  buttonOut.addEventListener("click", logOut);
}

function notAuthorized() {
  console.log("Не авторизован");

  function logIn(event) {
    event.preventDefault();
    login = loginInput.value;

    if (loginInput.value.trim()) {
      localStorage.setItem("userLogin", login);

      toggleModalAuth();
      buttonAuth.removeEventListener("click", toggleModalAuth);
      closeAuth.removeEventListener("click", toggleModalAuth);
      loginForm.removeEventListener("submit", logIn);
      loginForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = "tomato";
    }
  }

  buttonAuth.addEventListener("click", toggleModalAuth);
  closeAuth.addEventListener("click", toggleModalAuth);
  loginForm.addEventListener("submit", logIn);
}

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function createCardRestaurant({
  image,
  kitchen,
  name,
  price,
  products,
  stars,
  time_of_delivery: timeOfDelivery,
}) {
  const card = document.createElement("a");
  card.classList.add("card");
  card.classList.add("card-restaurant");
  card.className = "card card-restaurant";
  card.products = products;
  card.info = [name, price, stars, kitchen];

  card.insertAdjacentHTML(
    "beforeend",
    `
		<img
				src="${image}"
				alt="image"
				class="card-image"
		/>
      <div class="card-text">
         <div class="card-heading">
            <h3 class="card-title">${name}</h3>
            <span class="card-tag tag">${timeOfDelivery} мин</span>
         </div>
         <div class="card-info">
            <div class="rating">
            ${stars}
            </div>
            <div class="price">От ${price} ₽</div>
            <div class="category">${kitchen}</div>
         </div>
      </div>
    `
  );

  cardsRestaurants.insertAdjacentElement("beforeend", card);
}

function openGoods(event) {
  const target = event.target;

  const restaurant = target.closest(".card-restaurant");

  if (restaurant) {
    const [name, price, stars, kitchen] = restaurant.info;

    cardsMenu.textContent = "";
    containerPromo.classList.add("hide");
    restaurants.classList.add("hide");
    menu.classList.remove("hide");

    restaurantTitle.textContent = name;
    rating.textContent = stars;
    minPrice.textContent = `От ${price} ₽`;
    category.textContent = kitchen;

    getData(`./db/${restaurant.products}`).then(function (data) {
      data.forEach(createCardGood);
    });
  } else {
    toggleModalAuth();
  }
}

function createCardGood({ description, id, image, name, price }) {
  const card = document.createElement("div");
  card.className = "card";

  card.insertAdjacentHTML(
    "beforeend",
    `
   <img
   src="${image}"
   alt="image"
   class="card-image"
   />
   <div class="card-text">
      <div class="card-heading">
      <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
      <div class="ingredients">
         ${description}
      </div>
      </div>
      <div class="card-buttons">
      <button class="button button-primary button-add-cart" id="${id}">
         <span class="button-card-text">В корзину</span>
         <span class="button-cart-svg"></span>
      </button>
      <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
   </div>
   `
  );

  cardsMenu.insertAdjacentElement("beforeend", card);
}

function addToCart(event) {
  const target = event.target;
  const buttonAddToCart = target.closest(".button-add-cart");
  if (buttonAddToCart) {
    const card = target.closest(".card");
    const title = card.querySelector(".card-title-reg").textContent;
    const cost = card.querySelector(".card-price").textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function (item) {
      return item.id === id;
    });
    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      });
    }

    console.log(cart);
  }
}

function renderCart() {
  modalBody.textContent = "";

  cart.forEach(function ({ id, title, cost, count }) {
    const itemCart = `	
		<div class="food-row">
		<span class="food-name">${title}</span>
		<strong class="food-price">${cost}</strong>
		<div class="food-counter">
			<button class="counter-button counter-minus" data-id=${id}>-</button>
			<span class="counter">${count}</span>
			<button class="counter-button counter-plus" data-id=${id}>+</button>
		</div>
		</div>
  	`;
    modalBody.insertAdjacentHTML("afterbegin", itemCart);
  });

  const totalPrice = cart.reduce(function (result, item) {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  modalPrice.textContent = totalPrice + " ₽";
}

function changeCount(event) {
  const target = event.target;

  if (target.classList.contains("counter-button")) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains("counter-minus")) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains("counter-plus")) food.count++;
    renderCart();
  }
}

function init() {
  getData("./db/partners.json").then(function (data) {
    data.forEach(createCardRestaurant);
  });

  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener("click", function () {
    cart.length = 0;
    toggleModal();
  });

  modalBody.addEventListener("click", changeCount);

  cardsMenu.addEventListener("click", addToCart);

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener("click", openGoods);

  logo.addEventListener("click", returnMain);

  inputSearch.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      const target = event.target;
      const goods = [];

      getData("./db/partners.json").then(function (data) {
        const products = data.map(function (item) {
          return item.products;
        });

        products.forEach(function (product) {
          getData(`./db/${product}`).then(function (data) {
            goods.push(...[data]);

            cardsMenu.textContent = "";

            containerPromo.classList.add("hide");
            restaurants.classList.add("hide");
            menu.classList.remove("hide");

            restaurantTitle.textContent = `Результат поиска`;
            rating.textContent = ``;
            minPrice.textContent = ``;
            category.textContent = ``;
          });
        });
      });
    }
  });

  checkAuth();

  new Swiper(".swiper-container", {
    loop: true,
    sliderPerView: 1,
    speed: 2000,
    spaceBetween: 100,
    autoplay: {
      delay: 3000,
    },
  });
}

init();
