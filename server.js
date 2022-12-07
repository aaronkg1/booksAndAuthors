const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const port = 4000;
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
} = require("graphql");

const authors = [
	{ id: 1, name: "JK Rowling" },
	{ id: 2, name: "J.R.R Tolkien" },
	{ id: 3, name: "Brent Weeks" },
];

const books = [
	{ id: 1, name: "Harry Potter 1", authorId: 1 },
	{ id: 2, name: "Harry Potter 2", authorId: 1 },
	{ id: 3, name: "Harry Potter 3", authorId: 1 },
	{ id: 4, name: "The fellowship of the ring", authorId: 2 },
	{ id: 5, name: "The two towers", authorId: 2 },
	{ id: 6, name: "The return of the king", authorId: 2 },
	{ id: 7, name: "The way of shadows", authorId: 3 },
	{ id: 8, name: "Beyond the shadows", authorId: 3 },
];

const BookType = new GraphQLObjectType({
	name: "Book",
	description: "This represents a book written by an author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find((author) => author.id === book.authorId);
			},
		},
	}),
});

const AuthorType = new GraphQLObjectType({
	name: "Author",
	description: "This represents an author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		books: {
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter((book) => book.authorId === author.id);
			},
		},
	}),
});

const RootQueryType = new GraphQLObjectType({
	name: "Query",
	description: "Root Query",
	fields: () => ({
		books: {
			type: new GraphQLList(BookType),
			description: "List of all books",
			resolve: () => books,
		},
		book: {
			type: BookType,
			description: "A single book",
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (_parent, args) => {
				return books.find((book) => book.id === args.id);
			},
		},
		authors: {
			type: new GraphQLList(AuthorType),
			description: "List of all authors",
			resolve: () => authors,
		},
		author: {
			type: AuthorType,
			description: "A single author",
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (_parent, args) => {
				return authors.find((author) => author.id === args.id);
			},
		},

		bookSearch: {
			type: new GraphQLList(BookType),
			description: "Books with the name",
			args: {
				name: { type: GraphQLString },
			},
			resolve: (_parent, args) => {
				return books.filter((book) => {
					return book.name.toLowerCase().match(args.name.toLowerCase());
				});
			},
		},
	}),
});

const RootMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "Root Mutation",
	fields: () => ({
		addBook: {
			type: BookType,
			description: "Add a book",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				authorId: { type: GraphQLNonNull(GraphQLInt) },
			},
			resolve: (_parent, args) => {
				const book = {
					id: books.length + 1,
					name: args.name,
					authorId: args.authorId,
				};
				books.push(book);
				return book;
			},
		},
		addAuthor: {
			type: AuthorType,
			description: "Add an author",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve: (_parent, args) => {
				const author = {
					id: authors.length + 1,
					name: args.name,
				};
				authors.push(author);
				return author;
			},
		},
		removeBook: {
			type: BookType,
			description: "Remove a book",
			args: {
				id: { type: GraphQLNonNull(GraphQLInt) },
			},
			resolve: (_parent, args) => {
				const index = books.findIndex((book) => book.id === args.id);
				console.log(index);
				if (index < 0) return;
				const removedBook = books.splice(index, 1);
				return removedBook[0];
			},
		},
	}),
});

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType,
});

app.use(
	"/graphql",
	expressGraphQL.graphqlHTTP({
		graphiql: true,
		schema: schema,
	})
);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
