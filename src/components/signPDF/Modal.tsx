import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { SideBarProps } from "./SideBar";
import { FC, useState } from "react";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface BasicModalProps {
  isDocumentComplete: boolean;
}

const BasicModal: FC<BasicModalProps> = ({ isDocumentComplete }) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Modal
        open={isDocumentComplete}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Error Submitting Document
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            All Fields must be complete in order to submit document
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default BasicModal;
