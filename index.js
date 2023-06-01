const { ApolloServer } = require('apollo-server')

const jwt = require('jsonwebtoken')
//la variable de entorno se usa para firmar y para verificar, ahora para verificar
require('dotenv').config('variables.env')

const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

const conectarDB = require('./config/db')

//Conectar a la DB
conectarDB()

const server = new ApolloServer({
    typeDefs,
    resolvers,


    //Guardando el token en el context cuando se inicia sesion
    context: ({req}) => {
        const token = req.headers['authorization'] || ''
        if(token){
            try{
                const usuario = jwt.verify(token, process.env.SECRETA)

                return{
                    usuario
                }
            }catch(error){

            }
        }
    }
})


server.listen().then(({ url }) => {
    console.log(`Servidor listo en la URL ${url}`)
})