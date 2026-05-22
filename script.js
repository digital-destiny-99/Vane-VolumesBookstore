// Vane & Volume
// Menu, cart, forms and small page notes.

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    setCurrentPage();
    setupMobileMenu();
    setupNewsletter();
    setupCart();
    setupCustomOrderForm();
    setupDonationForm();
    setupStreetNote();
  });

  function setCurrentPage() {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    var navLinks = document.querySelectorAll("nav a");

    for (var i = 0; i < navLinks.length; i++) {
      if (navLinks[i].getAttribute("href") === currentPage) {
        navLinks[i].classList.add("active-page");
        navLinks[i].setAttribute("aria-current", "page");
      }
    }
  }

  function setupMobileMenu() {
    var menuButton = document.getElementById("menuButton");
    var menuLinks = document.getElementById("burgermenulinks");

    if (!menuButton || !menuLinks) return;

    function openMenu() {
      menuLinks.classList.add("show");
      menuLinks.removeAttribute("hidden");
      menuButton.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      menuLinks.classList.remove("show");
      menuLinks.setAttribute("hidden", "");
      menuButton.setAttribute("aria-expanded", "false");
    }

    closeMenu();

    menuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    var menuItems = menuLinks.querySelectorAll("a");
    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener("click", closeMenu);
    }

    document.addEventListener("click", function (event) {
      var clickedInside = menuButton.contains(event.target) || menuLinks.contains(event.target);
      if (!clickedInside) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function setupNewsletter() {
    var form = document.getElementById("subscribeForm");
    var emailInput = document.getElementById("email");
    var message = document.getElementById("subscribeMessage");

    if (!form || !emailInput || !message) return;

    var savedEmail = getSavedItem("vaneVolumeEmail");
    if (savedEmail) {
      emailInput.value = savedEmail;
      message.textContent = "You are already on the shop list.";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = emailInput.value.trim();

      if (!email) {
        message.textContent = "Add an email first.";
        emailInput.focus();
        return;
      }

      saveItem("vaneVolumeEmail", email);
      message.textContent = "You are on the list. No spam. Just shelf notes.";
      form.reset();
    });
  }

  function setupCart() {
    var cartModal = document.getElementById("cart-modal");
    var cartItemsList = document.getElementById("cart-items");
    var openCartBtn = document.getElementById("open-cart");
    var closeCartBtn = document.getElementById("close-cart-modal");
    var clearCartBtn = document.getElementById("clear-cart-button");
    var processOrderBtn = document.getElementById("process-order-button");
    var addButtons = document.querySelectorAll(".add-to-cart-button, .gallery-btn[data-item]");

    var cartItems = readCart();
    var lastFocus = null;

    updateCartButton();

    function readCart() {
      var savedCart = getSavedItem("vaneVolumeCart");

      if (!savedCart) return [];

      try {
        var parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      } catch (error) {
        return [];
      }
    }

    function saveCart() {
      saveItem("vaneVolumeCart", JSON.stringify(cartItems));
      updateCartButton();
    }

    function updateCartButton() {
      if (!openCartBtn) return;

      var count = cartItems.length;
      openCartBtn.textContent = count === 0 ? "View Cart" : "View Cart (" + count + ")";
      openCartBtn.setAttribute(
        "aria-label",
        count === 0 ? "View cart" : "View cart with " + count + " saved item" + (count === 1 ? "" : "s")
      );
    }

    function renderCart() {
      if (!cartItemsList) return;

      cartItemsList.innerHTML = "";

      if (cartItems.length === 0) {
        var emptyItem = document.createElement("li");
        emptyItem.textContent = "No books saved yet.";
        cartItemsList.appendChild(emptyItem);
        return;
      }

      for (var i = 0; i < cartItems.length; i++) {
        addCartRow(cartItems[i], i);
      }
    }

    function addCartRow(item, index) {
      var listItem = document.createElement("li");
      var itemName = document.createElement("span");
      var removeButton = document.createElement("button");

      itemName.textContent = item;

      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.className = "remove-cart-item";
      removeButton.setAttribute("aria-label", "Remove " + item);

      removeButton.addEventListener("click", function () {
        cartItems.splice(index, 1);
        saveCart();
        renderCart();
      });

      listItem.appendChild(itemName);
      listItem.appendChild(removeButton);
      cartItemsList.appendChild(listItem);
    }

    function openModal() {
      if (!cartModal) return;

      lastFocus = document.activeElement;
      renderCart();
      cartModal.style.display = "block";
      cartModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      var firstFocusable = getFocusableItems(cartModal)[0];
      if (firstFocusable) firstFocusable.focus();

      cartModal.addEventListener("keydown", trapFocus);
    }

    function closeModal() {
      if (!cartModal) return;

      cartModal.style.display = "none";
      cartModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      cartModal.removeEventListener("keydown", trapFocus);

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      } else if (openCartBtn) {
        openCartBtn.focus();
      }
    }

    function trapFocus(event) {
      if (event.key !== "Tab") return;

      var focusable = getFocusableItems(cartModal);
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    for (var i = 0; i < addButtons.length; i++) {
      setupAddButton(addButtons[i]);
    }

    function setupAddButton(button) {
      var originalText = button.textContent.trim();

      button.addEventListener("click", function () {
        var card = button.closest ? button.closest(".product-card") : null;
        var title = card ? card.querySelector("h3") : null;
        var itemName = button.getAttribute("data-item") || (title ? title.textContent.trim() : "Shop item");

        cartItems.push(itemName);
        saveCart();

        button.textContent = "Added";
        button.classList.add("is-added");
        button.setAttribute("aria-label", itemName + " added to cart");

        window.setTimeout(function () {
          button.textContent = originalText;
          button.classList.remove("is-added");
          button.setAttribute("aria-label", "Add " + itemName + " to cart");
        }, 1200);
      });
    }

    if (openCartBtn) openCartBtn.addEventListener("click", openModal);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeModal);

    if (cartModal) {
      cartModal.setAttribute("aria-hidden", "true");

      cartModal.addEventListener("click", function (event) {
        if (event.target === cartModal) closeModal();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && cartModal && cartModal.style.display === "block") {
        closeModal();
      }
    });

    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", function () {
        cartItems = [];
        saveCart();
        renderCart();
        flashButtonText(clearCartBtn, "Cleared", "Clear Cart");
      });
    }

    if (processOrderBtn) {
      processOrderBtn.addEventListener("click", function () {
        cartItems = [];
        saveCart();
        renderCart();
        closeModal();
        showPageMessage("Order received. We will be in touch shortly.");
      });
    }
  }

  function setupCustomOrderForm() {
    var form = document.getElementById("custom-order-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var orderData = {
        name: getInputValue("customer-name"),
        email: getInputValue("customer-email"),
        phone: getInputValue("customer-phone"),
        message: getInputValue("custom-message"),
        customOrder: isChecked("custom-order-check")
      };

      saveItem("vaneVolumeCustomOrder", JSON.stringify(orderData));
      showFormMessage(form, "Message received. We will follow up within two business days.");
      form.reset();
    });
  }

  function setupDonationForm() {
    var form = document.getElementById("donation-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showFormMessage(form, "Donation noted. Bring your books in anytime. Your voucher will be waiting.");
      form.reset();
    });
  }

  function setupStreetNote() {
    var note = document.querySelector(".top-note p");
    if (!note) return;

    var notes = [
      "Independent bookstore · alley light · sharp little shelves",
      "New arrivals · small press finds · quiet recommendations",
      "Open for browsers, note-takers and paperback loyalists",
      "Vane & Volume · books with a little nerve"
    ];

    var index = 0;

    window.setInterval(function () {
      note.style.opacity = "0";

      window.setTimeout(function () {
        index = (index + 1) % notes.length;
        note.textContent = notes[index];
        note.style.opacity = "1";
      }, 250);
    }, 4200);
  }

  function getFocusableItems(container) {
    if (!container) return [];

    var items = container.querySelectorAll(
      "button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    var visibleItems = [];

    for (var i = 0; i < items.length; i++) {
      if (items[i].offsetParent !== null || items[i] === document.activeElement) {
        visibleItems.push(items[i]);
      }
    }

    return visibleItems;
  }

  function showFormMessage(form, text) {
    var message = form.querySelector(".form-confirm");

    if (!message) {
      message = document.createElement("p");
      message.className = "form-confirm form-message";
      message.setAttribute("aria-live", "polite");
      form.appendChild(message);
    }

    message.textContent = text;
    message.style.opacity = "1";

    window.setTimeout(function () {
      message.style.opacity = "0";
    }, 6000);
  }

  function showPageMessage(text) {
    var banner = document.getElementById("page-message");

    if (!banner) {
      banner = document.createElement("div");
      banner.id = "page-message";
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
      banner.style.cssText =
        "position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--ink);font-family:var(--font-ui);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;z-index:2000;opacity:0;transition:opacity 0.3s ease;max-width:calc(100% - 32px);text-align:center;";
      document.body.appendChild(banner);
    }

    banner.textContent = text;
    banner.style.opacity = "1";

    window.setTimeout(function () {
      banner.style.opacity = "0";
    }, 4000);
  }

  function flashButtonText(button, newText, oldText) {
    button.textContent = newText;

    window.setTimeout(function () {
      button.textContent = oldText;
    }, 1200);
  }

  function getInputValue(id) {
    var input = document.getElementById(id);
    return input ? input.value.trim() : "";
  }

  function isChecked(id) {
    var input = document.getElementById(id);
    return input ? input.checked : false;
  }

  function getSavedItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function saveItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return false;
    }

    return true;
  }
})();