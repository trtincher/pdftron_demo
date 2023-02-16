import { useRef, useEffect, FC, useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MailIcon from "@mui/icons-material/Mail";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import WebViewer from "@pdftron/webviewer";
import React from "react";
import SignersTable from "./SignersTable";

const drawerWidth = 650;

interface Props { 
  handleUploadClick: Function;
  handleUpdateSignFieldClick: Function;
  nextField: Function;
  prevField: Function;
  uniqueSignFields: Object;
  potentialSigners: {id: number, name: string, email: string, type: string}[]
}

const SideBar: FC<Props> = ({handleUploadClick, handleUpdateSignFieldClick, nextField, prevField, potentialSigners, uniqueSignFields}) => {
  const [fields, setFields] = useState<{ [key: number]: string }>({0: "choose"})

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {/* Upload */}
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
      </List>

      <Divider />
      <SignersTable potentialSigners={potentialSigners} uniqueSignFields={uniqueSignFields} fields={fields} setFields={setFields}/>

      <List>
      <ListItem
          key={"Update Sign Fields"}
          disablePadding
          onClick={() => handleUpdateSignFieldClick(fields)}
        >
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Update Sign Fields"} />
          </ListItemButton>
        </ListItem>

        {/* Next Button */}
        <ListItem
          key={"Next Field"}
          disablePadding
          onClick={() => nextField()}
        >
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Next Field"} />
          </ListItemButton>
        </ListItem>

        {/* Previous Button */}
        <ListItem
          key={"Previous Field"}
          disablePadding
          onClick={() => prevField()}
        >
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Previous Field"} />
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
