const quests = [
  {
    icon: "📸",
    title: "Take a photo of {pet} looking like your boss.",
    description: "Capture the most judgmental, serious, or CEO-looking moment.",
    badge: "Tiny Boss"
  },
  {
    icon: "📦",
    title: "Build {pet} a 5-minute cardboard adventure.",
    description: "Use a box, paper bag, towel, or toy to create a tiny play zone.",
    badge: "Box Explorer"
  },
  {
    icon: "🎭",
    title: "Give {pet} a dramatic movie title for today.",
    description: "Pretend your pet is the main character. What is today’s episode called?",
    badge: "Drama Star"
  },
  {
    icon: "🛋️",
    title: "Find {pet}'s most iconic sleeping spot.",
    description: "Take a photo or write a note about the funniest place your pet chose to nap.",
    badge: "Nap Champion"
  },
  {
    icon: "🕵️",
    title: "Catch {pet} doing secret pet business.",
    description: "Observe one mysterious thing your pet does and record it.",
    badge: "Secret Agent"
  },
  {
    icon: "🍪",
    title: "Create a tiny snack ceremony for {pet}.",
    description: "Give a treat in a fun way, like a mini treasure hunt or puzzle.",
    badge: "Snack Hunter"
  },
  {
    icon: "🚪",
    title: "Document {pet}'s relationship with a door.",
    description: "Does your pet guard it, scream at it, scratch it, or ignore it?",
    badge: "Door Guard"
  },
  {
    icon: "🎤",
    title: "Describe {pet}'s voice like a music genre.",
    description: "Is it opera, rock, sad jazz, or alarm clock remix?",
    badge: "Professional Screamer"
  },
  {
    icon: "💌",
    title: "Write a one-sentence love letter to {pet}.",
    description: "Make it cute, funny, or overly dramatic.",
    badge: "Fluffy Roommate"
  },
  {
    icon: "🌙",
    title: "Name {pet}'s midnight personality.",
    description: "Record what your pet becomes at night: racer, hunter, singer, or ghost.",
    badge: "Midnight Runner"
  }
];

const personalityBonus = {
  dramatic: ["Drama Star", "Professional Screamer", "Tiny Boss"],
  lazy: ["Nap Champion", "Fluffy Roommate", "Sofa Royalty"],
  playful: ["Box Explorer", "Snack Hunter", "Tiny Athlete"],
  shy: ["Secret Agent", "Cozy Observer", "Soft Explorer"],
  bossy: ["Tiny Boss", "Door Guard", "House Manager"]
};

const state = {
  pet: JSON.parse(localStorage.getItem("pawquest_pet")) || null,
  currentQuest: JSON.parse(localStorage.getItem("pawquest_currentQuest")) || null,
  points: Number(localStorage.getItem("pawquest_points")) || 0,
  streak: Number(localStorage.getItem("pawquest_streak")) || 0,
  memories: JSON.parse(localStorage.getItem("pawquest_memories")) || [],
  photoData: ""
};

const $ = (id) => document.getElementById(id);

function saveState() {
  localStorage.setItem("pawquest_pet", JSON.stringify(state.pet));
  localStorage.setItem("pawquest_currentQuest", JSON.stringify(state.currentQuest));
  localStorage.setItem("pawquest_points", String(state.points));
  localStorage.setItem("pawquest_streak", String(state.streak));
  localStorage.setItem("pawquest_memories", JSON.stringify(state.memories));
}

function getPetEmoji(type) {
  const emojis = {
    cat: "🐱",
    dog: "🐶",
    rabbit: "🐰",
    other: "🐾"
  };
  return emojis[type] || "🐾";
}

function personalize(text) {
  const name = state.pet?.name || "your pet";
  return text.replaceAll("{pet}", name);
}

function pickQuest() {
  if (!state.pet) return null;

  const today = new Date().toDateString();
  const seed = today.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const petSeed = state.pet.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = (seed + petSeed + Math.floor(Math.random() * quests.length)) % quests.length;

  const quest = { ...quests[index] };

  const bonusTitles = personalityBonus[state.pet.personality] || [];
  if (bonusTitles.length && Math.random() > 0.45) {
    quest.badge = bonusTitles[Math.floor(Math.random() * bonusTitles.length)];
  }

  state.currentQuest = quest;
  saveState();
  render();
}

function render() {
  $("points").textContent = state.points;
  $("streak").textContent = state.streak;

  if (state.pet) {
    $("petName").value = state.pet.name;
    $("petType").value = state.pet.type;
    $("petPersonality").value = state.pet.personality;
    $("profileMessage").textContent = `${getPetEmoji(state.pet.type)} ${state.pet.name}'s profile is saved!`;
  }

  if (state.currentQuest) {
    $("questIcon").textContent = state.currentQuest.icon;
    $("questTitle").textContent = personalize(state.currentQuest.title);
    $("heroQuest").textContent = personalize(state.currentQuest.title);
    $("questDescription").textContent = state.currentQuest.description;
  }

  renderMemories();
}

function renderReward(memory) {
  if (!memory) return;
  $("rewardTitle").textContent = `${memory.petName} unlocked: ${memory.badge}`;
  $("rewardText").textContent = memory.quest;
  $("rewardBadge").textContent = `+20 Paw Points · ${memory.date}`;
}

function renderMemories() {
  const wall = $("memoryWall");

  if (!state.memories.length) {
    wall.className = "memory-wall empty";
    wall.innerHTML = "<p>No memories yet. Complete a quest to add one!</p>";
    return;
  }

  wall.className = "memory-wall";
  wall.innerHTML = state.memories
    .slice()
    .reverse()
    .map(memory => `
      <article class="memory-card">
        <div class="memory-img" style="${memory.photo ? `background-image:url('${memory.photo}')` : ""}">
          ${memory.photo ? "" : getPetEmoji(memory.petType)}
        </div>
        <div class="memory-body">
          <span class="badge">${memory.badge}</span>
          <h3>${memory.petName}</h3>
          <p><strong>Quest:</strong> ${memory.quest}</p>
          <p>${memory.note || "No note added."}</p>
        </div>
      </article>
    `)
    .join("");
}

$("petForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("petName").value.trim();
  if (!name) return;

  state.pet = {
    name,
    type: $("petType").value,
    personality: $("petPersonality").value
  };

  if (!state.currentQuest) {
    state.currentQuest = quests[0];
  }

  saveState();
  pickQuest();
});

$("newQuestBtn").addEventListener("click", () => {
  if (!state.pet) {
    alert("Create your pet profile first!");
    return;
  }
  pickQuest();
});

$("completeOpenBtn").addEventListener("click", () => {
  if (!state.pet) {
    alert("Create your pet profile first!");
    return;
  }
  document.querySelector("#complete").scrollIntoView({ behavior: "smooth" });
});

$("petPhoto").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.photoData = reader.result;
    $("imagePreview").style.backgroundImage = `url('${state.photoData}')`;
    $("imagePreview").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

$("completeForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.pet || !state.currentQuest) {
    alert("Create a pet profile and open a quest first!");
    return;
  }

  const memory = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    petName: state.pet.name,
    petType: state.pet.type,
    quest: personalize(state.currentQuest.title),
    badge: state.currentQuest.badge,
    note: $("questNote").value.trim(),
    photo: state.photoData,
    date: new Date().toLocaleDateString()
  };

  state.memories.push(memory);
  state.points += 20;
  state.streak += 1;
  state.photoData = "";

  $("questNote").value = "";
  $("petPhoto").value = "";
  $("imagePreview").classList.add("hidden");
  $("imagePreview").style.backgroundImage = "";

  saveState();
  render();
  renderReward(memory);
  document.querySelector("#rewardCard").scrollIntoView({ behavior: "smooth" });
});

$("clearMemoriesBtn").addEventListener("click", () => {
  if (!confirm("Clear all PawQuest memories?")) return;
  state.memories = [];
  state.points = 0;
  state.streak = 0;
  saveState();
  render();
});

$("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset the whole demo?")) return;
  localStorage.clear();
  location.reload();
});

if (!state.currentQuest && state.pet) {
  pickQuest();
} else {
  render();
}
