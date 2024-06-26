const { ObjectId} = require('mongodb');

class Users {

  constructor(db) {
      this.db = db;

  }

  // Retourne l'ID du nouvel utilisateur inséré
  async create(name, lastName, login, email, password) {
    
      try {
        const newUser = { 
            name, 
            lastName, 
            login, 
            email, 
            password, 
            isAdmin: false // Définition explicite de l'attribut isAdmin à false
        };        
        
            //Avant de créer un utilisateur dans la bd, on veut vérifier s'il n'y est pas déjà pr éviter les doublons
         if(this.exists(login)){ //this -> pr use exists de la classe Users, et qu'on est actuellement dans une instance d'user
            console.log("Un utilisateur avec cet identifiant existe déjà");
      }
        else if(this.exists(email)){
            console.log("Un utilisateur avec cet email existe déjà");
        }
            const result = await this.db.collection('users').insertOne(newUser);
            
        return result.insertedId;
         
            
        }

         
      catch (error) {
          throw new Error("Erreur lors de la création de l'utilisateur : " + error.message);
      }
  }

  // Retourne l'utilisateur trouvé ou null s'il n'existe pas
  async get(userId) {
      try {
          const user = await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
          return user;
      } catch (error) {
          throw new Error("Erreur lors de la récupération de l'utilisateur : " + error.message);
      }
  }

  // Retourne true si l'utilisateur existe, sinon false
  async exists(login) {
      try {
          const user = await this.db.collection('users').findOne({ login });
          console.log(user);
          return user !== null;
      } catch (error) {
          throw new Error("Erreur lors de la vérification de l'existence de l'utilisateur : " + error.message);
      }
  }
  async login(login, password) {
    try {
        // Vérifier si l'utilisateur existe avec le login donné
        const user = await this.db.collection('users').findOne({ login });

        // Si aucun utilisateur n'est trouvé avec le login donné, renvoyer false
        if (!user) {
            console.log("Utilisateur non trouvé");
            return false;
        }

        // Vérifier si le mot de passe correspond
        if (user.password !== password) {
            console.log("Mot de passe incorrect");
            return false;
        }

        // Authentification réussie
        console.log("Authentification réussie !");
        return true;
    } catch (error) {
        throw new Error("Erreur lors de l'authentification de l'utilisateur : " + error.message);
    }
}

  // Supprime un utilisateur
  async deleteUser(userId) {
      try {
          const result = await this.db.collection('users').deleteOne({ _id: new ObjectId(userId) });
          if (result.deletedCount === 0) {
              throw new Error("Utilisateur non trouvé");
          }
      } catch (error) {
          throw new Error("Erreur lors de la suppression de l'utilisateur : " + error.message);
      }
  }

  // Méthode pour récupérer la liste de tous les utilisateurs
  async getAllUsers() {
      try {
          const users = await this.db.collection('users').find().toArray();
          return users; // Retourne la liste de tous les utilisateurs
      } catch (error) {
          throw new Error("Erreur lors de la récupération de la liste des utilisateurs : " + error.message);
      }
  }

  // Méthode pour récupérer les données de l'utilisateur par son nom d'utilisateur
  async getUserDataByUsername(login) {
      try {
          const user = await this.db.collection('users').findOne({ login });
          return user; // Retourne les données de l'utilisateur
      } catch (error) {
          throw new Error("Erreur lors de la récupération des données de l'utilisateur : " + error.message);
      }
  }
  async grantAdmin(userId){
    try{
        await this.db.collection('users').updateOne({_id : new ObjectId(userId)},{ $set: { isAdmin : true}});
        console.log("Droits d'administration accordés avec succès !");
    }
    catch(error){
        throw new Error("Erreur durant l'accord des droits d'administration", error);
    }
  }

  async revokeAdmin(userId){
    try{
        await this.db.collection('users').updateOne({_id: new ObjectId(userId)}, { $set: { isAdmin: false}});
        console.log("Droits d'administration révoqués avec succès !");
    }
    catch(error){
        throw new Error("Erreur durant la révoquation des droits d'administration", error);
    }
  }
}
    

module.exports = Users;
