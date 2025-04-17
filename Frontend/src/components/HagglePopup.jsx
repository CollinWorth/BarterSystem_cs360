import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

const HagglePopup = ({ open, onClose, post }) => {
  const { user } = useAuth(); // Get user from context
  console.log("User in context: ", user);
  const [dropdown1Options, setDropdown1Options] = useState([]);
  const [selectedItem, setselectedItem] = useState(""); // Ensure selectedItem is a string
  const [quantity, setQuantity] = useState(1);
  const [tradeItem, setTradeItem] = useState(""); // For trade item selection
  const [tradeQuantity, setTradeQuantity] = useState(1); // For trade item quantity
  const listingOwnerId = post?.userId;

  useEffect(() => {
    if (!user) return; // Don't run until user is defined
  
    const fetchOptions = async () => {
      if (user?.id) {
        // safe to use it
        console.log("User ID:", user.id);
      }
  
      try {
        const res = await fetch(`http://localhost:8000/api/InventoryOptions?userId=${encodeURIComponent(user.id)}`);
        const text = await res.text();
  
      
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setDropdown1Options(data);
          } else {
            console.error("Fetched data is not an array.");
            setDropdown1Options([]);
          }
        } catch (parseErr) {
          console.error("JSON parsing failed", parseErr);
          setDropdown1Options([]);
        }
      } catch (err) {
        console.error("Failed to fetch or process data:", err);
        setDropdown1Options([]);
      }
    };
  
    fetchOptions();
  }, [user]);

  useEffect(() => {
    if (post?.requested_item_id) {
      setTradeItem(post.requested_item_id);
      setTradeQuantity(post.requested_quantity || 1);
    }
  }, [post]);
  
  const handleDropdown1Change = (e) => setselectedItem(e.target.value.toString()); // Ensure selectedItem is a string
  const handleQuantityChange = (e) => setQuantity(e.target.value);
  const handleTradeItemChange = (e) => setTradeItem(e.target.value); // Handle trade item
  const handleTradeQuantityChange = (e) => setTradeQuantity(e.target.value); // Handle trade quantity

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#1e1e1e",
    color: "#f7c518",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    border: "2px solid #f7c518",
  };

  const inputSx = {
    input: { color: "#f7c518" },
    label: { color: "#f7c518" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#f7c518",
      },
      "&:hover fieldset": {
        borderColor: "#fff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#fff",
      },
    },
  };

  const buttonSx = {
    mt: 3,
    width: "100%",
    backgroundColor: "#000",
    color: "#f7c518",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#333",
    },
  };

  const handleSubmit = async () => {
    const requestData = {
      senderId: user.id,                         // You
      recipientId: listingOwnerId,               // Person who made the listing
      senderItemId: selectedItem,                // Your selected inventory item (from dropdown)
      senderItemQuantity: quantity,
      recipientItemId: post.offered_item_id,              // Item in the listing (you want this)
      recipientItemQuantity: tradeQuantity,
    };
  
    console.log("Sending request data:", requestData);
    console.log("Sending request:", JSON.stringify(requestData, null, 2));
  
    try {
      const response = await fetch("http://localhost:8000/api/submit-haggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      console.log("API Response:", data);
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="haggle-modal-title"
      aria-describedby="haggle-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h6" sx={{ color: "#f7c518" }}>
          Haggle for {post?.name || "Unknown Item"}
        </Typography>
        <Typography id="haggle-modal-description" sx={{ mt: 2 }}>
          {post.body}
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ min: 1 }}
            InputLabelProps={{ style: { color: "#f7c518" } }}
            sx={inputSx}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: "#f7c518" }}>
            Choose Inventory Item
          </InputLabel>
          <Select
            value={selectedItem}
            onChange={handleDropdown1Change}
            sx={{
              color: "#f7c518",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f7c518",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#fff",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#fff",
              },
            }}
          >
            {dropdown1Options.map((option) => (
              <MenuItem key={option._id} value={option.itemId}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Quantity for Trade Item"
            type="number"
            value={tradeQuantity}
            onChange={handleTradeQuantityChange}
            inputProps={{ min: 1 }}
            InputLabelProps={{ style: { color: "#f7c518" } }}
            sx={inputSx}
          />
        </FormControl>

        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={buttonSx}
        >
          Submit
        </Button>

        <Button onClick={onClose} variant="contained" sx={buttonSx}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default HagglePopup;