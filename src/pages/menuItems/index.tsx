import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button, Stack, IconButton, FormControl, MenuItem, InputLabel, Select } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import EditIcon from '@mui/icons-material/Edit'
import MasterService from '@/services/master.service'
import MenuItemsDialog from '@/components/menu-items-dialog'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(90deg)',
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const MenuIems: React.FC = () => {
  const [menusData, setMenusData] = useState([])
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const masterService = new MasterService()
  const [expanded, setExpanded] = React.useState<string | false>('')
  const [availableCountries, setAvailableCountries] = useState<string[]>([])

  const [openMenuItemModal, setOpenMenuItemModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const [filters, setFilters] = useState({
    countryCode: '',
  })

  const [appliedFilters, setAppliedFilters] = useState({
    countryCode: '',
  })

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    console.log(event, '===========')
    setExpanded(newExpanded ? panel : false)
  }

  const fetchMenuItemsLists = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams()

      if (appliedFilters.countryCode) {
        queryParams.append('countryCode', appliedFilters.countryCode.split('(')[0].trim())
      }

      const queryString = queryParams.toString()

      const response = await masterService.getAllMenus(queryString ? `?${queryString}` : '')

      const data = Array.isArray(response?.data) ? response.data : []

      const countries = [...new Set(response.data.map((item: any) => item.countryCode).filter(Boolean))] as string[]

      !queryString && setAvailableCountries(countries)

      setMenusData(data)
    } catch (error) {
      console.error(error)
      setMenusData([])
    }
  }, [appliedFilters])

  useEffect(() => {
    fetchMenuItemsLists()
  }, [fetchMenuItemsLists])

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters(filters)
  }

  const resetFilters = () => {
    const emptyFilters = {
      countryCode: '',
    }

    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '90vw', height: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            MENU ITEMS LISTING
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                setEditData(null)
                setOpenMenuItemModal(true)
              }}
              sx={{ ml: 2 }}
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            >
              Add
            </Button>
          </Box>
        </Stack>

        {/* Filter Section */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={filters.countryCode}
                label="Country"
                onChange={(e) => {
                  handleFilterChange('countryCode', e.target.value)
                }}
              >
                <MenuItem value="">All</MenuItem>
                {availableCountries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Channel</InputLabel>
                      <Select value={filters.faqChannel} label="Channel" onChange={(e) => handleFilterChange('faqChannel', e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        {availableChannels.map((channel) => (
                          <MenuItem key={channel} value={channel}>
                            {channel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}

            <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={applyFilters} sx={{ minWidth: 100 }}>
              Search
            </Button>

            <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={resetFilters} sx={{ minWidth: 100 }}>
              Clear
            </Button>
          </Stack>
        </Box>

        <div className="faq-container">
          {menusData.map((menuItem: any, index: number) => {
            const hasChildren = Array.isArray(menuItem?.children) && menuItem.children.length > 0

            return (
              <Accordion
                key={index}
                expanded={hasChildren && expanded === menuItem.menuCode}
                onChange={hasChildren ? handleChange(menuItem.menuCode) : undefined}
                sx={{
                  marginBottom: '12px',
                  boxShadow: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    borderColor: '#d1d5db',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={hasChildren ? <ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} /> : null}
                  sx={{
                    padding: '14px 20px',
                    minHeight: 'auto',
                    '& .MuiAccordionSummary-content': {
                      margin: '0',
                      alignItems: 'center',
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: '#6b7280',
                      marginLeft: '8px',
                    },
                  }}
                >
                  {/* your existing content */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#111827',
                          marginLeft: 2,
                        }}
                      >
                        {menuItem?.parentMenuName}
                      </Typography>

                      {/* {menuItem?.faqSubSectionDescription && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6b7280',
                          fontSize: '12px',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 12px',
                          borderRadius: '12px',
                        }}
                      >
                        {menuItem?.faqSubSectionDescription.slice(0, 50)}
                      </Typography>
                    )} */}

                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6b7280',
                          fontSize: '12px',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 12px',
                          borderRadius: '12px',
                        }}
                      >
                        {menuItem?.countryCode}
                      </Typography>
                      {/* countryCode */}

                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6b7280',
                          fontSize: '12px',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 12px',
                          borderRadius: '12px',
                        }}
                      >
                        {Array.isArray(menuItem?.children) ? menuItem.children.length : 0}{' '}
                        {Array.isArray(menuItem?.children) && menuItem.children.length === 1 ? 'child' : 'children'}
                      </Typography>
                    </Box>

                    {/* Edit Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Set the edit data and open modal
                          setEditData(menuItem) // Pass the entire faqItem
                          setOpenMenuItemModal(true)
                        }}
                        sx={{
                          color: '#6b7280',
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: '18px' }} />
                      </IconButton>

                      {/* Optional: Delete button */}
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    padding: '4px 20px 20px 20px',
                  }}
                >
                  {hasChildren &&
                    menuItem.children.map((childDetail: any, ind: number) => (
                      // your existing child content
                      <Box
                        key={ind}
                        sx={{
                          padding: '14px 0',
                          borderBottom: ind !== menuItem.children.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#111827',
                                mb: 1,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: '80%',
                                display: 'block',
                              }}
                            >
                              {childDetail?.childMenuName}
                            </Typography>

                            {/* <Typography
                          variant="body2"
                          sx={{
                            color: '#4b5563',
                            fontSize: '13px',
                            lineHeight: 1.7,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '80%',
                            display: 'block',
                          }}
                        >
                          {faqDetail?.faqAnswer}
                        </Typography> */}
                          </Box>

                          {/* Edit button for individual FAQ */}
                          {/* <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Edit question:', faqDetail)
                        }}
                        sx={{
                          color: '#9ca3af',
                          padding: '4px',
                          marginLeft: '12px',
                          flexShrink: 0,
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: '16px' }} />
                      </IconButton> */}
                        </Box>
                      </Box>
                    ))}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </div>

        <MenuItemsDialog
          open={openMenuItemModal}
          editData={editData}
          onClose={() => setOpenMenuItemModal(false)}
          refreshList={fetchMenuItemsLists}
          showAlert={showAlert}
        />
      </Box>
    </HasPermission>
  )
}

export default MenuIems
