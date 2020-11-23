const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma d'un utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
});

// plugin permettant de rendre l'adresse email unique
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);