// HelpRequestList.js
import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

function HelpRequestList({ requests }) {
  return (
    <List sx={{ width: "100%", maxWidth: 360 }}>
      {requests.map((request) => (
        <ListItem key={request.id}>
          <ListItemText
            primary={`${request.city} - ${request.description}`}
            secondary={request.contact}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default HelpRequestList;
