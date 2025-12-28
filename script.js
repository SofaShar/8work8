const openFormBtn = document.getElementById("openFormBtn");
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.getElementById("closePopupBtn");
const feedbackForm = document.getElementById("feedbackForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const policyLink = document.getElementById("policyLink");
const body = document.body;

// Ключ для LocalStorage
const STORAGE_KEY = "feedbackFormData";

// Флаг для отслеживания состояния формы
let isPopupOpen = false;

// Проверка размера экрана
function isMobileDevice() {
  return window.innerWidth <= 768 || window.innerHeight <= 600;
}

// Настройка формы под мобильные устройства
function adjustFormForMobile() {
  if (isMobileDevice()) {
    const formScroll = document.querySelector(".form-scroll");
    const popupContent = document.querySelector(".popup-content");

    // Фиксированная высота для мобильных устройств
    const maxHeight = Math.min(window.innerHeight * 0.9, 700);
    popupContent.style.maxHeight = `${maxHeight}px`;

    // Высота для области прокрутки
    const headerHeight = document.querySelector("h2").offsetHeight;
    const buttonsHeight = document.querySelector(".form-buttons").offsetHeight;
    const padding = 30;

    const scrollHeight = maxHeight - headerHeight - buttonsHeight - padding;
    formScroll.style.maxHeight = `${Math.max(scrollHeight, 200)}px`;
  }
}

// Показать попап
function openPopup() {
  popupOverlay.style.display = "flex";
  body.classList.add("popup-open");
  isPopupOpen = true;

  // Настраиваем форму для мобильных устройств
  adjustFormForMobile();

  // Изменяем URL с помощью History API
  if (window.location.hash !== "#feedback-form") {
    history.pushState({ formOpen: true }, "", "#feedback-form");
  }

  // Загружаем сохраненные данные
  loadFormData();

  // Фокусируемся на первом поле
  setTimeout(() => {
    document.getElementById("fullName").focus();
  }, 300);
}

// Скрыть попап
function closePopup() {
  popupOverlay.style.display = "none";
  body.classList.remove("popup-open");
  isPopupOpen = false;

  // Восстанавливаем оригинальный URL
  if (window.location.hash === "#feedback-form") {
    history.back();
  }
}

// Обработчик кнопки "Назад" в браузере
window.addEventListener("popstate", function (event) {
  if (isPopupOpen && window.location.hash !== "#feedback-form") {
    closePopup();
  } else if (!isPopupOpen && window.location.hash === "#feedback-form") {
    openPopup();
  }
});

// Открытие формы по клику на кнопку
openFormBtn.addEventListener("click", openPopup);

// Закрытие формы по клику на крестик
closePopupBtn.addEventListener("click", closePopup);

// Закрытие формы по клику вне контента
popupOverlay.addEventListener("click", function (event) {
  if (event.target === popupOverlay) {
    closePopup();
  }
});

// Обработка ссылки на политику
policyLink.addEventListener("click", function (e) {
  e.preventDefault();
  alert(
    "Политика обработки персональных данных:\n\nМы собираем и храним ваши данные исключительно для обработки вашего запроса и не передаем их третьим лицам без вашего согласия.\n\nСрок хранения данных: 1 год.\n\nВы имеете право запросить удаление ваших данных в любое время."
  );
});

// Сохранение данных формы в LocalStorage
function saveFormData() {
  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    organization: document.getElementById("organization").value,
    message: document.getElementById("message").value,
    agree: document.getElementById("agree").checked,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

// Загрузка данных из LocalStorage
function loadFormData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    try {
      const formData = JSON.parse(savedData);

      document.getElementById("fullName").value = formData.fullName || "";
      document.getElementById("email").value = formData.email || "";
      document.getElementById("phone").value = formData.phone || "";
      document.getElementById("organization").value =
        formData.organization || "";
      document.getElementById("message").value = formData.message || "";
      document.getElementById("agree").checked = formData.agree || false;
    } catch (e) {
      console.error("Ошибка при загрузке данных:", e);
      // Если данные повреждены, удаляем их
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Очистка данных формы
function clearFormData() {
  // Сначала очищаем LocalStorage
  localStorage.removeItem(STORAGE_KEY);

  // Затем очищаем форму
  feedbackForm.reset();

  // Явно сбрасываем чекбокс
  document.getElementById("agree").checked = false;
}

// Автосохранение при изменении полей формы
let saveTimeout;
function debounceSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveFormData, 500);
}

document
  .querySelectorAll(
    '#feedbackForm input, #feedbackForm textarea, #feedbackForm input[type="checkbox"]'
  )
  .forEach((element) => {
    element.addEventListener("input", debounceSave);
    element.addEventListener("change", debounceSave);
  });

// Обработка отправки формы
feedbackForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Показать состояние загрузки
  submitBtn.disabled = true;
  submitBtn.textContent = "Отправка...";

  // Скрыть предыдущие сообщения
  successMessage.style.display = "none";
  errorMessage.style.display = "none";

  // Собираем данные формы
  const formData = new FormData(feedbackForm);
  const data = Object.fromEntries(formData);

  try {
    // Используем Formspree как бекэнд
    // ВАЖНО: Замените этот URL на свой от Formspree
    const response = await fetch("https://formspree.io/f/mzbnegjl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      // Успешная отправка
      successMessage.style.display = "block";
      successMessage.textContent = "✅ Сообщение успешно отправлено!";

      // Очищаем форму и LocalStorage
      clearFormData();

      // Закрываем попап через 2 секунды
      setTimeout(() => {
        if (isPopupOpen) {
          closePopup();
        }
      }, 2000);
    } else {
      throw new Error(result.error || "Ошибка сервера");
    }
  } catch (error) {
    // Ошибка отправки
    console.error("Ошибка отправки формы:", error);
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "❌ Ошибка: " + (error.message || "Неизвестная ошибка");
  } finally {
    // Восстанавливаем кнопку
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить сообщение";
  }
});

// Обработка клавиши Escape для закрытия формы
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && isPopupOpen) {
    closePopup();
  }
});

// Изменение размера при ресайзе окна
let resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (isPopupOpen) {
      adjustFormForMobile();
    }
  }, 100);
});

// Инициализация при загрузке страницы
window.addEventListener("DOMContentLoaded", function () {
  // Проверяем, если URL уже содержит хэш формы
  if (window.location.hash === "#feedback-form") {
    // Небольшая задержка для корректного отображения
    setTimeout(openPopup, 100);
  }

  // Загружаем данные при загрузке страницы
  loadFormData();
});

// Валидация номера телефона
document.getElementById("phone").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 0) {
    if (!value.startsWith("7") && value.length > 0) {
      value = "7" + value;
    }

    let formatted = "+7";
    if (value.length > 1) {
      formatted += " (" + value.substring(1, 4);
    }
    if (value.length >= 4) {
      formatted += ") " + value.substring(4, 7);
    }
    if (value.length >= 7) {
      formatted += "-" + value.substring(7, 9);
    }
    if (value.length >= 9) {
      formatted += "-" + value.substring(9, 11);
    }

    e.target.value = formatted;
  }
});

// Предотвращение зума на iOS при фокусе
document.querySelectorAll("input, textarea").forEach((element) => {
  element.addEventListener("focus", function () {
    if (isMobileDevice()) {
      // На iOS это помогает предотвратить зум
      this.style.fontSize = "16px";
    }
  });

  element.addEventListener("blur", function () {
    if (isMobileDevice()) {
      this.style.fontSize = "";
    }
  });
});
