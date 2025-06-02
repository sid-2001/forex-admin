import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppBar, Tabs, Tab, Box } from '@mui/material';
import ErrorsTab from '../../components/error-tab';
import BobMatrixTab from '../../components/bob-tab';
import ListCharges from '../list-chages';
import ListCurrencies from '../list-currency';

const tabMap: { [key: string]: number } = {
  errors: 0,
  bopmatrix: 1,
  charges: 2,
  Country:3
};

const MainTabsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabName = searchParams.get('tab') || 'errors'; // Default to "errors"
  const [activeTab, setActiveTab] = useState<number>(tabMap[tabName] ?? 0);

  useEffect(() => {
    if (tabMap[tabName] !== undefined) {
      setActiveTab(tabMap[tabName]);
    }
  }, [tabName]);

  const handleTabChange = (
    
    //@ts-ignore
    event: React.SyntheticEvent, newValue: number) => {
    const newTabName = Object.keys(tabMap).find((key) => tabMap[key] === newValue);
    if (newTabName) {
      setSearchParams({ tab: newTabName }); // Update the query parameter
      setActiveTab(newValue);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ErrorsTab />;
      case 1:
        return <BobMatrixTab />;
      case 2:
        return <ListCharges />;
      case 3:
        return <ListCurrencies/>
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '75vw' }}>
      <AppBar position="static" color="default">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Errors" />
          <Tab label="BOp Matrix" />
          <Tab label="Charges" />
          <Tab label="Country" />
        </Tabs>
      </AppBar>

      <Box sx={{ p: 2 }}>{renderTabContent()}</Box>
    </Box>
  );
};

export default MainTabsPage;
