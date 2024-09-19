export const toggleConfirmationVisibility = async (
  isVisible: boolean,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsVisible(!isVisible);
};
