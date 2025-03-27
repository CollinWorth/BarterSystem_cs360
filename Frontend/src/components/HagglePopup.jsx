import React, { useState } from "react";
import { Modal, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import styles from './HagglePopup.module.scss';

const HagglePopup = ({ post, open, onClose }) => {
  const [dropdown1, setDropdown1] = useState("Option1");
  const [dropdown2, setDropdown2] = useState("Option1");

  const handleDropdown1Change = (e) => setDropdown1(e.target.value);
  const handleDropdown2Change = (e) => setDropdown2(e.target.value);

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
    <Modal open={open} onClose={onClose} aria-labelledby="haggle-modal-title" aria-describedby="haggle-modal-description">
      <Box className='modal' sx={style}>
        <Typography id="haggle-modal-title" variant="h6">
          Haggle for {post.title}
        </Typography>
        <Typography id="haggle-modal-description" sx={{ mt: 2 }}>
          {post.body}
        </Typography>

        {/* Dropdown 1 */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Dropdown 1</InputLabel>
          <Select value={dropdown1} onChange={handleDropdown1Change}>
            <MenuItem value="Option1">Option 1</MenuItem>
            <MenuItem value="Option2">Option 2</MenuItem>
            <MenuItem value="Option3">Option 3</MenuItem>
          </Select>
        </FormControl>

        {/* Dropdown 2 */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Dropdown 2</InputLabel>
          <Select value={dropdown2} onChange={handleDropdown2Change}>
            <MenuItem value="Option1">Option 1</MenuItem>
            <MenuItem value="Option2">Option 2</MenuItem>
            <MenuItem value="Option3">Option 3</MenuItem>
          </Select>
        </FormControl>

        {/* Close Button */}
        <Button className= {styles.button} onClick={onClose} variant="contained" sx={{ mt: 3, width: "100%" }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default HagglePopup;