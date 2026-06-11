// コインを1回投げて「表」か「裏」を返す関数
function coinToss() {
  return Math.random() < 0.5 ? "表" : "裏";
}

console.log(coinToss());