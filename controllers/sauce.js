const Sauce = require('../models/Sauce');
const fs = require('fs');

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

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

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

exports.likeSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.body.like == 1) {
                sauce.likes += 1;
                sauce.usersLiked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, {
                    likes: sauce.likes,
                    usersLiked: sauce.usersLiked,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ message: "Vous aimez la sauce " + sauce.name + " !" }))
                    .catch(error => res.status(400).json({ error }));
            } else if (req.body.like == -1) {
                sauce.dislikes += 1;
                sauce.usersDisliked.push(req.body.userId);
                Sauce.updateOne({ _id: req.params.id }, {
                    dislikes: sauce.dislikes,
                    usersDisliked: sauce.usersDisliked,
                    _id: req.params.id
                })
                    .then(() => res.status(200).json({ message: "Vous n'aimez pas la sauce " + sauce.name + " !" }))
                    .catch(error => res.status(400).json({ error }));
            } else if (req.body.like == 0) {
                sauce.usersLiked.forEach(element => {
                    if (element == req.body.userId) {
                        sauce.likes -= 1;
                        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
                        Sauce.updateOne({ _id: req.params.id }, {
                            likes: sauce.likes,
                            usersLiked: sauce.usersLiked,
                            _id: req.params.id
                        })
                            .then(() => res.status(200).json({ message: "Vous avez pas d'avis sur la sauce " + sauce.name + " !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                });
                sauce.usersDisliked.forEach(element => {
                    if (element == req.body.userId) {
                        sauce.dislikes -= 1;
                        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1);
                        Sauce.updateOne({ _id: req.params.id }, {
                            dislikes: sauce.dislikes,
                            usersDisliked: sauce.usersDisliked,
                            _id: req.params.id
                        })
                            .then(() => res.status(200).json({ message: "Vous avez pas d'avis sur " + sauce.name + " !" }))
                            .catch(error => res.status(400).json({ error }));
                    }
                });
            }
            req.body.sauce = sauce;
        })
        .catch(error => res.status(400).json({ error }));
};

