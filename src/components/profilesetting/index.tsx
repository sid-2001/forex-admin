import { LocalStorageService } from "@/helpers/local-storage-service";
import { Box, Avatar, Typography, Menu, MenuItem, Divider, Select, Stack } from "@mui/material";
import { useEffect, useState } from "react";


const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const local_service=new LocalStorageService();
  const staff = local_service?.get_staff_access();



const CountrySelector = () => {
  const staff = local_service?.get_staff_access()

  if (!staff) return null

  const countryNames: Record<string, string> = {
    ZA: 'South Africa',
    IN: 'India',
    US: 'United States',
    UK: 'United Kingdom',
    AE: 'UAE',
  }

  const getFlag = (code: string) =>
    code
      ? code
          .toUpperCase()
          .replace(/./g, c =>
            String.fromCodePoint(127397 + c.charCodeAt(0))
          )
      : '🏳️'

  /** 🔹 Auto select first country if not selected */
  useEffect(() => {
    if (!staff.staffCountry && staff.staffCountries?.length) {
      local_service.set_usercountry(staff.staffCountries[0])
    }
  }, [staff])

  const selectedCountry =local_service.get_staff_country();


  return (
    <Typography>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.6}
        sx={{ mt: '2px' }}
      >
        {/* 🔹 MULTIPLE COUNTRIES → DROPDOWN */}
        {staff.staffCountries?.length > 1 ? (
          <Select
            size="small"
            value={selectedCountry}
            onChange={e =>
            {
              console.log(e)
              local_service.set_usercountry(e.target.value)
              window.location.reload()
            }
            }
            sx={{
             
              fontSize: { xs: '11px', md: '1.4vh' },
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              '& .MuiSelect-icon': { color: 'white' },
              '& fieldset': { border: 'none' },
            }}
          >
            {staff.staffCountries.map((code: string) => (
              <MenuItem key={code} value={code}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span>{getFlag(code)}</span>
                  <span>{countryNames[code] || code}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        ) : (
          /* 🔹 SINGLE COUNTRY → TEXT */
          selectedCountry && (
            <>
              <Typography
                sx={{ fontSize: { xs: '12px', md: '1.5vh' } }}
              >
                {getFlag(selectedCountry)}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '12px', md: '1.5vh' },
                  color: 'white',
                  whiteSpace: 'nowrap',
                }}
              >
                {countryNames[selectedCountry] ||
                  selectedCountry}
              </Typography>
            </>
          )
        )}
      </Stack>
    </Typography>
  )
}


  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* ===== MENU TRIGGER ===== */}
      <Box
        onClick={handleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          px: 1.5,
          py: 0.8,
          borderRadius: "30px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: "grey.700",
            width: 42,
            height: 42,
            fontWeight: 600,
          }}
        >
          {staff?.staffFirstName?.[0]?.toUpperCase()}
          {staff?.staffLastName?.[0]?.toUpperCase()}
        </Avatar>

        {/* Hide text on mobile */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column" }}>
          <Typography sx={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
            {staff?.staffFirstName} {staff?.staffLastName}
          </Typography>

          <Typography sx={{ color: "white", opacity: 0.7, fontSize: "12px" }}>
            {staff?.userCategory || staff?.roleDescription || "User"}
          </Typography>
        </Box>
      </Box>

      {/* ===== DROPDOWN MENU ===== */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 260,
            borderRadius: 2,
            backgroundColor: "#1e1e2f",
            color: "white",
          },
        }}
      >

      
        {/* User Info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontWeight={600}>
            {staff?.staffFirstName} {staff?.staffLastName}
          </Typography>
        
      
    
          <Typography>
             
            Staff ID: {staff?.staffId}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Country Selector */}
        <MenuItem disableRipple>
          <CountrySelector />
        </MenuItem>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        <MenuItem onClick={() => console.log("Profile Click")}>
          My Profile
        </MenuItem>

        <MenuItem onClick={() => console.log("Settings Click")}>
          Settings
        </MenuItem>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        <MenuItem
          onClick={() => {
          local_service.delete_eaccestoke();
          window.location.reload();
            handleClose();
            console.log("Logout");
          }}
          sx={{ color: "#ff6b6b" }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
