export const quantityInputSetter = (
  id: string,
  text: string,
  setQuantityInput: (
    value: React.SetStateAction<{
      [productId: string]: string;
    }>
  ) => void
) => {
  setQuantityInput((prevQuantityInput) => ({
    ...prevQuantityInput,
    [id]: text,
  }));
};
