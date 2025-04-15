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
  TextField
} from "@mui/material";
import styles from "./HagglePopup.module.scss";

const HagglePopup = ({ post, open, onClose }) => {
  const [dropdown1Options, setDropdown1Options] = useState([]);
  const [selected1, setSelected1] = useState("");
  const [quantity, setQuantity] = useState(1); // small text box

  // Fetch options on mount
  
  useEffect(() => {
    const fetchOptions = async () => {
      //const res1 = await fetch('/api/InventoryOptions?userId=${userId}'); // userId not availible yet
      const res1 = await fetch('/api/InventoryOptions?userId=67e57c5a312e8fd4e61bd264'); // temporty test for user (collin)
      const data1 = await res1.json();
      setDropdown1Options(data1);
    };

    fetchOptions();
  }, []);

/*
  // Test ////
  useEffect(() => {
    const fakeData = ["Item A", "Item B", "Item C"];
    setDropdown1Options(fakeData);
    setDropdown2Options(["Other A", "Other B"]);
  }, []);
  /////
*/
  const handleDropdown1Change = (e) => setSelected1(e.target.value);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="haggle-modal-title"
      aria-describedby="haggle-modal-description"
    >
      <Box className="modal" sx={style}>
        <Typography variant="h6">
          Haggle for {post?.name || "Unknown Item"}
        </Typography>
        <Typography id="haggle-modal-description" sx={{ mt: 2 }}>
          {post.body}
        </Typography>

        {/* Quantity Field */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ min: 1 }}
          />
        </FormControl>

        {/* Dropdown 2 */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Choose Inventory Item</InputLabel>
          <Select value={selected1} onChange={handleDropdown1Change}>
            {dropdown1Options.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Quantity Field */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ min: 1 }}
          />
        </FormControl>

        {/* Submit Button */}
        <Button
          className={styles.button}
          onClick={() => {
            // Handle submit logic here
            console.log("Submit", { selected1, quantity });
            onClose();
          }}
          variant="contained"
          sx={{ mt: 3, width: "100%" }}
          >
            Submit
          </Button>

        {/* Close Button */}
        <Button
          className={styles.button}
          onClick={onClose}
          variant="contained"
          sx={{ mt: 3, width: "100%" }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default HagglePopup;