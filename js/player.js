// Tiny music player: play/pause only. Never autoplays.
(function () {
  "use strict";
  var root = document.getElementById("player");
  if (!root) return;
  var audio = root.querySelector("audio");
  var btn = root.querySelector(".player-btn");
  var label = root.querySelector(".player-label");
  audio.volume = 0.6;

  function sync() {
    var playing = !audio.paused;
    root.classList.toggle("is-playing", playing);
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    label.textContent = playing ? "NOW PLAYING" : "ON LOOP RN";
  }

  btn.addEventListener("click", function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { label.textContent = "COULDN'T PLAY"; });
    } else {
      audio.pause();
    }
  });
  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("error", function () { root.hidden = true; }); // missing file = no dead player
})();
