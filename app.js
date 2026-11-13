// Импортируем функции, включая doc и deleteDoc для удаления
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ваша конфигурация из Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC3A75rF_qevP3sDN0z0Arg5BxEGmYQyxo",
  authDomain: "miningrepairapp.firebaseapp.com",
  projectId: "miningrepairapp",
  storageBucket: "miningrepairapp.firebasestorage.app",
  messagingSenderId: "2855864834",
  appId: "1:2855864834:web:7f3d70036638d15ce6b51b"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const requestsRef = collection(db, "requests");
const usersRef = collection(db, "users");

// ==========================================
// 1. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ==========================================
window.switchTab = function(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-content');
    btnElement.classList.add('active');
};

// ==========================================
// 2. ЗАГРУЗКА ЗАЯВОК
// ==========================================
const tableBody = document.getElementById("tableBody");
const q = query(requestsRef, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = "";

    if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Заявок пока нет...</td></tr>`;
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.timestamp).toLocaleString('ru-RU');
        const statusClass = data.status ? data.status.replace(/ /g, '-') : 'Новая';
        const priorityClass = data.priority || 'Обычный';

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${date}</td>
            <td><b>${data.title}</b></td>
            <td>${data.category || 'Не указана'}</td>
            <td>${data.location}</td>
            <td class="priority-${priorityClass}">${priorityClass}</td>
            <td class="status-${statusClass}">${data.status}</td>
            <td>${data.assignedTo || '-'}</td>
            <td>
                <button class="btn-delete" onclick="deleteRequest('${doc.id}')">УДАЛИТЬ</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}, (error) => {
    console.error("Ошибка при получении данных: ", error);
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Ошибка загрузки. Проверьте правила Firestore.</td></tr>`;
});

// ==========================================
// 3. ЗАГРУЗКА ПЕРСОНАЛА
// ==========================================
const staffBody = document.getElementById("staffBody");

onSnapshot(usersRef, (snapshot) => {
    staffBody.innerHTML = "";
    
    if (snapshot.empty) {
        staffBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Сотрудников пока нет...</td></tr>`;
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.email || 'Не указан'}</td>
            <td><b>${data.role || 'Не указана'}</b></td>
        `;
        staffBody.appendChild(row);
    });
}, (error) => {
    console.error("Ошибка загрузки персонала: ", error);
});

// ==========================================
// 4. ОТПРАВКА НОВОЙ ЗАЯВКИ
// ==========================================
const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "ОТПРАВКА...";

    const newRequest = {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        status: "Новая",
        authorEmail: "master@web.com",
        assignedTo: "",
        timestamp: Date.now()
    };

    try {
        await addDoc(requestsRef, newRequest);
        form.reset();
        alert("✅ Заявка успешно создана! Проверьте её на телефоне.");
    } catch (error) {
        console.error("Ошибка при отправке: ", error);
        alert("❌ Ошибка при создании заявки.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "СОЗДАТЬ ЗАЯВКУ";
    }
});

// ==========================================
// 5. УДАЛЕНИЕ ЗАЯВКИ
// ==========================================
window.deleteRequest = async function(requestId) {
    if (confirm("Вы уверены, что хотите удалить эту заявку?")) {
        try {
            await deleteDoc(doc(db, "requests", requestId));
            // Таблица обновится автоматически благодаря onSnapshot
        } catch (error) {
            console.error("Ошибка при удалении: ", error);
            alert("❌ Не удалось удалить заявку.");
        }
    }
};