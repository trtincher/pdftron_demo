import { useRef, useEffect, useState, FC } from "react";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MailIcon from "@mui/icons-material/Mail";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import WebViewer from "@pdftron/webviewer";
import React from "react";
import SignPDF from "./SignPDF";

const drawerWidth = 240;

export interface SignPDFTronProps {}

const SignPDFTron: FC<SignPDFTronProps> = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <SignPDF />
    </Box>
  );
};

export default SignPDFTron;
