const
    { GraphQLObjectType,
        GraphQLString,
        GraphQLList,
        GraphQLSchema,
        GraphQLID,
        GraphQLNonNull,
        GraphQLEnumType } = require('graphql')

const { clients, projects } = require('./SampleData')
const Client = require('../models/Client')
const Project = require('../models/Project')

// CLIENT SCHEMA
const ClientSchema = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    }),
})

// PROJECT SCHEMA
const ProjectSchema = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientSchema,
            resolve(parent, arg) {
                // return clients.find(client => client.id === parent.clientId)
                return Client.findById(parent.clientId)
            }
        }
    }),
})

// ROOT QUERIES
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {

        // RETURN SINGLE PROJECT
        project: {
            type: ProjectSchema,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Project.findById(args.id)
            }
        },


        // RETURN ALL PROJECTS
        projects: {
            type: new GraphQLList(ProjectSchema),
            resolve(parent, args) {
                return Project.find()
            }
        },

        // RETURN SINGLE CLIENT
        clients: {
            type: new GraphQLList(ClientSchema),
            resolve(parent, args) {
                return Client.find()
            }
        },
        // RETURN ALL CLIENTS
        client: {
            type: ClientSchema,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                phone: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Client.findById(args.id)
            }
        }
    }
})

// MUTATIONS
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

        // ADD A CLIENT
        addClient: {
            type: ClientSchema,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })
                return client.save()
            }

        },

        // DELETE A CLIENT
        deleteClient: {
            type: ClientSchema,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Client.findByIdAndRemove(args.id)
            }
        },

        // CREATE A PROJECT
        createProject: {
            type: ProjectSchema,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            new: { value: 'not started' },
                            progress: { value: 'in progress' },
                            completed: { value: 'completed' }
                        },

                    }),
                    defaultValue: 'new',
                },
                clientId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                })
                return project.save()
            }
        },

        // DELETE A PROJECT
        deleteProject: {
            type: ProjectSchema,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Project.findByIdAndDelete(args.id)
            }
        },

        // UPDATE A PROJECT
        updateProject: {
            type: ProjectSchema,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            new: { value: 'not started' },
                            progress: { value: 'in progress' },
                            completed: { value: 'completed' }
                        },
                    })

                },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(args.id, {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status
                    },
                }, { new: true })
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation

})