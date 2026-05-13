const express = require('express');
const app = express();
const module1Routes = require('./module1/src/routes/index');

app.use(express.json());

// Jalur API Modul 1
app.use('/api/v1/m1', module1Routes);

app.listen(3000, () => {
    console.log('Backend Modul 1 Aktif di Port 3000');
});