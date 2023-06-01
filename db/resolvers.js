const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const Tarea = require('../models/Tarea')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

//Crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {
    console.log(usuario)
    const { id, email } = usuario

    return jwt.sign({ id, email }, secreta, { expiresIn })
}

const resolvers = {
    Query: {
        obtenerProyectos: async (_, { }, ctx) => {
            /* console.log(ctx) */
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id })

            return proyectos
        },
        obtenerTareas: async (_, {input}, ctx) => {

            //Con esta sentencia me encargo de que se busque de las tareas del creador las que corresponden con el proyecto que se manda por input
            const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto)

            return tareas
        }

    },
    Mutation: {
        crearUsuario: async (_, { input }) => {

            const { email, password } = input

            //Validar que un mail sea unicamente para una cuenta
            const existeUsuario = await Usuario.findOne({ email })

            //Si el usuario existe
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado')
            }

            try {

                //Hashear password
                const salt = await bcryptjs.genSalt(10)
                input.password = await bcryptjs.hash(password, salt)

                console.log(input)


                //Crear una nueva instancia de usuario
                const nuevoUsuario = new Usuario(input)
                console.log(nuevoUsuario)

                //Guardar la instancia en la base de datos (guardar el usuario)
                nuevoUsuario.save()

                //Retorna un string porque en la funcion que defini en schema puse eso
                return "Usuario creado correctamente"
            } catch (error) {
                console.log(error)
            }

        },
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input

            //Si el usuario existe
            const existeUsuario = await Usuario.findOne({ email })

            //condicional por si el usuario no existe
            if (!existeUsuario) {
                throw new Error('El usuario no existe')
            }

            //Si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)

            if (!passwordCorrecto) {
                throw new Error('Password incorrecto')
            }

            //Dar acceso a la app
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
            }
        },
        nuevoProyecto: async (_, { input }, ctx) => {

            /* console.log('DESDE RESOLVER', ctx) */


            console.log(ctx)
            try {
                const proyecto = new Proyecto(input)

                //Asocial el creador
                proyecto.creador = ctx.usuario.id

                //Almacenarlo en la BD
                const resultado = await proyecto.save()

                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProyecto: async (_, { id, input }, ctx) => {


            try {
                //Revisar si el proyecto existe
                let proyecto = await Proyecto.findById(id)



                if (!proyecto) {
                    throw new Error('Proyecto no encontrado')
                }

                //Verificar que la persona que lo esta editando es el creador
                if (proyecto.creador.toString() !== ctx.usuario.id) {
                    throw new Error('No tienens las credenciales para editar')
                }



                //Guardar el proyecto                                           //new:true retorna el nuevo resultado
                proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true })
                return proyecto
            } catch (error) {
                console.log(error)
            }

        },
        eliminarProyecto: async (_, { id }, ctx) => {

            //Revisar si el proyecto existe
            let proyecto = await Proyecto.findById(id)


            if (!proyecto) {
                throw new Error('Proyecto no encontrado')
            }

            //Verificar que la persona que lo esta editando es el creador
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienens las credenciales para eliminar este proyecto')
            }
            

            //Eliminar proyecto
            await Proyecto.findOneAndDelete({ _id : id })

            return "Proyecto Eliminado"

        },
        nuevaTarea: async (_, { input }, ctx) => {
            try{
                const tarea = new Tarea(input)
                tarea.creador = ctx.usuario.id
                const resultado = await tarea.save()

                return resultado
            }catch(error){
                console.log(error)
            }
        },
        actualizarTarea: async (_,{id,input, estado},ctx) => {
            try {
                //Revisar si el proyecto existe con el metodo de mongoose
                let tarea = await Tarea.findById(id)

                if (!tarea) {
                    throw new Error('Tarea no encontrada')
                }

                //Verificar que la persona que la esta editando es el creador
                if (tarea.creador.toString() !== ctx.usuario.id) {
                    throw new Error('No tienens las credenciales para editar')
                }

                //Asignar estado
                input.estado = estado

                //Guardar el proyecto                                           //new:true retorna el nuevo resultado
                tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true })
                
                return tarea
            } catch (error) {
                console.log(error)
            }
        },
        eliminarTarea: async (_, { id }, ctx) => {

            //Revisar si la tarea existe
            let tarea = await Tarea.findById(id)


            if (!tarea) {
                throw new Error('Tarea no encontrada')
            }

            //Verificar que la persona que la esta eliminando es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienens las credenciales para eliminar esta tarea')
            }
            

            //Eliminar tarea
            await Tarea.findOneAndDelete({ _id : id })

            return "Tarea Eliminada"

        },
    }
}

module.exports = resolvers