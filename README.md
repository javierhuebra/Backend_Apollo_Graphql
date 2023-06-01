

Graphql tiene una característica que es devolverte unicamente lo que has pedido.

Esto crea el archivo package.json con lo default, despues se le agregan los archivos a manopla (index.js y demás)
- npm init -y

- Se crean unos scripts en el package.json
"scripts": {
    "start": "node .",
    "dev": "nodemon ."
  },


//Instalacion de apollo
- npm i apollo-server    

//Instalacion de graphql
- npm i graphql     

//Instalacion de nodemon como dependencia de desarrollador
- npm i --save-dev nodemon


---- Para conectar una base de datos
- Se usa mongo db atlas el plan gratuito que te da 512mb

//Se instala mongoose y dotenv
- npm i mongoose (Es el ORM)
- npm i dotenv (para manejar variables de entorno)

//Para hashear los passwords se instala bcryptjs
- npm i bcryptjs

//Para generar el Token
- npm i jsonwebtoken