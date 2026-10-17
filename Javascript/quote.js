const quoteForm = document.getElementById("quote-form");
if (quoteForm) {
  const nameInput = document.getElementById("full-name");
  const phoneInput = document.getElementById("phone");
  const eventTypeInput = document.getElementById("event-type");
  const eventDateInput = document.getElementById("event-date");
  const guestCountInput = document.getElementById("guest-count");
  const cityInput = document.getElementById("city");
  const menuTypeInput = document.getElementById("menu-type");
  const dateHint = document.getElementById("date-hint");
  const toDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const fromDateValue = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const updateMinimumDate = () => {
    const earliestDate = new Date();
    earliestDate.setHours(12, 0, 0, 0);
    earliestDate.setDate(earliestDate.getDate() + 5);
    eventDateInput.min = toDateValue(earliestDate);
    if (eventDateInput.value && eventDateInput.value < eventDateInput.min) {
      eventDateInput.value = "";
    }
  };
  eventDateInput.type = "hidden";
  eventDateInput.required = false;
  const dateWrap = eventDateInput.parentElement;
  dateWrap.classList.add("has-date-calendar");
  const dateToggle = document.createElement("button");
  dateToggle.type = "button";
  dateToggle.id = "event-date-toggle";
  dateToggle.className = "date-calendar-toggle";
  dateToggle.setAttribute("aria-haspopup", "dialog");
  dateToggle.setAttribute("aria-expanded", "false");
  dateToggle.setAttribute("aria-controls", "event-date-calendar");
  dateWrap.append(dateToggle);
  const dateLabel = quoteForm.querySelector('label[for="event-date"]');
  if (dateLabel) dateLabel.htmlFor = dateToggle.id;
  const calendar = document.createElement("div");
  calendar.id = "event-date-calendar";
  calendar.className = "date-calendar";
  calendar.hidden = true;
  calendar.setAttribute("role", "dialog");
  calendar.setAttribute("aria-label", "Escolha a data do evento");
  dateWrap.append(calendar);
  let visibleMonth;
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const syncDateLabel = () => {
    dateToggle.textContent = eventDateInput.value
      ? eventDateInput.value.split("-").reverse().join("/")
      : "Selecione a data do evento";
  };
  const closeCalendar = (returnFocus = false) => {
    calendar.hidden = true;
    dateToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) dateToggle.focus();
  };
  const renderCalendar = () => {
    calendar.replaceChildren();
    const header = document.createElement("div");
    header.className = "date-calendar-header";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "‹";
    previous.setAttribute("aria-label", "Mês anterior");
    const minimumMonth = fromDateValue(eventDateInput.min);
    minimumMonth.setDate(1);
    previous.disabled = visibleMonth <= minimumMonth;
    const monthLabel = document.createElement("span");
    monthLabel.textContent = `${months[visibleMonth.getMonth()]} de ${visibleMonth.getFullYear()}`;
    monthLabel.setAttribute("aria-live", "polite");
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Próximo mês");
    const changeMonth = (offset) => {
      visibleMonth.setMonth(visibleMonth.getMonth() + offset);
      renderCalendar();
      calendar
        .querySelector(
          offset > 0
            ? '[aria-label="Próximo mês"]'
            : '[aria-label="Mês anterior"]',
        )
        .focus();
    };
    previous.addEventListener("click", () => changeMonth(-1));
    next.addEventListener("click", () => changeMonth(1));
    header.append(previous, monthLabel, next);
    const grid = document.createElement("div");
    grid.className = "date-calendar-grid";
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((day) => {
      const label = document.createElement("span");
      label.className = "date-calendar-weekday";
      label.textContent = day;
      grid.append(label);
    });
    for (let i = 0; i < visibleMonth.getDay(); i++) {
      const blank = document.createElement("span");
      blank.setAttribute("aria-hidden", "true");
      grid.append(blank);
    }
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0, 12).getDate();
    for (let day = 1; day <= lastDay; day++) {
      const value = toDateValue(new Date(year, month, day, 12));
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      button.className = "date-calendar-day";
      button.dataset.date = value;
      button.disabled = value < eventDateInput.min;
      button.setAttribute(
        "aria-label",
        `${day} de ${months[month].toLowerCase()} de ${year}`,
      );
      button.setAttribute(
        "aria-pressed",
        String(value === eventDateInput.value),
      );
      button.addEventListener("click", () => {
        updateMinimumDate();
        if (value < eventDateInput.min) {
          renderCalendar();
          return;
        }
        eventDateInput.value = value;
        syncDateLabel();
        closeCalendar(true);
        eventDateInput.dispatchEvent(new Event("change", { bubbles: true }));
      });
      grid.append(button);
    }
    calendar.append(header, grid);
  };
  const openCalendar = () => {
    if (dateToggle.disabled) return;
    updateMinimumDate();
    syncDateLabel();
    visibleMonth = fromDateValue(eventDateInput.value || eventDateInput.min);
    visibleMonth.setDate(1);
    renderCalendar();
    calendar.hidden = false;
    dateToggle.setAttribute("aria-expanded", "true");
    const focusDate = eventDateInput.value || eventDateInput.min;
    calendar.querySelector(`[data-date="${focusDate}"]`).focus();
  };
  dateToggle.addEventListener("click", () => {
    if (calendar.hidden) openCalendar();
    else closeCalendar();
  });
  document.addEventListener("click", (event) => {
    if (!dateWrap.contains(event.target)) closeCalendar();
  });
  dateWrap.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !calendar.hidden) {
      event.preventDefault();
      closeCalendar(true);
    }
    const date = event.target.dataset.date;
    const offset = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[
      event.key
    ];
    if (!calendar.hidden && date && offset) {
      event.preventDefault();
      updateMinimumDate();
      const target = fromDateValue(date);
      target.setDate(target.getDate() + offset);
      const value = toDateValue(target);
      if (value < eventDateInput.min) return;
      visibleMonth = new Date(target.getFullYear(), target.getMonth(), 1, 12);
      renderCalendar();
      calendar.querySelector(`[data-date="${value}"]`).focus();
    }
  });

  const updateDateAvailability = () => {
    const hasRequiredDetails =
      nameInput.value.trim() !== "" &&
      phoneInput.value.trim() !== "" &&
      eventTypeInput.value !== "";
    updateMinimumDate();
    eventDateInput.disabled = !hasRequiredDetails;
    dateToggle.disabled = !hasRequiredDetails;
    if (!hasRequiredDetails) {
      eventDateInput.value = "";
      closeCalendar();
    }
    syncDateLabel();
    if (dateHint)
      dateHint.style.display = hasRequiredDetails ? "none" : "block";
  };

  nameInput.addEventListener("input", updateDateAvailability);
  phoneInput.addEventListener("input", updateDateAvailability);
  eventTypeInput.addEventListener("change", updateDateAvailability);
  guestCountInput.addEventListener("input", () => {
    if (Number(guestCountInput.value) > 300) guestCountInput.value = "300";
  });
  updateDateAvailability();

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateMinimumDate();
    if (eventDateInput.value < eventDateInput.min) {
      syncDateLabel();
      openCalendar();
      return;
    }

    const fullName = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const eventType = eventTypeInput.value;
    const eventDate = eventDateInput.value;
    const guestCount = guestCountInput.value;
    const city = cityInput.value;
    const menuType = menuTypeInput.value;
    const notes = document.getElementById("notes").value.trim();
    const formattedDate = eventDate
      ? eventDate.split("-").reverse().join("/")
      : "";
    const messageLines = [
      "*Solicitação de Orçamento - Sampaio Gourmet*",
      "",
      `*Nome:* ${fullName}`,
      `*Telefone:* ${phone}`,
      `*Tipo de Evento:* ${eventType}`,
      `*Data do Evento:* ${formattedDate}`,
      `*Nº de Convidados:* ${guestCount} pessoas`,
      `*Cidade:* ${city}`,
      `*Tipo de Cardápio:* ${menuType}`,
    ];
    if (notes) messageLines.push(`*Observações:* ${notes}`);
    const message = `${messageLines.join("\n")}\n`;
    const whatsappNumber = "5511966884935";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });
}
