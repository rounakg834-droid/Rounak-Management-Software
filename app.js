/* =========================================================
   ROUNAK MANAGEMENT SOFTWARE
   ========================================================= */


/* ================= DATABASE ================= */

let products = JSON.parse(localStorage.getItem("rounak_products")) || [];

let customers = JSON.parse(localStorage.getItem("rounak_customers")) || [];

let parties = JSON.parse(localStorage.getItem("rounak_parties")) || [];

let bills = JSON.parse(localStorage.getItem("rounak_bills")) || [];

let banks = JSON.parse(localStorage.getItem("rounak_banks")) || [];

let currentBillItems = [];


/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", function () {

    setDefaultDates();

    renderAll();

});


/* ================= DATE ================= */

function getToday() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setDefaultDates() {

    const today = getToday();

    const productDate = document.getElementById("productDate");

    const customerDate = document.getElementById("customerDate");

    const partyDate = document.getElementById("partyDate");

    const billingDate = document.getElementById("billingDate");

    const bankDate = document.getElementById("bankDate");


    if (productDate) productDate.value = today;

    if (customerDate) customerDate.value = today;

    if (partyDate) partyDate.value = today;

    if (billingDate) billingDate.value = today;

    if (bankDate) bankDate.value = today;

}


/* ================= NAVIGATION ================= */

function showSection(sectionId, button) {

    document.querySelectorAll(".section").forEach(section => {

        section.classList.remove("active");

    });


    document.getElementById(sectionId).classList.add("active");


    document.querySelectorAll(".nav-btn").forEach(btn => {

        btn.classList.remove("active");

    });


    if (button) {

        button.classList.add("active");

    }


    const titles = {

    dashboard: "Dashboard",

    products: "Products",

    customers: "Customers",

    parties: "Parties",

    billing: "Billing",

    bank: "Bank Details",

    reports: "Reports"

};


    document.getElementById("pageTitle").textContent =
        titles[sectionId] || "Dashboard";


    if (sectionId === "billing") {

    populateBillingCustomers();

    populateBillingProducts();

    renderBillItems();

}

if (sectionId === "reports") {

    renderSalesReport();

}

}


/* ================= SAVE DATABASE ================= */

function saveDatabase() {

    localStorage.setItem(
        "rounak_products",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "rounak_customers",
        JSON.stringify(customers)
    );

    localStorage.setItem(
        "rounak_parties",
        JSON.stringify(parties)
    );

    localStorage.setItem(
        "rounak_bills",
        JSON.stringify(bills)
    );

    localStorage.setItem(
        "rounak_banks",
        JSON.stringify(banks)
    );

}


/* ================= ID ================= */

function generateId(prefix) {

    return prefix + "_" + Date.now() + "_" +
        Math.floor(Math.random() * 10000);

}


/* ================= PRODUCTS ================= */

function addStock(productId) {

    const product = products.find(
        product => product.id === productId
    );

    if (!product) {
        alert("Product not found.");
        return;
    }

    const quantity = Number(
        prompt(`Enter stock quantity to add for ${product.name}:`)
    );

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Please enter a valid stock quantity.");
        return;
    }

    product.stock = Number(product.stock || 0) + quantity;

    saveDatabase();
    renderAll();

    alert(
        `Stock updated successfully.\n\n` +
        `${product.name}: ${product.stock}`
    );
}

function addProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const category =
        document.getElementById("productCategory").value;

    const mrp =
        Number(document.getElementById("productMRP").value);

        const stock =
    Number(document.getElementById("productStock").value);

    const date =
        document.getElementById("productDate").value;


    if (!name) {

        alert("Please enter product name.");

        return;

    }


    if (!category) {

        alert("Please select a category.");

        return;

    }


    if (mrp < 0 || isNaN(mrp)) {

        alert("Please enter a valid MRP.");

        return;

    }


    if (!date) {

        alert("Please select a date.");

        return;

    }


    const product = {

    id: generateId("product"),

    name,

    category,

    mrp,

    stock: Number(document.getElementById("productStock").value) || 0,

    date

};

    products.push(product);

    saveDatabase();

    clearProductForm();

    renderAll();

    alert("Product added successfully.");

}


function clearProductForm() {

    document.getElementById("productName").value = "";

    document.getElementById("productCategory").value = "";

    document.getElementById("productMRP").value = "";

    document.getElementById("productStock").value = "";

    document.getElementById("productDate").value = getToday();

}


function renderProducts() {

    const list =
        document.getElementById("productList");

    const search =
        document.getElementById("productSearch").value
            .toLowerCase()
            .trim();


    const filtered = products.filter(product => {

        return (

            product.name.toLowerCase().includes(search) ||

            product.category.toLowerCase().includes(search)

        );

    });


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                No products found.
            </div>
        `;

        return;

    }


    list.innerHTML = filtered.map(product => {

        return `

            <div class="data-card">

                <div class="data-card-top">

                    <div>

                        <h3>${escapeHtml(product.name)}</h3>

                        <div class="data-info">

                            <span>
                                Category:
                                <strong>
                                    ${escapeHtml(product.category)}
                                </strong>
                            </span>

                            <span>
    Stock:
    <strong>
        ${product.stock ?? 0}
    </strong>

    ${
        Number(product.stock ?? 0) === 0
            ? " | Out of Stock"
            : Number(product.stock ?? 0) <= 5
                ? " | Low Stock"
                : ""
    }
</span>
                            

                            <span>
                                MRP:
                                <strong>
                                    ₹${formatNumber(product.mrp)}
                                </strong>
                            </span>

                            <span>
                                Date:
                                <strong>
                                    ${formatDate(product.date)}
                                </strong>
                            </span>

                        </div>

                    </div>

                    <button
    class="add-stock-btn"
    onclick="addStock('${product.id}')"
>
    + Add Stock
</button>


                    <button
                        class="delete-btn"
                        onclick="deleteProduct('${product.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

    }).join("");

}


function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {

        return;

    }


    products = products.filter(product => product.id !== id);

    saveDatabase();

    renderAll();

}


/* ================= CUSTOMERS ================= */

function addCustomer() {

    const name =
        document.getElementById("customerName").value.trim();

    const mobile =
        document.getElementById("customerMobile").value.trim();

    const category =
        document.getElementById("customerCategory").value;

    const amount =
        Number(document.getElementById("customerAmount").value);

    const date =
        document.getElementById("customerDate").value;


    if (!name) {

        alert("Please enter customer name.");

        return;

    }


    if (!mobile) {

        alert("Please enter mobile number.");

        return;

    }


    if (!category) {

        alert("Please select a category.");

        return;

    }


    if (amount < 0 || isNaN(amount)) {

        alert("Please enter a valid amount.");

        return;

    }


    if (!date) {

        alert("Please select a date.");

        return;

    }


    const customer = {

        id: generateId("customer"),

        name,

        mobile,

        category,

        amount,

        date

    };


    customers.push(customer);

    saveDatabase();

    clearCustomerForm();

    renderAll();

    alert("Customer added successfully.");

}


function clearCustomerForm() {

    document.getElementById("customerName").value = "";

    document.getElementById("customerMobile").value = "";

    document.getElementById("customerCategory").value = "";

    document.getElementById("customerAmount").value = "";

    document.getElementById("customerDate").value = getToday();

}


function renderCustomers() {

    const list =
        document.getElementById("customerList");

    const search =
        document.getElementById("customerSearch").value
            .toLowerCase()
            .trim();


    const filtered = customers.filter(customer => {

        return (

            customer.name.toLowerCase().includes(search) ||

            customer.mobile.toLowerCase().includes(search) ||

            customer.category.toLowerCase().includes(search)

        );

    });


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                No customers found.
            </div>
        `;

        return;

    }


    list.innerHTML = filtered.map(customer => {

const customerBills = bills.filter(bill =>
    bill.customerId === customer.id ||
    (
        !bill.customerId &&
        bill.mobile === customer.mobile
    )
);

const totalPurchase = customerBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0),
    0
);

        return `

            <div class="data-card">

                <div class="data-card-top">

                    <div>

                        <h3>${escapeHtml(customer.name)}</h3>

                        <div class="data-info">

                            <span>
                                Mobile:
                                <strong>
                                    ${escapeHtml(customer.mobile)}
                                </strong>
                            </span>

                            <span>
                                Category:
                                <strong>
                                    ${escapeHtml(customer.category)}
                                </strong>
                            </span>

                            <span>
                                Amount:
                                <strong>
                                    ₹${formatNumber(customer.amount)}
                                </strong>
                            </span>

<span>
    Total Purchase:
    <strong>
        ₹${formatNumber(totalPurchase)}
    </strong>
</span>

                            <span>
                                Date:
                                <strong>
                                    ${formatDate(customer.date)}
                                </strong>
                            </span>

                        </div>

                    </div>

                    <button
    class="view-history-btn"
    onclick="viewCustomerHistory('${customer.id}')"
>
    View History
</button>

                    <button
                        class="delete-btn"
                        onclick="deleteCustomer('${customer.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

    }).join("");

}

function viewCustomerHistory(customerId) {

    const customer = customers.find(
        customer => customer.id === customerId
    );

    if (!customer) {
        alert("Customer not found.");
        return;
    }

    const customerBills = bills
        .filter(bill =>
            bill.customerId === customer.id ||
            (
                !bill.customerId &&
                bill.mobile === customer.mobile
            )
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalPurchase = customerBills.reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

    alert(
        `Customer: ${customer.name}\n` +
        `Mobile: ${customer.mobile}\n\n` +
        `Total Bills: ${customerBills.length}\n` +
        `Total Purchase: ₹${formatNumber(totalPurchase)}`
    );
}

function deleteCustomer(id) {

    if (!confirm("Are you sure you want to delete this customer?")) {

        return;

    }


    customers =
        customers.filter(customer => customer.id !== id);

    saveDatabase();

    renderAll();

}


/* ================= PARTIES ================= */

function addParty() {

    const name =
        document.getElementById("partyName").value.trim();

    const mobile =
        document.getElementById("partyMobile").value.trim();

    const address =
        document.getElementById("partyAddress").value.trim();

    const category =
        document.getElementById("partyCategory").value;

    const amount =
        Number(document.getElementById("partyAmount").value);

    const date =
        document.getElementById("partyDate").value;


    if (!name) {

        alert("Please enter party name.");

        return;

    }


    if (!mobile) {

        alert("Please enter mobile number.");

        return;

    }


    if (!address) {

        alert("Please enter address.");

        return;

    }


    if (!category) {

        alert("Please select a category.");

        return;

    }


    if (amount < 0 || isNaN(amount)) {

        alert("Please enter a valid amount.");

        return;

    }


    if (!date) {

        alert("Please select a date.");

        return;

    }


    const party = {

        id: generateId("party"),

        name,

        mobile,

        address,

        category,

        amount,

        date

    };


    parties.push(party);

    saveDatabase();

    clearPartyForm();

    renderAll();

    alert("Party added successfully.");

}


function clearPartyForm() {

    document.getElementById("partyName").value = "";

    document.getElementById("partyMobile").value = "";

    document.getElementById("partyAddress").value = "";

    document.getElementById("partyCategory").value = "";

    document.getElementById("partyAmount").value = "";

    document.getElementById("partyDate").value = getToday();

}


function renderParties() {

    const list =
        document.getElementById("partyList");

    const search =
        document.getElementById("partySearch").value
            .toLowerCase()
            .trim();


    const filtered = parties.filter(party => {

        return (

            party.name.toLowerCase().includes(search) ||

            party.mobile.toLowerCase().includes(search) ||

            party.category.toLowerCase().includes(search)

        );

    });


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                No parties found.
            </div>
        `;

        return;

    }


    list.innerHTML = filtered.map(party => {

        return `

            <div class="data-card">

                <div class="data-card-top">

                    <div>

                        <h3>${escapeHtml(party.name)}</h3>

                        <div class="data-info">

                            <span>
                                Mobile:
                                <strong>
                                    ${escapeHtml(party.mobile)}
                                </strong>
                            </span>

                            <span>
                                Address:
                                <strong>
                                    ${escapeHtml(party.address)}
                                </strong>
                            </span>

                            <span>
                                Category:
                                <strong>
                                    ${escapeHtml(party.category)}
                                </strong>
                            </span>

                            <span>
                                Amount:
                                <strong>
                                    ₹${formatNumber(party.amount)}
                                </strong>
                            </span>

                            <span>
                                Date:
                                <strong>
                                    ${formatDate(party.date)}
                                </strong>
                            </span>

                        </div>

                    </div>


                    <button
                        class="delete-btn"
                        onclick="deleteParty('${party.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

    }).join("");

}


function deleteParty(id) {

    if (!confirm("Are you sure you want to delete this party?")) {

        return;

    }


    parties =
        parties.filter(party => party.id !== id);

    saveDatabase();

    renderAll();

}


/* ================= BILLING ================= */

function populateBillingCustomers() {

    const select =
        document.getElementById("billingCustomer");

    if (!select) return;

    const currentValue = select.value;

    select.innerHTML = `
        <option value="">Select customer</option>
    `;

    customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value = customer.id;

        option.textContent =
            `${customer.name} - ${customer.mobile}`;

        select.appendChild(option);

    });

    if (
        customers.some(customer =>
            customer.id === currentValue
        )
    ) {

        select.value = currentValue;

    }

}


function populateBillingProducts() {

    const select =
        document.getElementById("billingProduct");

    if (!select) return;

    const currentValue = select.value;

    select.innerHTML = `
        <option value="">Select product</option>
    `;

    products.forEach(product => {

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent =
            `${product.name} - ₹${formatNumber(product.mrp)}`;

        select.appendChild(option);

    });

    if (
        products.some(product =>
            product.id === currentValue
        )
    ) {

        select.value = currentValue;

    }

}


/* CUSTOMER SELECTION */

function selectBillingCustomer() {

    const customerId =
        document.getElementById("billingCustomer").value;

    const customer =
        customers.find(item =>
            item.id === customerId
        );

    if (!customer) {

        document.getElementById("billingCustomerName").value = "";

        document.getElementById("billingCustomerMobile").value = "";

        document.getElementById("billingCustomerCategory").value = "";

        return;

    }

    document.getElementById("billingCustomerName").value =
        customer.name;

    document.getElementById("billingCustomerMobile").value =
        customer.mobile;

    document.getElementById("billingCustomerCategory").value =
        customer.category;

}


/* PRODUCT SELECTION */

function selectBillingProduct() {

    const productId =
        document.getElementById("billingProduct").value;

    const product =
        products.find(item =>
            item.id === productId
        );

    if (!product) {

        document.getElementById("billingProductName").value = "";

        document.getElementById("billingMRP").value = "";

        return;

    }

    document.getElementById("billingProductName").value =
        product.name;

    document.getElementById("billingMRP").value =
        product.mrp;

}


/* ADD PRODUCT TO BILL */

function addBillItem() {

    const productId =
        document.getElementById("billingProduct").value;

    const product =
        products.find(item =>
            item.id === productId
        );

    if (!product) {

        alert("Please select a product.");

        return;

    }


    const quantity =
        Number(
            document.getElementById("billingQuantity").value
        );


    if (quantity <= 0 || isNaN(quantity)) {

        alert("Please enter a valid quantity.");

        return;

    }


    /* Maximum 50 DIFFERENT products */

    const existingItem =
        currentBillItems.find(item =>
            item.productId === product.id
        );


    if (!existingItem && currentBillItems.length >= 50) {

        alert("Maximum 50 products can be added to one bill.");

        return;

    }


    /*
       If same product already exists,
       increase its quantity.
    */

    if (existingItem) {

        existingItem.quantity += quantity;

        existingItem.total =
            existingItem.mrp *
            existingItem.quantity;

    } else {

        const item = {

            id: generateId("item"),

            productId: product.id,

            productName: product.name,

            mrp: Number(product.mrp),

            quantity: quantity,

            total:
                Number(product.mrp) * quantity

        };

        currentBillItems.push(item);

    }


    renderBillItems();

    clearBillingProductForm();

}


/* CLEAR PRODUCT INPUT */

function clearBillingProductForm() {

    document.getElementById("billingProduct").value = "";

    document.getElementById("billingProductName").value = "";

    document.getElementById("billingMRP").value = "";

    document.getElementById("billingQuantity").value = 1;

}


/* DISPLAY BILL PRODUCTS */

function renderBillItems() {

    const tbody =
        document.getElementById("billItems");

    if (!tbody) return;


    if (currentBillItems.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5"
                    style="text-align:center;">

                    No products added.

                </td>

            </tr>

        `;

        updateBillTotal();

        return;

    }


    tbody.innerHTML =
        currentBillItems.map(item => {

            return `

                <tr>

                    <td>
                        ${escapeHtml(item.productName)}
                    </td>

                    <td>
                        ₹${formatNumber(item.mrp)}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        ₹${formatNumber(item.total)}
                    </td>

                    <td>

                        <button
                            class="table-delete"
                            onclick="removeBillItem('${item.id}')"
                        >
                            Remove
                        </button>

                    </td>

                </tr>

            `;

        }).join("");


    updateBillTotal();

}


/* REMOVE PRODUCT */

function removeBillItem(id) {

    currentBillItems =
        currentBillItems.filter(item =>
            item.id !== id
        );

    renderBillItems();

}


/* CALCULATE BILL TOTAL */

function updateBillTotal() {

    const subtotal =
        currentBillItems.reduce(
            (sum, item) =>
                sum + item.total,
            0
        );


    const discountType =
        document.getElementById("billDiscountType")?.value
        || "amount";


    let discount =
        Number(
            document.getElementById("billDiscount")?.value
        ) || 0;


    let discountAmount = 0;


    /* ₹ DISCOUNT */

    if (discountType === "amount") {

        discountAmount = discount;

    }


    /* % DISCOUNT */

    if (discountType === "percent") {

        if (discount > 100) {

            discount = 100;

            document.getElementById("billDiscount").value = 100;

        }

        discountAmount =
            subtotal * discount / 100;

    }


    /* Discount cannot exceed subtotal */

    if (discountAmount > subtotal) {

        discountAmount = subtotal;

    }


    const finalTotal =
        subtotal - discountAmount;


    document.getElementById("billSubtotal").textContent =
        `₹${formatNumber(subtotal)}`;


    document.getElementById("billTotal").textContent =
        `₹${formatNumber(finalTotal)}`;


    return {

        subtotal,

        discountType,

        discount,

        discountAmount,

        finalTotal

    };

}


/* SAVE BILL */

function saveBill() {

    const customerId =
        document.getElementById("billingCustomer").value;


    const customerName =
        document
            .getElementById("billingCustomerName")
            .value
            .trim();


    const mobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();


    const category =
        document
            .getElementById("billingCustomerCategory")
            .value
            .trim();


    const date =
        document.getElementById("billingDate").value;


    if (!customerName) {

        alert("Please select or enter a customer.");

        return;

    }


    if (!mobile) {

        alert("Please enter customer mobile number.");

        return;

    }


    if (!category) {

        alert("Please enter customer category.");

        return;

    }


    if (!date) {

        alert("Please select billing date.");

        return;

    }


    if (currentBillItems.length === 0) {

        alert("Please add at least one product.");

        return;

    }


    const calculation =
        updateBillTotal();


    const bill = {

        id: generateId("bill"),

        customerId,

        customerName,

        mobile,

        category,

        date,

        items: [...currentBillItems],

        subtotal: calculation.subtotal,

        discountType: calculation.discountType,

        discount: calculation.discount,

        discountAmount: calculation.discountAmount,

        total: calculation.finalTotal

    };


    bills.push(bill);

    saveDatabase();

    alert("Bill saved successfully.");

    clearBill();

    renderAll();

}


/* CLEAR COMPLETE BILL */

function clearBill() {

    currentBillItems = [];


    document.getElementById("billingCustomer").value = "";

    document.getElementById("billingCustomerName").value = "";

    document.getElementById("billingCustomerMobile").value = "";

    document.getElementById("billingCustomerCategory").value = "";

    document.getElementById("billingDate").value = getToday();


    clearBillingProductForm();


    document.getElementById("billDiscountType").value =
        "amount";


    document.getElementById("billDiscount").value =
        0;


    renderBillItems();

}


/* BILL HISTORY */

function renderSalesReport() {

    const list = document.getElementById("salesReportList");

    if (!list) return;

    const searchInput = document.getElementById("salesReportSearch");

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredBills = bills.filter(bill => {

        const billNumber = String(bill.billNumber || "").toLowerCase();
        const customerName = String(bill.customerName || "").toLowerCase();
        const mobile = String(bill.mobile || "").toLowerCase();
        const date = String(bill.date || "").toLowerCase();

        return (
            billNumber.includes(search) ||
            customerName.includes(search) ||
            mobile.includes(search) ||
            date.includes(search)
        );
    });

    if (filteredBills.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                No sales found.
            </div>
        `;

        return;
    }

    const sortedBills = [...filteredBills].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    list.innerHTML = sortedBills.map(bill => {

        const customerName =
            bill.customerName || "Walk-in Customer";

        return `
            <div class="data-card">

                <div>
                    <strong>${bill.billNumber || "-"}</strong>

                    <p>
                        ${bill.date || "-"} |
                        ${customerName}
                    </p>
                </div>

                <strong>
                    ₹${formatNumber(Number(bill.total || 0))}
                </strong>

            </div>
        `;

    }).join("");
}


function renderBills() {

    const list =
        document.getElementById("billList");

    if (!list) return;


    const search =
        document.getElementById("billSearch")
            .value
            .toLowerCase()
            .trim();


    const filtered =
        bills.filter(bill => {

            return (

                bill.customerName
                    .toLowerCase()
                    .includes(search) ||

                bill.mobile
                    .toLowerCase()
                    .includes(search) ||

                bill.date
                    .toLowerCase()
                    .includes(search)

            );

        });


    if (filtered.length === 0) {

        list.innerHTML = `

            <div class="empty">
                No bills found.
            </div>

        `;

        return;

    }


    list.innerHTML =
        filtered
            .slice()
            .reverse()
            .map(bill => {

                const productNames =
                    bill.items
                        .map(item =>
                            `${item.productName} × ${item.quantity}`
                        )
                        .join(", ");


                let discountText = "₹0";


                if (bill.discountType === "percent") {

                    discountText =
                        `${bill.discount}%`;

                } else {

                    discountText =
                        `₹${formatNumber(
                            bill.discountAmount || 0
                        )}`;

                }


                return `

                    <div class="data-card">

                        <div class="data-card-top">

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        bill.customerName
                                    )}
                                </h3>


                                <div class="data-info">

                                    <span>
                                        Mobile:
                                        <strong>
                                            ${escapeHtml(
                                                bill.mobile
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Category:
                                        <strong>
                                            ${escapeHtml(
                                                bill.category
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Products:
                                        <strong>
                                            ${escapeHtml(
                                                productNames
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Date:
                                        <strong>
                                            ${formatDate(
                                                bill.date
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Subtotal:
                                        <strong>
                                            ₹${formatNumber(
                                                bill.subtotal
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        Discount:
                                        <strong>
                                            ${discountText}
                                        </strong>
                                    </span>


                                    <span>
                                        Final Total:
                                        <strong>
                                            ₹${formatNumber(
                                                bill.total
                                            )}
                                        </strong>
                                    </span>

                                </div>

                            </div>


                            <div class="bill-buttons">

    <button
        class="view-btn"
        onclick="window.viewBill('${bill.id}')"
    >
        View Bill
    </button>

    <button
        class="delete-btn"
        onclick="deleteBill('${bill.id}')"
    >
        Delete
    </button>

</div>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* DELETE BILL */

function deleteBill(id) {

    if (
        !confirm(
            "Are you sure you want to delete this bill?"
        )
    ) {

        return;

    }


    bills =
        bills.filter(bill =>
            bill.id !== id
        );


    saveDatabase();

    renderAll();

}

/* ================= BANK ================= */

function calculateClosingBalance() {

    const opening =
        Number(
            document.getElementById("openingBalance").value
        ) || 0;


    const credit =
        Number(
            document.getElementById("creditAmount").value
        ) || 0;


    const debit =
        Number(
            document.getElementById("debitAmount").value
        ) || 0;


    const closing =
        opening + credit - debit;


    document.getElementById("closingBalance").value =
        closing;

}


function addBankEntry() {

    const date =
        document.getElementById("bankDate").value;


    const opening =
        Number(
            document.getElementById("openingBalance").value
        ) || 0;


    const credit =
        Number(
            document.getElementById("creditAmount").value
        ) || 0;


    const debit =
        Number(
            document.getElementById("debitAmount").value
        ) || 0;


    const closing =
        opening + credit - debit;


    if (!date) {

        alert("Please select a date.");

        return;

    }


    if (
        opening < 0 ||
        credit < 0 ||
        debit < 0
    ) {

        alert("Amounts cannot be negative.");

        return;

    }


    const bank = {

        id: generateId("bank"),

        date,

        opening,

        credit,

        debit,

        closing

    };


    banks.push(bank);

    saveDatabase();

    clearBankForm();

    renderAll();

    alert("Bank entry saved successfully.");

}


function clearBankForm() {

    document.getElementById("bankDate").value = getToday();

    document.getElementById("openingBalance").value = 0;

    document.getElementById("creditAmount").value = 0;

    document.getElementById("debitAmount").value = 0;

    document.getElementById("closingBalance").value = 0;

}


function renderBanks() {

    const list =
        document.getElementById("bankList");

    const search =
        document.getElementById("bankSearch").value
            .toLowerCase()
            .trim();


    const filtered =
        banks.filter(bank =>
            bank.date.includes(search)
        );


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                No bank records found.
            </div>
        `;

        return;

    }


    list.innerHTML =
        filtered.slice().reverse().map(bank => {

            return `

                <div class="data-card">

                    <div class="data-card-top">

                        <div>

                            <h3>
                                Bank Entry
                            </h3>

                            <div class="data-info">

                                <span>
                                    Date:
                                    <strong>
                                        ${formatDate(bank.date)}
                                    </strong>
                                </span>

                                <span>
                                    Opening:
                                    <strong>
                                        ₹${formatNumber(bank.opening)}
                                    </strong>
                                </span>

                                <span>
                                    Credit:
                                    <strong>
                                        ₹${formatNumber(bank.credit)}
                                    </strong>
                                </span>

                                <span>
                                    Debit:
                                    <strong>
                                        ₹${formatNumber(bank.debit)}
                                    </strong>
                                </span>

                                <span>
                                    Closing:
                                    <strong>
                                        ₹${formatNumber(bank.closing)}
                                    </strong>
                                </span>

                            </div>

                        </div>


                        <button
                            class="delete-btn"
                            onclick="deleteBank('${bank.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


function deleteBank(id) {

    if (!confirm("Are you sure you want to delete this bank entry?")) {

        return;

    }


    banks =
        banks.filter(bank => bank.id !== id);

    saveDatabase();

    renderAll();

}


/* ================= DASHBOARD ================= */

function showSalesDetails() {

function closeSalesDetails() {
    document.getElementById("salesModal").style.display = "none";
}


    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayString =
        yesterday.toISOString().split("T")[0];

    const weekStart = new Date(today);
    weekStart.setDate(
        today.getDate() - today.getDay()
    );
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const yearStart = new Date(
        today.getFullYear(),
        0,
        1
    );

    const calculateSales = (condition) => {
        return bills
            .filter(condition)
            .reduce(
                (sum, bill) =>
                    sum + Number(bill.total || 0),
                0
            );
    };

    const todaySales = calculateSales(
        bill => bill.date === todayString
    );

    const yesterdaySales = calculateSales(
        bill => bill.date === yesterdayString
    );

    const weekSales = calculateSales(
        bill => new Date(bill.date) >= weekStart
    );

    const monthSales = calculateSales(
        bill => new Date(bill.date) >= monthStart
    );

    const yearSales = calculateSales(
        bill => new Date(bill.date) >= yearStart
    );

    const allTimeSales = calculateSales(
        () => true
    );

    document.getElementById("modalSalesToday").textContent =
    `₹${formatNumber(todaySales)}`;

document.getElementById("modalSalesYesterday").textContent =
    `₹${formatNumber(yesterdaySales)}`;

document.getElementById("modalSalesWeek").textContent =
    `₹${formatNumber(weekSales)}`;

document.getElementById("modalSalesMonth").textContent =
    `₹${formatNumber(monthSales)}`;

document.getElementById("modalSalesYear").textContent =
    `₹${formatNumber(yearSales)}`;

document.getElementById("modalSalesAllTime").textContent =
    `₹${formatNumber(allTimeSales)}`;

document.getElementById("salesModal").style.display = "flex";
}

function updateDashboard() {

    document.getElementById("productCount").textContent =
        products.length;


    document.getElementById("customerCount").textContent =
        customers.length;


    document.getElementById("partyCount").textContent =
        parties.length;


    document.getElementById("billCount").textContent =
        bills.length;


    const today = new Date();

const todayString =
    today.toISOString().split("T")[0];

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const yesterdayString =
    yesterday.toISOString().split("T")[0];

const weekStart = new Date(today);
weekStart.setDate(
    today.getDate() - today.getDay()
);

weekStart.setHours(0, 0, 0, 0);

const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);

const yearStart = new Date(
    today.getFullYear(),
    0,
    1
);

const salesToday = bills
    .filter(bill => bill.date === todayString)
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

const salesYesterday = bills
    .filter(bill => bill.date === yesterdayString)
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

const salesWeek = bills
    .filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= weekStart;
    })
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

const salesMonth = bills
    .filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= monthStart;
    })
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

const salesYear = bills
    .filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= yearStart;
    })
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );

const salesAllTime = bills
    .reduce(
        (sum, bill) => sum + Number(bill.total || 0),
        0
    );



document.getElementById("salesCount").textContent =
    `₹${formatNumber(salesToday)}`;


    document.getElementById("bankCount").textContent =
        banks.length;

document.getElementById("reportTodaySales").textContent =
    `₹${formatNumber(salesToday)}`;

document.getElementById("reportWeekSales").textContent =
    `₹${formatNumber(salesWeek)}`;

document.getElementById("reportMonthSales").textContent =
    `₹${formatNumber(salesMonth)}`;

document.getElementById("reportYearSales").textContent =
    `₹${formatNumber(salesYear)}`;

document.getElementById("reportTotalBills").textContent =
    bills.length;

document.getElementById("reportAllTimeSales").textContent =
    `₹${formatNumber(salesAllTime)}`;


}


/* ================= RENDER ALL ================= */

function renderAll() {

    renderProducts();

    renderCustomers();

    renderParties();

    renderBills();

    renderBanks();

    populateBillingCustomers();

    populateBillingProducts();

    renderBillItems();

    updateDashboard();

}


/* ================= HELPERS ================= */

function formatNumber(number) {

    return Number(number || 0).toLocaleString("en-IN");

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
/* ================= STORE BILL DETAILS ================= */

let STORE_NAME = "RADHIKA GENERAL STORE";
let STORE_ADDRESS = "Meena Bazar Chowk, Ballia";
let STORE_CONTACT = "7505458511";
let STORE_GST = "09AJJPD9884F1ZQ";

let savedBusiness = JSON.parse(localStorage.getItem("business_details") || "null");

if (savedBusiness) {
    STORE_NAME = savedBusiness.name;
    STORE_ADDRESS = savedBusiness.address;
    STORE_CONTACT = savedBusiness.contact;
    STORE_GST = savedBusiness.gst;
}

function setupBusinessDetails() {
    const name = prompt("Enter Business / Shop Name:");
    const address = prompt("Enter Business Address:");
    const contact = prompt("Enter Mobile Number:");
    const gst = prompt("Enter GST Number:");

    if (!name || !address || !contact || !gst) {
        alert("Please enter all business details.");
        setupBusinessDetails();
        return;
    }

    STORE_NAME = name;
    STORE_ADDRESS = address;
    STORE_CONTACT = contact;
    STORE_GST = gst;

    localStorage.setItem("business_details", JSON.stringify({
        name: name,
        address: address,
        contact: contact,
        gst: gst
    }));

    location.reload();
}

if (!savedBusiness) {
    setupBusinessDetails();
}




/* ================= GET BILL CALCULATION ================= */

function getCurrentBillCalculation() {

    const subtotal = currentBillItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
    );

    const discountType =
        document.getElementById("billDiscountType")?.value
        || "amount";

    let discount =
        Number(
            document.getElementById("billDiscount")?.value
        ) || 0;

    let discountAmount = 0;

    if (discountType === "percent") {

        if (discount > 100) {
            discount = 100;
        }

        discountAmount =
            subtotal * discount / 100;

    } else {

        discountAmount = discount;

    }

    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    const finalTotal =
        subtotal - discountAmount;

    return {
        subtotal,
        discountType,
        discount,
        discountAmount,
        finalTotal
    };
}


/* ================= BILL NUMBER ================= */

function generateBillNumber() {

    const number =
        String(bills.length + 1).padStart(5, "0");

    return `BILL-${number}`;

}


/* ================= SAVE BILL ================= */

function saveBill(showAlert = true) {

    const customerId =
        document.getElementById("billingCustomer").value;

    const customerName =
        document
            .getElementById("billingCustomerName")
            .value
            .trim();

    const mobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();

    const category =
        document
            .getElementById("billingCustomerCategory")
            .value
            .trim();

    const date =
        document.getElementById("billingDate").value;


    if (!customerName) {

        alert("Please select or enter a customer.");

        return null;

    }


    if (!mobile) {

        alert("Please enter customer mobile number.");

        return null;

    }


    if (!date) {

        alert("Please select billing date.");

        return null;

    }


    if (currentBillItems.length === 0) {

        alert("Please add at least one product.");

        return null;

    }


    const calculation =
        getCurrentBillCalculation();

        /* CHECK STOCK BEFORE SAVING BILL */

for (const item of currentBillItems) {

    const product = products.find(
        product => product.id === item.productId
    );

    if (!product) {
        alert(`Product not found: ${item.productName}`);
        return null;
    }

    const availableStock = Number(product.stock || 0);

    if (item.quantity > availableStock) {

        alert(
            `Insufficient stock for ${item.productName}.\n` +
            `Available stock: ${availableStock}`
        );

        return null;
    }
}

/* DEDUCT STOCK */

currentBillItems.forEach(item => {

    const product = products.find(
        product => product.id === item.productId
    );

    product.stock =
        Number(product.stock || 0) - Number(item.quantity);

});


    const bill = {

        id: generateId("bill"),

        billNumber: generateBillNumber(),

        customerId,

        customerName,

        mobile,

        category,

        date,

        items: currentBillItems.map(item => ({
            ...item
        })),

        subtotal: calculation.subtotal,

        discountType: calculation.discountType,

        discount: calculation.discount,

        discountAmount: calculation.discountAmount,

        total: calculation.finalTotal

    };


   bills.push(bill);

saveDatabase();

renderAll();

if (showAlert) {
    alert(
        `Bill ${bill.billNumber} saved successfully.`
    );
}

clearBill();

            return bill;}


/* ================= FORMAT BILL TEXT ================= */

function createBillText() {

    const customerName =
        document
            .getElementById("billingCustomerName")
            .value
            .trim();

    const mobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();

    const date =
        document
            .getElementById("billingDate")
            .value;


    if (!customerName || !mobile) {

        alert("Please enter customer details.");

        return null;

    }


    if (currentBillItems.length === 0) {

        alert("Please add at least one product.");

        return null;

    }


    const calculation =
        getCurrentBillCalculation();


    let text = "";

    text += `*${STORE_NAME}*\n`;

    text += `${STORE_ADDRESS}\n`;

    text += `Contact: ${STORE_CONTACT}\n`;

    text += `GST NO: ${STORE_GST}\n`;

    text += `\n`;

    text += `*INVOICE / BILL*\n`;

    text += `Date: ${date}\n`;

    text += `Customer: ${customerName}\n`;

    text += `Mobile: ${mobile}\n`;

    text += `\n`;

    text += `*PRODUCTS*\n`;

    text += `--------------------------\n`;


    currentBillItems.forEach((item, index) => {

        text +=
            `${index + 1}. ${item.productName}\n`;

        text +=
            `   MRP: ₹${formatNumber(item.mrp)} | ` +
            `Qty: ${item.quantity} | ` +
            `Amount: ₹${formatNumber(item.total)}\n`;

    });


    text += `--------------------------\n`;

    text +=
        `Subtotal: ₹${formatNumber(
            calculation.subtotal
        )}\n`;


    if (calculation.discountType === "percent") {

        text +=
            `Discount: ${calculation.discount}% ` +
            `(₹${formatNumber(
                calculation.discountAmount
            )})\n`;

    } else {

        text +=
            `Discount: ₹${formatNumber(
                calculation.discountAmount
            )}\n`;

    }


    text +=
        `*FINAL TOTAL: ₹${formatNumber(
            calculation.finalTotal
        )}*\n`;


    text += `\n`;

    text += `Thank you for shopping with us!`;


    return text;

}


/* ================= WHATSAPP SHARE ================= */

function shareBillOnWhatsApp() {

    const customerMobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();


    if (!customerMobile) {

        alert(
            "Please enter customer mobile number."
        );

        return;

    }


    const billText =
        createBillText();


    if (!billText) {
        return;
    }


    /*
       Remove spaces, +, -, brackets etc.
       WhatsApp requires country code.

       India:
       9876543210
       becomes:
       919876543210
    */

    let phone =
        customerMobile.replace(/\D/g, "");


    if (phone.length === 10) {

        phone = "91" + phone;

    }


    const whatsappURL =
        `https://wa.me/${phone}?text=` +
        encodeURIComponent(billText);


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* ================= PRINT BILL ================= */

function printBill() {

    const customerName =
        document
            .getElementById("billingCustomerName")
            .value
            .trim();

    const mobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();

    const date =
        document
            .getElementById("billingDate")
            .value;


    if (!customerName || !mobile) {

        alert("Please enter customer details.");

        return;

    }


    if (currentBillItems.length === 0) {

        alert("Please add at least one product.");

        return;

    }


    const calculation =
        getCurrentBillCalculation();


    const billNumber =
        generateBillNumber();


    let productRows = "";


    currentBillItems.forEach(
        (item, index) => {

            productRows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.productName
                        )}
                    </td>

                    <td>
                        ₹${formatNumber(item.mrp)}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        ₹${formatNumber(item.total)}
                    </td>

                </tr>

            `;

        }
    );


    let discountText;


    if (
        calculation.discountType ===
        "percent"
    ) {

        discountText =
            `${calculation.discount}% ` +
            `(₹${formatNumber(
                calculation.discountAmount
            )})`;

    } else {

        discountText =
            `₹${formatNumber(
                calculation.discountAmount
            )}`;

    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${STORE_NAME} - ${billNumber}
            </title>


            <style>

                body {

                    font-family:
                        Arial, sans-serif;

                    padding: 35px;

                    color: #222;

                }


                .invoice {

                    max-width: 800px;

                    margin: auto;

                }


                .header {

                    text-align: center;

                    border-bottom:
                        2px solid #222;

                    padding-bottom: 15px;

                    margin-bottom: 20px;

                }


                .header h1 {

                    margin: 0;

                    font-size: 28px;

                }


                .header p {

                    margin: 5px 0;

                    font-size: 14px;

                }


                .customer {

                    display: flex;

                    justify-content:
                        space-between;

                    margin-bottom: 20px;

                }


                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                }


                th,
                td {

                    border:
                        1px solid #ccc;

                    padding: 10px;

                    text-align: left;

                }


                th {

                    background: #f2f2f2;

                }


                .summary {

                    margin-top: 20px;

                    margin-left: auto;

                    width: 300px;

                }


                .summary-row {

                    display: flex;

                    justify-content:
                        space-between;

                    padding: 7px 0;

                }


                .final {

                    border-top:
                        2px solid #222;

                    font-size: 20px;

                    font-weight: bold;

                    padding-top: 10px;

                }


                .thanks {

                    text-align: center;

                    margin-top: 40px;

                    border-top:
                        1px solid #ddd;

                    padding-top: 15px;

                }

.amount-words {
    margin-top: 10px;
    padding: 10px 14px;
    background: #eef7f8;
    border: 1px solid #d4e9eb;
    border-radius: 8px;
    font-size: 11px;
    color: #334155;
}

.amount-words strong {
    color: #176b87;
}
            </style>

        </head>


        <body>

            <div class="invoice">


                <div class="header">

                    <h1>
                        ${STORE_NAME}
                    </h1>

                    <p>
                        ${STORE_ADDRESS}
                    </p>

                    <p>
                        Contact:
                        ${STORE_CONTACT}
                    </p>

                    <p>
                        GST NO:
                        ${STORE_GST}
                    </p>

                    <h3>
                        INVOICE / BILL
                    </h3>

                </div>


                <div class="customer">

                    <div>

                        <strong>
                            Customer:
                        </strong>

                        ${escapeHtml(
                            customerName
                        )}

                        <br>

                        <strong>
                            Mobile:
                        </strong>

                        ${escapeHtml(
                            mobile
                        )}

                    </div>


                    <div>

                        <strong>
                            Bill No:
                        </strong>

                        ${billNumber}

                        <br>
                        <strong>
    GSTIN:
</strong>

${STORE_GST}

<br>

                        <strong>
                            Date:
                        </strong>

                        ${date}

                    </div>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>#</th>

                            <th>Product</th>

                            <th>MRP</th>

                            <th>Qty</th>

                            <th>Amount</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${productRows}

                    </tbody>

                </table>


                <div class="summary">

                    <div class="summary-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹${formatNumber(
                                calculation.subtotal
                            )}
                        </strong>

                    </div>


                    <div class="summary-row">

                        <span>
                            Discount
                        </span>

                        <strong>
                            ${discountText}
                        </strong>

                    </div>


                    <div class="summary-row final">

                        <span>
                            Final Total
                        </span>

                        <strong>
                            ₹${formatNumber(
                                calculation.finalTotal
                            )}
                        </strong>

                    </div>

                </div>


                <div class="thanks">

                    Thank you for shopping with us!

                </div>


            </div>


            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

                        }
/* ================= FRESH PRINT SYSTEM ================= */

function createPrintHTML(bill) {
    function numberToWordsIndian(num) {

    num = Math.floor(Number(num));

    if (num === 0) return "Zero";

    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen"
    ];

    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety"
    ];

    function convert(n) {

        if (n < 20) {
            return ones[n];
        }

        if (n < 100) {
            return tens[Math.floor(n / 10)] +
                (n % 10 ? " " + ones[n % 10] : "");
        }

        if (n < 1000) {
            return ones[Math.floor(n / 100)] +
                " Hundred" +
                (n % 100 ? " " + convert(n % 100) : "");
        }

        if (n < 100000) {
            return convert(Math.floor(n / 1000)) +
                " Thousand" +
                (n % 1000 ? " " + convert(n % 1000) : "");
        }

        if (n < 10000000) {
            return convert(Math.floor(n / 100000)) +
                " Lakh" +
                (n % 100000 ? " " + convert(n % 100000) : "");
        }

        return convert(Math.floor(n / 10000000)) +
            " Crore" +
            (n % 10000000 ? " " + convert(n % 10000000) : "");
    }

    return convert(num);
}

    const items = bill.items || [];

    const subtotal = Number(bill.subtotal || 0);
    const discountAmount = Number(bill.discountAmount || 0);
    const total = Number(bill.total || 0);
    const amountInWords = numberToWordsIndian(total);

    const discountText = bill.discountType === "percentage"
        ? `${bill.discount || 0}%`
        : `₹${Number(bill.discount || 0).toFixed(2)}`;

    const rows = items.map((item, index) => {

        const price = Number(item.price || item.mrp || 0);
        const qty = Number(item.qty || 1);
        const amount = Number(item.total || price * qty);

        return `
            <tr>
                <td class="center">${index + 1}</td>

                <td class="product-name">
                    ${item.name || "Product"}
                </td>

                <td class="number">
                    ₹${price.toFixed(2)}
                </td>

                <td class="center">
                    ${qty}
                </td>

                <td class="amount">
                    ₹${amount.toFixed(2)}
                </td>
            </tr>
        `;
    }).join("");

    return `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<title>${bill.billNumber || "Invoice"} - ${STORE_NAME}</title>

<style>

@page {
    size: A4 portrait;
    margin: 10mm;
}

* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #eef3f8;
    color: #172033;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.invoice {
    width: 190mm;
    max-width: 190mm;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 35px rgba(20, 40, 70, 0.14);
}

/* ================= HEADER ================= */

.header {
    background: linear-gradient(135deg, #102a43, #176b87);
    color: white;
    padding: 28px 30px;
    position: relative;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.store-area {
    display: flex;
    gap: 15px;
    align-items: center;
}

.store-logo {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    background: #d42a2a;
    color: #2599c0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.18);
    overflow: hidden;
}
.store-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.store-name {
    font-size: 25px;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.store-address {
    font-size: 12px;
    opacity: 0.9;
    line-height: 1.6;
}

.invoice-title {
    text-align: right;
}

.invoice-title h1 {
    margin: 0;
    font-size: 27px;
    letter-spacing: 2px;
}

.invoice-title p {
    margin: 7px 0 0;
    font-size: 12px;
    opacity: 0.88;
}

.header-line {
    height: 3px;
    background: #59d3c7;
    margin-top: 22px;
    border-radius: 5px;
}

/* ================= DETAILS ================= */

.details-wrapper {
    padding: 22px 30px 10px;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.info-card {
    border: 1px solid #dce5ee;
    background: #f8fbfd;
    border-radius: 11px;
    padding: 15px 17px;
}

.info-title {
    color: #176b87;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin: 6px 0;
    font-size: 12px;
}

.info-label {
    color: #718096;
}

.info-value {
    font-weight: 700;
    text-align: right;
    color: #172033;
}

/* ================= PRODUCT TABLE ================= */

.products-section {
    padding: 12px 30px 0;
}

.section-title {
    font-size: 14px;
    font-weight: 800;
    color: #102a43;
    margin: 0 0 10px;
}

table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    border: 1px solid #dce5ee;
    border-radius: 10px;
}

thead {
    display: table-header-group;
}

thead th {
    background: #102a43;
    color: #ffffff;
    padding: 11px 9px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
}

tbody tr {
    page-break-inside: avoid;
}

tbody tr:nth-child(even) {
    background: #f7fafc;
}

tbody td {
    padding: 9px;
    border-bottom: 1px solid #e8eef3;
    font-size: 11px;
    vertical-align: middle;
}

tbody tr:last-child td {
    border-bottom: none;
}

.center {
    text-align: center !important;
}

.number,
.amount {
    text-align: right !important;
    white-space: nowrap;
}

.product-name {
    font-weight: 600;
    color: #26364a;
    overflow-wrap: anywhere;
}

/* ================= TOTAL ================= */

.bottom-section {
    padding: 20px 30px 25px;
}

.summary-area {
    display: flex;
    justify-content: flex-end;
}

.summary {
    width: 280px;
    border: 1px solid #dce5ee;
    border-radius: 12px;
    overflow: hidden;
    background: #f8fbfd;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    font-size: 12px;
    border-bottom: 1px solid #e3eaf0;
}

.summary-label {
    color: #687789;
}

.summary-value {
    font-weight: 700;
}

.discount-row .summary-value {
    color: #d14b4b;
}

.grand-total {
    background: linear-gradient(135deg, #176b87, #102a43);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.grand-total .label {
    font-size: 13px;
    font-weight: 700;
}

.grand-total .value {
    font-size: 20px;
    font-weight: 900;
}

/* ================= FOOTER ================= */

.footer {
    margin-top: 5px;
    background: #f1f7fa;
    border-top: 1px solid #dce5ee;
    padding: 18px 30px;
    text-align: center;
}

.thank-you {
    color: #176b87;
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 6px;
}

.footer-text {
    color: #718096;
    font-size: 10px;
    line-height: 1.7;
}

.gst {
    margin-top: 5px;
    font-weight: 700;
    color: #4b5b6d;
}

/* ================= BUTTON ================= */

.actions {
    text-align: center;
    padding: 18px;
    background: #eef3f8;
}

.print-button {
    border: none;
    background: #176b87;
    color: white;
    padding: 11px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
}

.print-button:hover {
    background: #102a43;
}

/* ================= PRINT ================= */

@media print {

    html,
    body {
        background: white !important;
    }

    body {
        margin: 0;
    }

    .invoice {
        width: 190mm;
        max-width: 190mm;
        margin: 0;
        box-shadow: none;
        border-radius: 0;
    }

    .actions {
        display: none !important;
    }

    .header {
        break-inside: avoid;
    }

    .details-wrapper,
    .products-section,
    .bottom-section,
    .footer {
        break-inside: avoid;
    }

    table {
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-footer-group;
    }
}

/* ================= SMALL SCREEN ================= */

@media screen and (max-width: 850px) {

    .invoice {
        width: 95%;
        max-width: 95%;
        margin: 15px auto;
    }

    .header-top {
        flex-direction: column;
    }

    .invoice-title {
        text-align: left;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .summary-area {
        justify-content: stretch;
    }

    .summary {
        width: 100%;
    }
}

</style>

</head>

<body>

<div class="invoice">

    <!-- HEADER -->

    <div class="header">

        <div class="header-top">

            <div class="store-area">

                <div class="store-logo">
    <img src="Radhika_logo.png" alt="Radhika General Store">
</div>

                <div>

                    <div class="store-name">
                        ${STORE_NAME}
                    </div>

                    <div class="store-address">
                        ${STORE_ADDRESS}<br>
                        Contact: ${STORE_CONTACT}
                    </div>

                </div>

            </div>

            <div class="invoice-title">

                <h1>INVOICE</h1>

                <p>
    Bill No: <strong>${bill.billNumber || "-"}</strong>
</p>

<p class="gst-header">
    GSTIN: <strong>${STORE_GST}</strong>
</p>

            </div>

        </div>

        <div class="header-line"></div>

    </div>


    <!-- CUSTOMER / BILL DETAILS -->

    <div class="details-wrapper">

        <div class="details-grid">

            <div class="info-card">

                <div class="info-title">
                    Customer Details
                </div>

                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">
                        ${bill.customerName || "Walk-in Customer"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Mobile</span>
                    <span class="info-value">
                        ${bill.mobile || "-"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Category</span>
                    <span class="info-value">
                        ${bill.category || "-"}
                    </span>
                </div>

            </div>


            <div class="info-card">

                <div class="info-title">
                    Invoice Details
                </div>

                <div class="info-row">
                    <span class="info-label">Bill Number</span>
                    <span class="info-value">
                        ${bill.billNumber || "-"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Date</span>
                    <span class="info-value">
                        ${bill.date ? bill.date.split("-").reverse().join("-") : "-"}
                    </span>
                </div>

                <div class="info-row">
                    <span class="info-label">Products</span>
                    <span class="info-value">
                        ${items.length}
                    </span>
                </div>

            </div>

        </div>

    </div>


    <!-- PRODUCTS -->

    <div class="products-section">

        <div class="section-title">
            Product Details
        </div>

        <table>

            <thead>

                <tr>
                    <th style="width: 8%; text-align:center;">#</th>
                    <th style="width: 48%;">Product</th>
                    <th style="width: 15%; text-align:right;">Price</th>
                    <th style="width: 12%; text-align:center;">Qty</th>
                    <th style="width: 17%; text-align:right;">Amount</th>
                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    </div>


    <!-- TOTAL -->

    <div class="bottom-section">

        <div class="summary-area">

            <div class="summary">

                <div class="summary-row">

                    <span class="summary-label">
                        Subtotal
                    </span>

                    <span class="summary-value">
                        ₹${subtotal.toFixed(2)}
                    </span>

                </div>


                <div class="summary-row discount-row">

                    <span class="summary-label">
                        Discount (${discountText})
                    </span>

                    <span class="summary-value">
                        - ₹${discountAmount.toFixed(2)}
                    </span>

                </div>


                <div class="grand-total">

                    <span class="label">
                        GRAND TOTAL
                    </span>

                    <span class="value">
                        ₹${total.toFixed(2)}
                    </span>

                </div>
<div class="amount-words">
    <strong>Amount in Words:</strong>
    Rupees ${amountInWords} Only
</div>
            </div>

        </div>

    </div>


    <!-- FOOTER -->

    <div class="footer">

        <div class="thank-you">
            Thank You for Shopping With Us!
        </div>

        <div class="footer-text">
            Please keep this invoice for your records.
            For any queries, please contact the store.
        </div>

       

    </div>


    <!-- PRINT BUTTON -->

    <div class="actions">

        <button
            class="print-button"
            onclick="window.print()">
            Print / Save as PDF
        </button>

    </div>

</div>

</body>
</html>
`;
}


/* ================= PRINT CURRENT BILL ================= */

function printBill() {

    const customerName =
        document
            .getElementById("billingCustomerName")
            .value
            .trim();

    const mobile =
        document
            .getElementById("billingCustomerMobile")
            .value
            .trim();

    if (!customerName || !mobile) {

        alert("Please enter customer details.");

        return;
    }


    if (currentBillItems.length === 0) {

        alert("Please add at least one product.");

        return;
    }


    const calculation =
        getCurrentBillCalculation();


    const bill = {

        id: generateId("bill"),

        billNumber: generateBillNumber(),

        customerName,

        mobile,

        category:
            document
                .getElementById("billingCustomerCategory")
                .value
                .trim(),

        date:
            document
                .getElementById("billingDate")
                .value,

        items: [...currentBillItems],

        subtotal: calculation.subtotal,

        discountType: calculation.discountType,

        discount: calculation.discount,

        discountAmount: calculation.discountAmount,

        total: calculation.finalTotal

    };


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        alert("Please allow pop-ups to print the bill.");

        return;
    }


    printWindow.document.write(
        createPrintHTML(bill)
    );

    printWindow.document.close();

}


/* ================= VIEW SAVED BILL ================= */

function viewBill(id) {

    const bill =
        bills.find(
            item =>
                String(item.id) === String(id)
        );


    if (!bill) {

        alert("Bill not found.");

        return;
    }


    const viewWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!viewWindow) {

        alert("Please allow pop-ups.");

        return;
    }


    let productRows = "";


    bill.items.forEach((item, index) => {

        productRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(item.productName)}</td>
                <td>₹${formatNumber(item.mrp)}</td>
                <td>${item.quantity}</td>
                <td>₹${formatNumber(item.total)}</td>
            </tr>
        `;

    });


    let discountText = "₹0";


    if (bill.discountType === "percent") {

        discountText =
            `${bill.discount}% (₹${formatNumber(
                bill.discountAmount || 0
            )})`;

    } else {

        discountText =
            `₹${formatNumber(
                bill.discountAmount || 0
            )}`;

    }


    viewWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<title>${STORE_NAME} - ${bill.billNumber}</title>

<style>

body {
    font-family: Arial, sans-serif;
    background: #f4f6fb;
    padding: 30px;
    color: #222;
}

.bill {
    max-width: 800px;
    margin: auto;
    background: white;
    padding: 30px;
}

.header {
    text-align: center;
    border-bottom: 2px solid #222;
    padding-bottom: 15px;
}

.header h1 {
    margin: 0;
}

.header p {
    margin: 5px;
}

.customer {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: left;
}

th {
    background: #f1f1f1;
}

.summary {
    width: 300px;
    margin-left: auto;
    margin-top: 20px;
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.final {
    border-top: 2px solid #222;
    font-size: 20px;
    font-weight: bold;
}

.actions {
    text-align: center;
    margin-top: 30px;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    margin: 5px;
    cursor: pointer;
}

.print {
    background: #2563eb;
    color: white;
}

.close {
    background: #ddd;
}

</style>

</head>

<body>

<div class="bill">

<div class="header">

<h1>${STORE_NAME}</h1>

<p>${STORE_ADDRESS}</p>

<p>Contact: ${STORE_CONTACT}</p>

<p>GST NO: ${STORE_GST}</p>

<h3>INVOICE / BILL</h3>

</div>


<div class="customer">

<div>

<strong>Customer:</strong>
${escapeHtml(bill.customerName)}

<br>

<strong>Mobile:</strong>
${escapeHtml(bill.mobile)}

<br>

<strong>Category:</strong>
${escapeHtml(bill.category || "-")}

</div>


<div>

<strong>Bill No:</strong>
${escapeHtml(bill.billNumber || "-")}

<br>

<br>

<strong>GSTIN:</strong>
${STORE_GST}

<strong>Date:</strong>
${formatDate(bill.date)}

</div>

</div>


<table>

<thead>

<tr>

<th>#</th>
<th>Product</th>
<th>MRP</th>
<th>Quantity</th>
<th>Total</th>

</tr>

</thead>


<tbody>

${productRows}

</tbody>

</table>


<div class="summary">

<div class="row">

<span>Subtotal</span>

<strong>
₹${formatNumber(bill.subtotal)}
</strong>

</div>


<div class="row">

<span>Discount</span>

<strong>
${discountText}
</strong>

</div>


<div class="row final">

<span>Final Total</span>

<strong>
₹${formatNumber(bill.total)}
</strong>

</div>

</div>


<div class="actions">

<button
    class="print"
    onclick="window.print()"
>
    Print Bill
</button>

<button
    class="close"
    onclick="window.close()"
>
    Close
</button>

</div>


</div>

</body>

</html>

`);

    viewWindow.document.close();

}


/* ================= PRINT SAVED BILL ================= */

function printSavedBill(id) {

    const bill =
        bills.find(
            item =>
                String(item.id) === String(id)
        );


    if (!bill) {

        alert("Bill not found.");

        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        alert("Please allow pop-ups to print the bill.");

        return;
    }


    printWindow.document.write(
        createPrintHTML(bill)
    );

    printWindow.document.close();

}


/* ================= GLOBAL FUNCTIONS ================= */

window.printBill = printBill;

window.viewBill = viewBill;

window.printSavedBill = printSavedBill;