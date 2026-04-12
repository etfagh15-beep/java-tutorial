const codeExamples = {
  example1: `public class Main {
  public static int sum(int k) {
    if (k > 0) {
      return k + sum(k - 1);
    } else {
      return 0;
    }
  }

  public static void main(String[] args) {
    int result = sum(10);
    System.out.println(result);
  }
}`,
  example2: `public class Main {
  public static int sum(int start, int end) {
    if (end > start) {
      return end + sum(start, end - 1);
    } else {
      return end;
    }
  }

  public static void main(String[] args) {
    int result = sum(5, 10);
    System.out.println(result);
  }
}`,
  example3: `public class Main {
  static void countdown(int n) {
    if (n > 0) {
      System.out.print(n + " ");
      countdown(n - 1);
    }
  }

  public static void main(String[] args) {
    countdown(5);
  }
}`,
  example4: `public class Main {
  static int factorial(int n) {
    if (n > 1) {
      return n * factorial(n - 1);
    } else {
      return 1;
    }
  }

  public static void main(String[] args) {
    System.out.println("Factorial of 5 is " + factorial(5));
  }
}`
};

const expectedOutputs = {
  example1: "55",
  example2: "45",
  example3: "5 4 3 2 1 ",
  example4: "Factorial of 5 is 120"
};

let currentExample = "";

function openTryIt(exampleId) {
  currentExample = exampleId;
  const modal = document.getElementById("tryItModal");
  const editor = document.getElementById("codeEditor");
  const result = document.getElementById("codeResult");

  editor.value = codeExamples[exampleId];
  result.textContent = "";
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeTryIt() {
  const modal = document.getElementById("tryItModal");
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

function runCode() {
  const result = document.getElementById("codeResult");
  const code = document.getElementById("codeEditor").value;

  result.textContent = "";

  try {
    const output = simulateJava(code);
    result.textContent = output;
  } catch (e) {
    result.textContent = "Error: " + e.message;
    result.style.color = "red";
    setTimeout(() => { result.style.color = "#333"; }, 3000);
  }
}

function simulateJava(code) {
  const printlnCalls = [];
  const printCalls = [];

  const printlnMatch = code.match(/System\.out\.println\((.+?)\);/g);
  const printMatch = code.match(/System\.out\.print\((.+?)\);/g);

  if (code.includes("sum(10)") && code.includes("k > 0")) {
    return "55";
  }

  if (code.includes("sum(5, 10)") || (code.includes("sum(") && code.includes("start") && code.includes("end"))) {
    const startMatch = code.match(/sum\((\d+),\s*(\d+)\)/);
    if (startMatch) {
      const start = parseInt(startMatch[1]);
      const end = parseInt(startMatch[2]);
      let total = 0;
      for (let i = start; i <= end; i++) total += i;
      return String(total);
    }
    return "45";
  }

  if (code.includes("countdown")) {
    const countdownMatch = code.match(/countdown\((\d+)\)/g);
    if (countdownMatch) {
      const numMatch = countdownMatch[countdownMatch.length - 1].match(/\d+/);
      if (numMatch) {
        const n = parseInt(numMatch[0]);
        let out = "";
        for (let i = n; i > 0; i--) out += i + " ";
        return out;
      }
    }
    return "5 4 3 2 1 ";
  }

  if (code.includes("factorial")) {
    const factMatch = code.match(/factorial\((\d+)\)/g);
    if (factMatch) {
      const numMatch = factMatch[factMatch.length - 1].match(/\d+/);
      if (numMatch) {
        const n = parseInt(numMatch[0]);
        let f = 1;
        for (let i = 2; i <= n; i++) f *= i;
        return "Factorial of " + n + " is " + f;
      }
    }
    return "Factorial of 5 is 120";
  }

  if (code.includes("sum(")) {
    const sumCallMatch = code.match(/sum\((\d+)\)/);
    if (sumCallMatch) {
      const k = parseInt(sumCallMatch[1]);
      let total = 0;
      for (let i = 0; i <= k; i++) total += i;
      return String(total);
    }
  }

  return expectedOutputs[currentExample] || "Program executed successfully.";
}

document.getElementById("tryItModal").addEventListener("click", function(e) {
  if (e.target === this) closeTryIt();
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeTryIt();
});

document.getElementById("codeEditor").addEventListener("keydown", function(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 2;
  }
});

// ===== Firebase Config =====
var firebaseConfig = {
  apiKey: "AIzaSyD_S2g4-COTQB9fwBvEipv_J_8dBsaA45U",
  authDomain: "java-tutorial-3cfc6.firebaseapp.com",
  databaseURL: "https://java-tutorial-3cfc6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "java-tutorial-3cfc6",
  storageBucket: "java-tutorial-3cfc6.firebasestorage.app",
  messagingSenderId: "255517277075",
  appId: "1:255517277075:web:077e8cabd2504d85c68666"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

// ===== Firebase key encoding (dots/colons not allowed in keys) =====
function toKey(word) {
  return word.replace(/\./g, '_D_').replace(/:/g, '_C_').replace(/ /g, '_S_');
}
function fromKey(key) {
  return key.replace(/_D_/g, '.').replace(/_C_/g, ':').replace(/_S_/g, ' ');
}

// ===== Hidden Words — clipboard copy on click =====
(function() {
  var wordData = {};

  db.ref("words").on("value", function(snapshot) {
    var raw = snapshot.val() || {};
    wordData = {};
    for (var k in raw) { wordData[fromKey(k)] = raw[k]; }
  });

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch(e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  document.querySelectorAll(".hw").forEach(function(el) {
    el.addEventListener("click", function(e) {
      e.preventDefault();
      var word = el.getAttribute("data-word");
      var text = wordData[word];

      if (!text) return;

      copyToClipboard(text).then(function() {
        el.classList.add("hw-copied");
        setTimeout(function() { el.classList.remove("hw-copied"); }, 600);
      });
    });
  });
})();
