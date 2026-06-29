document.addEventListener('DOMContentLoaded', () => {
    console.log('%c✅ Fresh Mart hệ thống loaded successfully!', 'color: #15803d; font-size: 14px; font-weight: bold');
    
    loadHeaderFooter();
    initGlobalSearch(); // Kích hoạt tính năng tìm kiếm đồng bộ cho tất cả các trang
    
    // Kiểm tra trang hiện tại dựa trên các ID đặc trưng để kích hoạt hàm tương ứng
    if (document.getElementById('carouselTrack') && document.getElementById('all-products-grid')) {
        initHomePage(); 
    }
    
    if (document.getElementById('products-grid') && document.getElementById('cat-all')) {
        fetchStoreData(); 
    }
    
    if (document.getElementById('main-product-img') && document.getElementById('thumbnail-container')) {
        loadProductsData(); 
    }
});

// ==================== LOAD HEADER & FOOTER ====================
function getTemplateBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    if (path.includes('/html_login_register/')) {
        return '';
    }
    if (path.includes('/html_main/') || path.includes('/html_person/')) {
        return '../html_login_register/';
    }
    return 'html_login_register/';
}

function loadHeaderFooter() {
    const basePath = getTemplateBasePath();

    // Load Header thường
    fetch(basePath + 'header.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) headerContainer.innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Header chính
    fetch(basePath + 'header_chinh.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('headermain-container');
            if (headerContainer) headerContainer.innerHTML = data;
        })
        .catch(error => console.error('Error loading main header:', error));

    // Load Footer
    fetch(basePath + 'footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) footerContainer.innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

// ==================== ENGINE TÌM KIẾM TOÀN CỤC ĐỒNG BỘ ====================
function initGlobalSearch() {
    setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        const searchBtn = searchInput ? searchInput.parentElement.querySelector('button') : null;

        if (!searchInput) return;

        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        
        if (searchParam && document.getElementById('products-grid')) {
            searchInput.value = searchParam;
            setTimeout(() => { filterProducts(); }, 100);
        }

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                executeSearch(searchInput.value);
            }
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                executeSearch(searchInput.value);
            });
        }
    }, 300);
}

function executeSearch(keyword) {
    const isProductPage = document.getElementById('products-grid') && document.getElementById('cat-all');
    
    if (isProductPage) {
        filterProducts();
    } else {
        window.location.href = 'trang_san_pham.html?search=' + encodeURIComponent(keyword.trim());
    }
}

// 📌 HÀM BỔ SUNG: Tự động tính toán đường dẫn tương đối gọi file JSON dựa vào URL từng trang
function getJsonFetchPath() {
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    // Nếu Client đang ở trong thư mục con html_main hoặc html_person
    if (path.includes('/html_main/') || path.includes('/html_person/')) {
        return 'products.json';
    }
    // Nếu Client đang đứng ở thư mục ngoài cùng hoặc thư mục checkout/admin
    return '../html_main/products.json';
}


// ==================== LOGIC PHÂN TRANG 1: TRANG_CHU.HTML ====================
let rawProductsDatabase = [];
let currentIndex = 0;

// CẬP NHẬT TRANG CHỦ ĐỌC DỮ LIỆU ĐỘNG VÀ MẪU
async function initHomePage() {
    try {
        let localProducts = JSON.parse(localStorage.getItem('fresh_mart_products_pool'));
        
        // Nếu chưa có pool trong storage, tiến hành fetch lần đầu để nạp dữ liệu từ json gốc
        if (!localProducts) {
            const jsonPath = getJsonFetchPath(); // Gọi định vị đường dẫn tự động
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error("Không tìm thấy file products.json");
            rawProductsDatabase = await response.json();
            localStorage.setItem('fresh_mart_products_pool', JSON.stringify(rawProductsDatabase));
        } else {
            rawProductsDatabase = localProducts;
        }

        renderBestPriceCarousel();
        renderAllStoreProducts();
    } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu trang chủ:", error);
    }
}

function renderBestPriceCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const top7LastProducts = rawProductsDatabase.slice(-7);
    
    track.innerHTML = '';
    top7LastProducts.forEach(item => {
        track.insertAdjacentHTML('beforeend', `
            <div class="product-card min-w-[calc(25%-18px)] md:min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] border rounded-3xl overflow-hidden flex flex-col shadow-sm">
                <div class="h-52 overflow-hidden bg-slate-50 flex items-center justify-center p-4 relative">
                    <a href="chi_tiet_san_pham.html?id=${item.id}" class="w-full h-full flex items-center justify-center">
                        <img src="${item.image}" class="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500" alt="${item.name}">
                    </a>
                    <span class="absolute top-3 left-3 bg-red-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-sm tracking-widest italic">Giá sốc</span>
                </div>
                <div class="product-info p-5 flex-grow flex flex-col justify-between space-y-2">
                    <div>
                        <p class="text-green-600 font-bold text-xs uppercase tracking-wider">${item.category}</p>
                        <h4 class="font-bold text-slate-800 text-base line-clamp-1"><a href="chi_tiet_san_pham.html?id=${item.id}" class="hover:text-green-700">${item.name}</a></h4>
                    </div>
                    <div>
                        <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest">${item.unit || 'Túi 1KG'}</p>
                        <p class="text-green-700 font-[1000] text-xl mt-1">${item.price.toLocaleString('vi-VN')} đ</p>
                        <button onclick="globalAddToCart('${item.id}', 1)" class="mt-4 w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `);
    });
}

function renderAllStoreProducts() {
    const grid = document.getElementById('all-products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    rawProductsDatabase.forEach(item => {
        grid.insertAdjacentHTML('beforeend', `
            <div class="product-card p-4 rounded-2xl flex flex-col border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="bg-slate-50/50 rounded-xl h-44 flex items-center justify-center relative mb-4 overflow-hidden p-3">
                    <a href="chi_tiet_san_pham.html?id=${item.id}">
                        <img src="${item.image}" class="max-h-36 object-contain hover:scale-110 transition-transform duration-500">
                    </a>
                    <span class="absolute top-2 left-2 bg-[#2f6b2f] text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest italic shadow-sm">Fresh</span>
                </div>
                <div class="flex-grow space-y-1">
                    <div class="flex justify-between items-center text-[10px] font-bold">
                        <span class="text-green-600 uppercase font-black tracking-wider">${item.category}</span>
                        <span class="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded flex items-center gap-1">4.8 <i class="fas fa-star text-[8px]"></i></span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 line-clamp-1">
                        <a href="chi_tiet_san_pham.html?id=${item.id}" class="hover:text-green-700 transition-colors">${item.name}</a>
                    </h4>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${item.unit || 'Đơn vị'}</p>
                    <p class="text-base font-[1000] text-green-700 pt-1 tracking-tighter">${item.price.toLocaleString('vi-VN')} đ</p>
                </div>
                <button onclick="globalAddToCart('${item.id}', 1)" class="mt-4 bg-[#6b9460] py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition shadow-sm">
                    <i class="fas fa-shopping-cart mr-1"></i> Thêm vào giỏ
                </button>
            </div>
        `);
    });
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const totalItems = 7;
    const itemsVisible = window.innerWidth < 640 ? 1 : (window.innerWidth < 1024 ? 2 : 4);
    const maxIndex = totalItems - itemsVisible;

    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const itemWidth = 100 / itemsVisible;
    track.style.transform = `translateX(-${currentIndex * (itemWidth + 0.6)}%)`;
}

function redirectToCategory(catName) {
    window.location.href = `trang_san_pham.html?category=${encodeURIComponent(catName)}`;
}


// ==================== LOGIC PHÂN TRANG 2: TRANG_SAN_PHAM.HTML ====================
let rawProductsData = []; 
let minPriceFilter = 0;
let maxPriceFilter = 99999999;

async function fetchStoreData() {
    try {
        let localProducts = JSON.parse(localStorage.getItem('fresh_mart_products_pool'));
        
        if (!localProducts) {
            const jsonPath = getJsonFetchPath(); // Gọi định vị đường dẫn tự động
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error("Lỗi đọc file JSON");
            rawProductsData = await response.json();
            localStorage.setItem('fresh_mart_products_pool', JSON.stringify(rawProductsData));
        } else {
            rawProductsData = localProducts;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const catParam = urlParams.get('category');
        
        if (searchParam) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = searchParam;
            filterProducts();
        } else if (catParam) {
            changeCategory(catParam);
        } else {
            filterProducts();
        }
    } catch (error) {
        console.error("Lỗi liên kết dữ liệu:", error);
    }
}

function filterProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const searchInput = document.getElementById('search-input');
    const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let result = rawProductsData;

    if (typeof activeCategory !== 'undefined' && activeCategory !== 'all') {
        result = result.filter(p => p.category === activeCategory);
    }
    result = result.filter(p => p.price >= minPriceFilter && p.price <= maxPriceFilter);

    if (searchKeyword) {
        result = result.filter(p => p.name.toLowerCase().includes(searchKeyword));
    }

    const countEl = document.getElementById('product-count');
    if (countEl) countEl.innerText = `Tìm thấy: ${result.length} sản phẩm phù hợp`;
    
    grid.innerHTML = '';

    if (result.length === 0) {
        grid.innerHTML = `<div class="col-span-full bg-white py-24 rounded-2xl text-center text-slate-400 italic border font-medium">Không có thực phẩm nào khớp với bộ lọc.</div>`;
        return;
    }

    result.forEach(item => {
        grid.insertAdjacentHTML('beforeend', `
            <div class="product-card p-4 rounded-2xl flex flex-col border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="bg-slate-50/40 rounded-xl h-44 flex items-center justify-center relative mb-4 overflow-hidden p-3">
                    <a href="chi_tiet_san_pham.html?id=${item.id}">
                        <img src="${item.image}" class="max-h-36 object-contain hover:scale-110 transition-transform duration-500">
                    </a>
                    <span class="absolute top-2 left-2 bg-[#2f6b2f] text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest italic shadow-sm">Fresh</span>
                </div>
                <div class="flex-grow space-y-1">
                    <div class="flex justify-between items-center text-[10px] font-bold">
                        <span class="text-green-600 uppercase font-black tracking-wider">${item.category}</span>
                        <span class="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded flex items-center gap-1">4.8 <i class="fas fa-star text-[8px]"></i></span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 line-clamp-1">
                        <a href="chi_tiet_san_pham.html?id=${item.id}" class="hover:text-green-700 transition-colors">${item.name}</a>
                    </h4>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${item.unit || 'Đơn vị'}</p>
                    <p class="text-base font-[1000] text-green-700 pt-1 tracking-tighter">${item.price.toLocaleString('vi-VN')} đ</p>
                </div>
                <button onclick="globalAddToCart('${item.id}', 1)" class="mt-4 bg-[#6b9460] py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition active:scale-95 shadow-sm">
                    <i class="fas fa-shopping-cart mr-1"></i> Thêm vào giỏ
                </button>
            </div>
        `);
    });
}

function changeCategory(categoryName) {
    activeCategory = categoryName;

    document.querySelectorAll('.category-item').forEach(btn => {
        btn.classList.remove('category-item-active');
    });

    let targetId = 'cat-all';
    if (categoryName === 'Thịt cá') targetId = 'cat-thit-ca';
    else if (categoryName === 'Rau củ') targetId = 'cat-rau-cu';
    else if (categoryName === 'Trái cây') targetId = 'cat-trai-cay';
    else if (categoryName === 'Hạt') targetId = 'cat-hat';

    const activeBtn = document.getElementById(targetId);
    if (activeBtn) activeBtn.classList.add('category-item-active');

    filterProducts();
}

function changePriceFilter(min, max) {
    if(min === 'all') {
        minPriceFilter = 0;
        maxPriceFilter = 99999999;
    } else {
        minPriceFilter = min;
        maxPriceFilter = max;
    }
    filterProducts();
}


// ==================== LOGIC PHÂN TRANG 3: CHI_TIET_SAN_PHAM.HTML ====================
let productsDatabase = [];
let activeProduct = null;

// SỬA ĐỔI: Trang chi tiết đọc nguồn dữ liệu từ bộ pool chung thay vì tệp JSON tĩnh
async function loadProductsData() {
    try {
        let localProducts = JSON.parse(localStorage.getItem('fresh_mart_products_pool'));
        
        if (!localProducts) {
            const jsonPath = getJsonFetchPath(); // Gọi định vị đường dẫn tự động
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error('Gặp sự cố khi đọc tệp tin cơ sở dữ liệu products.json');
            productsDatabase = await response.json();
            localStorage.setItem('fresh_mart_products_pool', JSON.stringify(productsDatabase));
        } else {
            productsDatabase = localProducts;
        }
        
        initProductPage();
    } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu chi tiết:", error);
    }
}

function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'SP-001';

    activeProduct = productsDatabase.find(p => p.id === productId);
    if (!activeProduct) return;

    if(document.getElementById('page-title')) document.getElementById('page-title').innerText = `${activeProduct.name} - Fresh Mart`;
    if(document.getElementById('breadcrumb-title')) document.getElementById('breadcrumb-title').innerText = activeProduct.name;
    if(document.getElementById('breadcrumb-category')) document.getElementById('breadcrumb-category').innerText = activeProduct.category;
    if(document.getElementById('product-title')) document.getElementById('product-title').innerText = activeProduct.name;
    if(document.getElementById('product-unit')) document.getElementById('product-unit').innerText = activeProduct.unit;
    if(document.getElementById('product-price')) document.getElementById('product-price').innerText = activeProduct.price.toLocaleString('vi-VN') + " đ";
    if(document.getElementById('main-product-img')) document.getElementById('main-product-img').src = activeProduct.image;
    if(document.getElementById('db-unit')) document.getElementById('db-unit').innerText = activeProduct.unit;

    if(document.getElementById('product-short-desc')) document.getElementById('product-short-desc').innerText = activeProduct.shortDesc || 'Nông sản hữu cơ sạch đạt chuẩn vệ sinh thực phẩm.';
    // THAY THẾ BẰNG ĐOẠN CODE XỬ LÝ CHUỖI TỰ ĐỘNG NÀY:
const fullDescEl = document.getElementById('product-full-desc');
if (fullDescEl && activeProduct.fullDesc) {
    let formattedDesc = activeProduct.fullDesc;
    
    // Tự động tìm các cụm từ tiêu đề [NGUỒN GỐC], [QUY TRÌNH], [MÔ TẢ] 
    // và thêm 2 dấu xuống dòng (<br><br>) ra phía trước chúng
    formattedDesc = formattedDesc.replace(/(\[NGUỒN GỐC\])/g, '<br><br>$1');
    formattedDesc = formattedDesc.replace(/(\[QUY TRÌNH\])/g, '<br><br>$1');
    formattedDesc = formattedDesc.replace(/(\[MÔ TẢ\])/g, '<br><br>$1');
    
    // Loại bỏ các dấu xuống dòng thừa thãi ở ngay đầu đoạn văn nếu có
    if (formattedDesc.startsWith('<br><br>')) {
        formattedDesc = formattedDesc.substring(8);
    }
    
    // Đổ dữ liệu dạng innerHTML để trình duyệt biên dịch các thẻ xuống dòng
    fullDescEl.innerHTML = formattedDesc;
} else if (fullDescEl) {
    fullDescEl.innerText = 'Thông tin mô tả chi tiết sản phẩm đang được cập nhật.';
}

    const dbSource = document.getElementById('db-source');
    if (dbSource) {
        if (activeProduct.category === "Gia vị tươi") {
            dbSource.innerText = "Vùng chuyên canh rau gia vị hữu cơ nội địa";
        } else if (activeProduct.category === "Trái cây" && activeProduct.name.includes("New Zealand")) {
            dbSource.innerText = "Nhập khẩu chính ngạch - Đạt chuẩn quốc tế";
        } else {
            dbSource.innerText = "Hợp tác xã nông trại tiêu chuẩn VietGAP / GlobalGAP";
        }
    }

    const thumbContainer = document.getElementById('thumbnail-container');
    if (thumbContainer) {
        thumbContainer.innerHTML = `
            <img src="${activeProduct.image}" onclick="changeMainImage(this.src)" class="w-16 h-16 rounded-lg border-2 border-green-500 p-1 object-cover cursor-pointer shadow-sm bg-white">
            <img src="https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=150" onclick="changeMainImage(this.src)" class="w-16 h-16 rounded-lg border border-gray-200 p-1 object-cover cursor-pointer hover:border-green-500 shadow-sm opacity-70 hover:opacity-100">
        `;
    }

    renderRelatedProducts();
}

function changeQuantity(delta) {
    const input = document.getElementById('quantity-input');
    if (!input) return;
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    input.value = val;
}

// Sửa lại hàm đổi ảnh gốc bị lỗi chính tả (onclick gọi changeMainImage)
function changeMainImage(src) {
    const mainImg = document.getElementById('main-product-img');
    if (mainImg) mainImg.src = src;
}

function renderRelatedProducts() {
    const container = document.getElementById('related-products-container');
    if (!container) return;
    
    let list = productsDatabase.filter(p => p.category === activeProduct.category && p.id !== activeProduct.id);
    if (list.length < 4) {
        const extra = productsDatabase.filter(p => p.id !== activeProduct.id && p.category !== activeProduct.category);
        list = list.concat(extra);
    }
    
    const shuffleList = list.slice(0, 4);
    container.innerHTML = '';
    
    shuffleList.forEach(item => {
        container.insertAdjacentHTML('beforeend', `
            <div class="product-card p-4 rounded-2xl flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div class="bg-slate-50/50 rounded-xl h-40 flex items-center justify-center relative mb-4 overflow-hidden p-2">
                    <a href="chi_tiet_san_pham.html?id=${item.id}">
                        <img src="${item.image}" class="max-h-32 object-contain hover:scale-110 transition-transform duration-500">
                    </a>
                    <span class="absolute top-2 left-2 bg-[#2f6b2f] text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fresh</span>
                </div>
                <div class="flex-grow space-y-1">
                    <div class="flex justify-between items-center text-[10px] font-bold">
                        <span class="text-green-600 uppercase italic">${item.category}</span>
                        <span class="bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded flex items-center gap-1">4.8 <i class="fas fa-star text-[8px]"></i></span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 line-clamp-1">
                        <a href="chi_tiet_san_pham.html?id=${item.id}">${item.name}</a>
                    </h4>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${item.unit || 'Kg'}</p>
                    <p class="text-base font-black text-green-700 pt-1">${item.price.toLocaleString('vi-VN')} đ</p>
                </div>
                <button onclick="globalAddToCart('${item.id}', 1)" class="mt-4 bg-[#6b9460] py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-700 transition">
                    <i class="fas fa-shopping-cart mr-1"></i> + Giỏ hàng
                </button>
            </div>
        `);
    });
}


// ==================== ENGINE NGHIỆP VỤ GIỎ HÀNG TOÀN CỤC ====================
// SỬA ĐỔI: Đồng bộ hóa hàm Thêm vào giỏ hàng đọc thông tin từ pool động thay vì file JSON tĩnh
async function globalAddToCart(id, inputQty = null) {
    let qty = inputQty ? parseInt(inputQty) : 1;
    const qtyInput = document.getElementById('quantity-input');
    if (!inputQty && qtyInput) {
        qty = parseInt(qtyInput.value) || 1;
    }

    try {
        // Đọc từ kho pool chung thay vì fetch file tĩnh
        let localProducts = JSON.parse(localStorage.getItem('fresh_mart_products_pool')) || [];
        const pInfo = localProducts.find(p => p.id === id);
        
        if (!pInfo) return;

        let localCart = JSON.parse(localStorage.getItem('fresh_mart_cart')) || [];
        let existed = localCart.find(item => item.id === id);

        if (existed) {
            existed.quantity += qty;
        } else {
            localCart.push({
                id: pInfo.id,
                name: pInfo.name,
                price: pInfo.price,
                image: pInfo.image,
                unit: pInfo.unit || 'KG',
                quantity: qty,
                selected: true 
            });
        }

        localStorage.setItem('fresh_mart_cart', JSON.stringify(localCart));
        triggerToast(`Đã thêm ${qty} x ${pInfo.name} vào giỏ hàng thành công!`);
    } catch (e) {
        console.error("Lỗi đồng bộ giỏ hàng:", e);
    }
}

// Hàm nghiệp vụ xử lý nút MUA NGAY
async function globalBuyNow() {
    if (!activeProduct) return;
    
    const buyNowOrder = [{
        id: activeProduct.id,
        name: activeProduct.name,
        price: activeProduct.price,
        image: activeProduct.image,
        unit: activeProduct.unit || 'KG',
        quantity: parseInt(document.getElementById('quantity-input').value) || 1
    }];

    sessionStorage.setItem('checkout_type', 'buynow');
    sessionStorage.setItem('checkout_data', JSON.stringify(buyNowOrder));
    
    triggerToast("Đang kết nối luồng thanh toán cấp tốc...");
    setTimeout(() => {
        window.location.href = '../index/DienThongTin.html';
    }, 800);
}

// ==================== UTILITIES GLOBAL ====================
function triggerToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;
    msgEl.innerText = msg;
    toast.style.opacity = '1'; 
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translate(-50%, 40px)'; 
    }, 2000);
}

// ==================== ENGINE ĐIỀU KHIỂN TRẠNG THÁI ĐĂNG NHẬP ====================
function checkLoginState() {
    const userZone = document.querySelector('header .flex.items-center.gap-4');
    if (!userZone) return;

    const isLogin = localStorage.getItem('fresh_mart_is_logged_in') === 'true';
    const savedName = localStorage.getItem('fresh_mart_user_name') || 'Ánh Tuyết';
    const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
    const loginPrefix = path.includes('/html_main/') ? '../html_login_register/' : '';

    if (isLogin) {
        userZone.innerHTML = `
            <a href="gio_hang.html" class="relative p-3 hover:bg-green-100 rounded-full inline-flex items-center" style="margin-left: -3cm;">
                <i class="fas fa-shopping-cart text-3xl text-green-700"></i>
            </a>
            
            <button class="bg-[#f6f7ef] px-6 py-2 rounded-3xl text-[14px] font-semibold text-[#456b3f] hover:bg-white transition shadow-sm">
                <a href="../html_person/ho_so.html" class="inline-flex items-center">${savedName}</a>
            </button>
            
            <div class="relative inline-block text-left" id="avatar-dropdown-wrapper">
                <img src="https://i.pravatar.cc/120?img=32" alt="avatar" 
                     onclick="toggleUserDropdown(event)" 
                     class="w-[50px] h-[50px] rounded-full object-cover border-2 border-green-200 hover:border-green-500 cursor-pointer transition-all">
                
                <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-fadeIn">
                    <a href="../html_person/ho_so.html" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-green-700 transition">
                        <i class="far fa-user text-xs w-4"></i> Hồ sơ cá nhân
                    </a>
                    <hr class="border-slate-100 my-1">
                    <button onclick="handleUserLogout()" class="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition">
                        <i class="fas fa-sign-out-alt text-xs w-4"></i> Đăng xuất
                    </button>
                </div>
            </div>
        `;

        window.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown-menu');
            const wrapper = document.getElementById('avatar-dropdown-wrapper');
            if (dropdown && wrapper && !wrapper.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    } else {
        userZone.innerHTML = `
            <div class="flex items-center gap-3">
                <a href="${loginPrefix}dang_nhap.html" class="text-[14px] font-bold text-green-700 hover:text-green-900 border border-green-600 px-5 py-2 rounded-3xl transition bg-white shadow-sm flex items-center justify-center">
                    Đăng nhập
                </a>
                <a href="${loginPrefix}dang_ky.html" class="text-[14px] font-bold text-white bg-green-700 hover:bg-green-800 px-5 py-2 rounded-3xl transition shadow-md flex items-center justify-center">
                    Đăng ký
                </a>
            </div>
        `;
    }
}

function toggleUserDropdown(event) {
    event.stopPropagation(); 
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}