// data.js - danh sách sản phẩm demo cho EDU Uniform

// Mỗi sản phẩm: id, name, category, price, sizes, image, description, stock, detailPage

const PRODUCTS = [
  // Tiểu học
  {
    id: "p1",
    name: "Áo sơ mi trắng Tiểu học",
    category: "Tiểu học",
    price: 150000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Primary+Shirt+1",
    description: "Áo sơ mi trắng tay ngắn, chất liệu cotton thoáng mát, phù hợp học sinh Tiểu học.",
    stock: 120,
    detailPage: "product-primary-01.html"
  },
  {
    id: "p2",
    name: "Quần âu xanh Tiểu học",
    category: "Tiểu học",
    price: 180000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Primary+Pants",
    description: "Quần âu xanh đậm, may đứng dáng, dễ vận động.",
    stock: 95,
    detailPage: "product-primary-01.html"
  },
  {
    id: "p3",
    name: "Váy caro Tiểu học",
    category: "Tiểu học",
    price: 220000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Primary+Skirt",
    description: "Váy caro phối áo sơ mi, nữ tính và lịch sự.",
    stock: 60,
    detailPage: "product-primary-01.html"
  },

  // THCS
  {
    id: "p5",
    name: "Áo sơ mi trắng THCS",
    category: "THCS",
    price: 170000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Secondary+Shirt+1",
    description: "Áo sơ mi trắng tay dài, dáng slim, phù hợp học sinh THCS.",
    stock: 140,
    detailPage: "product-secondary-01.html"
  },
  {
    id: "p6",
    name: "Quần tây THCS",
    category: "THCS",
    price: 210000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Secondary+Pants",
    description: "Quần tây xanh than, chất vải co giãn nhẹ.",
    stock: 70,
    detailPage: "product-secondary-01.html"
  },
  {
    id: "p7",
    name: "Áo khoác gió THCS",
    category: "THCS",
    price: 260000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Secondary+Jacket",
    description: "Áo khoác gió chống nước nhẹ, logo trường thêu sắc nét.",
    stock: 45,
    detailPage: "product-secondary-01.html"
  },

  // Mầm non
  {
    id: "p9",
    name: "Bộ đồng phục Mầm non 01",
    category: "Mầm non",
    price: 190000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Kindergarten+Set+1",
    description: "Bộ đồng phục áo thun - quần short chất liệu mềm, an toàn cho da bé.",
    stock: 80,
    detailPage: "product-kindergarten-01.html"
  },
  {
    id: "p10",
    name: "Bộ đồng phục Mầm non 02",
    category: "Mầm non",
    price: 195000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Kindergarten+Set+2",
    description: "Thiết kế tươi sáng, hoạt hình đáng yêu cho bé.",
    stock: 55,
    detailPage: "product-kindergarten-01.html"
  },

  // Thiết kế riêng
  {
    id: "p11",
    name: "Mẫu thiết kế riêng 01",
    category: "Thiết kế riêng",
    price: 250000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Custom+Design+1",
    description: "Mẫu demo thiết kế riêng, có thể thay đổi màu sắc và chất liệu theo yêu cầu.",
    stock: 999,
    detailPage: "product-custom-01.html"
  },
  {
    id: "p12",
    name: "Mẫu thiết kế riêng 02",
    category: "Thiết kế riêng",
    price: 270000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Custom+Design+2",
    description: "Dành cho trường quốc tế, phong cách hiện đại.",
    stock: 999,
    detailPage: "product-custom-01.html"
  },

  // Phụ kiện
  {
    id: "p13",
    name: "Cà vạt học sinh",
    category: "Phụ kiện",
    price: 60000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Tie",
    description: "Cà vạt sọc, phù hợp đồng phục cấp 2 - cấp 3.",
    stock: 200,
    detailPage: "product-accessory-01.html"
  },
  {
    id: "p14",
    name: "Nơ cổ học sinh nữ",
    category: "Phụ kiện",
    price: 55000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Ribbon",
    description: "Nơ cổ xinh xắn, phối màu theo tông đồng phục.",
    stock: 180,
    detailPage: "product-accessory-01.html"
  },
  {
    id: "p15",
    name: "Dây lưng đồng phục",
    category: "Phụ kiện",
    price: 70000,
    sizes: ["S", "M", "L"],
    image: "https://via.placeholder.com/400x260?text=Belt",
    description: "Dây lưng da tổng hợp, khóa chắc chắn.",
    stock: 150,
    detailPage: "product-accessory-01.html"
  }
];

// Helper functions cho trang khác dùng

function getProductById(id) {
  return PRODUCTS.find(function (p) {
    return p.id === id;
  }) || null;
}

function getProductsByCategory(category) {
  return PRODUCTS.filter(function (p) {
    return p.category === category;
  });
}

function formatPrice(value) {
  return value.toLocaleString("vi-VN") + " đ";
}
