import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Paper, CircularProgress, Divider, TextField } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { type User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import React from 'react';

const CompanyNotes = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (user) {
        const tasksCollectionRef = collection(db, 'tasks', user.uid, 'userTasks');
        const querySnapshot = await getDocs(tasksCollectionRef);

        const companyNames = new Set<string>();
        querySnapshot.forEach((doc) => {
          const companyName = doc.data().companyName;
          if (companyName) {
            companyNames.add(companyName);
          }
        });
        const companyList = Array.from(companyNames).sort();
        setAllCompanies(companyList);
        setFilteredCompanies(companyList); // 初期状態では全件表示
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [user]);

  useEffect(() => {
    const results = allCompanies.filter(company =>
      company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(results);
  }, [searchTerm, allCompanies]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        企業メモ
      </Typography>

      <Paper sx={{ p: 1, mb: 1.5 }}>
        <TextField
          fullWidth
          label="企業名で検索"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />
      </Paper>

      <Paper>
        <List sx={{ p: 0 }}>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
              <React.Fragment key={company}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={`/notes/${encodeURIComponent(company)}`}
                    sx={{ py: 2 }}
                  >
                    <ListItemText
                      primary={company}
                      primaryTypographyProps={{ fontSize: '1.1rem' }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < filteredCompanies.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          ) : (
            <ListItem sx={{ p: 2 }}>
              <ListItemText primary="該当する企業はありません。" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CompanyNotes;