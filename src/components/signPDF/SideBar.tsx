import { useRef, useEffect, FC, useState } from "react";
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
import { SignPDFTronProps } from ".";
import BasicModal from "./Modal";

const drawerWidth = 240;

export interface SideBarProps extends SignPDFTronProps {
  handleUploadClick: Function;
  nextField: Function;
  prevField: Function;
  isDocumentComplete: boolean;
  completeSigning: Function;
}

const SideBar: FC<SideBarProps> = ({
  handleUploadClick,
  nextField,
  prevField,
  isDocumentComplete,
  completeSigning,
}) => {
  const drawer = (
    <div>
      <Toolbar />
      <BasicModal isDocumentComplete={isDocumentComplete} />
      <Divider />
      <List>
        <ListItem
          key={"Upload"}
          disablePadding
          onClick={() => handleUploadClick()}
        >
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Upload"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"Next"} disablePadding onClick={() => nextField()}>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Next Field"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={"Previous"} disablePadding onClick={() => prevField()}>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Previous Field"} />
          </ListItemButton>
        </ListItem>
        <ListItem
          key={"Complete"}
          disablePadding
          onClick={() => completeSigning()}
        >
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Submit"} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;
