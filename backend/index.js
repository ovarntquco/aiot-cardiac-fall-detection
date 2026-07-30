import app from './config.js';
import dotenv from 'dotenv'

dotenv.config()

BACKEND_PORT = process.env.BACKEND_PORT || 3000

app.listen(BACKEND_PORT, () => {
    console.log(`Server running on port ${BACKEND_PORT}`);
});