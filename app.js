const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');

// Les routes
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// application express
const app = express();

// connection à la base de données
mongoose.connect('mongodb+srv://XXXXXXXXXXXX@cluster0.ao8zs.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// middleware qui parse les requêtes du client
app.use(bodyParser.json());

app.use(helmet());

// middleware général premettant toute les demandes de toutes origines d'accéder à l'API
app.use((req, res, next) => {
    // accès de n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    // autorisation des entêtes 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // autorisation des méthodes pour les requêtes HTTP
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// middleware qui charge les fichiers du répertoire images
app.use('/images', express.static(path.join(__dirname, 'images')));

// middleswares qui transmettent les requêtes vers les routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;