import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { food_list as default_food_list } from "../assets/assets.js";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const url = (rawUrl || "").replace(/\/+$/, "");
    const [token, setToken] = useState("");
    // Instant initial load: initialize with bundled data so initial paint is 0ms
    const [food_list, setFoodList] = useState(default_food_list);
    const [loadingFood, setLoadingFood] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [discount, setDiscount] = useState(0);
    const currency = "₹";
    const deliveryCharge = 50;

    // Real-time WebSockets
    const [socket, setSocket] = useState(null);

    // Persistent User Favorites
    const [favorites, setFavorites] = useState([]);
    const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);

    // Saved Delivery Addresses (1-Click Checkout)
    const [savedAddresses, setSavedAddresses] = useState([]);

    // Initialize Socket.IO connection
    useEffect(() => {
        try {
            const newSocket = io(url, {
                transports: ["websocket", "polling"],
                reconnectionAttempts: 10,
                reconnectionDelay: 1500,
            });
            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("[Live WebSockets] Connected to server:", newSocket.id);
            });

            return () => {
                newSocket.disconnect();
            };
        } catch (err) {
            console.error("Socket.io initialization error:", err);
        }
    }, [url]);

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
                let itemInfo = food_list.find((product) => 
                    String(product._id) === String(item) || 
                    String(product.numericId) === String(item) ||
                    product.name === item
                );
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
                        return prev.map(item => {
                            const bItem = backendMap.get(item.name);
                            if (!bItem) return item;
                            return {
                                ...item,
                                ...bItem,
                                // Retain fast bundled asset so images never break or lag
                                image: item.image || bItem.image,
                                numericId: item.numericId
                            };
                        });
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

    const loadCartData = async (userToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: userToken } });
            if (response.data && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (err) {
            console.error("Load cart error:", err.message);
        }
    };

    // Fetch user favorites from backend
    const fetchFavorites = async (userToken) => {
        try {
            const response = await axios.get(url + "/api/user/favorites", { headers: { token: userToken } });
            if (response.data && response.data.success) {
                setFavorites(response.data.favorites || []);
            }
        } catch (err) {
            console.error("Fetch favorites error:", err.message);
        }
    };

    // Toggle favorite dish with optimistic update
    const toggleFavorite = async (foodId) => {
        if (!token) {
            toast.info("Please sign in to save dishes to your favorites ❤️");
            return false;
        }

        const idStr = String(foodId);
        const alreadyFav = favorites.includes(idStr);

        // Optimistic UI update
        if (alreadyFav) {
            setFavorites(prev => prev.filter(id => id !== idStr));
            toast.info("Removed from Favorites 🤍");
        } else {
            setFavorites(prev => [...prev, idStr]);
            toast.success("Saved to Favorites ❤️");
        }

        try {
            const response = await axios.post(
                url + "/api/user/favorites/toggle", 
                { foodId: idStr }, 
                { headers: { token } }
            );
            if (response.data && response.data.success) {
                setFavorites(response.data.favorites || []);
                return response.data.isFavorite;
            }
        } catch (err) {
            console.error("Toggle favorite sync error:", err.message);
            // Revert on error
            fetchFavorites(token);
        }
        return !alreadyFav;
    };

    // Fetch saved delivery addresses
    const fetchSavedAddresses = async (userToken) => {
        try {
            const response = await axios.get(url + "/api/user/addresses", { headers: { token: userToken } });
            if (response.data && response.data.success) {
                setSavedAddresses(response.data.addresses || []);
            }
        } catch (err) {
            console.error("Fetch addresses error:", err.message);
        }
    };

    // Save a new delivery address
    const saveNewAddress = async (addressData) => {
        if (!token) return;
        try {
            const response = await axios.post(
                url + "/api/user/addresses/save",
                { address: addressData },
                { headers: { token } }
            );
            if (response.data && response.data.success) {
                setSavedAddresses(response.data.addresses || []);
                return true;
            }
        } catch (err) {
            console.error("Save address error:", err.message);
        }
        return false;
    };

    // Delete a saved delivery address
    const deleteSavedAddress = async (addressId) => {
        if (!token) return;
        try {
            const response = await axios.post(
                url + "/api/user/addresses/delete",
                { addressId },
                { headers: { token } }
            );
            if (response.data && response.data.success) {
                setSavedAddresses(response.data.addresses || []);
                toast.success("Address removed 🗑️");
                return true;
            }
        } catch (err) {
            console.error("Delete address error:", err.message);
        }
        return false;
    };

    useEffect(() => {
        async function loadData() {
            // Asynchronously sync first batch with backend without blocking initial UI
            fetchFoodList(1, 8);
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await Promise.all([
                    loadCartData(savedToken),
                    fetchFavorites(savedToken),
                    fetchSavedAddresses(savedToken)
                ]);
            }
        }
        loadData();

        // Keep-alive ping for Render free tier so it doesn't spin down
        const pingInterval = setInterval(() => {
            axios.get(url + "/").catch(() => {});
        }, 8 * 60 * 1000);
        return () => clearInterval(pingInterval);
    }, [url]);

    // When token updates (e.g. login/logout)
    useEffect(() => {
        if (token) {
            fetchFavorites(token);
            fetchSavedAddresses(token);
            loadCartData(token);
        } else {
            setFavorites([]);
            setSavedAddresses([]);
        }
    }, [token]);

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
        setDiscount,
        socket,
        favorites,
        toggleFavorite,
        isFavoriteFilter,
        setIsFavoriteFilter,
        savedAddresses,
        fetchSavedAddresses,
        saveNewAddress,
        deleteSavedAddress
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
