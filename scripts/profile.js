document.addEventListener("DOMContentLoaded", function () {
	/**
	 * --------------------------------
	 * PHOTO GRID LOGIC
	 * --------------------------------
	 */
	var slots = document.querySelectorAll(".profilePhotoSlot");

	if (slots && slots.length) {
		slots.forEach(function (slot) {
			var slotId = slot.getAttribute("data-slot");
			if (!slotId) return;

			var button = slot.querySelector('.profilePhotoSlot__button[data-slot="' + slotId + '"]');
			var input = slot.querySelector('.profilePhotoSlot__input[data-slot="' + slotId + '"]');

			if (!button || !input) return;

			// Clicking a square opens the file picker
			button.addEventListener("click", function () {
				input.click();
			});

			// Show preview when photo is selected
			input.addEventListener("change", function (event) {
				var file = event.target.files && event.target.files[0];
				if (!file) return;
				if (!file.type || !file.type.startsWith("image/")) return;

				var reader = new FileReader();

				reader.onload = function (e) {
					var dataUrl = e.target && e.target.result;
					if (!dataUrl) return;

					button.style.backgroundImage = "url('" + dataUrl + "')";
					button.classList.add("profilePhotoSlot__button--hasImage");
				};

				reader.readAsDataURL(file);
			});
		});
	}

	/**
	 * --------------------------------
	 * PREFERENCE CHIPS: REMOVE ON X
	 * --------------------------------
	 */
	var prefsContainers = document.querySelectorAll(".profilePrefsCard__tags");

	if (prefsContainers && prefsContainers.length) {
		prefsContainers.forEach(function (container) {
			container.addEventListener("click", function (event) {
				var removeIcon = event.target.closest(".profileTag__remove");
				if (!removeIcon) return;

				var chip = removeIcon.closest(".profileTag");
				if (!chip) return;

				chip.remove();
			});
		});
	}

	/**
	 * --------------------------------
	 * PROFILE TOGGLE (ABOUT / PREFS)
	 * --------------------------------
	 */
	var toggle = document.querySelector(".profileToggle");
	if (!toggle) return;

	var toggleButtons = toggle.querySelectorAll(".profileToggle__button");
	var thumb = toggle.querySelector(".profileToggle__thumb");
	var aboutView = document.getElementById("profileViewAbout");
	var prefsView = document.getElementById("profileViewPrefs");

	var currentView = "about";

	function updateThumbPosition() {
		if (!thumb) return;

		var activeButton = Array.from(toggleButtons).find(function (btn) {
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

		// Buttons
		toggleButtons.forEach(function (btn) {
			var isActive = btn.getAttribute("data-view") === view;
			btn.classList.toggle("profileToggle__button--active", isActive);
			btn.setAttribute("aria-selected", isActive ? "true" : "false");
		});

		// Views
		if (aboutView && prefsView) {
			var showAbout = view === "about";
			aboutView.hidden = !showAbout;
			prefsView.hidden = showAbout;
		}

		updateThumbPosition();
	}

	toggleButtons.forEach(function (button) {
		button.addEventListener("click", function () {
			var view = button.getAttribute("data-view");
			setActiveView(view);
		});
	});

	// Initialize
	setActiveView("about");

	// Keep thumb aligned on resize
	window.addEventListener("resize", function () {
		updateThumbPosition();
	});
});