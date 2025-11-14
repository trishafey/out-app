// scripts/app.js
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const signin = document.getElementById("signin");
  const intro  = document.getElementById("intro");

  // ----- initial visibility -----
  splash.hidden = false;
  signin.hidden = true;
  intro.hidden  = true;

  // Splash → Sign-in
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.hidden = true;
      signin.hidden = false;
    }, 600); // match your .splash transition
  }, 1500);

  // ----- rotating words on sign-in -----
  const rotator = document.querySelector(".rotator-words");
  const words = ["planning dates.", "small talk.", "wasting time.", "swiping.", "ghosting."];
  let w = 0;
  if (rotator) {
    setInterval(() => {
      w = (w + 1) % words.length;
      rotator.textContent = words[w];
    }, 2000);
  }

  // ----- start onboarding -----
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      signin.hidden = true;
      intro.hidden  = false;
      showIntroSlide(0);
    });
  }

  // ----- Intro slides -----
  const slides = Array.from(document.querySelectorAll("#intro .intro__slide"));
  let current = 0;

  function showIntroSlide(i) {
    current = Math.max(0, Math.min(i, slides.length - 1));
    slides.forEach((s, idx) => {
      s.classList.toggle("intro__slide--active", idx === current);
    });
  }

  // Next buttons on each slide
  slides.forEach((slide, idx) => {
    const btn = slide.querySelector(".intro__btn");
    if (!btn) return;
    
		    btn.addEventListener("click", () => {
      if (idx < slides.length - 1) {
        showIntroSlide(idx + 1);
      } else {
        // finished onboarding – go to Matchmaker chat
        window.location.href = "matchmaker.html";
      }
    });
  });
});