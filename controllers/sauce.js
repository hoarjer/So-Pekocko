const Sauce = require('../models/Sauce');
const fs = require('fs');

// POST: créer une sauce et la sauvegarder
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'La sauce ' + sauce.name + ' est enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

// GET: voir toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// GET: voir une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

// PUT: modifier la sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }));
};

// DELETE: supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
};

// function like() {
    
//     Sauce.updateOne({ _id: req.params.id }, {
//         likes: sauceObject.likes,
//         usersLiked: sauceObject.usersLiked,
//         dislikes: sauceObject.dislikes,
//         usersDisliked: sauceObject.usersDisliked,
//         _id: req.params.id
//     })
//         .then(() => res.status(200).json({ message: req.body.message }))
//         .catch(error => res.status(400).json({ error }));
// };

// POST: liker ou disliker une sauce
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const sauceObject = sauce;
            if (req.body.like == 1) { // mettre un like
                sauceObject.likes += 1; // ajoute 1 à likes
                sauceObject.usersLiked.push(req.body.userId); // ajoute le userId aux usersLiked
                // màj des données
                Sauce.updateOne({ _id: req.params.id }, {
                    likes: sauce.likes,
                    usersLiked: sauce.usersLiked,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ message: "Vous aimez la sauce " + sauce.name + " !" }))
                    .catch(error => res.status(400).json({ error }));
            } else if (req.body.like == -1) { //mettre un dislike
                sauce.dislikes += 1; // ajoute 1 à dislikes
                sauce.usersDisliked.push(req.body.userId); // ajoute le userId aux usersDisliked
                // màj des données
                Sauce.updateOne({ _id: req.params.id }, {
                    dislikes: sauce.dislikes,
                    usersDisliked: sauce.usersDisliked,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ message: "Vous n'aimez pas la sauce " + sauce.name + " !" }))
                    .catch(error => res.status(400).json({ error }));
            } else if (req.body.like == 0) {
                sauce.usersLiked.forEach(element => { //enlever like
                    if (element == req.body.userId) {
                        sauce.likes -= 1; // retire 1 à likes
                        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1); // retire le userId
                        Sauce.updateOne({ _id: req.params.id }, {
                            likes: sauce.likes,
                            usersLiked: sauce.usersLiked,
                            _id: req.params.id
                        })
                            .then(() => res.status(200).json({ message: "Vous n'avez pas d'avis sur la sauce " + sauce.name + " !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                });
                sauce.usersDisliked.forEach(element => { // enlever dislike
                    if (element == req.body.userId) {
                        sauce.dislikes -= 1; // retire 1 à dislikes
                        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1); // retire le userId
                        Sauce.updateOne({ _id: req.params.id }, {
                            dislikes: sauce.dislikes,
                            usersDisliked: sauce.usersDisliked,
                            _id: req.params.id
                        })
                            .then(() => res.status(200).json({ message: "Vous n'avez pas d'avis sur " + sauce.name + " !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                });
            }
        })
        .catch(error => res.status(400).json({ error }));
};



