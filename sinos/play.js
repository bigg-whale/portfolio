// =====================================================================
// SinOS play page: boots SinOS in the v86 PC emulator.
// The machine boots from sinos.img (SinOS's own two-stage bootloader +
// kernel, IDE primary master) with data.img as the FAT16 data disk
// (IDE primary slave, mounted by SinOS at /disk). Nothing starts until
// the visitor presses "Boot SinOS", so the page costs ~2.5 MB until then.
// =====================================================================
(function () {
  "use strict";

  var DATA_DISK_BYTES = 16 * 1024 * 1024;

  var screen = document.getElementById("screen");
  var bootBtn = document.getElementById("boot");
  var restartBtn = document.getElementById("restart");
  var statusEl = document.getElementById("status");
  var emulator = null;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function boot() {
    if (emulator) return;
    if (typeof window.V86 !== "function" || typeof WebAssembly !== "object") {
      setStatus("Sorry, this browser can't run the emulator (needs WebAssembly).");
      return;
    }
    bootBtn.hidden = true;
    screen.classList.add("on");
    setStatus("Loading the emulator…");

    emulator = new window.V86({
      wasm_path: "v86/v86.wasm",
      memory_size: 64 * 1024 * 1024,
      vga_memory_size: 2 * 1024 * 1024,
      screen_container: screen,
      bios: { url: "v86/seabios.bin" },
      vga_bios: { url: "v86/vgabios.bin" },
      hda: { url: "sinos.img" },
      // The data disk is read on demand (HTTP range requests); writes stay
      // in browser memory.
      hdb: { url: "data.img", async: true, size: DATA_DISK_BYTES },
      boot_order: 0x132, // hard disk first
      disable_mouse: true,
      disable_speaker: true, // SinOS has no sound; also avoids v86's audio worklet

      autostart: true
    });

    emulator.add_listener("emulator-ready", function () {
      setStatus("Running. Click the screen, then type.");
      restartBtn.hidden = false;
      screen.focus();
    });
    emulator.add_listener("download-error", function () {
      setStatus("A file failed to load. Reload the page to try again.");
    });
  }

  bootBtn.addEventListener("click", boot);
  restartBtn.addEventListener("click", function () {
    if (emulator) {
      emulator.restart();
      setStatus("Restarted. Click the screen, then type.");
      screen.focus();
    }
  });
  screen.addEventListener("click", function () {
    screen.focus();
  });

  // While SinOS has the keyboard, arrows / Space / Page keys steer the game
  // instead of scrolling the page.
  var SCROLL_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "PageUp", "PageDown", "Home", "End"];
  window.addEventListener("keydown", function (e) {
    if (emulator && document.activeElement === screen && SCROLL_KEYS.indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  });
})();
