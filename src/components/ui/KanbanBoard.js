import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box, Typography } from "@mui/material";
import { statusMapping } from "../../utils/statusMapping";

const KanbanBoard = ({ columns, onDragEnd, onMarkerClick }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" justifyContent="space-around" flexGrow={1}>
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                width="250px"
                margin="8px"
                padding="8px"
                border="1px solid #ccc"
                borderRadius="8px"
                bgcolor="#f7f7f7"
              >
                <Typography variant="h6">
                  {statusMapping[column.id].icon} {column.title}
                </Typography>
                {column.markers.map((marker, index) => (
                  <Draggable
                    key={marker.id}
                    draggableId={marker.id}
                    index={index}
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        margin="4px 0"
                        padding="8px"
                        bgcolor="#fff"
                        border="1px solid #ddd"
                        borderRadius="8px"
                        onClick={() => onMarkerClick(marker)}
                      >
                        <Typography variant="subtitle1">
                          #{marker.index + 1} - {marker.contact}
                        </Typography>
                        <Typography variant="body2">
                          {marker.description}
                        </Typography>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;
