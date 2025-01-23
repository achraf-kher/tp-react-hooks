// import React, {useState, useContext, useEffect} from 'react';
// import { ThemeContext } from '../App';
//
// const ProductSearch = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const { isDarkTheme } = useContext(ThemeContext);
//   // TODO: Exercice 2.1 - Utiliser le LanguageContext
//
//   // TODO: Exercice 1.2 - Utiliser le hook useDebounce
//
//     const debounce = (func, delay) => {
//         let timer;
//         return (...args) => {
//             clearTimeout(timer);
//             timer = setTimeout(() => func.apply(this, args), delay);
//         };
//     };
//
//     const performSearch = (term) => {
//         console.log("Recherche en cours pour :", term);
//         // Ici, tu peux appeler une API ou effectuer une autre action de recherche
//     };
//
//     // Version debouncée de la fonction de recherche
//     const debouncedSearch = debounce(performSearch, 300);
//
//     // Effet pour déclencher la recherche lorsque searchTerm change
//     useEffect(() => {
//         if (searchTerm) {
//             debouncedSearch(searchTerm);
//         }
//     }, [searchTerm]);
//
//   return (
//     <div className="mb-4">
//       <input
//         type="text"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         placeholder="Rechercher un produit..."
//         className={`form-control ${isDarkTheme ? 'bg-dark text-light' : ''}`}
//       />
//     </div>
//   );
// };
//
// export default ProductSearch;

import React, { useState, useEffect } from 'react';

const ProductSearch = ({ isDarkTheme = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [allProducts, setAllProducts] = useState([]); // Stock tous les produits
    const [filteredProducts, setFilteredProducts] = useState([]); // Stock les produits filtrés
    const [error, setError] = useState(null);

    // Charger tous les produits au démarrage
    useEffect(() => {
        const fetchProducts = async () => {
            setIsSearching(true);
            try {
                const response = await fetch('https://api.daaif.net/products');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des produits');
                }
                const data = await response.json();
                const productsArray = Array.isArray(data) ? data : (data.products || []);
                setAllProducts(productsArray);
            } catch (error) {
                setError('Une erreur est survenue lors de la récupération des produits');
                console.error('Error fetching products:', error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchProducts();
    }, []);

    // Filtrer les produits quand le terme de recherche change
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredProducts([]);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = allProducts.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(searchTermLower);
            const descMatch = product.description?.toLowerCase().includes(searchTermLower);
            const priceMatch = String(product.price)?.includes(searchTerm);
            return nameMatch || descMatch || priceMatch;
        });

        setFilteredProducts(filtered);
    }, [searchTerm, allProducts]);

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const handleSearchChange = debounce((value) => {
        setSearchTerm(value);
    }, 300);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative mb-4">
                <div className="relative" style="flex-wrap: wrap; display: flex;">
                    <input
                        type="text"
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                            isDarkTheme
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}

                    />
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            {filteredProducts.length > 0 && (
                <div className={`mt-4 rounded-lg border ${
                    isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    {filteredProducts.map((product) => (
                        // <div
                        //     key={product.id || Math.random()}
                        //     className={`p-4 border-b last:border-b-0 ${
                        //         isDarkTheme ? 'border-gray-700' : 'border-gray-200'
                        //     }`}
                        // >
                        //     <h3 className={`font-semibold ${
                        //         isDarkTheme ? 'text-white' : 'text-gray-900'
                        //     }`}>
                        //         {product.title || 'Sans nom'}
                        //     </h3>
                        //     <p className={`mt-1 text-sm ${
                        //         isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        //     }`}>
                        //         {product.description || 'Aucune description'}
                        //     </p>
                        //     <div className="mt-2 text-blue-600">
                        //         {product.price ? `${product.price} €` : 'Prix non disponible'}
                        //     </div>
                        // </div>
                        <div key={product.id} className="col">
                            <div className={`card h-100 ${isDarkTheme ? 'bg-dark text-light' : ''}`}>
                                {product.thumbnail && (
                                    <img
                                        src={product.thumbnail}
                                        className="card-img-top"
                                        alt={product.title}
                                        style={{height: '200px', objectFit: 'cover'}}
                                    />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">{product.title}</h5>
                                    <p className="card-text">{product.description}</p>
                                    <p className="card-text">
                                        <strong>Prix: </strong>
                                        {product.price}€
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {searchTerm && filteredProducts.length === 0 && !isSearching && (
                <div className={`p-4 text-center ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    Aucun produit trouvé
                </div>
            )}
        </div>
    );
};

export default ProductSearch;

