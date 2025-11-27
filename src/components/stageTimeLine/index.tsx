import React from "react";
import { Box, Typography, Tooltip, useTheme } from "@mui/material";

interface StageDetail {
  stage: string;
  status: string;
  timestamp: string | null;
  message: string;
}

interface StageTimelineProps {
  stageDetails: StageDetail[];
}

const StageTimeline: React.FC<StageTimelineProps> = ({ stageDetails }) => {
  const theme = useTheme();
  

  const getColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return 'green';
      case "FAILED":
        return 'red';
      case "SKIPPED":
        return "red";
      default:
        return "red";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        overflowX: "auto",
        py: 3,
        position: "relative",
      }}
    >
      {stageDetails?.map((stage, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: "120px",
            position: "relative",
          }}
        >
          {/* Tooltip wraps the dot */}
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stage.message}
                </Typography>
                {stage.timestamp && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stage.timestamp).toLocaleString()}
                  </Typography>
                )}
              </Box>
            }
            arrow
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: getColor(stage.status),
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2],
                zIndex: 2,
              }}
            />
          </Tooltip>

          {/* Connector line */}
          {/* {index < stageDetails.length - 1 && (
            <Box
              sx={{
           
                flex: 1,
                height: 3,
                backgroundColor:
                  stageDetails[index + 1].status === "FAILED"
                    ? 'red'
                    : 'green',
              }}
            />
          )} */}


          {index < stageDetails.length - 1 && (
  <Box
    sx={{
      flex: 1,
      height: 3,
      background:
        stage.status !== stageDetails[index + 1].status
          ? `linear-gradient(to right, ${getColor(stage.status)} 90%, ${getColor(
              stageDetails[index + 1].status
            )} 50%)`
          : getColor(stage.status),
    }}
  />
)}


          {/* Stage name below */}
          <Box
            sx={{
              position: "absolute",
              bottom: -25,
              left: "-35%",
              width: "100%",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
            >
              {stage.stage}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default StageTimeline;
