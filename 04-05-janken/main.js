function jankenHand() {
  const hands = ['Rock', 'Scissors', 'Paper'];
  const randomIndex = Math.floor(Math.random() * hands.length);
  return hands[randomIndex];
}

console.log(jankenHand());