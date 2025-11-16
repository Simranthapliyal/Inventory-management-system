const API_URL = "http://localhost:3000/items";

const form = document.getElementById("inventory-form");
const nameInput = document.getElementById("item-name");
const quantityInput = document.getElementById("item-quantity");
const priceInput = document.getElementById("item-price");
const tableBody = document.getElementById("inventory-table-body");

// Load items from DB
function loadInventory() {
    fetch(API_URL)
        .then(async res => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to load items');
            }
            return res.json();
        })
        .then(data => {
            renderTable(data);
        })
        .catch(err => {
            console.error('Error loading inventory:', err);
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                showMessage('Cannot connect to server. Make sure backend is running on port 3000.', 'error');
            } else {
                showMessage(err.message || 'Error loading items. Please refresh the page.', 'error');
            }
        });
}

// Render table data
function renderTable(items) {
    tableBody.innerHTML = "";
    items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>
                <button onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new item → backend → database
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const item = {
        name: nameInput.value.trim(),
        quantity: parseInt(quantityInput.value),
        price: parseFloat(priceInput.value)
    };

    // Validate input
    if (!item.name || item.quantity < 0 || item.price < 0) {
        showMessage('Please enter valid data!', 'error');
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(item)
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to add item');
        }
        return data;
    })
    .then(data => {
        showMessage('Item added successfully!', 'success');
        form.reset();
        loadInventory(); // Refresh table to show new data
    })
    .catch(err => {
        console.error('Error adding item:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            showMessage('Cannot connect to server. Make sure backend is running on port 3000.', 'error');
        } else {
            showMessage(err.message || 'Error adding item. Please check if server is running.', 'error');
        }
    });
});

// Delete item → backend → DB delete
function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(res => {
            if (!res.ok) throw new Error('Failed to delete item');
            return res.json();
        })
        .then(() => {
            showMessage('Item deleted successfully!', 'success');
            loadInventory(); // Refresh table
        })
        .catch(err => {
            console.error('Error deleting item:', err);
            showMessage('Error deleting item. Please try again.', 'error');
        });
}

// Show message to user
function showMessage(message, type) {
    // Remove existing message if any
    const existingMsg = document.getElementById('message');
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement('div');
    msgDiv.id = 'message';
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(msgDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (msgDiv.parentNode) {
            msgDiv.parentNode.removeChild(msgDiv);
        }
    }, 3000);
}

// Initial load when page loads
loadInventory();
