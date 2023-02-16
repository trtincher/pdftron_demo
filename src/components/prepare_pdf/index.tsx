import { useRef, useEffect, useState } from "react";
import {
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MailIcon from "@mui/icons-material/Mail";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import WebViewer from "@pdftron/webviewer";
import React from "react";
import PDF from "./PDF";

const drawerWidth = 240;

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const PreparePDF = (props: Props) => {
  const { window } = props;

  const [mobileOpen, setMobileOpen] = React.useState(false);



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex"}}>
      {/* <Toolbar /> */}
      <PDF/>
    </Box>
  );
};

export default PreparePDF;
