import  { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  IconButton,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  InputAdornment,
  Typography,
  Dialog,
  DialogTitle
} from "@mui/material";

//@ts-nocheck
import SearchIcon from "@mui/icons-material/Search";
import { ApplicantService } from "@/services/applicant.service";
import { PieChart } from '@mui/x-charts/PieChart';
import { useRecoilState } from "recoil";
import { applicantView } from "@/states/state";
export default function ApplicantList(
  
  //@ts-ignore
  { open, setOpen, userList, fetchUserDetails }) {


     const [viewapplicatn,setViewApplicant]=useRecoilState(applicantView)
    
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showList, setShowList] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  const [ utilizedLimit, setutilizedLimit ] = useState(0)
  const [availableLimit,setAvailableLimit]=useState(0)
  const[ maxlimit,setMaxlimit]=useState(0)


    function LimitPieChart() {
  
    const utilized = Math.abs(utilizedLimit);
    const available = Math.abs(availableLimit);
  
    return (
      <Box sx={{  width: 400, height: 100, }}>
        <PieChart
          series={[
            {
              data: [
                {
                  id: 0,
                  value: utilized,
                  label: 'Utilized Limit',
                  color: '#FF6B6B',
                },
                {
                  id: 1,
                  value: available,
                  label: 'Available Limit',
                  color: '#4ECDC4',
                },
              ],
              innerRadius: 50, // donut shape
              outerRadius: 100,
            },
          ]}
          width={400}
          height={200}
        />
        <Typography
          variant="subtitle2"
          sx={{
            position: 'absolute',
            top: '60%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          ₹{maxlimit.toLocaleString()}
          <br />
          Max Limit
        </Typography>
      </Box>
    );
  }


  // Sample testing data
  const testData = {
    testFlag: true,
    requestSource: "test-environment",
    mockData: {
      complianceLimit: 50000,
      message: "Test Mode Active",
    },
  };

  // Filter user list based on search input
  const filteredUsers = userList.filter((b:any) =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle user selection and fetch compliance details
  const handleUserSelect = async (user:any) => {

    console.log((user));
    
    setSelectedUser(user);
    setSearchText(user.name);
    setShowList(false);
    setUserDetails(null);

    try {
      let applicant_service = new ApplicantService();



      // Fetch compliance data with testing data appended
      let comp_data = await applicant_service.getCompliance(
   user?.applicantId,
    );

      console.log("Compliance Data:", comp_data); // Log the compliance data

      setutilizedLimit(comp_data?.utilizedLimit)
      setAvailableLimit(comp_data?.availableLimit)
      setAvailableLimit(comp_data?.maxlimit)


      // const [ utilizedLimit, setutilizedLimit ] = useState(0)
      // const [availableLimit,setAvailableLimit]=useState(0)
      // const[ maxlimit,setMaxlimit]=useState(0)
    

      // Fetch user details with testing data appended
      const response = await fetchUserDetails({
        bpId: user.benificaryId,
        residentStatus: "resident",
        ...testData, // Appending test data
      });

      // Merge compliance data into userDetails state
      setUserDetails({
        ...response,
        complianceLimit: comp_data?.limit || testData.mockData.complianceLimit, // Extract compliance limit or use test data
        message: comp_data?.message || testData.mockData.message,
      });

      

    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Clear user selection
  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchText("");
    setUserDetails(null);
    setShowList(false);
  };

  return (
    <>
      {/* Search Icon Button */}
      <IconButton onClick={() => setOpen(true)}>
        <SearchIcon />
      </IconButton>

      {/* Modal */}
      <Modal open={viewapplicatn} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 250,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          
          {/* Search Input */}
          
          <TextField
            variant="filled"
            fullWidth
            value={searchText}
            onChange={(e) => {
              setSelectedUser(null);
              setSearchText(e.target.value);
              setShowList(true);
            }}
            
            placeholder="Type a User name or ID..."
            InputProps={{
              startAdornment: selectedUser && (
                <InputAdornment position="start">
                  <Avatar src={selectedUser.profilePhoto} alt={selectedUser.name} />
                </InputAdornment>
              ),
            }}
          />

          {/* User List */}
          {showList && filteredUsers.length > 0 && (
            <Paper elevation={3} sx={{ mt: 2 }}>
              <List>
                {filteredUsers.map((b:any) => (
                  <ListItem
                    key={b.benificaryId}
                    divider
                    button
                    onClick={() => handleUserSelect(b)}
                  >
                    <ListItemAvatar>
                      <Avatar src={b.profilePhoto} alt={b.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={b.name}
                      secondary={`ID: ${b.benificaryId} | Account: ${b.accountNumber}`}
                    />
                  </ListItem>
                ))}
              </List>
     

              
            </Paper>
          )}

          {/* Selected User & Compliance Info */}
          {selectedUser && (
            <>

                 

              <Box sx={{  textAlign: "center", color: "grey",height:"20vh" }}>
              <LimitPieChart></LimitPieChart>
              </Box>
        
            </>
          )}
        </Box>

      
      </Modal>



    </>
  );
}
