console.log("Book Haven script loaded.");

const subscribeButtons = document.querySelectorAll("footer button");

subscribeButtons.forEach(function(button) {
    if (button.textContent.trim() === "Subscribe") {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            alert("Thank you for subscribing.");
        });
    }
});

// Shopping cart using sessionStorage
let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];

function saveCartItems() {
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function displayCartItems() {
    const cartList = document.getElementById("cart-items");

    if (!cartList) {
        return;
    }

    cartList.innerHTML = "";

    if (cartItems.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "Your cart is empty.";
        cartList.appendChild(emptyMessage);
        return;
    }

    cartItems.forEach(function(item) {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        cartList.appendChild(listItem);
    });
}

function openCartModal() {
    const cartModal = document.getElementById("cart-modal");

    if (cartModal) {
        displayCartItems();
        cartModal.style.display = "block";
    }
}

function closeCartModal() {
    const cartModal = document.getElementById("cart-modal");

    if (cartModal) {
        cartModal.style.display = "none";
    }
}

//* Wait til page content loads
document.addEventListener("DOMContentLoaded", function() {

    // Gallery page buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
    const viewCartButton = document.getElementById("view-cart-button");
    const closeCartButton = document.getElementById("close-cart-modal");
    const clearCartButton = document.getElementById("clear-cart-button");
    const processOrderButton = document.getElementById("process-order-button");

    addToCartButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const itemName = button.getAttribute("data-item");

            cartItems.push(itemName);
            saveCartItems();

            alert(itemName + " added to the cart.");
        });
    });

    if (viewCartButton) {
        viewCartButton.addEventListener("click", function() {
            openCartModal();
        });
    }

    if (closeCartButton) {
        closeCartButton.addEventListener("click", function() {
            closeCartModal();
        });
    }

    if (clearCartButton) {
        clearCartButton.addEventListener("click", function() {
            cartItems = [];
            sessionStorage.removeItem("cartItems");
            displayCartItems();
            alert("Cart cleared.");
        });
    }

    if (processOrderButton) {
        processOrderButton.addEventListener("click", function() {
            cartItems = [];
            sessionStorage.removeItem("cartItems");
            displayCartItems();
            alert("Thank you for your order.");
            closeCartModal();
        });
    }

    //* About page custom order form using localStorage
    const customOrderForm = document.getElementById("custom-order-form");

    if (customOrderForm) {
        customOrderForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const customOrderInfo = {
                name: document.getElementById("customer-name").value,
                email: document.getElementById("customer-email").value,
                phone: document.getElementById("customer-phone").value,
                message: document.getElementById("custom-message").value,
                customOrder: document.getElementById("custom-order-check").checked
            };

            localStorage.setItem("customOrderInfo", JSON.stringify(customOrderInfo));

            alert("Thank you. Your custom order information has been saved.");

            customOrderForm.reset();
        });
    }
});