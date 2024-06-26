const express = require("express");
const Users = require("./entities/users.js");
const Messages = require("./entities/messages.js");
const Requests = require("./entities/requests.js");


function init(db) {
    console.log('init est lancé');
    const router = express.Router();

    router.use(express.json());

    router.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*"); // Autoriser l'accès depuis n'importe quelle origine
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Autoriser les méthodes HTTP spécifiées
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    router.use((req, res, next) => {
        console.log('API: method %s, path %s', req.method, req.path); //pour print la méthode (POST, GET..) et le chemin de l'URL demandé dans la requete
        console.log('Body', req.body); // et ce que contient la req
        next();
    });
    console.log('jusquici tout va bien');

    const users = new Users(db); //création d'une instance de la classe Users + connexion à la bd

    

    router.post("/user/register", async (req, res) => {
        
        try {
            const { name, lastName, login, email, password } = req.body;
            

            if (!name || !lastName || !login || !email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: "Veuillez fournir tous les champs nécessaires pour l'inscription"
                });
            }
    

            //l'utilisateur n'a jamais été inscrit
            const userId = await users.create(name, lastName, login, email, password);
    
            // Réponse de succès
            return res.status(201).json({
                status: 201,
                message: "Inscription réussie !",
                user: userId // Renvoi de l'ID
            });
            
            
        } catch (error) {
            // Gestion des erreurs
            return res.status(500).json({
                status: 500,
                message: "Erreur lors de l'inscription",
                error: error.message
            });
        }
    });
    router.post("/user/login", async (req, res) => {
        console.log("fonction Login bien appelée");
        try {
            const { login, password } = req.body;
            if (!login || !password) {
                return res.status(400).json({
                    status: 400,
                    message: "Requête invalide : nom d'utilisateur et mot de passe nécessaires"
                });
            }
    
            // Vérifier si le mot de passe est correct
            const isAuthenticated = await users.login(login, password);
            if (!isAuthenticated) {
                console.log("Mot de passe incorrect");
                return res.status(401).json({
                    status: 401,
                    message: "Mot de passe incorrect"
                });
            }
    
            // Récupérer les données de l'utilisateur
            const userData = await users.getUserDataByUsername(login);
    
            // Envoyer une réponse 200 OK si l'authentification réussit
            return res.status(200).json({
                status: 200,
                message: "Authentification réussie",
                user: userData
            });
    
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Erreur interne",
                details: error.message
            });
        }
    });
    

    router.route("/user/:user_id(\\d+)")
        .get(async (req, res) => {
            try {
                const user = await users.get(req.params.user_id);
                if (!user) {
                    res.sendStatus(404);
                } else {
                    res.send(user);
                }
            } catch (e) {
                res.status(500).send(e);
            }
        })
        .delete((req, res) => res.send(`delete user ${req.params.user_id}`));

    router.get("/users", async (req,res) => {
        try{
            const allUsers = await users.getAllUsers();
            return res.send(allUsers);
        }
        catch(error){
            res.status(500).json({error: error.message});
        }
    });

    router.put("/users/:user_id/grant-admin", async (req, res) => {
        try{
            console.log("rentre dans grant-admin");
            const userId = req.params.user_id;
            console.log(userId);

            await users.grantAdmin(userId);
            return res.status(200).send({message : "Droits d'administration accordés avec succès !"});
        }
        catch(error){
            res.status(500).json({error : error.message});
        }

    });

    router.put("/users/:user_id/revoke-admin", async (req,res) => {
        try{
            console.log("rentre dans revoke-admin");
            const userId = req.params.user_id;
            console.log(userId);
            await users.revokeAdmin(userId);
            return res.status(200).send({message: "Droits d'administration révoqués avec succès !"});
        }
        catch(error){
            res.status(500).json({error: error.message});
        }
    });

    router.post("/user", (req, res) => {
        const { login, email, password, lastname, firstname } = req.body;
        if (!login || !email || !password || !lastname || !firstname) {
            res.status(400).send("Missing fields");
        } else {
            users.create(login, email, password, lastname, firstname)
                .then((user_id) => res.status(201).send({ id: user_id }))
                .catch((err) => res.status(500).send(err));
        }
    });

    router.get("/users", async (req, res) => {
        try {
            const allUsers = await users.getAllUsers();
            return res.json(allUsers);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    
    router.post("/user/exist", async (req, res) => {
        try {
            const { login } = req.body;
            if (!login) {
                return res.status(400).json({
                    status: 400,
                    message: "Requête invalide : nom d'utilisateur nécessaire"
                });
            }
    
            // Vérifier si l'utilisateur existe déjà
            const userExists = await users.exists(login);
    
            // Envoyer true si l'utilisateur existe, sinon false
            return res.status(200).json({
                exists: userExists
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Erreur interne",
                details: error.message
            });
        }
    });
    
    //-------------------------------------------------------------------------------------------------------//

    const messages = new Messages(db);

    router.get("/message/:message_id", async (req, res) => {
        console.log('getMessage');
        const id =req.params.message_id;
        console.log(id);
        try {
            const message = await messages.getMessage(id);
            if (!message) {
                return res.sendStatus(404);
            }
            return res.send(message);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    router.post("/messages/replies", async (req, res) => {
        try {
            const { replyIds } = req.body;
            if (!replyIds || !Array.isArray(replyIds) || replyIds.length === 0) {
                return res.status(400).json({ error: "Veuillez fournir une liste d'IDs de réponses" });
            }
    
            // Utilisez votre méthode pour récupérer les messages correspondants aux IDs de réponse
            const replyMessages = await messages.getMessagesByReplyIds(replyIds);
    
            return res.json(replyMessages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    
    router.post("/message", async (req, res) => {
        try {
            const messageData = req.body;
            console.log(messageData.parentId);
            if (!messageData) {
                return res.status(400).send("Missing fields");
            }
    
            if (messageData.parentId) {
                console.log(messageData.parentId);

                
                const replyData = {
                    author: messageData.author,
                    content: messageData.content,
                    date: messageData.date,
                    parentId: messageData.parentId,
                    repliesID: [], // Assurez-vous d'initialiser les réponses de la réponse à un tableau vide
                    topic: messageData.topic, // Utilisez le sujet du message parent
                };
                console.log(replyData);
                const replyId = await messages.createMessage(replyData);
                
    
                return res.status(201).send({ id: replyId });
            } else {
                const messageId = await messages.createMessage(messageData);
                return res.status(201).send({ id: messageId });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    

    router.delete("/message/:message_id", async (req, res) => {
        try {
            console.log("delete");
            const messageId = req.params.message_id;
            console.log('delete2');
            console.log(messageId);
            await messages.deleteMessage(messageId);
            console.log('deleeted');
            return res.status(204).send({message: "Message supprimé avec succès !"});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    
    
    router.get("/messages", async (req, res) => {
        console.log("route bien trouvée");

        try {
            const allMessages = await messages.getAllMessages();
            console.log(allMessages);
            return res.send(allMessages);
            
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

    router.get("/messages/search", async (req, res) => {
        console.log("route de search trouvée");
        try {
            // Récupérer les critères de recherche depuis les paramètres de requête
            const { searchTerm, startDate, endDate, author } = req.query;
            
            // Effectuer la recherche dans la collection de messages en fonction des critères
            const searchResults = await messages.searchMessages(searchTerm, startDate, endDate, author);
            console.log(searchResults);
            // Retourner les résultats de la recherche
            return res.json(searchResults);
        } catch (error) {
            // En cas d'erreur, renvoyer un statut 500 avec le message d'erreur
            return res.status(500).json({ error: error.message });
        }
    });
    router.get("/messages/user/:username", async (req, res) => {
        console.log("route pour messages user check");
        try {
            const username = req.params.username; // Récupérer le nom d'utilisateur depuis les paramètres de la route
            const userMessages = await messages.getUserMessages(username);
            return res.json(userMessages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    
   // Route pour répondre à un message

// router.post('/messages/:id/reply', async (req, res) => {
//     const messageId = req.params.id;
//     const { content, author, parentId } = req.body; // Inclure le parentId dans les données de la requête

//     try {
//         await messages.replyToMessage(messageId, content, author, parentId);
//         res.status(201).json({ message: 'Réponse envoyée avec succès' });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de la réponse :', error);
//         res.status(500).json({ error: 'Erreur lors de l\'envoi de la réponse' });
//     }
// });

    
    

    
    
    //-------------------------------------------------------------------------------------------------------//
   
    const requests = new Requests(db); // Création d'une instance de la classe Requests, sans ajouter default


    router.post("/request", async (req, res) => {
        
        try{
            const requestUser = req.body ; //on récupère les infos du user, on le cherche dans la base de données
            

            const newRequest = await requests.createRequest(requestUser); //créé une nouvelle demande d'inscription avec les données de l'utilisateur
            //Envoi d'une réponse au frontend pour indiquer que la demande a été créée avec succès

            //on envoi un code d'état, on utilise status. si on voulait envoyer des datas, on utilise res.send
            res.status(201).json({
                message:"Nouvelle demande d'inscription créée avec succès",
                request: newRequest
        });
        }
    catch(error){
        res.status(500).json({
            error:error.message
        });
    }
    })
  
    
    


    router.post("/request/:request_id/accept", async (req, res) => {
        
        try {
            
            const newUserCreatedID = await requests.acceptRequest(req.params.request_id);
            
            res.status(201).json({
                status: 201,
                message: "Inscription acceptée !",
                user: newUserCreatedID // Renvoi de l'ID
            });
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/request/:request_id/reject", async (req, res) => {
        try {
            await requests.deleteRequest(req.params.request_id);
            res.status(204).send("La demande a été rejetée avec succès");
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    router.get("/requests", async (req, res) => {
        console.log("Rentré dans GET all requests")

        try {
            const allRequests = await requests.getAllRequests();
            //console.log("AFFICHAGE DE TOUTES LES REQUETES : " + allRequests);
            res.send(allRequests);
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
module.exports = init;
