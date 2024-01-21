// src/main.ts
import axios, { AxiosError } from 'axios';

async function getRoomDetails(roomId: string) {
  const response = await axios.get(`https://infinite-castles.azurewebsites.net/castles/1/rooms/${roomId}`);
  return response.data;
}

async function getChestDetails(chestId: string) {
  try {
    const response = await axios.get(`https://infinite-castles.azurewebsites.net/castles/1/chests/${chestId}`);
    return response.data;
  } catch (error) {
    // Log 404 errors and return null for other errors
    if (is404Error(error)) {
      log404Error(`Chest ${chestId} not found.`);
    } else {
      console.error(`Error fetching details for chest ${chestId}:`, (error as Error).message);
    }
    return null;
  }
}

function is404Error(error: any): error is AxiosError {
  return error.response?.status === 404;
}

function log404Error(message: string) {
  // Log 404 errors as information, not as critical errors
  console.log(message);
}

async function exploreCastle(roomId: string) {
  try {
    const roomDetails = await getRoomDetails(roomId);

    // Log the roomDetails for debugging
    console.log('Room details:', JSON.stringify(roomDetails, null, 2));

    if (!roomDetails.chests || !Array.isArray(roomDetails.chests)) {
      console.error(`Error exploring castle: Invalid or missing chests data for room ${roomId}`);
      return;
    }

    // Count and list filled chests
    const filledChests = roomDetails.chests.filter((chest: any) => chest.status === 'filled');
    console.log(`Room ${roomId} has ${filledChests.length} filled chests:`);

    for (const chest of filledChests) {
      const chestDetails = await getChestDetails(chest.id);

      if (chestDetails && chestDetails.position && chestDetails.position.x !== undefined && chestDetails.position.y !== undefined) {
        console.log(`- Chest ${chest.id} at position (${chestDetails.position.x}, ${chestDetails.position.y})`);
      } else {
        console.log(`- Chest ${chest.id} has no valid position information`);
      }
    }

    // Explore connected rooms if available
    if (Array.isArray(roomDetails.rooms) && roomDetails.rooms.length > 0) {
      for (const connectedRoomId of roomDetails.rooms) {
        await exploreCastle(connectedRoomId);
      }
    } else {
      console.error(`Error exploring castle: Invalid or missing connectedRooms data for room ${roomId}`);
    }
  } catch (error) {
    if ((error as Error).message) {
      console.error('Error exploring castle:', (error as Error).message);
    } else {
      console.error('Error exploring castle:', error);
    }
  }
}

// Start exploring from the entry room
exploreCastle('entry').catch((error) => console.error('Error exploring castle:', error));
