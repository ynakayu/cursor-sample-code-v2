const heading = document.getElementById('heading');
const colorChangeButton = document.getElementById('colorChangeButton');

const headingColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12'];
let colorIndex = 0;

function changeHeadingColor() {
  colorIndex = (colorIndex + 1) % headingColors.length;
  heading.style.color = headingColors[colorIndex];
}

colorChangeButton.addEventListener('click', changeHeadingColor);
