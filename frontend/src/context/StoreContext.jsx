import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list as default_food_list } from "../assets/assets.js";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [token, setToken] = useState("");
    // Instant initial load: initialize with bundled data so initial paint is 0ms
    const [food_list, setFoodList] = useState(default_food_list);
    const [loadingFood, setLoadingFood] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [discount, setDiscount] = useState(0);
    const currency = "₹";
    const deliveryCharge = 50;
     
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            } catch (err) {
                console.error("Add to cart sync error:", err.message);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 1) - 1) }));
        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            } catch (err) {
                console.error("Remove from cart sync error:", err.message);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => String(product._id) === String(item) || product.name === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // Progressive backend fetching: page 1 first, remaining pages on demand
    const fetchFoodList = async (page = 1, limit = 8) => {
        try {
            const response = await axios.get(`${url}/api/food/list?page=${page}&limit=${limit}`);
            if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
                if (page === 1) {
                    setFoodList(prev => {
                        const backendMap = new Map(response.data.data.map(i => [i.name, i]));
                        return prev.map(item => backendMap.get(item.name) || item);
                    });
                } else {
                    setFoodList(prev => {
                        const existingNames = new Set(prev.map(i => i.name));
                        const newItems = response.data.data.filter(i => !existingNames.has(i.name));
                        return [...prev, ...newItems];
                    });
                }
            }
        } catch (err) {
            console.log("Using cached/bundled food list fallback:", err.message);
        }
    };

    const fetchMoreFood = async (nextPage, limit = 8) => {
        setIsFetchingMore(true);
        try {
            await fetchFoodList(nextPage, limit);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
            if (response.data && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (err) {
            console.error("Load cart error:", err.message);
        }
    };

    useEffect(() => {
        async function loadData() {
            // Asynchronously sync first batch with backend without blocking initial UI
            fetchFoodList(1, 8);
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken);
            }
        }
        loadData();

        // Keep-alive ping for Render free tier so it doesn't spin down
        const pingInterval = setInterval(() => {
            axios.get(url + "/").catch(() => {});
        }, 8 * 60 * 1000);
        return () => clearInterval(pingInterval);
    }, [url]);

    const contextValue = {
        food_list,
        loadingFood,
        isFetchingMore,
        fetchFoodList,
        fetchMoreFood,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        currency,
        deliveryCharge,
        discount,
        setDiscount
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
