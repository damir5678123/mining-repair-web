// Импортируем только те функции, которые нам нужны (без Analytics)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ==========================================
// 1. СЛУШАЕМ БАЗУ И ОТРИСОВЫВАЕМ ТАБЛИЦУ
// ==========================================
const tableBody = document.getElementById("tableBody");

// Создаем запрос: взять все заявки, отсортировать по времени (сначала новые)
const q = query(requestsRef, orderBy("timestamp", "desc"));

// onSnapshot - это магия Firebase. Он автоматически обновит таблицу, 
// если кто-то (например, с телефона) добавит или изменит заявку!
onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = ""; // Очищаем таблицу перед обновлением

    if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Заявок пока нет...</td></tr>`;
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Форматируем дату
        const date = new Date(data.timestamp).toLocaleString('ru-RU');
        
        // Заменяем пробелы в классе, чтобы CSS работал (например, "В работе" -> "В-работе")
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
        `;
        tableBody.appendChild(row);
    });
}, (error) => {
    console.error("Ошибка при получении данных: ", error);
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Ошибка загрузки. Проверьте правила Firestore.</td></tr>`;
});

// ==========================================
// 2. ОТПРАВЛЯЕМ НОВУЮ ЗАЯВКУ ИЗ ФОРМЫ
// ==========================================
const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Останавливаем перезагрузку страницы

    // Блокируем кнопку, чтобы не нажали дважды
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    // Собираем данные из полей
    const newRequest = {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        status: "Новая",
        authorEmail: "master@web.com", // Притворяемся мастером с сайта
        assignedTo: "",
        timestamp: Date.now()
    };

    try {
        // Добавляем документ в Firestore
        await addDoc(requestsRef, newRequest);
        
        // Очищаем форму
        form.reset();
        alert("✅ Заявка успешно создана! Проверьте её на телефоне.");
    } catch (error) {
        console.error("Ошибка при отправке: ", error);
        alert("❌ Ошибка при создании заявки. Проверьте консоль (F12).");
    } finally {
        // Возвращаем кнопку в нормальное состояние
        submitBtn.disabled = false;
        submitBtn.textContent = "Создать заявку";
    }
});