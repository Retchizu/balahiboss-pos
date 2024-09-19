export const handleInputChange = (
  label: string,
  value: string,
  setter: any
) => {
  setter((prevState: any) => ({
    ...prevState,
    [label]: value,
  }));
};
