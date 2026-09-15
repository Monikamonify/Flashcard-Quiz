const starterCards = [
  { question: "What does HTML stand for?", answer: "HyperText Markup Language." },
  { question: "What is CSS primarily used for?", answer: "Styling and laying out web pages." },
  { question: "Which JavaScript keyword declares a variable that can be reassigned?", answer: "let" },
  { question: "What is the purpose of the <title> element?", answer: "It sets the text shown in the browser tab and used as the page title." },
  { question: "Which CSS property changes the text color of an element?", answer: "color" },
  { question: "What does the CSS display: flex property help create?", answer: "A flexible layout that can align and distribute items in a container." },
  { question: "Which HTML element creates a clickable link?", answer: "The <a> (anchor) element." },
  { question: "What does DOM stand for?", answer: "Document Object Model — the browser's representation of a web page that JavaScript can interact with." },
  { question: "Which JavaScript method selects an element by its ID?", answer: "document.getElementById()" },
  { question: "What is an event listener used for in JavaScript?", answer: "It runs code when a specific user or browser event occurs, such as a click or key press." },
  { question: "What does responsive design mean?", answer: "Designing a website so it adapts and works well across different screen sizes and devices." },
  { question: "Why is localStorage useful in a web app?", answer: "It stores small amounts of data in the browser so it remains available after a page refresh." },
  { question: "What does the CSS border-radius property do?", answer: "It rounds the corners of an element's border." }
];

const savedCards = JSON.parse(localStorage.getItem("recall-cards"));
// Add newly supplied starter questions without overwriting a learner's own cards.
let cards = savedCards || starterCards;
if (savedCards) {
  const existingQuestions = new Set(savedCards.map((card) => card.question));
  const newStarterCards = starterCards.filter((card) => !existingQuestions.has(card.question));
  if (newStarterCards.length) {
    cards = [...savedCards, ...newStarterCards];
    localStorage.setItem("recall-cards", JSON.stringify(cards));
  }
}
let currentIndex = 0;
let editingIndex = null;
let answerVisible = false;

const el = (id) => document.getElementById(id);
const dialog = el("cardDialog");

function saveCards() { localStorage.setItem("recall-cards", JSON.stringify(cards)); }
function showToast(message) { el("toast").textContent = message; el("toast").classList.add("visible"); setTimeout(() => el("toast").classList.remove("visible"), 2300); }

function render() {
  const hasCards = cards.length > 0;
  el("emptyState").hidden = hasCards;
  el("flashcard").hidden = !hasCards;
  el("cardControls").hidden = !hasCards;
  el("manageControls").hidden = !hasCards;
  el("cardCount").textContent = `${cards.length} ${cards.length === 1 ? "card" : "cards"}`;
  if (!hasCards) { el("progressBar").style.width = "0%"; return; }
  const card = cards[currentIndex];
  el("questionText").textContent = card.question;
  el("answerText").textContent = card.answer;
  el("flashcard").classList.toggle("is-flipped", answerVisible);
  el("flashcard").setAttribute("aria-pressed", String(answerVisible));
  el("flashcard").setAttribute("aria-label", answerVisible ? "Answer shown. Click to show question." : "Question shown. Click to show answer.");
  el("revealButton").innerHTML = answerVisible ? "Hide answer <span>↑</span>" : "Show answer <span>↓</span>";
  el("positionText").textContent = `Card ${currentIndex + 1} of ${cards.length}`;
  el("progressBar").style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
  el("previousButton").disabled = currentIndex === 0;
  el("nextButton").disabled = currentIndex === cards.length - 1;
}

function move(direction) {
  const next = currentIndex + direction;
  if (next >= 0 && next < cards.length) { currentIndex = next; answerVisible = false; render(); }
}

function openForm(index = null) {
  editingIndex = index;
  el("dialogTitle").textContent = index === null ? "New flashcard" : "Edit flashcard";
  el("questionInput").value = index === null ? "" : cards[index].question;
  el("answerInput").value = index === null ? "" : cards[index].answer;
  dialog.showModal(); el("questionInput").focus();
}

el("newCardButton").addEventListener("click", () => openForm());
el("emptyNewButton").addEventListener("click", () => openForm());
el("closeDialog").addEventListener("click", () => dialog.close());
el("cancelButton").addEventListener("click", () => dialog.close());
el("revealButton").addEventListener("click", () => { answerVisible = !answerVisible; render(); });
el("flashcard").addEventListener("click", () => { answerVisible = !answerVisible; render(); });
el("previousButton").addEventListener("click", () => move(-1));
el("nextButton").addEventListener("click", () => move(1));
el("editButton").addEventListener("click", () => openForm(currentIndex));
el("deleteButton").addEventListener("click", () => {
  if (!confirm("Delete this flashcard?")) return;
  cards.splice(currentIndex, 1); currentIndex = Math.max(0, currentIndex - 1); answerVisible = false; saveCards(); render(); showToast("Flashcard deleted");
});
el("cardForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const card = { question: el("questionInput").value.trim(), answer: el("answerInput").value.trim() };
  if (!card.question || !card.answer) return;
  if (editingIndex === null) { cards.push(card); currentIndex = cards.length - 1; showToast("Flashcard added"); }
  else { cards[editingIndex] = card; showToast("Flashcard updated"); }
  answerVisible = false; saveCards(); dialog.close(); render();
});
document.addEventListener("keydown", (event) => {
  if (dialog.open) return;
  if (event.key === "ArrowLeft") move(-1);
  if (event.key === "ArrowRight") move(1);
  if ((event.key === "Enter" || event.key === " ") && document.activeElement === el("flashcard")) { event.preventDefault(); answerVisible = !answerVisible; render(); }
});
render();
