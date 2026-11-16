// =====================================================================
// PROJECT LIST (data only)
// Add a project = copy one { ... } block, paste it below, edit the values.
// The first project with featured: true gets the big centerpiece layout;
// every other project becomes a smaller card underneath it.
//
// Fields:
//   num      small label above the title, e.g. "02 / GAME JAM"
//   title    project name
//   hook     one punchy line
//   blurb    optional: one or two sentences saying what it actually is
//   role     optional: who did what (shown in small text)
//   images   screenshot paths, e.g. ["assets/img/sih-1.png"]. [] = placeholder box
//   video    path to a video, e.g. "assets/video/sih.mp4". "" = show images instead
//            (images and video must be files in this repo: the page's security
//             policy blocks media hosted on other websites)
//   bullets  list of features / points
//   tags     short labels, shown in capitals
//   links    { play: "", itch: "", github: "" }  empty = that button is hidden
//            play = a page on this site that runs it in the browser, e.g. "sinos/"
//   featured true = big layout
// =====================================================================

window.PROJECTS = [
  {
    num: "01 / SMART INDIA HACKATHON",
    title: "The SIH Game", // TODO: put the real game name here if it has one
    hook: "A school earthquake drill, except this time you can actually fail it.",
    blurb: "A 2D top-down (3/4 view) earthquake-preparedness training game set inside a school building. Made in Godot for Smart India Hackathon, Disaster Management theme.",
    role: "I built the game; my friend built the teacher dashboard.",
    images: [
      "assets/img/sih-1.png", // roll call at the assembly point
      "assets/img/sih-2.png", // carrying a classmate's wheelchair down the corridor
      "assets/img/sih-3.png", // the earthquake hits mid-recess
      "assets/img/sih-4.png"  // classroom: drop, cover and hold on
    ],
    video: "", // TODO (later): "assets/video/sih.mp4"
    bullets: [
      // TODO: final wording
      "Players make evacuation decisions during an earthquake and get a scored debrief at the end.",
      "Includes helping a disabled or injured classmate evacuate, something most people never learn.",
      "Runs fully offline (built for low-end school PCs) and syncs results to a teacher dashboard afterward."
    ],
    tags: ["Godot", "GDScript", "2D", "Simulation", "Disaster Mgmt"],
    links: {
      itch: "",   // not public yet: add the itch.io page URL here when it is
      github: ""  // not public yet: add the repo URL here when it is
    },
    featured: true
  },
  {
    num: "02 / FROM SCRATCH",
    title: "SinOS",
    hook: "I wrote an operating system. It boots. You can play snake on it. In your browser.",
    blurb: "A 32-bit x86 OS written from zero in C and NASM assembly: own bootloader, multitasking, user programs, a real disk with FAT16, and a shell. No Linux underneath, just me and a lot of triple faults.",
    role: "Solo. Written from zero in C and assembly, with an AI pair-programmer explaining every step.",
    images: [
      "assets/img/sinos-1.png", // Sin Snake running in VGA mode 13h
      "assets/img/sinos-2.png"  // the SinOS shell after quitting the game
    ],
    video: "",
    bullets: [
      "Boots from its own two-stage bootloader (or GRUB) into protected mode, with interrupts, a timer and a keyboard driver I wrote myself.",
      "Paging, a heap and preemptive multitasking, plus ring-3 user programs that talk to the kernel through system calls.",
      "Reads and writes a real FAT16 disk, with a shell that has ls, cat, write, rm, run and ps.",
      "Draws its own pixels (VGA mode 13h) and ships an original snake game, Sin Snake."
    ],
    tags: ["C", "x86 Assembly", "OS Dev", "QEMU"],
    links: {
      play: "sinos/",
      itch: "",
      github: "" // source repo is local only for now
    }
  }
];
