import { CalendarToday, ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment-hijri";
import { useState } from "react";

// Configure Hijri
moment.locale("ar-sa");

const HijriDatePicker = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [displayDate, setDisplayDate] = useState(
    value ? moment(value, "iYYYY/iM/iD") : moment(),
  );

  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateSelect = (day) => {
    const selectedDate = moment(displayDate).iDate(day);
    onChange(selectedDate.format("iYYYY/iM/iD"));
    handleClose();
  };

  const handleMonthChange = (direction) => {
    setDisplayDate(moment(displayDate).add(direction, "iMonth"));
  };

  const getDaysInMonth = () => {
    const daysInMonth = displayDate.iDaysInMonth();
    const firstDayOfMonth = moment(displayDate).iDate(1).day();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  const monthNames = [
    "محرم",
    "صفر",
    "ربیع الاول",
    "ربیع الثانی",
    "جمادی الاول",
    "جمادی الثانی",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذی القعده",
    "ذی الحجه",
  ];

  const open = Boolean(anchorEl);

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={value || ""}
        onClick={handleClick}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton onClick={handleClick} edge="end" disabled={disabled}>
              <CalendarToday />
            </IconButton>
          ),
          sx: {
            direction: "rtl",
          },
        }}
        placeholder="YYYY/M/D"
        sx={{
          "& .MuiInputBase-input": {
            textAlign: "right",
            direction: "rtl",
            cursor: "pointer",
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2, width: 320, direction: "rtl" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <IconButton onClick={() => handleMonthChange(-1)} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontFamily: "Vazirmatn" }}>
              {monthNames[displayDate.iMonth()]} {displayDate.iYear()}
            </Typography>
            <IconButton onClick={() => handleMonthChange(1)} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Week Days */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {weekDays.map((day, index) => (
              <Grid item xs={12 / 7} key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    color: "primary.main",
                  }}
                >
                  {day}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={1}>
            {getDaysInMonth().map((day, index) => (
              <Grid item xs={12 / 7} key={index}>
                {day ? (
                  <Button
                    onClick={() => handleDateSelect(day)}
                    sx={{
                      minWidth: "auto",
                      width: "100%",
                      aspectRatio: "1",
                      p: 0,
                      fontSize: "0.875rem",
                      bgcolor:
                        value &&
                        moment(value, "iYYYY/iM/iD").iDate() === day &&
                        moment(value, "iYYYY/iM/iD").iMonth() ===
                          displayDate.iMonth()
                          ? "primary.main"
                          : "transparent",
                      color:
                        value &&
                        moment(value, "iYYYY/iM/iD").iDate() === day &&
                        moment(value, "iYYYY/iM/iD").iMonth() ===
                          displayDate.iMonth()
                          ? "white"
                          : "text.primary",
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "white",
                      },
                    }}
                  >
                    {day}
                  </Button>
                ) : (
                  <Box sx={{ width: "100%", aspectRatio: "1" }} />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Today Button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              onClick={() => {
                const today = moment().format("iYYYY/iM/iD");
                onChange(today);
                setDisplayDate(moment());
                handleClose();
              }}
              variant="outlined"
              size="small"
            >
              امروز
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default HijriDatePicker;
