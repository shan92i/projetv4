class Users {
  constructor(db) {
    this.db = db
    // suite plus tard avec la BD
  }

  create(login, password, lastname, firstname) {
    return new Promise((resolve, reject) => {
      let userid = 1; // À remplacer par une requête bd
      if(false) {
        //erreur
        reject();
      } else {
        resolve(userid);
      }
    });
  }

  get(userid) {
    return new Promise((resolve, reject) => {
      const user = {
         login: "pikachu",
         password: "1234",
         lastname: "chu",
         firstname: "pika"
      }; // À remplacer par une requête bd

      if(false) {
        //erreur
        reject();
      } else {
        if(userid == 1) {
          resolve(user);
        } else {
          resolve(null);
        }
      }
    });
  }

  async exists(login) {
    return new Promise((resolve, reject) => {
      if(false) {
        //erreur
        reject();
      } else {
        resolve(true);
      }
    });
  }

  checkpassword(login, password) {
    return new Promise((resolve, reject) => {
      let userid = 1; // À remplacer par une requête bd
      if(false) {
        //erreur
        reject();
      } else {
        resolve(userid);
      }
    });
  }

  async deleteUser(userId) {
    try {
      // récupérer l'utilisateur depuis la base de données en utilisant l'identifiant fourni
      // Exemple : await this.db.remove({ userId })
      // Code de suppression dans la base de données
    } catch (error) {
      throw new Error("Erreur lors de la suppression de l'utilisateur : " + error.message);
    }
  }

  // Méthode pour récupérer la liste de tous les utilisateurs
  async getAllUsers() {
    try {
     //récupérer tous les utilisateurs depuis la base de données
      // Exemple : const users = await this.db.find()
      // Code pour récupérer tous les utilisateurs depuis la base de données
    } catch (error) {
      throw new Error("Erreur lors de la récupération de la liste des utilisateurs : " + error.message);
    }
  }
}


exports.default = Users;

