import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import '../App.css'; 

const ActivitiesPage = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [activities, setActivities] = useState([]);
  
  // A few random fun break tips
  const tips = [
    "Take a deep breath and smile!",
    "Hydrate! Grab a glass of water before your next task.",
    "Stand up and stretch for a minute — your body will thank you.",
    "Look away from the screen and blink slowly.",
    "Remember: small breaks can boost creativity.",
    "You are doing great - keep it up!"
  ];

  // Choose a random tip each time
  const [tip] = useState(() => tips[Math.floor(Math.random()*tips.length)]);

  // A selection of games to embed
  const games = [
    {
      name: "Sudoku",
      url: "https://www.proprofs.com/games/sudoku/?embed=1"
    },
    {
      name: "Classic Snake Game",
      url: "https://playpager.com/embed/snake/index.html"
    },
    {
      name: "Word Search",
      url: "https://www.proprofs.com/games/word-search/?embed=1&game=646242"
    }
  ];

  const [currentGame, setCurrentGame] = useState(() => games[0]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5001/activities', { headers });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [headers]);

  const handleShuffleGame = () => {
    let newGame = currentGame;
    if (games.length > 1) {
      // Keep picking until a different game is chosen
      while (newGame === currentGame) {
        newGame = games[Math.floor(Math.random()*games.length)];
      }
    }
    setCurrentGame(newGame);
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Header />
        <Box p={3} flex={1} overflow="auto">

          {/* Tip of the Day */}
          <Paper sx={{ p: 2, background: '#ffffff', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Break Tip
            </Typography>
            <Typography variant="body1">
              {tip}
            </Typography>
          </Paper>

          {/* Game Section */}
          <Paper sx={{ p: 2, background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom>
              Take a Fun Break!
            </Typography>
            <Typography variant="body2" gutterBottom>
              Refresh your mind with a quick game. Feeling adventurous?
              Try a different one by clicking "Shuffle Game".
            </Typography>

            <Button variant="contained" color="secondary" onClick={handleShuffleGame} sx={{ mb: 2, mt: 1 }}>
              Shuffle Game
            </Button>

            <Box
              className="game-container"
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                margin: '0 auto',
                border: '3px solid #f0f0f0',
                borderRadius: '8px',
                overflow: 'hidden',
                mt: 2
              }}
            >
              <iframe
                src={currentGame.url}
                width="600"
                height="600"
                style={{ border: 'none', display: 'block' }}
                title={currentGame.name}
                allowFullScreen
              ></iframe>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivitiesPage;
