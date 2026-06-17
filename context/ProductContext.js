import React, { createContext, useState } from 'react'

export const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  // console.log('products', products)
  const [searchText, setSearchText] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])


  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        searchText,
        setSearchText,
        filteredProducts,
        setFilteredProducts

      }}>
      {children}
    </ProductContext.Provider>
  )
}