// SonarQube Issue Example
const apiKey = "sk_test_1234567890abcdef"; // Security: Hardcoded secret
let unused = "never used"; // Unused variable

function complexFunction(a, b, c, d, e, f, g, h) {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            return "deeply nested"; // Cognitive complexity issue
          }
        }
      }
    }
  }
}

console.log('Hello component');
console.log("New comment");
