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
  { key: 1, choiceName: "Customer name" },
  { key: 2, choiceName: "Product name" },
];
