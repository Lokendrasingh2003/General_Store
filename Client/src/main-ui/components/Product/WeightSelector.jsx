import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import styles from './WeightSelector.module.css';

const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];
const HOUSEHOLD_SIZE_OPTIONS = ['250ml', '500ml', '1L', '2L'];

const WeightSelector = ({ product, onWeightChange }) => {
  const isHousehold = product.category === 'household';
  const options = isHousehold ? HOUSEHOLD_SIZE_OPTIONS : WEIGHT_OPTIONS;
  const currentValue = isHousehold ? product.size : product.weight;
  const [selectedValue, setSelectedValue] = useState(currentValue || options[0]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    onWeightChange?.(newValue);
  };

  const label = isHousehold ? 'Size' : 'Weight';

  return (
    <Box className={styles.container}>
      <FormControl fullWidth size="small">
        <InputLabel id={`${product._id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${product._id}-label`}
          id={`${product._id}-select`}
          value={selectedValue}
          label={label}
          onChange={handleChange}
          className={styles.select}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default WeightSelector;
