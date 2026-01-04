export const generateCard = () => {
  const card = Array.from({ length: 3 }, () => Array(9).fill(null));
  const columns = Array.from({ length: 9 }, (_, i) => {
    const min = i === 0 ? 1 : i * 10;
    const max = i === 8 ? 90 : (i * 10) + 9;
    const nums = [];
    for (let n = min; n <= max; n++) nums.push(n);
    return nums.sort(() => Math.random() - 0.5);
  });

  // Each row must have 5 numbers
  for (let r = 0; r < 3; r++) {
    let count = 0;
    const possibleCols = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    for (let c of possibleCols) {
      if (count < 5 && columns[c].length > 0) {
        // Simple logic: try to fill each row with 5 numbers, 
        // ensuring we don't exceed 3 numbers per column across all rows
        card[r][c] = columns[c].pop();
        count++;
      }
    }
  }

  return card;
};
