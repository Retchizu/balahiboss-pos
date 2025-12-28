type Category = {
  id: string; // Firestore document ID
  categoryName: string; // Display name (e.g., "Beverages", "Snacks")
  displayOrder?: number; // Optional: for custom sorting
  color?: string;
};

export type CategoryCreateInput = {
  categoryName: string;
  displayOrder?: number;
};

export type CategoryUpdateInput = {
  categoryName?: string;
  displayOrder?: number;
};

export default Category;

