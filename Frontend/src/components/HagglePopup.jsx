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

const HagglePopup = ({ open, onClose, post }) => {
  const [dropdown1Options, setDropdown1Options] = useState([]);
  const [selected1, setSelected1] = useState(""); // Ensure selected1 is a string
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res1 = await fetch(
          "/api/InventoryOptions?userId=67e57c5a312e8fd4e61bd264"
        );
        const data1 = await res1.json();
        console.log("Fetched data:", data1);

        // Check if we got the right structure
        if (Array.isArray(data1)) {
          setDropdown1Options(data1); // Store the full objects
        } else {
          console.error("Fetched data is not an array or has issues.");
          setDropdown1Options([]);
        }
      } catch (err) {
        console.error("Failed to fetch or parse JSON", err);
        setDropdown1Options([]);
      }
    };
    fetchOptions();
  }, []);

  const handleDropdown1Change = (e) => setSelected1(e.target.value.toString()); // Ensure selected1 is a string
  const handleQuantityChange = (e) => setQuantity(e.target.value);

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
    value={selected1}
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
    {dropdown1Options.map((option, index) => (
      <MenuItem key={index} value={option.itemId} sx={{ color: "#000" }}>
        {option.name || "Unknown Item"} {/* Display the name or fallback */}
      </MenuItem>
    ))}
  </Select>
</FormControl>

        <Button
          onClick={() => {
            console.log("Submit", { selected1, quantity });
            onClose();
          }}
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