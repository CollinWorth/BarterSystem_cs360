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
  ListSubheader,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const HagglePopup = ({ open, onClose, post }) => {
  const { user } = useAuth();
  const [dropdown1Options, setDropdown1Options] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tradeItem, setTradeItem] = useState("");
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const listingOwnerId = post?.userId;

  useEffect(() => {
    if (!user) return;

    const fetchOptions = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/InventoryOptions?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setDropdown1Options(data);
        } else {
          console.error("Fetched data is not an array.");
          setDropdown1Options([]);
        }
      } catch (err) {
        console.error("Failed to fetch inventory options:", err);
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

  const handleSubmit = async () => {
    const requestData = {
      senderId: user.id,
      recipientId: listingOwnerId,
      senderItemId: selectedItem,
      senderItemQuantity: quantity,
      recipientItemId: post.offered_item_id,
      recipientItemQuantity: tradeQuantity,
    };

    try {
      const response = await fetch("http://localhost:8000/api/submit-haggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      console.log("API Response:", data);
      onClose();
    } catch (error) {
      console.error("Error submitting haggle:", error);
    }
  };

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

  // Separate items into "Your Items" and "Group Members' Items"
  const yourItems = dropdown1Options.filter((item) => item.userId === user.id);
  const groupItems = dropdown1Options.filter((item) => item.userId !== user.id);

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
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            InputLabelProps={{ style: { color: "#f7c518" } }}
            sx={inputSx}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel sx={{ color: "#f7c518" }}>Choose Inventory Item</InputLabel>
          <Select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
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
            <ListSubheader>Your Items</ListSubheader>
            {yourItems.map((item) => (
              <MenuItem key={item._id} value={item.itemId}>
                {item.name} (Qty: {item.quantity})
              </MenuItem>
            ))}
            <ListSubheader>Group Members' Items</ListSubheader>
            {groupItems.map((item) => (
              <MenuItem key={item._id} value={item.itemId}>
                {item.name} (Qty: {item.quantity})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Quantity for Trade Item"
            type="number"
            value={tradeQuantity}
            onChange={(e) => setTradeQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            InputLabelProps={{ style: { color: "#f7c518" } }}
            sx={inputSx}
          />
        </FormControl>

        <Button onClick={handleSubmit} variant="contained" sx={buttonSx}>
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