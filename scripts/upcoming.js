document.addEventListener("DOMContentLoaded", function () {
	var toggle = document.querySelector(".upcomingToggle");
	if (!toggle) return;

	var buttons = toggle.querySelectorAll(".upcomingToggle__button");
	var thumb = toggle.querySelector(".upcomingToggle__thumb");

	var cardsShell = document.getElementById("upcomingCardsShell");
	var soloCard = document.getElementById("upcomingSoloCard");
	var groupCard = document.getElementById("upcomingGroupCard");

	var currentView = "solo";

	function updateThumbPosition() {
		if (!thumb) return;

		var activeButton = Array.from(buttons).find(function (btn) {
			return btn.getAttribute("data-view") === currentView;
		});

		if (!activeButton) return;

		var buttonRect = activeButton.getBoundingClientRect();
		var toggleRect = toggle.getBoundingClientRect();

		var left = buttonRect.left - toggleRect.left;
		var width = buttonRect.width;

		thumb.style.left = left + "px";
		thumb.style.width = width + "px";
	}

	function setActiveView(view) {
		currentView = view;

		var showSolo = view === "solo";

		// Toggle button state
		buttons.forEach(function (btn) {
			var isActive = btn.getAttribute("data-view") === view;
			btn.classList.toggle("upcomingToggle__button--active", isActive);
			btn.setAttribute("aria-selected", isActive ? "true" : "false");
		});

		// Animate cards using active/inactive classes
		if (soloCard && groupCard) {
			var activeCard = showSolo ? soloCard : groupCard;
			var inactiveCard = showSolo ? groupCard : soloCard;

			activeCard.classList.add("upcomingCard--active");
			activeCard.classList.remove("upcomingCard--inactive");
			activeCard.setAttribute("aria-hidden", "false");

			inactiveCard.classList.add("upcomingCard--inactive");
			inactiveCard.classList.remove("upcomingCard--active");
			inactiveCard.setAttribute("aria-hidden", "true");

			// Smooth height on the wrapper
			if (cardsShell) {
				var newHeight = activeCard.offsetHeight;
				cardsShell.style.height = newHeight + "px";
			}
		}

		// Move the thumb
		updateThumbPosition();
	}

	buttons.forEach(function (button) {
		button.addEventListener("click", function () {
			var view = button.getAttribute("data-view");
			setActiveView(view);
		});
	});

	// Initialize
	setActiveView("solo");

	// Keep thumb aligned on resize
	window.addEventListener("resize", function () {
		updateThumbPosition();
	});
});