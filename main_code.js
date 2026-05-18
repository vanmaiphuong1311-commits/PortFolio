// main_code.js
document.addEventListener("DOMContentLoaded", () => {
  const landingScreen = document.getElementById("landing-screen");
  const journeyScreen = document.getElementById("journey-screen");
  const contentScreen = document.getElementById("content-screen");
  const finalScreen = document.getElementById("final-screen");
  const cardsContainer = document.getElementById("cards-container");
  const finalCardsContainer = document.getElementById("final-cards-container");
  const btnExplore = document.getElementById("btn-explore");
  const btnSkip = document.getElementById("btn-skip");
  const btnBack = document.getElementById("btn-back");

  // Sequence Logic
  const sequence = ["C", "O", "D", "E", "Q"];
  let currentStepIndex = 0;
  let cards = [];
  let isReExploration = false;

  // Projects Data
  const projectDatabase = {
    "airbnb": {
      title: "AIRBNB MARKET DEVELOPMENT",
      desc: "Strategic expansion focusing on local hosts, optimizing customer acquisition cost (CAC), and maximizing lifetime value (LTV).",
      src: "Personal Project/AIRBNB MARKET DEVELOPMENT/AIRBNB MARKET DEVELOPMENT_VAN THI MAI PHUONG (SENA)_K45 .pdf",
      extraBtn: "View Dataset",
      extraSrc: "Personal Project/AIRBNB MARKET DEVELOPMENT/Airbnb_New York_Dataset.xlsx"
    },
    "siamdairy": {
      title: "SIAMDAIRY (THAILAND)",
      desc: "In-depth case study analyzing SiamDairy's market position, competitive advantages, and potential expansion strategies in the dairy sector.",
      src: "Personal Project/SiamDairy/SiamDairy Thailand.pdf",
      extraBtn: "View CaseStudy",
      extraSrc: "Personal Project/SiamDairy/CaseStudy.pdf"
    }
  };

  initProjectSelection();

  // Expose function to global scope for final layout pill buttons
  window.openFinalProject = function(projectId) {
    const data = projectDatabase[projectId];
    const container = document.getElementById("final-project-detail-container");
    container.style.display = "block";
    container.innerHTML = `
      <iframe src="${data.src}#toolbar=0" class="project-iframe" title="${data.title}"></iframe>
      <div style="margin-top: 15px; display: flex; gap: 15px; justify-content: center;">
        <a href="${data.src}" target="_blank" class="btn-outline">Open PDF</a>
        <a href="${data.extraSrc}" target="_blank" class="btn-primary">${data.extraBtn}</a>
      </div>
    `;
    gsap.fromTo(container, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
  };

  btnExplore.addEventListener("click", startJourney);
  if(btnSkip) btnSkip.addEventListener("click", skipToPortfolio);
  btnBack.addEventListener("click", closeContentPanel);

  function initProjectSelection() {
    const thumbs = document.querySelectorAll(".project-thumb");
    const container = document.getElementById("project-detail-container");

    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbs.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");

        const projectId = thumb.dataset.project;
        const data = projectDatabase[projectId];

        container.style.display = "block";
        container.innerHTML = `
          <h4 style="color: var(--dark-burgundy); margin-bottom: 5px;">${data.title}</h4>
          <p class="project-detail-desc">${data.desc}</p>
          <iframe src="${data.src}#toolbar=0" class="project-iframe" title="${data.title}"></iframe>
          <div style="margin-top: 15px; text-align: center;">
            <a href="${data.src}" target="_blank" class="btn-outline">Open PDF in New Tab</a>
          </div>
        `;
        gsap.fromTo(container, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      });
    });
  }

  function startJourney() {
    gsap.to(landingScreen, {opacity: 0, duration: 0.8, onComplete: () => {
      landingScreen.classList.remove("active");
      landingScreen.classList.add("hidden");
      journeyScreen.classList.remove("hidden");
      journeyScreen.classList.add("active");
      generateCards();
    }});
  }

  // Tự động cuộn đến nội dung khi bấm vào các thẻ banner ở trang cuối
  if (finalCardsContainer) {
    finalCardsContainer.addEventListener("click", (e) => {
      // Tìm thẻ story-card vừa được click
      const card = e.target.closest(".story-card");
      if (!card) return;

      // Lấy chữ cái (C, O, D, E) lưu ở thuộc tính data-letter của thẻ
      const letter = card.dataset.letter;
      
      if (letter) {
        // Tìm khối nội dung tương ứng bên dưới
        const targetSection = document.getElementById(`final-sec-${letter.toUpperCase()}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  function skipToPortfolio() {
    gsap.to(landingScreen, {opacity: 0, duration: 0.8, onComplete: () => {
      landingScreen.classList.remove("active");
      landingScreen.classList.add("hidden");
      
      cards = [];
      for(let i=0; i<5; i++) {
        const card = document.createElement("div");
        card.className = "story-card";
        card.innerHTML = `<span class="card-content"></span>`;
        card.dataset.letter = sequence[i];
        card.querySelector(".card-content").innerText = sequence[i] === "Q" ? "?" : sequence[i];
        cards.push(card);
      }
      showFinalDashboard();
    }});
  }

  function generateCards() {
    cardsContainer.innerHTML = "";
    cards = [];
    for(let i=0; i<5; i++) {
      const card = document.createElement("div");
      card.className = "story-card";
      card.innerHTML = `<span class="card-content"></span>`;
      
      gsap.fromTo(card, 
        { y: 100, opacity: 0, rotationY: 90 }, 
        { y: 0, opacity: 1, rotationY: 0, duration: 0.8, delay: i * 0.15, ease: "back.out(1.7)" }
      );
      
      card.addEventListener("click", () => handleCardClick(card));
      cardsContainer.appendChild(card);
      cards.push(card);
    }
  }

  function handleCardClick(clickedCard) {
    if (isReExploration) {
      const letter = clickedCard.dataset.letter;
      const targetSection = document.getElementById(`final-sec-${letter}`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (clickedCard.classList.contains("revealed")) return;

    const currentLetter = sequence[currentStepIndex];
    gsap.to(clickedCard, {rotationY: 360, duration: 0.6, onStart: () => {
      clickedCard.classList.add("revealed");
      clickedCard.querySelector(".card-content").innerText = currentLetter === "Q" ? "?" : currentLetter;
      clickedCard.dataset.letter = currentLetter;
    }, onComplete: () => {
      openContentSection(currentLetter, clickedCard);
    }});
  }

  function openContentSection(letter, cardElement) {
    document.querySelectorAll(".narrative-content").forEach(el => el.classList.add("hidden"));
    const target = document.getElementById(`sec-${letter}`);
    if(target) target.classList.remove("hidden");
    
    contentScreen.classList.remove("hidden");
    gsap.fromTo(contentScreen, 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out", onComplete: () => {
        contentScreen.classList.add("active");
        if(letter === "Q" && !isReExploration) {
          btnBack.style.display = "none";
          setTimeout(completeJourney, 3000);
        }
      }}
    );
  }

  function closeContentPanel() {
    gsap.to(contentScreen, {opacity: 0, scale: 0.95, duration: 0.4, onComplete: () => {
      contentScreen.classList.remove("active");
      contentScreen.classList.add("hidden");
      if (!isReExploration) {
        reorderCards();
      }
    }});
  }

  function reorderCards() {
    currentStepIndex++;
    const revealedCards = cards.filter(c => c.classList.contains("revealed"));
    const unrevealedCards = cards.filter(c => !c.classList.contains("revealed"));

    revealedCards.sort((a, b) => sequence.indexOf(a.dataset.letter) - sequence.indexOf(b.dataset.letter));
    
    cardsContainer.innerHTML = "";
    revealedCards.forEach(c => cardsContainer.appendChild(c));
    unrevealedCards.forEach(c => cardsContainer.appendChild(c));
  }

  function completeJourney() {
    gsap.to(contentScreen, { opacity: 0, duration: 0.5, onComplete: () => {
      contentScreen.classList.remove("active");
      contentScreen.classList.add("hidden");
      journeyScreen.classList.remove("active");
      journeyScreen.classList.add("hidden");
      showFinalDashboard();
    }});
  }

  function showFinalDashboard() {
    finalScreen.classList.remove("hidden");
    finalScreen.style.display = "block";
    
    gsap.fromTo(finalScreen, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, onComplete: () => finalScreen.classList.add("active") }
    );
    
    isReExploration = true;
    btnBack.style.display = "flex";
    finalCardsContainer.innerHTML = "";

    const codeCards = cards.filter(c => c.dataset.letter !== "Q");
    const sortedCards = codeCards.sort((a, b) => sequence.indexOf(a.dataset.letter) - sequence.indexOf(b.dataset.letter));
    
    sortedCards.forEach(card => {
      card.classList.add("final-card-mode");
      finalCardsContainer.appendChild(card);
    });
  }
});
