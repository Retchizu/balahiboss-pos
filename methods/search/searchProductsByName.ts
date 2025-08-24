import Product from "@/types/Product";

const searchProductsByName = (products: Product[], query: string) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product =>
    product.productName.toLowerCase().includes(lowerQuery)
  );
};

export default searchProductsByName;
