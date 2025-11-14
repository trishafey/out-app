// Matchmaker onboarding chat – front-end only state machine.

(function() {
	const messagesEl = document.getElementById("mm-messages");
	const quickRepliesEl = document.getElementById("mm-quick-replies");
	const formEl = document.getElementById("mm-form");
	const inputEl = document.getElementById("mm-input");

	const session = {
		fullName: null,
		phone: null,
		phoneVerified: false,
		email: null,
		emailConfirmed: false,
		locationMethod: null,
		locationText: null,
		detectedCity: null,
		locationConfirmed: false,
		finalChoice: null
	};

	let currentStateId = null;
	let isBotBusy = false;

	function delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function formatTime(date) {
		const d = date || new Date();
		let hours = d.getHours();
		const minutes = d.getMinutes().toString().padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12;
		return `${hours}:${minutes} ${ampm}`;
	}

	function scrollToBottom() {
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	function textToHtml(text) {
		const escaped = text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		return escaped.replace(/\n/g, "<br>");
	}

	function createTypingIndicator() {
		const row = document.createElement("div");
		row.className = "mm-message-row mm-message-row--bot";

		const avatar = document.createElement("div");
		avatar.className = "mm-avatar";
		avatar.innerHTML =
			'<img src="assets/chat-icon.svg" alt="" class="mm-chat-icon">';

		const bubble = document.createElement("div");
		bubble.className = "mm-bubble mm-bubble--bot mm-bubble--typing";

		for (let i = 0; i < 3; i++) {
			const dot = document.createElement("span");
			dot.className = "mm-typing-dot";
			bubble.appendChild(dot);
		}

		row.appendChild(avatar);
		row.appendChild(bubble);
		return row;
	}

	function appendMetaRow(senderType) {
		const meta = document.createElement("div");
		const isBot = senderType === "bot";
		meta.className = "mm-meta " + (isBot ? "mm-meta--bot" : "mm-meta--user");
		const name = isBot ? "Out Matchmaker" : session.fullName || "You";
		meta.textContent = `${name} • ${formatTime()}`;
		messagesEl.appendChild(meta);
	}

	async function botSay(text, options = {}) {
		isBotBusy = true;
		const appendMeta = options.appendMeta !== false;

		const typing = createTypingIndicator();
		messagesEl.appendChild(typing);
		scrollToBottom();

		const baseDelay = 550;
		const perChar = 18;
		const computedDelay = Math.min(baseDelay + text.length * perChar, 1800);
		await delay(computedDelay);

		messagesEl.removeChild(typing);

		const row = document.createElement("div");
		row.className = "mm-message-row mm-message-row--bot";

		const avatar = document.createElement("div");
		avatar.className = "mm-avatar";
		avatar.innerHTML =
			'<img src="assets/chat-icon.svg" alt="" class="mm-chat-icon">';

		const bubble = document.createElement("div");
		bubble.className = "mm-bubble mm-bubble--bot";
		bubble.innerHTML = textToHtml(text);

		row.appendChild(avatar);
		row.appendChild(bubble);

		messagesEl.appendChild(row);
		if (appendMeta) {
			appendMetaRow("bot");
		}
		scrollToBottom();

		isBotBusy = false;
	}

	function userSay(textToDisplay) {
		const row = document.createElement("div");
		row.className = "mm-message-row mm-message-row--user";

		const bubble = document.createElement("div");
		bubble.className = "mm-bubble mm-bubble--user";
		bubble.innerHTML = textToHtml(textToDisplay);

		row.appendChild(bubble);
		messagesEl.appendChild(row);
		appendMetaRow("user");
		scrollToBottom();
	}

	function renderQuickReplies(options) {
		quickRepliesEl.innerHTML = "";
		if (!options || !options.length) return;

		options.forEach((opt) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "mm-quick-reply";
			btn.textContent = opt.label;
			btn.addEventListener("click", () => {
				handleUserInput(opt.value, {
					fromQuickReply: true,
					displayText: opt.label,
					optionId: opt.id || null
				});
			});
			quickRepliesEl.appendChild(btn);
		});
	}

	function setInputState(state) {
		const placeholder =
			(state && state.placeholder) || "Type your message...";
		inputEl.placeholder = placeholder;

		if (state && state.inputMode) {
			inputEl.setAttribute("inputmode", state.inputMode);
		} else {
			inputEl.setAttribute("inputmode", "text");
		}
	}

	const chatFlow = {
		greeting: {
			async onEnter({ goToState }) {
				await botSay(
					"Hello, I'm Out 👋\n\nI'm your personal matchmaker. I'll get to know you, learn what you like, and set you up with people you actually click with. Be as honest as possible, no judgment!", { appendMeta: false });
				await botSay(
					"But for now, I'll set up your profile. Let's start with the basics.", { appendMeta: false });
				await botSay("What is your first and last name?");
				goToState("askName");
			}
		},

		askName: {
			expects: "text",
			placeholder: "Type your first and last name...",
			validate(value) {
				const trimmed = value.trim();
				return trimmed.split(/\s+/).length >= 2;
			},
			errorMessage: "Please enter your first and last name.",
			async onUserInput({ session, goToState }, value) {
				session.fullName = value.trim();
				goToState("nameThanks");
			}
		},

		nameThanks: {
			async onEnter({ session, goToState }) {
				await botSay(`Nice to meet you, ${session.fullName} ✨`, { appendMeta: false });
				goToState("termsIntro");
			}
		},

		termsIntro: {
			async onEnter({ goToState }) {
				await botSay("Before we continue, I need your OK on the basics.", { appendMeta: false });
				await botSay(
					"View Terms of Service\nView Privacy Policy\n\nDo you agree to these terms?"
				);
				goToState("termsConfirm");
			}
		},

		termsConfirm: {
			expects: "choice",
			options: [{
				id: "agree",
				label: "Yes, I agree",
				value: "yes"
			}],
			validate(value) {
				return /^y(es)?$/i.test(value.trim());
			},
			errorMessage: "Please agree to continue.",
			async onUserInput({ goToState }) {
				goToState("thanksForConsent");
			}
		},

		thanksForConsent: {
			async onEnter({ goToState }) {
				await botSay("Thank you!", { appendMeta: false });
				await botSay("What's the best number to reach you?");
				goToState("askPhone");
			}
		},

		askPhone: {
			expects: "text",
			placeholder: "Add your mobile number...",
			inputMode: "tel",
			validate(value) {
				const digits = value.replace(/\D/g, "");
				return digits.length >= 10;
			},
			errorMessage: "Please enter a valid phone number.",
			async onUserInput({ session, goToState }, value) {
				session.phone = value.trim();
				goToState("phoneVerifyPrompt");
			}
		},

		phoneVerifyPrompt: {
			async onEnter({ goToState }) {
				await botSay(
					"Great! I sent you a verification code. Please type it below."
				);
				goToState("phoneVerifyCode");
			}
		},

		phoneVerifyCode: {
			expects: "text",
			placeholder: "Enter SMS verification code...",
			inputMode: "numeric",
			validate(value) {
				const trimmed = value.trim();
				return /^\d{4,8}$/.test(trimmed);
			},
			errorMessage: "That code doesn’t look right. Try again.",
			async onUserInput({ session, goToState }) {
				session.phoneVerified = true;
				await botSay("✅ Verified! Thanks.", { appendMeta: false });
				await botSay("Now what's your email?");
				goToState("askEmail");
			}
		},

		askEmail: {
			expects: "text",
			placeholder: "Add your email...",
			inputMode: "email",
			validate(value) {
				const trimmed = value.trim();
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
			},
			errorMessage: "Please enter a valid email address.",
			async onUserInput({ session, goToState }, value) {
				session.email = value.trim();
				await botSay(
					"Got it. I'll send a confirmation link — you can verify anytime.", { appendMeta: false });
				goToState("locationIntro");
			}
		},

		locationIntro: {
			async onEnter({ goToState }) {
				await botSay(
					"I can use your location to match you with people nearby and set up dates in your area.\n\nHow do you want to share it?"
				);
				goToState("locationChoice");
			}
		},

		locationChoice: {
			expects: "choice",
			options: [{
					id: "type-location",
					label: "I'll type it instead",
					value: "typed"
				},
				{
					id: "share-location",
					label: "Share my location",
					value: "device"
				}
			],
			async onUserInput({ session, goToState }, value) {
				session.locationMethod = value;
				if (value === "typed") {
					await botSay("Okay! Type your city or neighborhood.");
					goToState("askLocationText");
				} else {
					session.detectedCity = "Soho, Manhattan, New York City";
					goToState("confirmDetectedLocation");
				}
			}
		},

		askLocationText: {
			expects: "text",
			placeholder: "e.g., Soho, Manhattan, New York City",
			async onUserInput({ session, goToState }, value) {
				session.locationText = value.trim();
				session.detectedCity = session.locationText;
				goToState("confirmDetectedLocation");
			}
		},

		confirmDetectedLocation: {
			expects: "choice",
			options: [{
				id: "location-yes",
				label: "Yes",
				value: "yes"
			}],
			async onEnter({ session, goToState }) {
				const city = session.detectedCity || "your area";
				await botSay(`I see you live in ${city}. Is that correct?`);
				goToState("locationConfirmChoice");
			}
		},

		locationConfirmChoice: {
			expects: "choice",
			options: [{
				id: "location-yes-inner",
				label: "Yes",
				value: "yes"
			}],
			async onUserInput({ session, goToState }) {
				session.locationConfirmed = true;
				await botSay("Got it — New York it is 🗽", { appendMeta: false });
				goToState("wrapUpIntro");
			}
		},

		wrapUpIntro: {
			async onEnter({ goToState }) {
				await botSay("All set ✅", { appendMeta: false });
				await botSay("How do you want to continue?");
				goToState("finalChoice");
			}
		},

		
		finalChoice: {
			expects: "choice",
			options: [{
					id: "explore-app",
					label: "Explore app",
					value: "explore"
				},
				{
					id: "finish-profile",
					label: "Finish building profile",
					value: "finish-profile"
				}
			],
			async onUserInput({ session }, value) {
				session.finalChoice = value;
				console.log("Final choice:", value, "session:", session);

				// Send the user to the Home screen after onboarding
				window.location.href = "home.html";
			}
		}
	};

	async function goToState(id) {
		currentStateId = id;
		const state = chatFlow[id];
		if (!state) return;
		renderQuickReplies(state.options || []);
		setInputState(state);
		if (typeof state.onEnter === "function") {
			await state.onEnter({ session, goToState });
		}
	}

	async function handleUserInput(value, meta) {
		const state = chatFlow[currentStateId];
		if (!state || isBotBusy) return;

		const trimmed = (value || "").trim();
		if (!trimmed) return;

		const isQuick = meta && meta.fromQuickReply;
		const displayText =
			isQuick && meta.displayText ? meta.displayText : trimmed;

		userSay(displayText);
		inputEl.value = "";
		renderQuickReplies([]);

		if (state.validate) {
			const ok = state.validate(trimmed);
			if (!ok) {
				if (state.errorMessage) {
					await botSay(state.errorMessage);
				}
				if (state.options) {
					renderQuickReplies(state.options);
				}
				return;
			}
		}

		if (typeof state.onUserInput === "function") {
			await state.onUserInput({ session, goToState }, trimmed, meta || {});
		}
	}

	formEl.addEventListener("submit", function(event) {
		event.preventDefault();
		handleUserInput(inputEl.value, { fromQuickReply: false });
	});

	window.addEventListener("load", function() {
		goToState("greeting");
	});
})();