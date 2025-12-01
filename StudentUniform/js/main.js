// main.js - logic giao diện & nghiệp vụ frontend chính

document.addEventListener("DOMContentLoaded", function () {
  buildHeaderAndFooter();
  initHeaderInteractions();
  updateCartCountBadge();

  var pageType = document.body.dataset.page || "";

  if (pageType === "home") {
    initHomePage();
  } else if (
    pageType === "primary" ||
    pageType === "secondary" ||
    pageType === "kindergarten" ||
    pageType === "custom" ||
    pageType === "accessories"
  ) {
    initCategoryPage(pageType);
  } else if (pageType === "product-detail") {
    initProductDetailPage();
  } else if (pageType === "cart") {
    initCartPage();
  } else if (pageType === "checkout") {
    initCheckoutPage();
  } else if (pageType === "confirmation") {
    // Không cần init nhiều, nhưng vẫn update badge
  }
});

/* -------------------- Header & Footer -------------------- */

/**
 * Sinh HTML header & footer dùng chung cho tất cả các trang.
 */
function buildHeaderAndFooter() {
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="site-header-container" role="banner">' +
      '  <div class="site-header-inner">' +
      '    <a href="index.html" class="logo" aria-label="Trang chủ EDU Uniform">' +
      '      EDU <span>Uniform</span>' +
      "    </a>" +
      '    <nav class="main-nav" aria-label="Điều hướng chính">' +
      "      <ul>" +
      '        <li><a href="index.html">Trang chủ</a></li>' +
      '        <li><a href="uniform-primary.html">Tiểu học</a></li>' +
      '        <li><a href="uniform-secondary.html">THCS</a></li>' +
      '        <li><a href="uniform-kindergarten.html">Mầm non</a></li>' +
      '        <li><a href="custom-orders.html">Thiết kế riêng</a></li>' +
      '        <li><a href="accessories.html">Phụ kiện</a></li>' +
      "      </ul>" +
      "    </nav>" +
      '    <div class="header-right">' +
      '      <form class="search-form" id="search-form" role="search">' +
      '        <label class="hidden" for="search-input">Tìm kiếm sản phẩm</label>' +
      '        <input type="search" id="search-input" placeholder="Tìm sản phẩm..." />' +
      '        <button type="submit">Tìm</button>' +
      "      </form>" +
      '      <a href="cart.html" class="cart-icon" aria-label="Xem giỏ hàng">' +
      '        <span>🛒</span>' +
      '        <span class="cart-count" id="cart-count">0</span>' +
      "      </a>" +
      '      <button class="hamburger-btn" id="hamburger-btn" aria-label="Mở menu" aria-expanded="false">' +
      "        <span></span><span></span><span></span>" +
      "      </button>" +
      "    </div>" +
      "  </div>" +
      '  <nav class="mobile-nav" id="mobile-nav" aria-label="Menu di động">' +
      "    <ul>" +
      '      <li><a href="index.html">Trang chủ</a></li>' +
      '      <li><a href="uniform-primary.html">Tiểu học</a></li>' +
      '      <li><a href="uniform-secondary.html">THCS</a></li>' +
      '      <li><a href="uniform-kindergarten.html">Mầm non</a></li>' +
      '      <li><a href="custom-orders.html">Thiết kế riêng</a></li>' +
      '      <li><a href="accessories.html">Phụ kiện</a></li>' +
      '      <li><a href="cart.html">Giỏ hàng</a></li>' +
      "    </ul>" +
      "  </nav>" +
      "</div>";
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML =
      '<div class="site-footer">' +
      '  <div class="site-footer-inner">' +
      '    <div class="footer-columns">' +
      '      <div>' +
      "        <h3>EDU Uniform</h3>" +
      '        <p class="small-text">Giải pháp đồng phục học sinh chuyên nghiệp cho các trường Mầm non, Tiểu học, THCS.</p>' +
      "      </div>" +
      '      <div>' +
      "        <h3>Liên kết</h3>" +
      '        <p><a href="index.html">Trang chủ</a></p>' +
      '        <p><a href="uniform-primary.html">Đồng phục Tiểu học</a></p>' +
      '        <p><a href="uniform-secondary.html">Đồng phục THCS</a></p>' +
      '        <p><a href="uniform-kindergarten.html">Đồng phục Mầm non</a></p>' +
      '        <p><a href="custom-orders.html">Thiết kế riêng</a></p>' +
      '        <p><a href="accessories.html">Phụ kiện</a></p>' +
      '        <p><a href="cart.html">Giỏ hàng</a> · <a href="checkout.html">Thanh toán</a></p>' +
      "      </div>" +
      '      <div>' +
      "        <h3>Liên hệ</h3>" +
      '        <p class="small-text">Hotline: 0123 456 789</p>' +
      '        <p class="small-text">Email: contact@edu-uniform.vn</p>' +
      '        <p class="small-text">Địa chỉ: 123 Đường Đồng Phục, Quận 1, TP. Hồ Chí Minh</p>' +
      "      </div>" +
      "    </div>" +
      '    <div class="footer-bottom">' +
      "      <p>© " +
      new Date().getFullYear() +
      " EDU Uniform. Website demo mô phỏng quy trình mua hàng.</p>" +
      "    </div>" +
      "  </div>" +
      "</div>";
  }
}

/**
 * Khởi tạo tương tác header: menu mobile, form search.
 */
function initHeaderInteractions() {
  var hamburgerBtn = document.getElementById("hamburger-btn");
  var mobileNav = document.getElementById("mobile-nav");

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("search-input");
      var term = (input && input.value) ? input.value.trim() : "";
      handleGlobalSearch(term);
    });
  }
}

/* -------------------- Search logic -------------------- */

/**
 * Search toàn cục: nếu đang đứng ở trang có danh sách (home + category),
 * thì filter ngay trên trang. Nếu không, lưu query rồi chuyển về index.
 */
function handleGlobalSearch(term) {
  var pageType = document.body.dataset.page || "";
  if (!term) {
    // Reset search nếu để trống
    if (pageType === "home" || isCategoryPage(pageType)) {
      renderListForPage(pageType, null); // null = không filter
      showToast("Đã hiển thị lại tất cả sản phẩm.");
      return;
    }
    localStorage.removeItem("globalSearchQuery");
    window.location.href = "index.html";
    return;
  }

  if (pageType === "home" || isCategoryPage(pageType)) {
    renderListForPage(pageType, term);
  } else {
    localStorage.setItem("globalSearchQuery", term);
    window.location.href = "index.html";
  }
}

/**
 * Kiểm tra có phải trang category.
 */
function isCategoryPage(pageType) {
  return (
    pageType === "primary" ||
    pageType === "secondary" ||
    pageType === "kindergarten" ||
    pageType === "custom" ||
    pageType === "accessories"
  );
}

/* -------------------- Cart icon -------------------- */

/**
 * Cập nhật số lượng trên icon giỏ hàng.
 */
function updateCartCountBadge() {
  var badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = getCartItemCount();
}

/* -------------------- Toast -------------------- */

/**
 * Hiển thị toast nhỏ khi thêm vào giỏ, v.v.
 */
function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}

/* -------------------- Render product list -------------------- */

/**
 * Trả về danh sách sản phẩm theo pageType.
 */
function getBaseProductsForPage(pageType) {
  if (pageType === "primary") {
    return getProductsByCategory("Tiểu học");
  }
  if (pageType === "secondary") {
    return getProductsByCategory("THCS");
  }
  if (pageType === "kindergarten") {
    return getProductsByCategory("Mầm non");
  }
  if (pageType === "custom") {
    return getProductsByCategory("Thiết kế riêng");
  }
  if (pageType === "accessories") {
    return getProductsByCategory("Phụ kiện");
  }
  // Home: tất cả
  return PRODUCTS.slice();
}

/**
 * Khởi tạo trang chủ.
 * - Hiển thị tối đa 6 sản phẩm, có nút "Xem thêm".
 * - Nếu có searchQuery global thì filter.
 */
function initHomePage() {
  var query = localStorage.getItem("globalSearchQuery") || "";
  var input = document.getElementById("search-input");
  if (query && input) {
    input.value = query;
  }

  renderListForPage("home", query || null);
}

/**
 * Khởi tạo trang category.
 */
function initCategoryPage(pageType) {
  renderListForPage(pageType, null);
}

/**
 * Render list cho pageType, với searchTerm (có thể null).
 * Có load-more nếu nhiều hơn 6 item.
 */
function renderListForPage(pageType, searchTerm) {
  var container = document.getElementById("product-list");
  if (!container) return;

  var products = getBaseProductsForPage(pageType);

  // Nếu search, filter theo tên & category
  if (searchTerm) {
    var termLower = searchTerm.toLowerCase();
    products = PRODUCTS.filter(function (p) {
      return (
        p.name.toLowerCase().indexOf(termLower) !== -1 ||
        p.category.toLowerCase().indexOf(termLower) !== -1
      );
    });
    showToast("Đã lọc theo: " + searchTerm);
  }

  container.innerHTML = "";

  var loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.classList.add("hidden");
  }

  // Phân trang đơn giản: hiển thị 6, nếu >6 thì ẩn phần còn lại và bật nút
  var initialCount = 6;
  var hasMore = products.length > initialCount;

  var visibleProducts = hasMore ? products.slice(0, initialCount) : products.slice();

  visibleProducts.forEach(function (product) {
    container.appendChild(createProductCardElement(product));
  });

  if (hasMore && loadMoreBtn) {
    loadMoreBtn.classList.remove("hidden");
    loadMoreBtn.onclick = function () {
      // Render thêm phần còn lại
      products.slice(initialCount).forEach(function (product) {
        container.appendChild(createProductCardElement(product));
      });
      loadMoreBtn.classList.add("hidden");
    };
  }

  // Xóa query global sau khi render search trên home
  if (pageType === "home" && searchTerm) {
    localStorage.removeItem("globalSearchQuery");
  }
}

/**
 * Tạo element card cho 1 sản phẩm.
 */
function createProductCardElement(product) {
  var card = document.createElement("article");
  card.className = "product-card";
  card.setAttribute("data-product-id", product.id);

  card.innerHTML =
    '<div class="product-image-wrapper">' +
    '  <img src="' +
    product.image +
    '" alt="' +
    product.name +
    '" />' +
    "</div>" +
    '<div class="product-card-body">' +
    '  <p class="product-name">' +
    product.name +
    "</p>" +
    '  <p class="product-category">' +
    product.category +
    "</p>" +
    '  <p class="product-price">' +
    formatPrice(product.price) +
    "</p>" +
    '  <div class="product-card-actions">' +
    '    <a href="' +
    product.detailPage +
    '" class="btn btn-outline">Xem chi tiết</a>' +
    '    <button type="button" class="btn btn-primary js-add-to-cart-list">Thêm</button>' +
    "  </div>" +
    "</div>";

  // Thêm event cho nút "Thêm"
  var addBtn = card.querySelector(".js-add-to-cart-list");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      // Mặc định size M, số lượng 1 khi thêm từ list
      addToCart(product.id, "M", 1);
      updateCartCountBadge();
      showToast('Đã thêm "' + product.name + '" (size M) vào giỏ.');
    });
  }

  return card;
}

/* -------------------- Product detail page -------------------- */

/**
 * Khởi tạo trang chi tiết sản phẩm:
 * - Lấy id từ body data-product-id
 * - Render thông tin
 * - Render gallery giả (3 ảnh giống nhau)
 * - Xử lý form thêm vào giỏ
 */
function initProductDetailPage() {
  var productId = document.body.dataset.productId;
  if (!productId) return;
  var product = getProductById(productId);
  if (!product) return;

  var nameEl = document.getElementById("product-name");
  var categoryEl = document.getElementById("product-category");
  var priceEl = document.getElementById("product-price");
  var descEl = document.getElementById("product-description");
  var stockEl = document.getElementById("product-stock");
  var mainImage = document.getElementById("main-image");
  var thumbRow = document.getElementById("thumbnail-row");
  var breadcrumbName = document.getElementById("breadcrumb-product-name");

  if (nameEl) nameEl.textContent = product.name;
  if (categoryEl) categoryEl.textContent = product.category;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (descEl) descEl.textContent = product.description;
  if (stockEl) stockEl.textContent = "Số lượng còn: " + product.stock;
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  if (mainImage) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  // Gallery: 3 thumbnail (demo, dùng cùng 1 ảnh hoặc biến thể)
  if (thumbRow && mainImage) {
    thumbRow.innerHTML = "";
    var urls = [
      product.image,
      product.image + "&var=1",
      product.image + "&var=2"
    ];
    urls.forEach(function (url, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      if (index === 0) btn.classList.add("active");

      btn.innerHTML =
        '<img src="' +
        url +
        '" alt="Xem ảnh ' +
        (index + 1) +
        ' của ' +
        product.name +
        '"/>';

      btn.addEventListener("click", function () {
        mainImage.src = url;
        var allButtons = thumbRow.querySelectorAll("button");
        allButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      });

      thumbRow.appendChild(btn);
    });
  }

  // Xử lý form thêm vào giỏ
  var form = document.getElementById("add-to-cart-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var sizeSelect = document.getElementById("size");
      var qtyInput = document.getElementById("quantity");
      if (!sizeSelect || !qtyInput) return;

      var size = sizeSelect.value;
      var qty = parseInt(qtyInput.value, 10);
      if (!size) {
        showToast("Vui lòng chọn size.");
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        showToast("Số lượng không hợp lệ.");
        return;
      }

      addToCart(product.id, size, qty);
      updateCartCountBadge();
      showToast('Đã thêm "' + product.name + '" vào giỏ.');
    });
  }
}

/* -------------------- Cart page -------------------- */

/**
 * Khởi tạo trang giỏ hàng:
 * - Render bảng item
 * - Cho phép cập nhật số lượng, xóa item
 */
function initCartPage() {
  renderCartTable();

  // Lắng nghe thay đổi số lượng & nút xóa (event delegation)
  var tbody = document.getElementById("cart-items");
  if (!tbody) return;

  tbody.addEventListener("change", function (e) {
    var target = e.target;
    if (target.matches(".js-cart-qty")) {
      var productId = target.getAttribute("data-product-id");
      var size = target.getAttribute("data-size");
      var qty = target.value;
      updateCartItemQuantity(productId, size, qty);
      renderCartTable();
      updateCartCountBadge();
      showToast("Đã cập nhật số lượng.");
    }
  });

  tbody.addEventListener("click", function (e) {
    var target = e.target;
    if (target.matches(".js-cart-remove")) {
      var productId = target.getAttribute("data-product-id");
      var size = target.getAttribute("data-size");
      removeFromCart(productId, size);
      renderCartTable();
      updateCartCountBadge();
      showToast("Đã xóa sản phẩm khỏi giỏ.");
    }
  });
}

/**
 * Render lại bảng giỏ hàng & tổng tiền.
 */
function renderCartTable() {
  var tbody = document.getElementById("cart-items");
  var totalEl = document.getElementById("cart-total");
  if (!tbody || !totalEl) return;

  var items = getCartItems();
  tbody.innerHTML = "";

  if (items.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6">Giỏ hàng trống. Hãy chọn sản phẩm để mua.</td></tr>';
    totalEl.textContent = formatPrice(0);
    return;
  }

  items.forEach(function (item) {
    var product = getProductById(item.productId);
    if (!product) return;

    var row = document.createElement("tr");
    var linePrice = product.price * item.quantity;

    row.innerHTML =
      "<td>" +
      product.name +
      "</td>" +
      "<td>" +
      item.size +
      "</td>" +
      "<td>" +
      formatPrice(product.price) +
      "</td>" +
      '<td><input type="number" class="js-cart-qty" data-product-id="' +
      item.productId +
      '" data-size="' +
      item.size +
      '" min="1" value="' +
      item.quantity +
      '" /></td>' +
      "<td>" +
      formatPrice(linePrice) +
      "</td>" +
      '<td><button type="button" class="btn btn-secondary js-cart-remove" data-product-id="' +
      item.productId +
      '" data-size="' +
      item.size +
      '">Xóa</button></td>';

    tbody.appendChild(row);
  });

  totalEl.textContent = formatPrice(getCartTotalPrice());
}

/* -------------------- Checkout page -------------------- */

/**
 * Khởi tạo trang checkout:
 * - Hiển thị tóm tắt giỏ hàng
 * - Validate form và mô phỏng đặt hàng
 */
function initCheckoutPage() {
  renderCheckoutSummary();

  var form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = validateCheckoutForm();
    if (!valid) return;

    // Mô phỏng đặt hàng: xóa giỏ + chuyển sang trang xác nhận
    clearCart();
    updateCartCountBadge();
    window.location.href = "order-confirmation.html";
  });
}

/**
 * Render tóm tắt giỏ trên sidebar.
 */
function renderCheckoutSummary() {
  var list = document.getElementById("checkout-summary-list");
  var totalEl = document.getElementById("checkout-total");
  if (!list || !totalEl) return;

  var items = getCartItems();
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = "<li>Giỏ hàng trống.</li>";
    totalEl.textContent = formatPrice(0);
    return;
  }

  items.forEach(function (item) {
    var product = getProductById(item.productId);
    if (!product) return;
    var li = document.createElement("li");
    li.textContent =
      product.name +
      " - size " +
      item.size +
      " x " +
      item.quantity +
      " (" +
      formatPrice(product.price * item.quantity) +
      ")";
    list.appendChild(li);
  });

  totalEl.textContent = formatPrice(getCartTotalPrice());
}

/**
 * Validate form checkout. Trả về true nếu hợp lệ, ngược lại false.
 * Có hiển thị message lỗi bên dưới từng field.
 */
function validateCheckoutForm() {
  var fullName = document.getElementById("fullName");
  var email = document.getElementById("email");
  var address = document.getElementById("address");
  var paymentMethod = document.getElementById("paymentMethod");

  var errorName = document.getElementById("error-fullName");
  var errorEmail = document.getElementById("error-email");
  var errorAddress = document.getElementById("error-address");
  var errorPayment = document.getElementById("error-paymentMethod");

  var isValid = true;

  function setError(el, errorEl, msg) {
    if (errorEl) errorEl.textContent = msg || "";
    if (msg) {
      el.setAttribute("aria-invalid", "true");
      isValid = false;
    } else {
      el.removeAttribute("aria-invalid");
    }
  }

  if (!fullName.value.trim()) {
    setError(fullName, errorName, "Vui lòng nhập họ tên.");
  } else {
    setError(fullName, errorName, "");
  }

  if (!email.value.trim()) {
    setError(email, errorEmail, "Vui lòng nhập email.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, errorEmail, "Email không hợp lệ.");
  } else {
    setError(email, errorEmail, "");
  }

  if (!address.value.trim()) {
    setError(address, errorAddress, "Vui lòng nhập địa chỉ.");
  } else {
    setError(address, errorAddress, "");
  }

  if (!paymentMethod.value) {
    setError(paymentMethod, errorPayment, "Vui lòng chọn phương thức thanh toán.");
  } else {
    setError(paymentMethod, errorPayment, "");
  }

  if (!isValid) {
    showToast("Vui lòng kiểm tra lại thông tin.");
  } else {
    showToast("Đã xác nhận thông tin. Đang xử lý đơn hàng...");
  }

  return isValid;
}
