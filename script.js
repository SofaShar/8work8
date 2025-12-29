const openFormBtn = document.getElementById("openFormBtn");
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.getElementById("closePopupBtn");
const feedbackForm = document.getElementById("feedbackForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const policyLink = document.getElementById("policyLink");
const phoneInput = document.getElementById("phone");
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
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Очистка данных формы
function clearFormData() {
  localStorage.removeItem(STORAGE_KEY);
  feedbackForm.reset();
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

// ИСПРАВЛЕННАЯ МАСКА ДЛЯ ТЕЛЕФОНА
function formatPhoneNumber(value) {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, "");

  // Если номер пустой, возвращаем пустую строку
  if (!numbers) return "";

  // Оставляем только первые 11 цифр (российский номер)
  const limitedNumbers = numbers.substring(0, 11);

  // Форматируем номер
  let formatted = "+7";

  if (limitedNumbers.length > 1) {
    formatted += " (" + limitedNumbers.substring(1, 4);
  }
  if (limitedNumbers.length >= 4) {
    formatted += ") " + limitedNumbers.substring(4, 7);
  }
  if (limitedNumbers.length >= 7) {
    formatted += "-" + limitedNumbers.substring(7, 9);
  }
  if (limitedNumbers.length >= 9) {
    formatted += "-" + limitedNumbers.substring(9, 11);
  }

  return formatted;
}

// Обработчик ввода номера телефона
phoneInput.addEventListener("input", function (e) {
  const cursorPosition = e.target.selectionStart;
  const oldValue = e.target.value;
  const formattedValue = formatPhoneNumber(oldValue);

  // Устанавливаем отформатированное значение
  e.target.value = formattedValue;

  // Восстанавливаем позицию курсора
  const newCursorPosition = getNewCursorPosition(
    oldValue,
    formattedValue,
    cursorPosition
  );
  e.target.setSelectionRange(newCursorPosition, newCursorPosition);

  // Сохраняем данные
  debounceSave();
});

// Функция для расчета новой позиции курсора
function getNewCursorPosition(oldValue, newValue, oldCursorPos) {
  // Если старая позиция в конце строки, ставим в конец новой строки
  if (oldCursorPos >= oldValue.length) {
    return newValue.length;
  }

  // Считаем сколько цифр до старой позиции курсора
  const digitsBeforeCursor = oldValue
    .substring(0, oldCursorPos)
    .replace(/\D/g, "").length;

  // Ищем позицию в новой строке после N цифр
  let digitCount = 0;
  for (let i = 0; i < newValue.length; i++) {
    if (/\d/.test(newValue[i])) {
      digitCount++;
    }
    if (digitCount >= digitsBeforeCursor) {
      // Возвращаем позицию после этой цифры
      return i + 1;
    }
  }

  return newValue.length;
}

// Обработчик вставки текста (Ctrl+V)
phoneInput.addEventListener("paste", function (e) {
  e.preventDefault();
  const pastedText = (e.clipboardData || window.clipboardData).getData("text");
  const numbers = pastedText.replace(/\D/g, "");

  if (numbers) {
    // Если вставлены только цифры, начинающиеся с 7 или 8, заменяем на 7
    let cleanNumbers = numbers;
    if (cleanNumbers.startsWith("8")) {
      cleanNumbers = "7" + cleanNumbers.substring(1);
    }

    // Форматируем и вставляем
    const formatted = formatPhoneNumber(cleanNumbers);

    // Заменяем текущее значение
    this.value = formatted;

    // Ставим курсор в конец
    setTimeout(() => {
      this.setSelectionRange(formatted.length, formatted.length);
    }, 0);

    // Сохраняем данные
    debounceSave();
  }
});

// Обработка клавиш Backspace и Delete для корректного удаления
phoneInput.addEventListener("keydown", function (e) {
  // Запоминаем позицию курсора перед удалением
  if (e.key === "Backspace" || e.key === "Delete") {
    const cursorPos = this.selectionStart;
    const selectionLength = this.selectionEnd - this.selectionStart;

    // Если есть выделение, удаляем его
    if (selectionLength > 0) {
      e.preventDefault();

      // Удаляем выделенные символы
      const value = this.value;
      const before = value.substring(0, this.selectionStart);
      const after = value.substring(this.selectionEnd);
      const newValue = before + after;

      // Форматируем новое значение
      const formatted = formatPhoneNumber(newValue);
      this.value = formatted;

      // Устанавливаем курсор на место первого удаленного символа
      this.setSelectionRange(cursorPos, cursorPos);

      // Сохраняем данные
      debounceSave();
    }
  }
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
    setTimeout(openPopup, 100);
  }

  // Загружаем данные при загрузке страницы
  loadFormData();
});

// Предотвращение зума на iOS при фокусе
document.querySelectorAll("input, textarea").forEach((element) => {
  element.addEventListener("focus", function () {
    if (isMobileDevice()) {
      this.style.fontSize = "16px";
    }
  });

  element.addEventListener("blur", function () {
    if (isMobileDevice()) {
      this.style.fontSize = "";
    }
  });
});
