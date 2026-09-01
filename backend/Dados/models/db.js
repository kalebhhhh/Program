const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "cadastro",
    "root",
    "admin",
    {
        host: "localhost",
        dialect: "mysql"
    }
);

sequelize.authenticate().then((function(){
    console.log("Conversando com o banco de dados")
})).catch(function(erro){
    console.log("Erro de conexão" + erro);
});
module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}