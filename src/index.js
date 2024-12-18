const express = require('express');
const axios = require('axios');
const path = require('path');
const xml2js = require('xml2js'); 
const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  
app.use(express.static(path.join(__dirname, 'public')));


const checkImageUrl = async (url) => {
    try {
        await axios.head(url);
        return true;  
    } catch (error) {
        return false;  
    }
};

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://ergast.com/api/f1/2024/drivers'); 

        xml2js.parseString(response.data, async (err, result) => {
            if (err) {
                return res.status(500).send('Error parsing XML');
            }

            const drivers = result.MRData?.DriverTable?.[0]?.Driver; 

            const processedDrivers = [];

            for (const driver of drivers) {
                const givenName = driver.GivenName[0] || 'Unknown';
                const familyName = driver.FamilyName[0] || 'Unknown';
                const nationality = driver.Nationality[0] || 'Unknown';
                const dateOfBirth = driver.DateOfBirth[0] || 'Unknown';
                const url = driver.$.url || '';  

                let imageUrl = `https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_1320/content/dam/fom-website/drivers/2024Drivers/${familyName.toLowerCase()}.jpg`;

                const fallbackImageUrl = `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/fom-website/drivers/2024Drivers/${familyName.toLowerCase()}.jpg`;

                const imageExists = await checkImageUrl(imageUrl);

                if (!imageExists) {
                    imageUrl = fallbackImageUrl;
                }

                processedDrivers.push({
                    givenName,
                    familyName,
                    nationality,
                    dateOfBirth,
                    url,
                    imageUrl
                });
            }

            res.render('home', { drivers: processedDrivers });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});


const port = 3005;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
