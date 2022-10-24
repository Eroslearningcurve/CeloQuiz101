let id = (id) => document.getElementById(id);
let classes = (classes) => document.getElementsByClassName(classes);

classes("home")[0].addEventListener("click", () => {
  window.location = "index.html";
});

window.addEventListener("load", () => {
  let userScore = sessionStorage.getItem("userScore");
  id("result").innerHTML = `${userScore}%`;
  if (userScore <= 50) {
    id("feedback").innerHTML = "Try harder next time";
  } else if (finalResult > 50 && finalResult <= 75) {
    id("feedback").innerHTML = "You are almost there try again";
  } else {
    id("feedback").innerHTML = "Congratulations You made it";
  }
});
