document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("lastUpdated");
  if (el) {
    el.textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
});