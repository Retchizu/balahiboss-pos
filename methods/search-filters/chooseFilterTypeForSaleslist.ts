export const chooseFilterTypeForSaleslist = (
  key: number,
  setIsNameFilter: React.Dispatch<React.SetStateAction<boolean>>
) => {
  switch (key) {
    case 1:
      setIsNameFilter(true);
      break;
    case 2:
      setIsNameFilter(false);
      break;
  }
};

export const choices = [
  { key: 1, choiceName: "Search by customer name" },
  { key: 2, choiceName: "Search by product name" },
];
