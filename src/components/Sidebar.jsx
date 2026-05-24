// import React, { useState, useEffect } from "react";
// import {
//   Drawer,
//   Box,
//   Avatar,
//   Typography,
//   Button,
//   Divider,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   Collapse,
// } from "@mui/material";
// import {
//   ExpandLess,
//   ExpandMore,
//   Logout as LogoutIcon,
//   AccountCircle,
//   AdminPanelSettings,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { useMyContext } from "../store/ContextApi";
// import { useTheme } from "@mui/material/styles";
// import api from "../services/api";
// // Import your axios instance

// const Sidebar = ({ open, toggleSidebar }) => {
//   const navigate = useNavigate();
//   const { currentUser, isAdmin, setToken, setCurrentUser, setIsAdmin } =
//     useMyContext();
//   const theme = useTheme();
//   const [adminOpen, setAdminOpen] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [imageError, setImageError] = useState(false);

//   // Fetch user profile when sidebar opens
//   useEffect(() => {
//     if (open) {
//       fetchUserProfile();
//     }
//   }, [open]);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await api.get("/auth/profile");
//       setUserProfile(response.data);
//       setImageError(false);
//       console.log("✅ User profile fetched:", response.data);
//     } catch (error) {
//       console.error("❌ Error fetching user profile:", error);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setToken(null);
//     setCurrentUser(null);
//     setIsAdmin(false);
//     setUserProfile(null);
//     toggleSidebar && toggleSidebar(false);
//     navigate("/login");
//   };

//   const handleAdminToggle = () => {
//     setAdminOpen(!adminOpen);
//   };

//   // Get profile image URL from backend
//   const getProfileImageUrl = () => {
//     if (userProfile?.profileImage && !imageError) {
//       const imagePath = userProfile.profileImage.startsWith("/")
//         ? userProfile.profileImage.substring(1)
//         : userProfile.profileImage;
//       return `${process.env.REACT_APP_API_URL}/${imagePath}`;
//     }
//     return null;
//   };

//   const handleImageError = () => {
//     console.error("❌ Failed to load profile image");
//     setImageError(true);
//   };

//   const profileImageUrl = getProfileImageUrl();
//   const userName = userProfile?.userName || currentUser?.name || "کاروونکی";
//   const userEmail = userProfile?.email || currentUser?.email || "";
//   const userInitial = userName.charAt(0).toUpperCase();

//   return (
//     <Drawer
//       anchor="right"
//       open={open}
//       onClose={() => toggleSidebar(false)}
//       sx={{
//         "& .MuiDrawer-paper": {
//           width: 260,
//           boxSizing: "border-box",
//           direction: "rtl",
//           bgcolor: theme.palette.background.paper,
//           color: theme.palette.text.primary,
//         },
//       }}
//     >
//       <Box
//         sx={{
//           p: 2,
//           height: "100%",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//       >
//         {/* پورته برخه */}
//         <Box>
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               mb: 3,
//             }}
//           >
//             <Avatar
//               src={profileImageUrl}
//               imgProps={{
//                 onError: handleImageError,
//               }}
//               sx={{
//                 width: 64,
//                 height: 64,
//                 mb: 1,
//                 bgcolor: !profileImageUrl
//                   ? theme.palette.primary.main
//                   : undefined,
//               }}
//             >
//               {!profileImageUrl && userInitial}
//             </Avatar>
//             <Typography variant="h6">{userName}</Typography>
//             <Typography variant="body2">{userEmail}</Typography>
//           </Box>

//           <Divider />

//           <List sx={{ mt: 2 }}>
//             {/* پروفایل */}
//             <ListItem disablePadding>
//               <ListItemButton
//                 onClick={() => {
//                   navigate("/profile");
//                   toggleSidebar(false);
//                 }}
//                 sx={{ justifyContent: "flex-end", gap: 1 }}
//               >
//                 <AccountCircle sx={{ color: "#9aa0ac" }} />
//                 <ListItemText
//                   primary="پروفایل"
//                   primaryTypographyProps={{
//                     textAlign: "right",
//                     fontWeight: "bold",
//                     color: "#9aa0ac",
//                   }}
//                 />
//               </ListItemButton>
//             </ListItem>

//             {/* ادمن برخه */}
//             {isAdmin && (
//               <>
//                 <ListItem disablePadding>
//                   <ListItemButton
//                     onClick={handleAdminToggle}
//                     sx={{ justifyContent: "flex-end", gap: 1 }}
//                   >
//                     <AdminPanelSettings sx={{ color: "#9aa0ac" }} />
//                     <ListItemText
//                       primary="ادمن برخې"
//                       primaryTypographyProps={{
//                         textAlign: "right",
//                         fontWeight: "bold",
//                         color: "#9aa0ac",
//                       }}
//                     />
//                     {adminOpen ? (
//                       <ExpandLess sx={{ color: "#9aa0ac" }} />
//                     ) : (
//                       <ExpandMore sx={{ color: "#9aa0ac" }} />
//                     )}
//                   </ListItemButton>
//                 </ListItem>

//                 <Collapse in={adminOpen} timeout="auto" unmountOnExit>
//                   <List component="div" disablePadding sx={{ pr: 3 }}>
//                     <ListItem disablePadding>
//                       <ListItemButton
//                         onClick={() => {
//                           navigate("/admin/users");
//                           toggleSidebar(false);
//                         }}
//                         sx={{
//                           justifyContent: "flex-end",
//                           "&:hover": { bgcolor: "#f5f5f5" },
//                         }}
//                       >
//                         <ListItemText
//                           primary="د کاروونکو لېست"
//                           primaryTypographyProps={{
//                             textAlign: "right",
//                             color: "#9aa0ac",
//                           }}
//                         />
//                       </ListItemButton>
//                     </ListItem>

//                     <ListItem disablePadding>
//                       <ListItemButton
//                         onClick={() => {
//                           navigate("/admin/audit-logs");
//                           toggleSidebar(false);
//                         }}
//                         sx={{
//                           justifyContent: "flex-end",
//                           "&:hover": { bgcolor: "#f5f5f5" },
//                         }}
//                       >
//                         <ListItemText
//                           primary=" تفتیشي ثبتونه"
//                           primaryTypographyProps={{
//                             textAlign: "right",
//                             color: "#9aa0ac",
//                           }}
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                     <ListItem disablePadding>
//                       <ListItemButton
//                         onClick={() => {
//                           navigate("/admin/user-management");
//                           toggleSidebar(false);
//                         }}
//                         sx={{
//                           justifyContent: "flex-end",
//                           "&:hover": { bgcolor: "#f5f5f5" },
//                         }}
//                       >
//                         <ListItemText
//                           primary="د کاروونکو مدیریت"
//                           primaryTypographyProps={{
//                             textAlign: "right",
//                             color: "#9aa0ac",
//                           }}
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                   </List>
//                 </Collapse>
//               </>
//             )}
//           </List>
//         </Box>

//         {/* ښکته برخه */}
//         <Box>
//           <Divider sx={{ mb: 2 }} />
//           <Button
//             variant="contained"
//             fullWidth
//             onClick={handleLogout}
//             sx={{
//               bgcolor: "#ecccc4",
//               color: "#ed5a57",
//               fontWeight: "bold",
//               borderRadius: 2,
//               justifyContent: "center",
//               gap: 1.5,
//               "&:hover": { bgcolor: "#e0bdb4" },
//             }}
//             startIcon={<LogoutIcon sx={{ color: "#ed5a57" }} />}
//           >
//             وتل
//           </Button>
//         </Box>
//       </Box>
//     </Drawer>
//   );
// };

// export default Sidebar;
