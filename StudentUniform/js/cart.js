// cart.js - quản lý giỏ hàng (localStorage, thêm/xóa/cập nhật)

/**
 * Đọc giỏ hàng từ localStorage.
 * Trả về mảng item: { productId, size, quantity }
 */
function getCartItems() {
  try {
    var raw = localStorage.getItem("schoolUniformCart");
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Lỗi đọc giỏ hàng:", e);
    return [];
  }
}

/**
 * Ghi giỏ hàng vào localStorage.
 */
function saveCartItems(items) {
  localStorage.setItem("schoolUniformCart", JSON.stringify(items));
}

/**
 * Thêm sản phẩm vào giỏ.
 * Nếu cùng productId + size đã tồn tại thì cộng dồn quantity.
 */
function addToCart(productId, size, quantity) {
  var qty = parseInt(quantity, 10);
  if (!productId || !size || isNaN(qty) || qty <= 0) return;

  var cart = getCartItems();
  var existing = cart.find(function (item) {
    return item.productId === productId && item.size === size;
  });

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: productId,
      size: size,
      quantity: qty
    });
  }

  saveCartItems(cart);
}

/**
 * Xóa một item khỏi giỏ (theo productId + size).
 */
function removeFromCart(productId, size) {
  var cart = getCartItems().filter(function (item) {
    return !(item.productId === productId && item.size === size);
  });
  saveCartItems(cart);
}

/**
 * Cập nhật số lượng cho một item.
 */
function updateCartItemQuantity(productId, size, quantity) {
  var qty = parseInt(quantity, 10);
  var cart = getCartItems();

  cart.forEach(function (item) {
    if (item.productId === productId && item.size === size) {
      if (isNaN(qty) || qty <= 0) {
        item.quantity = 1;
      } else {
        item.quantity = qty;
      }
    }
  });

  saveCartItems(cart);
}

/**
 * Tính tổng số lượng item trong giỏ (cho icon giỏ hàng).
 */
function getCartItemCount() {
  return getCartItems().reduce(function (sum, item) {
    return sum + (item.quantity || 0);
  }, 0);
}

/**
 * Tính tổng tiền giỏ hàng.
 */
function getCartTotalPrice() {
  return getCartItems().reduce(function (sum, item) {
    var product = getProductById(item.productId);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);
}

/**
 * Xóa giỏ hàng.
 */
function clearCart() {
  localStorage.removeItem("schoolUniformCart");
}
