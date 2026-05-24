import React, { useMemo } from "react";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import getArchiveTexts from "../helpers/archive/getArchiveTexts";

const Filter = ({
  value,
  onChange,
  placeholder,
  width = "300px",
  height = "40px",
  field,
  onFieldChange,
  fields = [],
}) => {
  const { t } = useTranslation("archive");
  const texts = useMemo(() => getArchiveTexts(t), [t]);

  const finalPlaceholder = placeholder || texts.search;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      justifyContent={isMobile ? "center" : "flex-end"}
      alignItems="center"
      mb={2}
      gap={2}
      flexWrap="wrap"
    >
      {/* فلټر Dropdown */}
      <FormControl
        size="small"
        variant="outlined"
        dir="rtl"
        sx={{
          width: isMobile ? "100%" : "150px",
          "& .MuiOutlinedInput-root": {
            height: height,
            borderRadius: "8px",
          },
        }}
      >
        <InputLabel id="field-label">{texts.filter}</InputLabel>
        <Select
          labelId="field-label"
          value={field}
          onChange={onFieldChange}
          label={texts.filter}
        >
          {fields.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* سرچ / جستجو */}
      <TextField
        variant="outlined"
        size="small"
        placeholder={finalPlaceholder}
        value={value}
        onChange={onChange}
        dir="rtl"
        fullWidth={isMobile}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          width: isMobile ? "100%" : width,
          "& .MuiOutlinedInput-root": {
            height: height,
            borderRadius: "8px",
          },
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />
    </Box>
  );
};

export default Filter;