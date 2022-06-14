import { gsap } from 'gsap';

// import { ScrollToPlugin } from 'gsap/ScrollToPlugin.js';
// gsap.registerPlugin(ScrollToPlugin);

global.gsap = gsap;

gsap.defaults({
	overwrite: 'auto',
});

class ProjectApp {
	constructor() {
		this.env = require('./utils/env').default;
		this.utils = require('./utils/utils').default;
		this.classes = {
			Signal: require('./classes/Signal').default,
		};
		this.components = {};
		this.helpers = {};
		this.modules = {};
		document.addEventListener('DOMContentLoaded', () => {
			document.documentElement.classList.remove('_loading');
		});
	}
}

global.ProjectApp = new ProjectApp();

if (module.hot) {
	module.hot.accept();
}

document.addEventListener('DOMContentLoaded', () => {
	const gumbLink = document.querySelector('#js-gumb');
	const header = document.querySelector('.header');
	const basketLink = document.querySelector('#js-basket');
	const basketBlock = document.querySelector('.wrapper__basket');
	const bodyBlock = document.querySelector('body');

	const showMenu = e => {
		e.preventDefault();
		header.classList.toggle('is-open');
		bodyBlock.classList.toggle('hidden');
	};
	const showBasket = e => {
		e.preventDefault();
		basketBlock.classList.toggle('is-show');
		bodyBlock.classList.toggle('hidden');
	};
	const hideBasket = e => {
		if (e.target.classList.contains('overlay')) {
			basketBlock.classList.remove('is-show');
			bodyBlock.classList.remove('hidden');
		}
	};

	gumbLink.addEventListener('click', showMenu);

	if (window.innerWidth <= 992) {
		basketLink.addEventListener('click', showBasket);
		document.addEventListener('click', hideBasket);
	}

	if (module.hot) {
		module.hot.dispose(() => {
			gumbLink.removeEventListener('click', showMenu);
			basketLink.removeEventListener('click', showBasket);
		});
	}
});

const basket = document.querySelector('.basket');
const priceTotal = document.querySelector('.price_total');
const basketCounter = document.querySelector('#basket-counter');
const actionDecrement = 'minus';
const actionIncrement = 'plus';
let counter = 0;

const getItemSubtotal = input => Number(input.value) * Number(input.dataset.price);

const normalPrice = str => String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');

const total = subtotal => {
	const priceTax = Number(document.querySelector('.price_tax').textContent);
	const priceShipping = Number(document.querySelector('.price_shipping').textContent);

	priceTotal.textContent = normalPrice(priceTax + priceShipping + subtotal);

	if (module.hot) {
		module.hot.dispose(() => {
			priceTotal.parentNode.removeChild(priceTotal);
		});
	}
};

const counterCalc = product => {
	const value = Number(product.querySelector('.counter__input').value);
	counter += value;
};

const init = () => {
	const priceSubtotal = document.querySelector('.price_subtotal');
	let subtotal = 0;

	[...document.querySelectorAll('.product')].forEach(productItem => {
		const productItemCost = productItem.querySelector('.product__cost span');
		const productItemInput = productItem.querySelector('.counter__input');

		productItemCost.textContent = normalPrice(getItemSubtotal(productItemInput));
		subtotal += getItemSubtotal(productItemInput);
		counterCalc(productItem);

		if (module.hot) {
			module.hot.dispose(() => {
				productItemCost.parentNode.removeChild(productItemCost);
			});
		}
	});

	priceSubtotal.textContent = normalPrice(subtotal);
	basketCounter.textContent = counter;

	if (module.hot) {
		module.hot.dispose(() => {
			priceSubtotal.parentNode.removeChild(priceSubtotal);
			basketCounter.parentNode.removeChild(basketCounter);
		});
	}

	total(subtotal);
};

const emptyBasket = () => {
	if (basket) {
		const basketAreas = basket.querySelectorAll('.area');
		const basketEmpty = basket.querySelector('.basket__empty');

		basketAreas.forEach(area => {
			area.classList.add('hidden');
		});
		basketEmpty.classList.remove('hidden');
	}
};

const calc = (product, action) => {
	counter = 0;
	const counterInput = product.querySelector('.counter__input');

	switch (action) {
		case actionIncrement:
			counterInput.value++;
			break;
		case actionDecrement:
			counterInput.value--;
			break;
		default:
			counterInput.value = 1;
			break;
	}

	product.querySelector('.product__cost span').textContent = normalPrice(
		getItemSubtotal(counterInput)
	);
	if (module.hot) {
		module.hot.dispose(() => {
			product
				.querySelector('.product__cost span')
				.parentNode.removeChild(product.querySelector('.product__cost span'));
		});
	}

	init();

	if (counter === 0) emptyBasket();
};

const deleteProduct = product => {
	product.remove();
};

const actionCounterBtn = e => {
	const target = e.target;
	const currentButton = target.closest('button');
	const currentProduct = target.closest('.product');
	const currentDelBtn = target.closest('.product__delete-btn');

	if (currentButton) {
		if (currentButton.classList.contains('counter__button_dec')) {
			const inputValue = currentButton.closest('.counter').querySelector('.counter__input').value;

			if (Number(inputValue) === 1) {
				deleteProduct(currentProduct);
			}
			if (Number(inputValue) !== 0) {
				calc(currentProduct, actionDecrement);
			}
		}
		if (currentButton.classList.contains('counter__button_inc')) {
			calc(currentProduct, actionIncrement);
		}
	}
	if (currentDelBtn) {
		deleteProduct(currentProduct);
		calc(currentProduct, actionDecrement);
	}
};

document.querySelector('.product-list').addEventListener('click', actionCounterBtn);

if (module.hot) {
	module.hot.dispose(() => {
		document.querySelector('.product-list').removeEventListener('click', actionCounterBtn);
	});
}

init();
